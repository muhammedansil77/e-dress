import { Schema, model } from 'mongoose';
import { IBrandDocument } from './brand.types';

const brandSchema = new Schema<IBrandDocument>(
  {
    name: {
      type: String,
      required: [true, 'Brand name is required'],
      trim: true,
      unique: true,
      minlength: 2,
      maxlength: 100,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    logo: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
      maxlength: 500,
    },
    website: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
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

export const BrandModel = model<IBrandDocument>('Brand', brandSchema);
