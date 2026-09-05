import { Document, Types } from 'mongoose';

export type BrandStatus = 'ACTIVE' | 'INACTIVE';

export interface IBrand {
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  website?: string;
  status: BrandStatus;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBrandDocument extends IBrand, Document<Types.ObjectId> {}
