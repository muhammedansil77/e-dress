import { Types } from 'mongoose';
import { OrderModel } from './order.model';
import { ProductModel } from '../products/product.model';
import { userRepository } from '../users/user.repository';
import {
  IOrderDocument,
  IOrderItem,
  CreateOrderInput,
  OrderQueryFilters,
  OrderStatus,
  PaymentStatus,
} from './order.types';
import { NotFoundError, BadRequestError } from '../../common/errors/app-error';

export class OrderService {
  /**
   * Place a new order with live inventory deduction
   */
  public async createOrder(
    input: CreateOrderInput,
    customerId?: string
  ): Promise<IOrderDocument> {
    let itemsToProcess: Array<{ productId: string; variantSku: string; quantity: number }> = [];

    // If items were provided in payload (direct buy or guest)
    if (input.items && input.items.length > 0) {
      itemsToProcess = input.items;
    } else if (customerId) {
      // Or pull from customer's persistent cart
      const user = await userRepository.findById(customerId);
      if (!user || !user.cart || user.cart.length === 0) {
        throw new BadRequestError('Shopping cart is empty. Please add items to checkout.');
      }
      itemsToProcess = user.cart.map((c) => ({
        productId: c.productId.toString(),
        variantSku: c.variantSku,
        quantity: c.quantity,
      }));
    } else {
      throw new BadRequestError('No order items provided for checkout.');
    }

    const snapshotItems: IOrderItem[] = [];
    let subtotal = 0;

    // 1. Validate all items and stock
    for (const item of itemsToProcess) {
      const product = await ProductModel.findOne({ _id: item.productId, isDeleted: false });
      if (!product) {
        throw new NotFoundError(`Product not found (ID: ${item.productId})`);
      }

      const variant = (product.variants || []).find((v) => v.sku === item.variantSku);
      if (!variant) {
        throw new NotFoundError(`Variant SKU "${item.variantSku}" not found on product "${product.name}"`);
      }

      if (variant.stock < item.quantity) {
        throw new BadRequestError(
          `Insufficient stock for "${product.name}" (${variant.size} - ${variant.color?.name}). Only ${variant.stock} available.`
        );
      }

      const effectivePrice = variant.discountPrice && variant.discountPrice > 0
        ? variant.discountPrice
        : variant.price || product.discountPrice || product.price;

      const itemTotal = effectivePrice * item.quantity;
      subtotal += itemTotal;

      snapshotItems.push({
        productId: product._id,
        variantSku: variant.sku,
        productTitle: product.name,
        productSlug: product.slug,
        thumbnail: product.images?.[0] || '',
        size: variant.size,
        colorName: variant.color?.name || 'Standard',
        colorHex: variant.color?.hexCode || '#000000',
        price: effectivePrice,
        quantity: item.quantity,
        itemTotal,
      });
    }

    // 2. Pricing & Taxes
    const tax = Math.round(subtotal * 0.05 * 100) / 100; // 5% GST
    const freeShippingEligible = subtotal >= 75;
    const shippingFee = freeShippingEligible ? 0 : 10;
    const grandTotal = Math.round((subtotal + tax + shippingFee) * 100) / 100;

    // 3. Atomically decrement inventory for each variant
    for (const item of snapshotItems) {
      await ProductModel.updateOne(
        { _id: item.productId, 'variants.sku': item.variantSku },
        {
          $inc: {
            'variants.$.stock': -item.quantity,
            totalStock: -item.quantity,
          },
        }
      );
    }

    // 4. Generate unique luxury order number
    const timestamp = Date.now().toString().slice(-6);
    const rand = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `HA-${timestamp}-${rand}`;

    // 5. Create Order Document
    const order = await OrderModel.create({
      orderNumber,
      customerId: customerId ? new Types.ObjectId(customerId) : null,
      customerEmail: input.customerEmail.toLowerCase().trim(),
      customerName: input.customerName.trim(),
      customerPhone: input.customerPhone.trim(),
      items: snapshotItems,
      shippingAddress: input.shippingAddress,
      subtotal: Math.round(subtotal * 100) / 100,
      discountTotal: 0,
      tax,
      shippingFee,
      grandTotal,
      paymentMethod: input.paymentMethod || 'COD',
      paymentStatus: input.paymentMethod === 'CARD' ? 'PAID' : 'PENDING',
      orderStatus: 'CONFIRMED',
      notes: input.notes || '',
      placedAt: new Date(),
    });

    // 6. If customer was logged in, clear their cart
    if (customerId) {
      await userRepository.clearCart(customerId);
    }

    return order;
  }

  /**
   * Find order by ID or orderNumber
   */
  public async getOrderById(orderIdOrNumber: string): Promise<IOrderDocument> {
    const isObjectId = Types.ObjectId.isValid(orderIdOrNumber);
    const query = isObjectId
      ? { $or: [{ _id: orderIdOrNumber }, { orderNumber: orderIdOrNumber }] }
      : { orderNumber: orderIdOrNumber };

    const order = await OrderModel.findOne(query).populate('customerId', 'name email phone');
    if (!order) {
      throw new NotFoundError(`Order "${orderIdOrNumber}" not found`);
    }
    return order;
  }

  /**
   * Get orders for a specific customer
   */
  public async getCustomerOrders(customerIdOrEmail: string): Promise<IOrderDocument[]> {
    const isObjectId = Types.ObjectId.isValid(customerIdOrEmail);
    const query = isObjectId
      ? { $or: [{ customerId: customerIdOrEmail }, { customerEmail: customerIdOrEmail.toLowerCase() }] }
      : { customerEmail: customerIdOrEmail.toLowerCase() };

    return OrderModel.find(query).sort({ createdAt: -1 });
  }

  /**
   * Admin: Paginated and filtered order management
   */
  public async getOrdersForAdmin(filters: OrderQueryFilters) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const query: any = {};

    if (filters.orderStatus) {
      query.orderStatus = filters.orderStatus;
    }

    if (filters.paymentStatus) {
      query.paymentStatus = filters.paymentStatus;
    }

    if (filters.search) {
      const regex = new RegExp(filters.search, 'i');
      query.$or = [
        { orderNumber: regex },
        { customerName: regex },
        { customerEmail: regex },
        { customerPhone: regex },
      ];
    }

    const [items, total] = await Promise.all([
      OrderModel.find(query)
        .sort({ [filters.sortBy || 'createdAt']: filters.sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .populate('customerId', 'name email phone avatar'),
      OrderModel.countDocuments(query),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    };
  }

  /**
   * Admin: Update order status
   */
  public async updateOrderStatus(
    orderId: string,
    orderStatus: OrderStatus,
    notes?: string
  ): Promise<IOrderDocument> {
    const order = await OrderModel.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // If order is cancelled, restore variant stock
    if (orderStatus === 'CANCELLED' && order.orderStatus !== 'CANCELLED') {
      for (const item of order.items) {
        await ProductModel.updateOne(
          { _id: item.productId, 'variants.sku': item.variantSku },
          {
            $inc: {
              'variants.$.stock': item.quantity,
              totalStock: item.quantity,
            },
          }
        );
      }
      order.cancelledAt = new Date();
    }

    if (orderStatus === 'DELIVERED') {
      order.deliveredAt = new Date();
      order.paymentStatus = 'PAID';
    }

    order.orderStatus = orderStatus;
    if (notes) order.notes = notes;

    await order.save();
    return order;
  }

  /**
   * Admin: Update payment status
   */
  public async updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus): Promise<IOrderDocument> {
    const order = await OrderModel.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }
    order.paymentStatus = paymentStatus;
    await order.save();
    return order;
  }
}

export const orderService = new OrderService();
