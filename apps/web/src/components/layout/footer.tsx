import React from 'react';
import Link from 'next/link';
import { Sparkles, ShieldCheck, Truck, RotateCcw, Award } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#2F241D] text-[#EFE5D5] pt-16 pb-12 border-t border-[#DED2C2]/30">
      {/* 1. Value Pillars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-[#5A3E2B]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-lg bg-[#5A3E2B] text-[#B58B45]">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-semibold text-[#FFFDF8]">Artisanal Couture</h4>
              <p className="text-xs text-[#806F61] mt-1">Hand-finished embroidery and premium silk georgette weaves.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-lg bg-[#5A3E2B] text-[#B58B45]">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-semibold text-[#FFFDF8]">Express Delivery</h4>
              <p className="text-xs text-[#806F61] mt-1">Complimentary expedited shipping on orders over $75.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-lg bg-[#5A3E2B] text-[#B58B45]">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-semibold text-[#FFFDF8]">Effortless Exchanges</h4>
              <p className="text-xs text-[#806F61] mt-1">Hassle-free 14-day return and size exchange policy.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-lg bg-[#5A3E2B] text-[#B58B45]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-semibold text-[#FFFDF8]">Authenticity Guaranteed</h4>
              <p className="text-xs text-[#806F61] mt-1">100% verified original designer collections.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#5A3E2B] text-[#B58B45] flex items-center justify-center font-serif font-bold text-sm">
              H
            </div>
            <span className="font-serif text-lg font-bold text-[#FFFDF8]">HAUTE COUTURE</span>
          </div>
          <p className="text-xs text-[#806F61] leading-relaxed">
            Redefining luxury fashion with contemporary Indian ethnics, flowing georgette maxis, and timeless silhouettes.
          </p>
          <div className="flex items-center gap-2 text-xs text-[#B58B45]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Boutique Atelier Since 2024</span>
          </div>
        </div>

        <div>
          <h5 className="text-xs font-semibold uppercase tracking-widest text-[#B58B45] mb-4">Collections</h5>
          <ul className="space-y-2.5 text-xs text-[#806F61]">
            <li><Link href="/shop" className="hover:text-[#FFFDF8] transition-colors">Maxi & Midi Dresses</Link></li>
            <li><Link href="/shop" className="hover:text-[#FFFDF8] transition-colors">Festive Kurti Sets</Link></li>
            <li><Link href="/shop" className="hover:text-[#FFFDF8] transition-colors">Traditional Sarees</Link></li>
            <li><Link href="/shop" className="hover:text-[#FFFDF8] transition-colors">New Arrivals</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="text-xs font-semibold uppercase tracking-widest text-[#B58B45] mb-4">Customer Care</h5>
          <ul className="space-y-2.5 text-xs text-[#806F61]">
            <li><Link href="/checkout" className="hover:text-[#FFFDF8] transition-colors">Track Your Order</Link></li>
            <li><Link href="/wishlist" className="hover:text-[#FFFDF8] transition-colors">Saved Wishlist</Link></li>
            <li><span className="text-[#806F61]">Size Guide & Dimensions</span></li>
            <li><span className="text-[#806F61]">Shipping & Customs</span></li>
          </ul>
        </div>

        <div>
          <h5 className="text-xs font-semibold uppercase tracking-widest text-[#B58B45] mb-4">Newsletter</h5>
          <p className="text-xs text-[#806F61] mb-3">Subscribe to receive exclusive invitations to private trunk shows.</p>
          <div className="flex items-center gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="bg-[#432C1D] border border-[#5A3E2B] rounded-lg px-3 py-2 text-xs text-[#FFFDF8] placeholder-[#806F61] focus:outline-none focus:ring-1 focus:ring-[#B58B45] w-full"
            />
            <button
              type="button"
              className="bg-[#B58B45] hover:bg-[#9E7432] text-[#FFFDF8] px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors"
            >
              Join
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-[#5A3E2B] text-center text-xs text-[#806F61]">
        <p>© {new Date().getFullYear()} Haute Couture Apparel Inc. All rights reserved. Designed for luxury fashion lovers.</p>
      </div>
    </footer>
  );
};
