'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/product.service';
import { ProductCard } from '../components/products/product-card';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Award,
  ChevronRight,
} from 'lucide-react';

export default function HomePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['products', 'home'],
    queryFn: () => productService.getProducts({ limit: 8 }),
  });

  const products = data?.products || [];

  const CATEGORIES_SHOWCASE = [
    {
      name: 'Maxi & Evening Dresses',
      description: 'Tiered floral georgettes and sculpted evening silhouettes',
      image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80',
      href: '/shop?category=dresses',
    },
    {
      name: 'Festive Kurti Sets',
      description: 'Pure silk blends with intricate zardozi hand embroidery',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80',
      href: '/shop?category=kurtis',
    },
    {
      name: 'Heritage Sarees',
      description: 'Traditional weaves and modern organza drapes',
      image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&q=80',
      href: '/shop?category=sarees',
    },
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* 1. Hero Editorial Section */}
      <section className="relative overflow-hidden bg-[#2F241D] text-[#FFFDF8] py-20 lg:py-32 px-4 sm:px-6 lg:px-8">
        {/* Subtle Background Glow */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#B58B45] blur-3xl" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-[#5A3E2B] blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#5A3E2B] border border-[#B58B45]/50 text-xs font-medium text-[#E8D5B5]">
            <Sparkles className="w-3.5 h-3.5 text-[#B58B45]" />
            <span>The Autumn / Festive 2026 Collection</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
            Elegance in Motion, <br />
            <span className="italic font-light text-[#B58B45]">Crafted for You.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#DED2C2] font-light leading-relaxed">
            Discover bespoke festive kurtis, ethereal georgette maxi dresses, and handcrafted sarees tailored for your most celebrated occasions.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/shop"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#B58B45] hover:bg-[#9E7432] text-[#FFFDF8] text-xs uppercase tracking-widest font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
            >
              <span>Explore The Boutique</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/shop?sort=newest"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-transparent hover:bg-[#FFFDF8]/10 text-[#FFFDF8] border border-[#DED2C2]/40 text-xs uppercase tracking-widest font-medium transition-colors"
            >
              View New Arrivals
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Curated Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#B58B45] block mb-1">
            Curated Edits
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2F241D]">
            Signature Categories
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CATEGORIES_SHOWCASE.map((cat, idx) => (
            <Link
              key={idx}
              href={cat.href}
              className="group relative rounded-2xl overflow-hidden aspect-[4/5] bg-[#2F241D] shadow-sm hover:shadow-lg transition-all"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2F241D]/90 via-[#2F241D]/30 to-transparent" />
              <div className="absolute inset-x-6 bottom-6 space-y-1.5 text-[#FFFDF8]">
                <h3 className="font-serif text-xl font-bold">{cat.name}</h3>
                <p className="text-xs text-[#DED2C2] font-light line-clamp-1">{cat.description}</p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#B58B45] pt-2 group-hover:underline">
                  Shop Collection <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Featured & Trending Dresses */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 border-b border-[#DED2C2] pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#B58B45] block mb-1">
              Handpicked Essentials
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2F241D]">
              Featured Apparel & Dresses
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-xs font-semibold uppercase tracking-widest text-[#5A3E2B] hover:text-[#B58B45] transition-colors flex items-center gap-1"
          >
            View All Pieces ({products.length}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-[#FFFDF8] rounded-2xl border border-[#DED2C2] p-4 space-y-3">
                <div className="aspect-[3/4] bg-[#EFE5D5] rounded-xl" />
                <div className="h-4 bg-[#EFE5D5] rounded w-3/4" />
                <div className="h-3 bg-[#EFE5D5] rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-[#FFFDF8] rounded-2xl border border-[#DED2C2]">
            <p className="font-serif text-lg font-bold text-[#2F241D]">No products in boutique yet</p>
            <p className="text-xs text-[#806F61] mt-1">Add dresses from the Admin panel to see them featured here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 4. Luxury Brand Story Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-[#EFE5D5] border border-[#DED2C2] p-8 sm:p-12 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-[#B58B45]">
              The Atelier Standard
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#2F241D]">
              Every Stitch Speaks of Royalty.
            </h2>
            <p className="text-xs sm:text-sm text-[#806F61] leading-relaxed">
              From hand-dyed organzas to rich Chanderi silks, our designers handcraft contemporary silhouettes that blend royal Indian heritage with modern, effortless cuts.
            </p>
            <div className="pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#5A3E2B] hover:bg-[#432C1D] text-[#FFFDF8] text-xs uppercase tracking-widest font-semibold transition-colors"
              >
                Shop By Silhouette
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
          <div className="w-full md:w-1/2 aspect-[16/10] rounded-2xl overflow-hidden shadow-md">
            <img
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80"
              alt="Atelier Crafts"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
