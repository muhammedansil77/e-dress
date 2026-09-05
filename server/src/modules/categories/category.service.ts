import { Types } from 'mongoose';
import { categoryRepository } from './category.repository';
import { CreateCategoryDTO, UpdateCategoryDTO, CategoryQueryFilters } from './category.dto';
import { ICategoryDocument, ICategoryTreeItem } from './category.types';
import { slugify } from '../../common/utils/slugify';
import { ConflictError, NotFoundError, BadRequestError } from '../../common/errors/app-error';
import { PaginatedResult } from '../../common/types';

export class CategoryService {
  public async getCategories(filters: CategoryQueryFilters): Promise<PaginatedResult<any>> {
    return categoryRepository.findPaginated(filters);
  }

  public async getCategoryById(id: string): Promise<ICategoryDocument> {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundError(`Category with ID '${id}' not found`);
    }
    return category;
  }

  public async getCategoryTree(): Promise<ICategoryTreeItem[]> {
    return categoryRepository.getCategoryTree();
  }

  public async getAllActive(): Promise<any[]> {
    return categoryRepository.findAllActive();
  }

  public async createCategory(dto: CreateCategoryDTO): Promise<ICategoryDocument> {
    // 1. Generate slug if not provided
    let slug = dto.slug ? slugify(dto.slug) : slugify(dto.name);
    if (!slug) {
      slug = `cat-${Date.now()}`;
    }

    // Check slug uniqueness
    const existingSlug = await categoryRepository.findBySlug(slug);
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    // 2. Validate parent category if provided
    let parentObjectId: Types.ObjectId | null = null;
    if (dto.parentId) {
      const parent = await categoryRepository.findById(dto.parentId);
      if (!parent) {
        throw new NotFoundError(`Parent category with ID '${dto.parentId}' does not exist`);
      }
      parentObjectId = parent._id as Types.ObjectId;
    }

    // 3. Create category
    return categoryRepository.create({
      name: dto.name.trim(),
      slug,
      description: dto.description?.trim() || '',
      image: dto.image?.trim() || '',
      parentId: parentObjectId,
      status: dto.status || 'ACTIVE',
      displayOrder: dto.displayOrder ?? 0,
      seoTitle: dto.seoTitle?.trim() || dto.name.trim(),
      seoDescription: dto.seoDescription?.trim() || '',
      isDeleted: false,
    });
  }

  public async updateCategory(id: string, dto: UpdateCategoryDTO): Promise<ICategoryDocument> {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundError(`Category with ID '${id}' not found`);
    }

    const updateData: any = {};

    if (dto.name !== undefined) {
      updateData.name = dto.name.trim();
    }

    if (dto.slug !== undefined) {
      const formattedSlug = slugify(dto.slug);
      const existing = await categoryRepository.findBySlug(formattedSlug);
      if (existing && existing._id.toString() !== id) {
        throw new ConflictError(`Category with slug '${formattedSlug}' already exists`);
      }
      updateData.slug = formattedSlug;
    }

    if (dto.description !== undefined) {
      updateData.description = dto.description.trim();
    }

    if (dto.image !== undefined) {
      updateData.image = dto.image.trim();
    }

    if (dto.status !== undefined) {
      updateData.status = dto.status;
    }

    if (dto.displayOrder !== undefined) {
      updateData.displayOrder = dto.displayOrder;
    }

    if (dto.seoTitle !== undefined) {
      updateData.seoTitle = dto.seoTitle.trim();
    }

    if (dto.seoDescription !== undefined) {
      updateData.seoDescription = dto.seoDescription.trim();
    }

    // Handle parent change and prevent circular hierarchy
    if (dto.parentId !== undefined) {
      if (dto.parentId === null || dto.parentId === '') {
        updateData.parentId = null;
      } else {
        if (dto.parentId === id) {
          throw new BadRequestError('A category cannot be its own parent');
        }

        const parent = await categoryRepository.findById(dto.parentId);
        if (!parent) {
          throw new NotFoundError(`Parent category with ID '${dto.parentId}' does not exist`);
        }

        // Prevent choosing a descendant as parent
        await this.assertNotDescendant(id, dto.parentId);

        updateData.parentId = parent._id;
      }
    }

    const updated = await categoryRepository.update(id, updateData);
    if (!updated) {
      throw new NotFoundError(`Failed to update category with ID '${id}'`);
    }

    return updated;
  }

  public async updateCategoryStatus(id: string, status: 'ACTIVE' | 'INACTIVE'): Promise<ICategoryDocument> {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundError(`Category with ID '${id}' not found`);
    }

    const updated = await categoryRepository.updateStatus(id, status);
    if (!updated) {
      throw new NotFoundError(`Failed to update status for category '${id}'`);
    }

    return updated;
  }

  public async deleteCategory(id: string): Promise<void> {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundError(`Category with ID '${id}' not found`);
    }

    // Check if category has children
    const children = await categoryRepository.findChildren(id);
    if (children.length > 0) {
      throw new BadRequestError(
        `Cannot delete category '${category.name}' because it contains ${children.length} subcategories. Please reassign or delete subcategories first.`
      );
    }

    await categoryRepository.softDelete(id);
  }

  private async assertNotDescendant(categoryId: string, targetParentId: string): Promise<void> {
    let currentId: string | null = targetParentId;
    const visited = new Set<string>();

    while (currentId) {
      if (currentId === categoryId) {
        throw new BadRequestError('Cannot select a descendant category as a parent (circular hierarchy detected)');
      }
      if (visited.has(currentId)) {
        break;
      }
      visited.add(currentId);

      const parentDoc = await categoryRepository.findById(currentId);
      currentId = parentDoc?.parentId ? parentDoc.parentId.toString() : null;
    }
  }
}

export const categoryService = new CategoryService();
