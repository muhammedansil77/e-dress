import { Types, FilterQuery } from 'mongoose';
import { ProductModel } from './product.model';
import { IProduct, IProductDocument } from './product.types';
import { ProductQueryFilters } from './product.dto';
import { PaginatedResult } from '../../common/types';

export class ProductRepository {
  public async findPaginated(filters: ProductQueryFilters): Promise<PaginatedResult<any>> {
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 10;
    const skip = (page - 1) * limit;

    const query: FilterQuery<IProductDocument> = { isDeleted: false };

    if (filters.search) {
      const searchRegex = new RegExp(filters.search.trim(), 'i');
      query.$or = [{ name: searchRegex }, { slug: searchRegex }, { sku: searchRegex }, { tags: searchRegex }];
    }

    if (filters.categoryId && Types.ObjectId.isValid(filters.categoryId)) {
      query.categoryId = new Types.ObjectId(filters.categoryId);
    }

    if (filters.subcategoryId && Types.ObjectId.isValid(filters.subcategoryId)) {
      query.subcategoryId = new Types.ObjectId(filters.subcategoryId);
    }

    if (filters.brandId && Types.ObjectId.isValid(filters.brandId)) {
      query.brandId = new Types.ObjectId(filters.brandId);
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.isFeatured !== undefined) {
      query.isFeatured = filters.isFeatured;
    }

    if (filters.inStock) {
      query.totalStock = { $gt: 0 };
    }

    const sortField = filters.sortBy || 'createdAt';
    const sortDirection = filters.sortOrder === 'asc' ? 1 : -1;
    const sortOptions: Record<string, 1 | -1> = { [sortField]: sortDirection };

    const [items, total] = await Promise.all([
      ProductModel.find(query)
        .populate('categoryId', 'name slug')
        .populate('subcategoryId', 'name slug')
        .populate('brandId', 'name slug logo')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      ProductModel.countDocuments(query),
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

  public async findById(id: string | Types.ObjectId): Promise<IProductDocument | null> {
    return ProductModel.findOne({ _id: id, isDeleted: false })
      .populate('categoryId', 'name slug')
      .populate('subcategoryId', 'name slug')
      .populate('brandId', 'name slug logo')
      .exec();
  }

  public async findBySlug(slug: string): Promise<IProductDocument | null> {
    return ProductModel.findOne({ slug: slug.toLowerCase(), isDeleted: false }).exec();
  }

  public async findBySku(sku: string): Promise<IProductDocument | null> {
    return ProductModel.findOne({ sku: sku.toUpperCase(), isDeleted: false }).exec();
  }

  public async create(data: Partial<IProduct>): Promise<IProductDocument> {
    const product = new ProductModel(data);
    return product.save();
  }

  public async update(id: string | Types.ObjectId, data: Partial<IProduct>): Promise<IProductDocument | null> {
    // Recalculate totalStock if variants changed
    if (data.variants && data.variants.length > 0) {
      data.totalStock = data.variants.reduce((acc, v) => acc + (v.stock || 0), 0);
    }
    return ProductModel.findOneAndUpdate({ _id: id, isDeleted: false }, { $set: data }, { new: true })
      .populate('categoryId', 'name slug')
      .populate('subcategoryId', 'name slug')
      .populate('brandId', 'name slug logo')
      .exec();
  }

  public async updateStatus(id: string | Types.ObjectId, status: string): Promise<IProductDocument | null> {
    return ProductModel.findOneAndUpdate({ _id: id, isDeleted: false }, { $set: { status } }, { new: true }).exec();
  }

  public async softDelete(id: string | Types.ObjectId): Promise<IProductDocument | null> {
    return ProductModel.findOneAndUpdate({ _id: id, isDeleted: false }, { $set: { isDeleted: true } }, { new: true }).exec();
  }

  public async countAll(): Promise<number> {
    return ProductModel.countDocuments({ isDeleted: false });
  }
}

export const productRepository = new ProductRepository();
