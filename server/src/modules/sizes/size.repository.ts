import { SizeModel } from './size.model';
import { ISize, ISizeDocument } from './size.types';

export class SizeRepository {
  public async findAll(): Promise<ISizeDocument[]> {
    return SizeModel.find().sort({ sortOrder: 1, name: 1 }).exec();
  }

  public async findActive(): Promise<ISizeDocument[]> {
    return SizeModel.find({ status: 'ACTIVE' }).sort({ sortOrder: 1, name: 1 }).exec();
  }

  public async create(data: Partial<ISize>): Promise<ISizeDocument> {
    const size = new SizeModel(data);
    return size.save();
  }
}

export const sizeRepository = new SizeRepository();
