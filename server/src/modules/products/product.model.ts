import { Schema, model } from 'mongoose';
import { IProductDocument, IProductVariant } from './product.types';

const variantSchema = new Schema<IProductVariant>(
  {
    sku: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    color: {
      name: { type: String, required: true },
      hexCode: { type: String, required: true },
    },
    size: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      min: 0,
    },
    discountPrice: {
      type: Number,
      min: 0,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    image: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
    },
  },
  { _id: true }
);

const productSchema = new Schema<IProductDocument>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: 2,
      maxlength: 200,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    sku: {
      type: String,
      required: [true, 'Base SKU is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: '',
    },
    shortDescription: {
      type: String,
      default: '',
      maxlength: 300,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
      index: true,
    },
    subcategoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
      index: true,
    },
    brandId: {
      type: Schema.Types.ObjectId,
      ref: 'Brand',
      default: null,
      index: true,
    },
    images: {
      type: [String],
      default: [],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    discountPrice: {
      type: Number,
      min: 0,
      default: null,
    },
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED'],
      default: 'ACTIVE',
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isNewArrival: {
      type: Boolean,
      default: true,
      index: true,
    },
    isBestseller: {
      type: Boolean,
      default: false,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    seoTitle: {
      type: String,
      default: '',
      maxlength: 150,
    },
    seoDescription: {
      type: String,
      default: '',
      maxlength: 300,
    },
    variants: {
      type: [variantSchema],
      default: [],
    },
    totalStock: {
      type: Number,
      default: 0,
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

// Pre-save hook: auto compute totalStock from variants
productSchema.pre('save', function (next) {
  if (this.variants && this.variants.length > 0) {
    this.totalStock = this.variants.reduce((acc, v) => acc + (v.stock || 0), 0);
  }
  next();
});

// Compound search index
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ categoryId: 1, status: 1, isDeleted: 1 });
productSchema.index({ brandId: 1, status: 1, isDeleted: 1 });

export const ProductModel = model<IProductDocument>('Product', productSchema);
