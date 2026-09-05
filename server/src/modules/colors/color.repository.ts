import { ColorModel } from './color.model';
import { IColor, IColorDocument } from './color.types';

export class ColorRepository {
  public async findAll(): Promise<IColorDocument[]> {
    return ColorModel.find().sort({ name: 1 }).exec();
  }

  public async findActive(): Promise<IColorDocument[]> {
    return ColorModel.find({ status: 'ACTIVE' }).sort({ name: 1 }).exec();
  }

  public async create(data: Partial<IColor>): Promise<IColorDocument> {
    const color = new ColorModel(data);
    return color.save();
  }
}

export const colorRepository = new ColorRepository();
