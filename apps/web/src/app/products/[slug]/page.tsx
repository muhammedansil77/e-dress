'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { productService } from '../../../services/product.service';
import { cartService } from '../../../services/cart.service';
import { wishlistService } from '../../../services/wishlist.service';
import { ProductVariant } from '../../../types';
import {
  Heart,
  ShoppingBag,
  Truck,
  RotateCcw,
  ShieldCheck,
  Check,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Share2,
} from 'lucide-react';
import { VirtualFittingRoomModal } from '../../../components/fitting-room/virtual-fitting-room-modal';
import { bodyProfileService } from '../../../services/body-profile.service';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slugOrId = params.slug as string;

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', slugOrId],
    queryFn: () => productService.getProductBySlugOrId(slugOrId),
  });

  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedNotice, setAddedNotice] = useState(false);
  const [isFittingRoomOpen, setIsFittingRoomOpen] = useState(false);
  const [bodyProfile, setBodyProfile] = useState(bodyProfileService.getProfile());

  useEffect(() => {
    if (product) {
      const defaultImg = product.images?.[0] || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80';
      setSelectedImage(defaultImg);
      if (product.variants?.length > 0) {
        // Select first available variant by default
        const firstAvailable = product.variants.find((v) => v.stock > 0) || product.variants[0];
        setSelectedVariant(firstAvailable);
      }
      setIsWishlisted(wishlistService.isWishlisted(product._id));
    }

    const handleProfileUpdate = () => {
      setBodyProfile(bodyProfileService.getProfile());
    };
    window.addEventListener('body-profile-updated', handleProfileUpdate);
    return () => window.removeEventListener('body-profile-updated', handleProfileUpdate);
  }, [product]);

  const handleToggleWishlist = async () => {
    if (!product) return;
    const next = await wishlistService.toggleWishlist(product);
    setIsWishlisted(next);
  };

  const handleAddToCart = async () => {
    if (!product || !selectedVariant) return;
    await cartService.addItem(product, selectedVariant, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 3000);
  };

  const handleBuyNow = async () => {
    if (!product || !selectedVariant) return;
    await cartService.addItem(product, selectedVariant, quantity);
    router.push('/checkout');
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-[3/4] bg-[#EFE5D5] rounded-2xl" />
          <div className="space-y-4">
            <div className="h-4 bg-[#EFE5D5] rounded w-1/4" />
            <div className="h-8 bg-[#EFE5D5] rounded w-3/4" />
            <div className="h-6 bg-[#EFE5D5] rounded w-1/3" />
            <div className="h-24 bg-[#EFE5D5] rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="font-serif text-2xl font-bold text-[#2F241D]">Dress Not Found</h2>
        <p className="text-xs text-[#806F61] mt-1">This product might have been moved or archived.</p>
        <button
          onClick={() => router.push('/shop')}
          className="mt-4 px-6 py-2.5 rounded-lg bg-[#5A3E2B] text-[#FFFDF8] text-xs font-semibold"
        >
          Return to Boutique
        </button>
      </div>
    );
  }

  const brandName = typeof product.brandId === 'object' ? product.brandId?.name : '';
  const price = selectedVariant?.price || product.price;
  const discountPrice = selectedVariant?.discountPrice || product.discountPrice;
  const hasDiscount = discountPrice && discountPrice < price;
  const inStock = selectedVariant && selectedVariant.stock > 0;

  // Group variants by distinct sizes
  const sizes = Array.from(new Set(product.variants.map((v) => v.size)));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* 1. Breadcrumb */}
      <div className="text-xs text-[#806F61] flex items-center gap-1.5">
        <button onClick={() => router.push('/')} className="hover:text-[#2F241D]">Home</button>
        <ChevronRight className="w-3 h-3" />
        <button onClick={() => router.push('/shop')} className="hover:text-[#2F241D]">Dresses</button>
        <ChevronRight className="w-3 h-3" />
        <span className="text-[#2F241D] font-medium line-clamp-1">{product.name}</span>
      </div>

      {/* 2. Main Product Hero (Gallery + Information) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Gallery: 7 Cols */}
        <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
          {/* Thumbnails */}
          {product.images?.length > 1 && (
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto max-h-[600px] flex-shrink-0">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-20 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                    selectedImage === img ? 'border-[#5A3E2B] shadow-sm' : 'border-[#DED2C2] opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${product.name} view ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Main Large Image */}
          <div className="flex-1 aspect-[3/4] rounded-2xl overflow-hidden bg-[#FFFDF8] border border-[#DED2C2] relative">
            <img
              src={selectedImage || product.images?.[0] || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80'}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
            {hasDiscount && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#5A3E2B] text-[#FFFDF8] text-xs font-bold uppercase tracking-wider">
                Sale
              </span>
            )}
          </div>
        </div>

        {/* Product Purchase Actions: 5 Cols */}
        <div className="lg:col-span-5 space-y-6">
          {/* Brand & Title */}
          <div>
            {brandName && (
              <span className="text-xs uppercase font-bold tracking-widest text-[#B58B45]">
                {brandName}
              </span>
            )}
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2F241D] mt-1">
              {product.name}
            </h1>
            <p className="text-xs text-[#806F61] font-mono mt-1">SKU: {selectedVariant?.sku || product.sku}</p>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 border-b border-[#DED2C2] pb-5">
            <span className="font-serif font-bold text-3xl text-[#2F241D]">
              ${hasDiscount ? discountPrice : price}
            </span>
            {hasDiscount && (
              <span className="text-sm text-[#806F61] line-through">${price}</span>
            )}
            <span className="text-[10px] uppercase font-semibold text-[#059669] bg-[#ecfdf5] px-2 py-0.5 rounded border border-[#a7f3d0]">
              Inclusive of all taxes
            </span>
          </div>

          {/* Short Description */}
          <p className="text-xs sm:text-sm text-[#806F61] leading-relaxed">
            {product.description || product.shortDescription}
          </p>

          {/* Virtual Fitting Room & Body Visualizer Trigger */}
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => setIsFittingRoomOpen(true)}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#FAF4E8] to-[#F3E5C8] border border-[#B58B45]/70 hover:border-[#B58B45] text-[#5A3E2B] text-xs font-bold flex items-center justify-between shadow-xs hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#B58B45] group-hover:rotate-12 transition-transform" />
                <span>Try on My Virtual Body & Check Fit</span>
              </div>
              <span className="text-[11px] font-semibold text-[#B58B45] underline flex items-center gap-1">
                {bodyProfile.photoScanned ? 'Custom Scanned' : 'Configure Avatar'} →
              </span>
            </button>
            <p className="text-[10px] text-[#806F61] flex items-center justify-between px-1">
              <span>View live hemline drop & bust/waist fit on your height</span>
              {bodyProfile && (
                <span className="text-[#059669] font-medium">
                  {Math.floor(bodyProfile.heightInches / 12)}'{bodyProfile.heightInches % 12}" {bodyProfile.archetype}
                </span>
              )}
            </p>
          </div>

          {/* Size Selector */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#2F241D]">
                Select Size:
              </span>
              {selectedVariant && (
                <span className={`text-xs font-medium ${selectedVariant.stock < 5 ? 'text-[#e11d48]' : 'text-[#059669]'}`}>
                  {selectedVariant.stock > 0
                    ? `● ${selectedVariant.stock} available in stock`
                    : '✕ Currently Out of Stock'}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2.5">
              {product.variants.map((v) => {
                const isSelected = selectedVariant?.sku === v.sku;
                const isOut = v.stock === 0;

                return (
                  <button
                    key={v.sku}
                    type="button"
                    disabled={isOut}
                    onClick={() => setSelectedVariant(v)}
                    className={`min-w-12 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                      isSelected
                        ? 'bg-[#5A3E2B] border-[#5A3E2B] text-[#FFFDF8] shadow-sm'
                        : isOut
                        ? 'bg-[#F7F1E7]/50 border-[#DED2C2] text-[#806F61]/40 cursor-not-allowed line-through'
                        : 'bg-[#FFFDF8] border-[#DED2C2] text-[#2F241D] hover:border-[#5A3E2B]'
                    }`}
                  >
                    {v.size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Display */}
          {selectedVariant?.color && (
            <div className="space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#2F241D]">
                Color: <strong className="text-[#5A3E2B]">{selectedVariant.color.name}</strong>
              </span>
              <div className="flex items-center gap-2">
                <span
                  className="w-5 h-5 rounded-full border border-[#DED2C2] shadow-xs"
                  style={{ backgroundColor: selectedVariant.color.hexCode }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons: Add to Bag & Buy Now */}
          <div className="space-y-3 pt-2">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!inStock}
                className="flex-1 py-3.5 rounded-xl bg-[#5A3E2B] hover:bg-[#432C1D] disabled:bg-[#806F61] text-[#FFFDF8] text-xs uppercase tracking-widest font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{inStock ? 'Add to Shopping Bag' : 'Out of Stock'}</span>
              </button>

              <button
                type="button"
                onClick={handleToggleWishlist}
                className={`p-3.5 rounded-xl border transition-colors flex items-center justify-center ${
                  isWishlisted
                    ? 'bg-[#e11d48] border-[#e11d48] text-[#FFFDF8]'
                    : 'bg-[#FFFDF8] border-[#DED2C2] text-[#5A3E2B] hover:border-[#5A3E2B]'
                }`}
                title="Wishlist"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>

            <button
              type="button"
              onClick={handleBuyNow}
              disabled={!inStock}
              className="w-full py-3.5 rounded-xl bg-[#B58B45] hover:bg-[#9E7432] disabled:opacity-40 text-[#FFFDF8] text-xs uppercase tracking-widest font-semibold shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Instant Buy / Checkout</span>
            </button>

            {addedNotice && (
              <p className="text-xs text-[#059669] font-medium text-center flex items-center justify-center gap-1 animate-fade-in">
                <Check className="w-4 h-4" />
                <span>Added to bag! Click the cart icon to checkout.</span>
              </p>
            )}
          </div>

          {/* Value Props */}
          <div className="p-4 rounded-xl border border-[#DED2C2] bg-[#F7F1E7]/60 space-y-2.5 text-xs text-[#806F61]">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#B58B45]" />
              <span>Complimentary expedited shipping on orders over $75</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-[#B58B45]" />
              <span>14-day hassle-free returns and size exchanges</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#B58B45]" />
              <span>100% verified authentic atelier craftsmanship</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Virtual Fitting Room & Custom Body Mannequin Modal */}
      <VirtualFittingRoomModal
        isOpen={isFittingRoomOpen}
        onClose={() => setIsFittingRoomOpen(false)}
        product={product}
        selectedVariant={selectedVariant}
        onApplySize={(variant) => {
          setSelectedVariant(variant);
        }}
      />
    </div>
  );
}
