import { Document, Types } from 'mongoose';

export interface IColor {
  name: string; // e.g. "Crimson Red"
  hexCode: string; // e.g. "#E11D48"
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

export interface IColorDocument extends IColor, Document<Types.ObjectId> {}
