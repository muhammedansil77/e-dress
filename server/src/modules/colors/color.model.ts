import { Schema, model } from 'mongoose';
import { IColorDocument } from './color.types';

const colorSchema = new Schema<IColorDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    hexCode: {
      type: String,
      required: true,
      trim: true,
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

export const ColorModel = model<IColorDocument>('Color', colorSchema);
