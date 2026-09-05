import { sizeRepository } from './size.repository';
import { ISizeDocument } from './size.types';

export class SizeService {
  public async getSizes(): Promise<ISizeDocument[]> {
    return sizeRepository.findAll();
  }

  public async getActiveSizes(): Promise<ISizeDocument[]> {
    return sizeRepository.findActive();
  }

  public async createSize(data: any): Promise<ISizeDocument> {
    return sizeRepository.create(data);
  }
}

export const sizeService = new SizeService();
