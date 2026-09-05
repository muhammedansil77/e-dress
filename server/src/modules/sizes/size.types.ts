import { Document, Types } from 'mongoose';

export interface ISize {
  name: string; // e.g. "XS", "S", "M", "L", "XL", "XXL", "XXXL"
  code: string; // e.g. "XS"
  sortOrder: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

export interface ISizeDocument extends ISize, Document<Types.ObjectId> {}
