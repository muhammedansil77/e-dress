import { Document, Types } from 'mongoose';

export type CategoryStatus = 'ACTIVE' | 'INACTIVE';

export interface ICategory {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: Types.ObjectId | null;
  status: CategoryStatus;
  displayOrder: number;
  seoTitle?: string;
  seoDescription?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategoryDocument extends ICategory, Document<Types.ObjectId> {}

export interface ICategoryTreeItem extends ICategory {
  _id: Types.ObjectId;
  children: ICategoryTreeItem[];
}
