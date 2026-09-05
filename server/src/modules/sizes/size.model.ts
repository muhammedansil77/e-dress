import { Schema, model } from 'mongoose';
import { ISizeDocument } from './size.types';

const sizeSchema = new Schema<ISizeDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
      index: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: any) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const SizeModel = model<ISizeDocument>('Size', sizeSchema);
