import { brandRepository } from './brand.repository';
import { slugify } from '../../common/utils/slugify';
import { ConflictError, NotFoundError } from '../../common/errors/app-error';
import { IBrandDocument } from './brand.types';

export class BrandService {
  public async getBrands(): Promise<IBrandDocument[]> {
    return brandRepository.findAll();
  }

  public async getActiveBrands(): Promise<IBrandDocument[]> {
    return brandRepository.findActive();
  }

  public async getBrandById(id: string): Promise<IBrandDocument> {
    const brand = await brandRepository.findById(id);
    if (!brand) throw new NotFoundError(`Brand with ID '${id}' not found`);
    return brand;
  }

  public async createBrand(data: any): Promise<IBrandDocument> {
    let slug = data.slug ? slugify(data.slug) : slugify(data.name);
    const existing = await brandRepository.findBySlug(slug);
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }
    return brandRepository.create({ ...data, slug });
  }

  public async updateBrand(id: string, data: any): Promise<IBrandDocument> {
    const brand = await brandRepository.findById(id);
    if (!brand) throw new NotFoundError(`Brand with ID '${id}' not found`);

    if (data.slug) {
      data.slug = slugify(data.slug);
      const existing = await brandRepository.findBySlug(data.slug);
      if (existing && existing._id.toString() !== id) {
        throw new ConflictError(`Brand with slug '${data.slug}' already exists`);
      }
    }

    const updated = await brandRepository.update(id, data);
    if (!updated) throw new NotFoundError(`Failed to update brand`);
    return updated;
  }

  public async deleteBrand(id: string): Promise<void> {
    const brand = await brandRepository.findById(id);
    if (!brand) throw new NotFoundError(`Brand with ID '${id}' not found`);
    await brandRepository.softDelete(id);
  }
}

export const brandService = new BrandService();
