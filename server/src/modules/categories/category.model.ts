import { Schema, model } from 'mongoose';
import { ICategoryDocument } from './category.types';

const categorySchema = new Schema<ICategoryDocument>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
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
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: 1000,
    },
    image: {
      type: String,
      default: '',
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
      index: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
      index: true,
    },
    seoTitle: {
      type: String,
      trim: true,
      default: '',
      maxlength: 150,
    },
    seoDescription: {
      type: String,
      trim: true,
      default: '',
      maxlength: 300,
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

// Compound index for querying active categories by parent and displayOrder
categorySchema.index({ parentId: 1, status: 1, displayOrder: 1, isDeleted: 1 });

export const CategoryModel = model<ICategoryDocument>('Category', categorySchema);
