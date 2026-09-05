import { BrandModel } from './brand.model';
import { IBrand, IBrandDocument } from './brand.types';
import { Types } from 'mongoose';

export class BrandRepository {
  public async findAll(): Promise<IBrandDocument[]> {
    return BrandModel.find({ isDeleted: false }).sort({ name: 1 }).exec();
  }

  public async findActive(): Promise<IBrandDocument[]> {
    return BrandModel.find({ isDeleted: false, status: 'ACTIVE' }).sort({ name: 1 }).exec();
  }

  public async findById(id: string | Types.ObjectId): Promise<IBrandDocument | null> {
    return BrandModel.findOne({ _id: id, isDeleted: false }).exec();
  }

  public async findBySlug(slug: string): Promise<IBrandDocument | null> {
    return BrandModel.findOne({ slug: slug.toLowerCase(), isDeleted: false }).exec();
  }

  public async create(data: Partial<IBrand>): Promise<IBrandDocument> {
    const brand = new BrandModel(data);
    return brand.save();
  }

  public async update(id: string | Types.ObjectId, data: Partial<IBrand>): Promise<IBrandDocument | null> {
    return BrandModel.findOneAndUpdate({ _id: id, isDeleted: false }, { $set: data }, { new: true }).exec();
  }

  public async softDelete(id: string | Types.ObjectId): Promise<IBrandDocument | null> {
    return BrandModel.findOneAndUpdate({ _id: id, isDeleted: false }, { $set: { isDeleted: true } }, { new: true }).exec();
  }
}

export const brandRepository = new BrandRepository();
