import { productRepository } from './product.repository';
import { categoryRepository } from '../categories/category.repository';
import { CreateProductDTO, UpdateProductDTO, ProductQueryFilters } from './product.dto';
import { IProductDocument } from './product.types';
import { slugify } from '../../common/utils/slugify';
import { ConflictError, NotFoundError, BadRequestError } from '../../common/errors/app-error';
import { PaginatedResult } from '../../common/types';
import { Types } from 'mongoose';

export class ProductService {
  public async getProducts(filters: ProductQueryFilters): Promise<PaginatedResult<any>> {
    return productRepository.findPaginated(filters);
  }

  public async getProductById(id: string): Promise<IProductDocument> {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new NotFoundError(`Product with ID '${id}' not found`);
    }
    return product;
  }

  public async createProduct(dto: CreateProductDTO): Promise<IProductDocument> {
    // 1. Verify Category exists
    const category = await categoryRepository.findById(dto.categoryId);
    if (!category) {
      throw new NotFoundError(`Category with ID '${dto.categoryId}' does not exist`);
    }

    // 2. Generate slug
    let slug = dto.slug ? slugify(dto.slug) : slugify(dto.name);
    const existingSlug = await productRepository.findBySlug(slug);
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    // 3. Generate base SKU if not provided
    let baseSku = dto.sku ? dto.sku.toUpperCase().trim() : '';
    if (!baseSku) {
      const prefix = dto.name.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase() || 'DRS';
      baseSku = `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const existingSku = await productRepository.findBySku(baseSku);
    if (existingSku) {
      baseSku = `${baseSku}-${Math.floor(10 + Math.random() * 90)}`;
    }

    // 4. Process Variants
    const processedVariants = (dto.variants || []).map((v, index) => {
      const colorCode = v.color.name.substring(0, 3).toUpperCase();
      const variantSku = v.sku ? v.sku.toUpperCase() : `${baseSku}-${colorCode}-${v.size}`;
      return {
        ...v,
        sku: variantSku,
        stock: Number(v.stock) || 0,
        price: v.price !== undefined ? Number(v.price) : dto.price,
        discountPrice: v.discountPrice !== undefined ? Number(v.discountPrice) : (dto.discountPrice || undefined),
        status: v.status || 'ACTIVE',
      };
    });

    const totalStock = processedVariants.reduce((acc, v) => acc + (v.stock || 0), 0);

    return productRepository.create({
      name: dto.name.trim(),
      slug,
      sku: baseSku,
      description: dto.description || '',
      shortDescription: dto.shortDescription || '',
      categoryId: new Types.ObjectId(dto.categoryId),
      subcategoryId: dto.subcategoryId ? new Types.ObjectId(dto.subcategoryId) : null,
      brandId: dto.brandId ? new Types.ObjectId(dto.brandId) : null,
      images: dto.images || [],
      price: dto.price,
      discountPrice: dto.discountPrice || undefined,
      tax: dto.tax || 0,
      status: dto.status || 'ACTIVE',
      isFeatured: dto.isFeatured || false,
      isNewArrival: dto.isNewArrival ?? true,
      isBestseller: dto.isBestseller || false,
      tags: dto.tags || [],
      seoTitle: dto.seoTitle || dto.name,
      seoDescription: dto.seoDescription || dto.shortDescription || '',
      variants: processedVariants as any,
      totalStock,
      isDeleted: false,
    });
  }

  public async updateProduct(id: string, dto: UpdateProductDTO): Promise<IProductDocument> {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new NotFoundError(`Product with ID '${id}' not found`);
    }

    const updateData: any = { ...dto };

    if (dto.slug) {
      updateData.slug = slugify(dto.slug);
      const existing = await productRepository.findBySlug(updateData.slug);
      if (existing && existing._id.toString() !== id) {
        throw new ConflictError(`Product with slug '${updateData.slug}' already exists`);
      }
    }

    if (dto.sku) {
      updateData.sku = dto.sku.toUpperCase();
      const existing = await productRepository.findBySku(updateData.sku);
      if (existing && existing._id.toString() !== id) {
        throw new ConflictError(`Product with SKU '${updateData.sku}' already exists`);
      }
    }

    if (dto.categoryId) {
      updateData.categoryId = new Types.ObjectId(dto.categoryId);
    }
    if (dto.subcategoryId !== undefined) {
      updateData.subcategoryId = dto.subcategoryId ? new Types.ObjectId(dto.subcategoryId) : null;
    }
    if (dto.brandId !== undefined) {
      updateData.brandId = dto.brandId ? new Types.ObjectId(dto.brandId) : null;
    }

    const updated = await productRepository.update(id, updateData);
    if (!updated) throw new NotFoundError('Failed to update product');
    return updated;
  }

  public async updateStatus(id: string, status: string): Promise<IProductDocument> {
    const product = await productRepository.findById(id);
    if (!product) throw new NotFoundError(`Product with ID '${id}' not found`);
    const updated = await productRepository.updateStatus(id, status);
    if (!updated) throw new NotFoundError('Failed to update product status');
    return updated;
  }

  public async deleteProduct(id: string): Promise<void> {
    const product = await productRepository.findById(id);
    if (!product) throw new NotFoundError(`Product with ID '${id}' not found`);
    await productRepository.softDelete(id);
  }
}

export const productService = new ProductService();
