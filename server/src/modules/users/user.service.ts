import { Types } from 'mongoose';
import { userRepository } from './user.repository';
import { ProductModel } from '../products/product.model';
import { PasswordUtils } from '../../common/utils/password.utils';
import { JwtUtils } from '../../common/utils/jwt.utils';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
} from '../../common/errors/app-error';
import {
  RegisterUserInput,
  LoginUserInput,
  UpdateProfileInput,
  AddressInput,
  AddToCartInput,
} from './user.validation';
import {
  IUser,
  IUserDocument,
  ICartSummary,
  IPopulatedCartItem,
  UserQueryFilters,
  UserStatus,
} from './user.types';

export class UserService {
  // --- Customer Auth & Profile ---
  public async register(input: RegisterUserInput): Promise<{ user: Partial<IUser>; token: string }> {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError('A user with this email address already exists');
    }

    const hashedPassword = await PasswordUtils.hash(input.password);

    const user = await userRepository.create({
      name: input.name,
      email: input.email.toLowerCase(),
      password: hashedPassword,
      phone: input.phone || '',
      status: 'ACTIVE',
      addresses: [],
      wishlist: [],
      cart: [],
      lastLoginAt: new Date(),
    });

    const token = JwtUtils.generateCustomerToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    });

    const userJson = user.toJSON() as any;
    return { user: userJson, token };
  }

  public async login(input: LoginUserInput): Promise<{ user: Partial<IUser>; token: string }> {
    const user = await userRepository.findByEmail(input.email, true);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (user.status === 'BLOCKED') {
      throw new ForbiddenError('Your account has been blocked. Please contact customer support.');
    }

    const isMatch = await user.comparePassword(input.password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = JwtUtils.generateCustomerToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    });

    const userJson = user.toJSON() as any;
    return { user: userJson, token };
  }

  public async getProfile(userId: string): Promise<IUserDocument> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User profile not found');
    }
    return user;
  }

  public async updateProfile(userId: string, input: UpdateProfileInput): Promise<IUserDocument> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (input.name !== undefined) user.name = input.name;
    if (input.phone !== undefined) user.phone = input.phone;
    if (input.avatar !== undefined) user.avatar = input.avatar;

    await user.save();
    return user;
  }

  // --- Addresses ---
  public async addAddress(userId: string, input: AddressInput): Promise<IUserDocument> {
    const updated = await userRepository.addAddress(userId, input as any);
    if (!updated) {
      throw new NotFoundError('User not found');
    }
    return updated;
  }

  public async removeAddress(userId: string, addressId: string): Promise<IUserDocument> {
    const updated = await userRepository.removeAddress(userId, addressId);
    if (!updated) {
      throw new NotFoundError('User not found');
    }
    return updated;
  }

  // --- Wishlist ---
  public async getWishlist(userId: string): Promise<any[]> {
    return userRepository.getPopulatedWishlist(userId);
  }

  public async addToWishlist(userId: string, productId: string): Promise<{ wishlist: any[]; inWishlist: boolean }> {
    const product = await ProductModel.findOne({ _id: productId, isDeleted: false });
    if (!product) {
      throw new NotFoundError('Apparel product not found');
    }

    await userRepository.addToWishlist(userId, productId);
    const updatedWishlist = await userRepository.getPopulatedWishlist(userId);
    return { wishlist: updatedWishlist, inWishlist: true };
  }

  public async removeFromWishlist(userId: string, productId: string): Promise<{ wishlist: any[]; inWishlist: boolean }> {
    await userRepository.removeFromWishlist(userId, productId);
    const updatedWishlist = await userRepository.getPopulatedWishlist(userId);
    return { wishlist: updatedWishlist, inWishlist: false };
  }

  public async toggleWishlist(userId: string, productId: string): Promise<{ wishlist: any[]; inWishlist: boolean }> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const alreadyInWishlist = user.wishlist.some((id) => id.toString() === productId);

    if (alreadyInWishlist) {
      return this.removeFromWishlist(userId, productId);
    } else {
      return this.addToWishlist(userId, productId);
    }
  }

  // --- Cart Calculations & Operations ---
  public async getCart(userId: string): Promise<ICartSummary> {
    const user = await userRepository.getCartWithProducts(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const populatedItems: IPopulatedCartItem[] = [];
    let subtotal = 0;
    let baseRetailSum = 0;
    let totalQuantity = 0;

    for (const item of user.cart) {
      const product: any = item.productId;
      if (!product || product.isDeleted) {
        continue; // skip deleted product
      }

      // Find matching variant
      const variant = (product.variants || []).find((v: any) => v.sku === item.variantSku);
      if (!variant) {
        continue; // skip if variant no longer exists
      }

      const effectivePrice = variant.discountPrice && variant.discountPrice > 0
        ? variant.discountPrice
        : variant.price || product.price;

      const regularPrice = variant.price || product.price;
      const itemTotal = effectivePrice * item.quantity;

      subtotal += itemTotal;
      baseRetailSum += regularPrice * item.quantity;
      totalQuantity += item.quantity;

      populatedItems.push({
        _id: item._id ? item._id.toString() : item.variantSku,
        productId: product._id.toString(),
        productTitle: product.name,
        productSlug: product.slug,
        brandName: product.brandId?.name || '',
        thumbnail: product.images?.[0] || '',
        variantSku: variant.sku,
        color: {
          name: variant.color?.name || '',
          hexCode: variant.color?.hexCode || '#000000',
        },
        size: variant.size,
        price: regularPrice,
        discountPrice: variant.discountPrice,
        effectivePrice,
        quantity: item.quantity,
        itemTotal,
        availableStock: variant.stock || 0,
        isAvailable: (variant.stock || 0) >= item.quantity,
      });
    }

    const discountTotal = Math.max(0, baseRetailSum - subtotal);
    const estimatedTax = Math.round(subtotal * 0.05 * 100) / 100; // 5% GST
    const freeShippingEligible = subtotal >= 75 || subtotal === 0;
    const shippingFee = freeShippingEligible ? 0 : 10;
    const grandTotal = Math.round((subtotal + estimatedTax + shippingFee) * 100) / 100;

    return {
      items: populatedItems,
      subtotal: Math.round(subtotal * 100) / 100,
      discountTotal: Math.round(discountTotal * 100) / 100,
      estimatedTax,
      shippingFee,
      grandTotal,
      totalQuantity,
      freeShippingEligible,
    };
  }

  public async addToCart(userId: string, input: AddToCartInput): Promise<ICartSummary> {
    const product = await ProductModel.findOne({ _id: input.productId, isDeleted: false });
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    const variant = (product.variants || []).find((v) => v.sku === input.variantSku);
    if (!variant) {
      throw new NotFoundError(`Variant with SKU "${input.variantSku}" not found on this product`);
    }

    if (variant.stock < input.quantity) {
      throw new BadRequestError(`Only ${variant.stock} units available in stock for this variant`);
    }

    await userRepository.addToCart(userId, {
      productId: product._id,
      variantSku: input.variantSku,
      quantity: input.quantity,
    });

    return this.getCart(userId);
  }

  public async updateCartQuantity(userId: string, variantSku: string, quantity: number): Promise<ICartSummary> {
    if (quantity > 0) {
      // Find the user's cart item to verify stock
      const user = await userRepository.findById(userId);
      const cartItem = user?.cart.find((c) => c.variantSku === variantSku);
      if (cartItem) {
        const product = await ProductModel.findById(cartItem.productId);
        const variant = product?.variants.find((v) => v.sku === variantSku);
        if (variant && variant.stock < quantity) {
          throw new BadRequestError(`Only ${variant.stock} units available in stock for this variant`);
        }
      }
    }

    await userRepository.updateCartItem(userId, variantSku, quantity);
    return this.getCart(userId);
  }

  public async removeFromCart(userId: string, variantSku: string): Promise<ICartSummary> {
    await userRepository.removeFromCart(userId, variantSku);
    return this.getCart(userId);
  }

  public async clearCart(userId: string): Promise<ICartSummary> {
    await userRepository.clearCart(userId);
    return this.getCart(userId);
  }

  // --- Admin Customer Management ---
  public async getCustomersForAdmin(filters: UserQueryFilters) {
    return userRepository.findPaginated(filters);
  }

  public async toggleCustomerStatus(userId: string, status: UserStatus): Promise<IUserDocument> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('Customer not found');
    }
    user.status = status;
    await user.save();
    return user;
  }
}

export const userService = new UserService();
