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

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query.price = {};
      if (filters.minPrice !== undefined) query.price.$gte = filters.minPrice;
      if (filters.maxPrice !== undefined) query.price.$lte = filters.maxPrice;
    }

    if (filters.sizes) {
      const sizeList = Array.isArray(filters.sizes)
        ? filters.sizes
        : filters.sizes.split(',').map((s) => s.trim().toUpperCase());
      query['variants.size'] = { $in: sizeList };
    }

    if (filters.colors) {
      const colorList = Array.isArray(filters.colors)
        ? filters.colors
        : filters.colors.split(',').map((c) => new RegExp(`^${c.trim()}$`, 'i'));
      query['variants.color.name'] = { $in: colorList };
    }

    let sortOptions: Record<string, 1 | -1> = { createdAt: -1 };
    if (filters.sortBy === 'price') {
      sortOptions = { price: filters.sortOrder === 'asc' ? 1 : -1 };
    } else if (filters.sortBy === 'name') {
      sortOptions = { name: filters.sortOrder === 'asc' ? 1 : -1 };
    } else if (filters.sortBy === 'totalStock') {
      sortOptions = { totalStock: filters.sortOrder === 'asc' ? 1 : -1 };
    } else if (filters.sortBy === 'discount') {
      sortOptions = { discountPrice: -1 };
    } else {
      const sortField = filters.sortBy || 'createdAt';
      const sortDirection = filters.sortOrder === 'asc' ? 1 : -1;
      sortOptions = { [sortField]: sortDirection };
    }

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

  public async getFilterFacets(): Promise<any> {
    const baseMatch = { isDeleted: false, status: 'ACTIVE' };

    const facetsResult = await ProductModel.aggregate([
      { $match: baseMatch },
      {
        $facet: {
          priceStats: [
            {
              $group: {
                _id: null,
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' },
                count: { $sum: 1 },
              },
            },
          ],
          sizes: [
            { $unwind: '$variants' },
            { $match: { 'variants.status': 'ACTIVE' } },
            { $group: { _id: '$variants.size', count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
          ],
          colors: [
            { $unwind: '$variants' },
            { $match: { 'variants.status': 'ACTIVE' } },
            {
              $group: {
                _id: {
                  name: '$variants.color.name',
                  hexCode: '$variants.color.hexCode',
                },
                count: { $sum: 1 },
              },
            },
            { $sort: { '_id.name': 1 } },
          ],
          brands: [
            { $match: { brandId: { $ne: null } } },
            { $group: { _id: '$brandId', count: { $sum: 1 } } },
            {
              $lookup: {
                from: 'brands',
                localField: '_id',
                foreignField: '_id',
                as: 'brand',
              },
            },
            { $unwind: '$brand' },
            {
              $project: {
                _id: '$brand._id',
                name: '$brand.name',
                logo: '$brand.logo',
                count: 1,
              },
            },
            { $sort: { name: 1 } },
          ],
          categories: [
            { $group: { _id: '$categoryId', count: { $sum: 1 } } },
            {
              $lookup: {
                from: 'categories',
                localField: '_id',
                foreignField: '_id',
                as: 'category',
              },
            },
            { $unwind: '$category' },
            {
              $project: {
                _id: '$category._id',
                name: '$category.name',
                count: 1,
              },
            },
            { $sort: { name: 1 } },
          ],
        },
      },
    ]);

    const result = facetsResult[0] || {};
    const priceStats = result.priceStats?.[0] || { minPrice: 0, maxPrice: 500, count: 0 };

    return {
      priceRange: {
        min: priceStats.minPrice || 0,
        max: priceStats.maxPrice || 500,
      },
      sizes: (result.sizes || []).map((s: any) => ({ code: s._id, count: s.count })),
      colors: (result.colors || []).map((c: any) => ({
        name: c._id.name,
        hexCode: c._id.hexCode,
        count: c.count,
      })),
      brands: result.brands || [],
      categories: result.categories || [],
      totalProducts: priceStats.count || 0,
    };
  }

  public async findById(id: string | Types.ObjectId): Promise<IProductDocument | null> {
    const isObjectId =
      typeof id === 'string'
        ? Types.ObjectId.isValid(id) && id.length === 24
        : id instanceof Types.ObjectId;

    const query = isObjectId
      ? { $or: [{ _id: id }, { slug: id.toString().toLowerCase() }], isDeleted: false }
      : { slug: (id as string).toLowerCase(), isDeleted: false };

    return ProductModel.findOne(query)
      .populate('categoryId', 'name slug')
      .populate('subcategoryId', 'name slug')
      .populate('brandId', 'name slug logo')
      .exec();
  }

  public async findBySlug(slug: string): Promise<IProductDocument | null> {
    return ProductModel.findOne({ slug: slug.toLowerCase(), isDeleted: false })
      .populate('categoryId', 'name slug')
      .populate('subcategoryId', 'name slug')
      .populate('brandId', 'name slug logo')
      .exec();
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
