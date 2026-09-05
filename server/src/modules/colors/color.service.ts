import { colorRepository } from './color.repository';
import { IColorDocument } from './color.types';

export class ColorService {
  public async getColors(): Promise<IColorDocument[]> {
    return colorRepository.findAll();
  }

  public async getActiveColors(): Promise<IColorDocument[]> {
    return colorRepository.findActive();
  }

  public async createColor(data: any): Promise<IColorDocument> {
    return colorRepository.create(data);
  }
}

export const colorService = new ColorService();
