import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/async-handler';
import { ApiResponse } from '../../common/utils/api-response';
import { HttpStatus } from '../../common/constants/http-status';
import { orderService } from './order.service';

export class OrderController {
  /**
   * Customer / Guest: Checkout & Place Order
   */
  public checkout = asyncHandler(async (req: Request, res: Response) => {
    const customerId = req.user?.userId;
    const order = await orderService.createOrder(req.body, customerId);
    return ApiResponse.success(res, order, 'Order placed successfully', HttpStatus.CREATED);
  });

  /**
   * Customer: View My Orders
   */
  public getMyOrders = asyncHandler(async (req: Request, res: Response) => {
    const customerId = req.user?.userId || (req.query.email as string);
    if (!customerId) {
      return ApiResponse.error(res, 'Customer identification required', HttpStatus.BAD_REQUEST);
    }
    const orders = await orderService.getCustomerOrders(customerId);
    return ApiResponse.success(res, orders, 'Orders retrieved successfully', HttpStatus.OK);
  });

  /**
   * Customer / Guest / Admin: Track single order
   */
  public getOrderById = asyncHandler(async (req: Request, res: Response) => {
    const order = await orderService.getOrderById(req.params.id);
    return ApiResponse.success(res, order, 'Order details retrieved successfully', HttpStatus.OK);
  });

  /**
   * Admin: List all orders with filters
   */
  public getOrdersForAdmin = asyncHandler(async (req: Request, res: Response) => {
    const result = await orderService.getOrdersForAdmin(req.query as any);
    return ApiResponse.success(res, result.items, 'Orders retrieved successfully', HttpStatus.OK, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
    });
  });

  /**
   * Admin: Update order fulfillment status
   */
  public updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
    const updated = await orderService.updateOrderStatus(
      req.params.id,
      req.body.orderStatus,
      req.body.notes
    );
    return ApiResponse.success(res, updated, 'Order status updated successfully', HttpStatus.OK);
  });

  /**
   * Admin: Update payment status
   */
  public updatePaymentStatus = asyncHandler(async (req: Request, res: Response) => {
    const updated = await orderService.updatePaymentStatus(req.params.id, req.body.paymentStatus);
    return ApiResponse.success(res, updated, 'Payment status updated successfully', HttpStatus.OK);
  });
}

export const orderController = new OrderController();
