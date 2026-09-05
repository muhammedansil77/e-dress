import { Types, FilterQuery } from 'mongoose';
import { CategoryModel } from './category.model';
import { ICategory, ICategoryDocument, ICategoryTreeItem } from './category.types';
import { CategoryQueryFilters } from './category.dto';
import { PaginatedResult } from '../../common/types';

export class CategoryRepository {
  public async findPaginated(filters: CategoryQueryFilters): Promise<PaginatedResult<any>> {
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 10;
    const skip = (page - 1) * limit;

    const query: FilterQuery<ICategoryDocument> = { isDeleted: false };

    if (filters.search) {
      const searchRegex = new RegExp(filters.search.trim(), 'i');
      query.$or = [{ name: searchRegex }, { slug: searchRegex }, { description: searchRegex }];
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.parentId !== undefined) {
      if (filters.parentId === 'null' || filters.parentId === '' || filters.parentId === null) {
        query.parentId = null;
      } else if (typeof filters.parentId === 'string' && Types.ObjectId.isValid(filters.parentId)) {
        query.parentId = new Types.ObjectId(filters.parentId);
      }
    }

    const sortField = filters.sortBy || 'displayOrder';
    const sortDirection = filters.sortOrder === 'desc' ? -1 : 1;
    const sortOptions: Record<string, 1 | -1> = { [sortField]: sortDirection };

    if (sortField !== 'createdAt') {
      sortOptions.createdAt = -1;
    }

    const [items, total] = await Promise.all([
      CategoryModel.find(query)
        .populate('parentId', 'name slug')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      CategoryModel.countDocuments(query),
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

  public async findById(id: string | Types.ObjectId): Promise<ICategoryDocument | null> {
    return CategoryModel.findOne({ _id: id, isDeleted: false }).populate('parentId', 'name slug').exec();
  }

  public async findBySlug(slug: string): Promise<ICategoryDocument | null> {
    return CategoryModel.findOne({ slug: slug.toLowerCase(), isDeleted: false }).exec();
  }

  public async findChildren(parentId: string | Types.ObjectId): Promise<ICategoryDocument[]> {
    return CategoryModel.find({ parentId, isDeleted: false }).sort({ displayOrder: 1 }).exec();
  }

  public async findAllActive(): Promise<any[]> {
    return CategoryModel.find({ isDeleted: false, status: 'ACTIVE' })
      .select('name slug parentId displayOrder image')
      .sort({ displayOrder: 1, name: 1 })
      .lean()
      .exec();
  }

  public async getCategoryTree(): Promise<ICategoryTreeItem[]> {
    const allCategories = await CategoryModel.find({ isDeleted: false })
      .sort({ displayOrder: 1, name: 1 })
      .lean()
      .exec();

    const categoryMap = new Map<string, any>();
    const tree: ICategoryTreeItem[] = [];

    // Initialize map
    allCategories.forEach((cat) => {
      categoryMap.set(cat._id.toString(), { ...cat, children: [] });
    });

    // Build hierarchy
    allCategories.forEach((cat) => {
      const catWithChildren = categoryMap.get(cat._id.toString());
      if (cat.parentId && categoryMap.has(cat.parentId.toString())) {
        categoryMap.get(cat.parentId.toString()).children.push(catWithChildren);
      } else {
        tree.push(catWithChildren);
      }
    });

    return tree;
  }

  public async create(data: Partial<ICategory>): Promise<ICategoryDocument> {
    const category = new CategoryModel(data);
    return category.save();
  }

  public async update(id: string | Types.ObjectId, data: Partial<ICategory>): Promise<ICategoryDocument | null> {
    return CategoryModel.findOneAndUpdate({ _id: id, isDeleted: false }, { $set: data }, { new: true })
      .populate('parentId', 'name slug')
      .exec();
  }

  public async updateStatus(id: string | Types.ObjectId, status: 'ACTIVE' | 'INACTIVE'): Promise<ICategoryDocument | null> {
    return CategoryModel.findOneAndUpdate({ _id: id, isDeleted: false }, { $set: { status } }, { new: true })
      .populate('parentId', 'name slug')
      .exec();
  }

  public async softDelete(id: string | Types.ObjectId): Promise<ICategoryDocument | null> {
    return CategoryModel.findOneAndUpdate({ _id: id, isDeleted: false }, { $set: { isDeleted: true } }, { new: true }).exec();
  }

  public async countAll(): Promise<number> {
    return CategoryModel.countDocuments({ isDeleted: false });
  }
}

export const categoryRepository = new CategoryRepository();
