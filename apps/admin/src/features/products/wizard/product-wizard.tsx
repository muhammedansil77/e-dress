'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../../../services/product.service';
import { categoryService } from '../../../services/category.service';
import { ProductFormData } from '../../../types/product';
import { useToast } from '../../../components/ui/toast';
import { Button } from '../../../components/ui/button';
import { WizardNav, WIZARD_STEPS } from './wizard-nav';
import { StepBasic } from './step-basic';
import { StepCategory } from './step-category';
import { StepImages } from './step-images';
import { StepVariants } from './step-variants';
import { StepPricing } from './step-pricing';
import { StepInventory } from './step-inventory';
import { StepSeo } from './step-seo';
import { StepReview } from './step-review';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';

export function ProductWizard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [maxStepUnlocked, setMaxStepUnlocked] = useState(1);

  // Queries for Masters
  const { data: categoryTree = [], isLoading: loadingCategories } = useQuery({
    queryKey: ['categories', 'tree'],
    queryFn: () => categoryService.getCategoryTree(),
  });

  const { data: brands = [], isLoading: loadingBrands } = useQuery({
    queryKey: ['brands', 'active'],
    queryFn: () => productService.getBrands(),
  });

  const { data: sizes = [], isLoading: loadingSizes } = useQuery({
    queryKey: ['sizes', 'active'],
    queryFn: () => productService.getSizes(),
  });

  const { data: colors = [], isLoading: loadingColors } = useQuery({
    queryKey: ['colors', 'active'],
    queryFn: () => productService.getColors(),
  });

  const form = useForm<ProductFormData>({
    defaultValues: {
      name: '',
      slug: '',
      sku: '',
      description: '',
      shortDescription: '',
      categoryId: '',
      subcategoryId: null,
      brandId: null,
      images: [],
      price: 99,
      discountPrice: null,
      tax: 5,
      status: 'ACTIVE',
      isFeatured: false,
      isNewArrival: true,
      isBestseller: false,
      tags: [],
      seoTitle: '',
      seoDescription: '',
      variants: [],
    },
    mode: 'onChange',
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (data: ProductFormData) => productService.createProduct(data),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      success(`Product "${created.name}" created successfully!`);
      router.push('/catalog/products');
    },
    onError: (err: any) => {
      const serverErrors = err.response?.data?.errors;
      if (Array.isArray(serverErrors) && serverErrors.length > 0) {
        const detail = serverErrors
          .map((e: any) => `${e.field ? e.field + ': ' : ''}${e.message}`)
          .join(' | ');
        toastError(detail);
      } else {
        const msg = err.response?.data?.message || 'Failed to create product';
        toastError(msg);
      }
    },
  });

  const handleNext = async () => {
    // Validate step 1 if on basic
    if (currentStep === 1) {
      const isValid = await form.trigger('name');
      if (!isValid) return;
    }

    // Validate step 2 category selection
    if (currentStep === 2) {
      const isValid = await form.trigger('categoryId');
      if (!isValid) return;
    }

    const next = currentStep + 1;
    setCurrentStep(next);
    setMaxStepUnlocked((prev) => Math.max(prev, next));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStepClick = (stepId: number) => {
    setCurrentStep(stepId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinalSubmit = (statusOverride?: 'ACTIVE' | 'DRAFT') => {
    const raw = form.getValues();
    const cleanPayload: ProductFormData = {
      ...raw,
      slug: raw.slug?.trim() ? raw.slug.trim() : undefined,
      sku: raw.sku?.trim() ? raw.sku.trim() : undefined,
      brandId: raw.brandId && raw.brandId.trim() ? raw.brandId.trim() : null,
      subcategoryId: raw.subcategoryId && raw.subcategoryId.trim() ? raw.subcategoryId.trim() : null,
      status: statusOverride || raw.status || 'ACTIVE',
      price: Number(raw.price) || 0,
      discountPrice:
        raw.discountPrice !== null && raw.discountPrice !== undefined && Number(raw.discountPrice) > 0
          ? Number(raw.discountPrice)
          : null,
      tax: Number(raw.tax) || 0,
      variants: (raw.variants || []).map((v) => ({
        ...v,
        sku: v.sku?.trim() || '',
        stock: Number(v.stock) || 0,
        price: v.price !== undefined ? Number(v.price) : Number(raw.price) || 0,
        discountPrice:
          v.discountPrice !== undefined && v.discountPrice !== null ? Number(v.discountPrice) : undefined,
      })),
    };
    createMutation.mutate(cleanPayload);
  };

  const isMastersLoading = loadingCategories || loadingBrands || loadingSizes || loadingColors;

  if (isMastersLoading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-coffee-600">
        <Loader2 className="w-8 h-8 animate-spin text-gold-500 mb-3" />
        <p className="text-xs font-semibold">Loading Catalog Masters...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* 8-Step Navigation Bar */}
      <WizardNav
        currentStep={currentStep}
        onStepClick={handleStepClick}
        maxStepUnlocked={maxStepUnlocked}
      />

      {/* Step Content Card */}
      <div className="p-6 md:p-8 rounded-3xl border border-cream-400 bg-cream-50 shadow-sm">
        {currentStep === 1 && <StepBasic form={form} brands={brands} />}
        {currentStep === 2 && <StepCategory form={form} categoryTree={categoryTree} />}
        {currentStep === 3 && <StepImages form={form} />}
        {currentStep === 4 && <StepVariants form={form} colors={colors} sizes={sizes} />}
        {currentStep === 5 && <StepPricing form={form} />}
        {currentStep === 6 && <StepInventory form={form} />}
        {currentStep === 7 && <StepSeo form={form} />}
        {currentStep === 8 && (
          <StepReview
            form={form}
            categoryTree={categoryTree}
            brands={brands}
            isSubmitting={createMutation.isPending}
            onSubmit={handleFinalSubmit}
          />
        )}

        {/* Wizard Footer Controls */}
        <div className="mt-8 pt-6 border-t border-cream-400 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={handleBack}
            disabled={currentStep === 1 || createMutation.isPending}
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            <span>Back</span>
          </Button>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => router.push('/catalog/products')}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>

            {currentStep < 8 && (
              <Button type="button" variant="primary" size="md" onClick={handleNext}>
                <span>Next Step</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
