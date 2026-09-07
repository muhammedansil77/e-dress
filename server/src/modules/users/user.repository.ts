import { Types, FilterQuery } from 'mongoose';
import { UserModel } from './user.model';
import { IUser, IUserDocument, IAddress, ICartItem, UserQueryFilters } from './user.types';
import { PaginatedResult } from '../../common/types';

export class UserRepository {
  public async findByEmail(email: string, includePassword = false): Promise<IUserDocument | null> {
    const query = UserModel.findOne({ email: email.toLowerCase() });
    if (includePassword) {
      query.select('+password');
    }
    return query.exec();
  }

  public async findById(id: string | Types.ObjectId, includePassword = false): Promise<IUserDocument | null> {
    const query = UserModel.findById(id);
    if (includePassword) {
      query.select('+password');
    }
    return query.exec();
  }

  public async create(data: Partial<IUser>): Promise<IUserDocument> {
    const user = new UserModel(data);
    return user.save();
  }

  public async update(id: string | Types.ObjectId, data: Partial<IUser>): Promise<IUserDocument | null> {
    return UserModel.findByIdAndUpdate(id, { $set: data }, { new: true }).exec();
  }

  public async findPaginated(filters: UserQueryFilters): Promise<PaginatedResult<any>> {
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 10;
    const skip = (page - 1) * limit;

    const query: FilterQuery<IUserDocument> = {};

    if (filters.search) {
      const searchRegex = new RegExp(filters.search.trim(), 'i');
      query.$or = [{ name: searchRegex }, { email: searchRegex }, { phone: searchRegex }];
    }

    if (filters.status) {
      query.status = filters.status;
    }

    const sortField = filters.sortBy || 'createdAt';
    const sortDirection = filters.sortOrder === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      UserModel.find(query)
        .select('-password')
        .sort({ [sortField]: sortDirection })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      UserModel.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items,
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  // --- Wishlist Methods ---
  public async addToWishlist(userId: string | Types.ObjectId, productId: string | Types.ObjectId): Promise<IUserDocument | null> {
    return UserModel.findByIdAndUpdate(
      userId,
      { $addToSet: { wishlist: new Types.ObjectId(productId) } },
      { new: true }
    ).exec();
  }

  public async removeFromWishlist(userId: string | Types.ObjectId, productId: string | Types.ObjectId): Promise<IUserDocument | null> {
    return UserModel.findByIdAndUpdate(
      userId,
      { $pull: { wishlist: new Types.ObjectId(productId) } },
      { new: true }
    ).exec();
  }

  public async getPopulatedWishlist(userId: string | Types.ObjectId): Promise<any> {
    const user = await UserModel.findById(userId)
      .select('wishlist')
      .populate({
        path: 'wishlist',
        match: { isDeleted: false },
        populate: [
          { path: 'brandId', select: 'name logo' },
          { path: 'categoryId', select: 'name' },
        ],
      })
      .lean()
      .exec();

    return user?.wishlist || [];
  }

  // --- Cart Methods ---
  public async getCartWithProducts(userId: string | Types.ObjectId): Promise<IUserDocument | null> {
    return UserModel.findById(userId)
      .populate({
        path: 'cart.productId',
        populate: [
          { path: 'brandId', select: 'name logo' },
          { path: 'categoryId', select: 'name' },
        ],
      })
      .exec();
  }

  public async addToCart(
    userId: string | Types.ObjectId,
    item: { productId: Types.ObjectId; variantSku: string; quantity: number }
  ): Promise<IUserDocument | null> {
    const user = await UserModel.findById(userId);
    if (!user) return null;

    const existingIndex = user.cart.findIndex(
      (c) => c.productId.toString() === item.productId.toString() && c.variantSku === item.variantSku
    );

    if (existingIndex > -1) {
      user.cart[existingIndex].quantity += item.quantity;
    } else {
      user.cart.push({
        productId: item.productId,
        variantSku: item.variantSku,
        quantity: item.quantity,
        addedAt: new Date(),
      } as any);
    }

    return user.save();
  }

  public async updateCartItem(
    userId: string | Types.ObjectId,
    variantSku: string,
    quantity: number
  ): Promise<IUserDocument | null> {
    if (quantity <= 0) {
      return this.removeFromCart(userId, variantSku);
    }

    return UserModel.findOneAndUpdate(
      { _id: userId, 'cart.variantSku': variantSku },
      { $set: { 'cart.$.quantity': quantity } },
      { new: true }
    ).exec();
  }

  public async removeFromCart(userId: string | Types.ObjectId, variantSku: string): Promise<IUserDocument | null> {
    return UserModel.findByIdAndUpdate(
      userId,
      { $pull: { cart: { variantSku } } },
      { new: true }
    ).exec();
  }

  public async clearCart(userId: string | Types.ObjectId): Promise<IUserDocument | null> {
    return UserModel.findByIdAndUpdate(userId, { $set: { cart: [] } }, { new: true }).exec();
  }

  // --- Address Methods ---
  public async addAddress(userId: string | Types.ObjectId, address: IAddress): Promise<IUserDocument | null> {
    const user = await UserModel.findById(userId);
    if (!user) return null;

    if (address.isDefault || user.addresses.length === 0) {
      user.addresses.forEach((a) => (a.isDefault = false));
      address.isDefault = true;
    }

    user.addresses.push(address);
    return user.save();
  }

  public async removeAddress(userId: string | Types.ObjectId, addressId: string | Types.ObjectId): Promise<IUserDocument | null> {
    return UserModel.findByIdAndUpdate(
      userId,
      { $pull: { addresses: { _id: addressId } } },
      { new: true }
    ).exec();
  }
}

export const userRepository = new UserRepository();
