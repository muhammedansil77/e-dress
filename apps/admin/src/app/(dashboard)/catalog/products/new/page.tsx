'use client';

import { ProductWizard } from '@/features/products/wizard/product-wizard';

export default function NewProductPage() {
  return (
    <div className="space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-black text-coffee-900 tracking-tight">
          Create New Apparel Product
        </h1>
        <p className="text-xs text-coffee-600 mt-0.5">
          Follow the 8-step wizard to configure dress details, imagery, color/size variants, pricing, and SEO.
        </p>
      </div>

      <ProductWizard />
    </div>
  );
}
