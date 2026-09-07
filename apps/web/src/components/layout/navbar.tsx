'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Heart,
  Search,
  Menu,
  X,
  Sparkles,
  User,
  ArrowRight,
} from 'lucide-react';
import { cartService } from '../../services/cart.service';
import { wishlistService } from '../../services/wishlist.service';

interface NavbarProps {
  onOpenCart: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCart }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  const updateCounts = () => {
    const localCart = cartService.getLocalCart();
    const count = localCart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    setCartCount(count);

    const localWishlist = wishlistService.getLocalWishlist();
    setWishlistCount(localWishlist.length);
  };

  useEffect(() => {
    updateCounts();

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('cart-updated', updateCounts);
    window.addEventListener('wishlist-updated', updateCounts);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('cart-updated', updateCounts);
      window.removeEventListener('wishlist-updated', updateCounts);
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const NAV_LINKS = [
    { label: 'Home', href: '/' },
    { label: 'All Dresses', href: '/shop' },
    { label: 'Kurtis & Sets', href: '/shop?category=kurtis' },
    { label: 'Sarees', href: '/shop?category=sarees' },
    { label: 'New Arrivals', href: '/shop?sort=newest' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300">
      {/* 1. Top Announcement Bar */}
      <div className="bg-[#5A3E2B] text-[#FFFDF8] py-1.5 px-4 text-center text-xs tracking-wider font-light flex items-center justify-center gap-2">
        <Sparkles className="w-3 h-3 text-[#B58B45]" />
        <span>Complimentary Express Delivery on Orders over $75 • Festive Couture Live</span>
      </div>

      {/* 2. Main Navigation Bar */}
      <div
        className={`w-full bg-[#FFFDF8]/95 backdrop-blur-md border-b border-[#DED2C2] transition-shadow ${
          isScrolled ? 'shadow-sm' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#5A3E2B] hover:text-[#B58B45] transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Luxury Brand Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-full bg-[#5A3E2B] text-[#FFFDF8] flex items-center justify-center border border-[#B58B45] group-hover:bg-[#432C1D] transition-colors">
              <span className="font-serif text-lg font-bold text-[#B58B45]">H</span>
            </div>
            <div>
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#2F241D] block leading-none">
                HAUTE COUTURE
              </span>
              <span className="text-[9px] uppercase tracking-[0.25em] text-[#806F61] block mt-0.5 font-medium">
                Apparel & Dresses
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-xs uppercase tracking-widest font-medium transition-colors relative py-1 ${
                    isActive ? 'text-[#5A3E2B] font-semibold' : 'text-[#806F61] hover:text-[#2F241D]'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#B58B45] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons: Search, Wishlist, Cart */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative hidden lg:block w-48 xl:w-64">
              <input
                type="text"
                placeholder="Search luxury dresses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F7F1E7] border border-[#DED2C2] rounded-full py-1.5 pl-8 pr-4 text-xs text-[#2F241D] placeholder-[#806F61]/60 focus:outline-none focus:ring-1 focus:ring-[#5A3E2B] focus:border-[#5A3E2B]"
              />
              <Search className="w-3.5 h-3.5 text-[#806F61] absolute left-2.5 top-1/2 -translate-y-1/2" />
            </form>

            {/* Wishlist Link */}
            <Link
              href="/wishlist"
              className="p-2 rounded-full hover:bg-[#F7F1E7] text-[#5A3E2B] transition-colors relative"
              title="Saved Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#e11d48] text-[#FFFDF8] text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <button
              type="button"
              onClick={onOpenCart}
              className="p-2 rounded-full hover:bg-[#F7F1E7] text-[#5A3E2B] transition-colors relative group"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 group-hover:text-[#B58B45] transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#B58B45] text-[#FFFDF8] text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#DED2C2] bg-[#FFFDF8] px-4 pt-3 pb-6 space-y-3">
            <form onSubmit={handleSearchSubmit} className="relative mb-3">
              <input
                type="text"
                placeholder="Search dresses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F7F1E7] border border-[#DED2C2] rounded-lg py-2 pl-9 pr-4 text-sm text-[#2F241D]"
              />
              <Search className="w-4 h-4 text-[#806F61] absolute left-3 top-1/2 -translate-y-1/2" />
            </form>

            <div className="flex flex-col space-y-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm font-medium text-[#2F241D] hover:bg-[#F7F1E7] rounded-lg"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium text-[#e11d48] hover:bg-[#fdf2f8] rounded-lg flex items-center justify-between"
              >
                <span>My Wishlist</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#fdf2f8] font-bold">{wishlistCount}</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
