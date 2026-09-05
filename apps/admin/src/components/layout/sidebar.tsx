'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../../lib/utils';
import {
  LayoutDashboard,
  FolderTree,
  Tags,
  Sparkles,
  ShoppingBag,
  Layers,
  Ruler,
  Palette,
  Boxes,
  ShoppingCart,
  Users,
  Percent,
  Image as ImageIcon,
  MessageSquare,
  BarChart3,
  Settings,
  ChevronDown,
  ShieldCheck,
  Store,
} from 'lucide-react';

interface NavItem {
  title: string;
  href?: string;
  icon: any;
  badge?: string;
  children?: Array<{ title: string; href: string }>;
}

const NAV_ITEMS: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Catalog',
    icon: ShoppingBag,
    children: [
      { title: 'Categories', href: '/catalog/categories' },
      { title: 'Subcategories', href: '/catalog/subcategories' },
      { title: 'Brands', href: '/catalog/brands' },
      { title: 'Products / Dresses', href: '/catalog/products' },
      { title: 'Product Variants', href: '/catalog/variants' },
      { title: 'Sizes', href: '/catalog/sizes' },
      { title: 'Colors', href: '/catalog/colors' },
      { title: 'Inventory', href: '/catalog/inventory' },
    ],
  },
  {
    title: 'Orders',
    icon: ShoppingCart,
    badge: '12',
    children: [
      { title: 'All Orders', href: '/orders' },
      { title: 'Pending', href: '/orders?status=PENDING' },
      { title: 'Confirmed', href: '/orders?status=CONFIRMED' },
      { title: 'Processing', href: '/orders?status=PROCESSING' },
      { title: 'Shipped', href: '/orders?status=SHIPPED' },
      { title: 'Delivered', href: '/orders?status=DELIVERED' },
      { title: 'Cancelled', href: '/orders?status=CANCELLED' },
      { title: 'Returned', href: '/orders?status=RETURNED' },
    ],
  },
  {
    title: 'Customers',
    icon: Users,
    children: [
      { title: 'Customers', href: '/customers' },
      { title: 'Customer Details', href: '/customers/details' },
    ],
  },
  {
    title: 'Marketing',
    icon: Percent,
    children: [
      { title: 'Coupons', href: '/marketing/coupons' },
      { title: 'Banners', href: '/marketing/banners' },
      { title: 'Offers', href: '/marketing/offers' },
    ],
  },
  {
    title: 'Reviews',
    icon: MessageSquare,
    children: [{ title: 'Product Reviews', href: '/reviews' }],
  },
  {
    title: 'Reports',
    icon: BarChart3,
    children: [
      { title: 'Sales Report', href: '/reports/sales' },
      { title: 'Product Performance', href: '/reports/products' },
      { title: 'Customer Analytics', href: '/reports/customers' },
      { title: 'Inventory Valuation', href: '/reports/inventory' },
    ],
  },
  {
    title: 'Settings',
    icon: Settings,
    children: [
      { title: 'Admin Users', href: '/settings/admins' },
      { title: 'Roles & Permissions', href: '/settings/roles' },
      { title: 'Store Settings', href: '/settings/store' },
    ],
  },
];

export function Sidebar({ isMobileOpen, onCloseMobile }: { isMobileOpen?: boolean; onCloseMobile?: () => void }) {
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    Catalog: true,
  });

  const toggleSection = (title: string) => {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#2F241D]/40 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-40 w-64 border-r border-[#DED2C2] bg-[#EFE5D5] transition-transform duration-300 ease-in-out flex flex-col',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-[#DED2C2]">
          <div className="h-9 w-9 rounded-xl bg-[#5A3E2B] flex items-center justify-center text-[#FFFDF8] font-black shadow-sm">
            <Store className="w-5 h-5 text-[#B58B45]" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-[#2F241D]">
              HAUTE<span className="text-[#B58B45]"> LUXE</span>
            </span>
            <span className="block text-[10px] uppercase font-semibold text-[#806F61] tracking-wider">
              Luxury Fashion Admin
            </span>
          </div>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const hasChildren = item.children && item.children.length > 0;
            const isOpen = openSections[item.title];
            const isParentActive =
              item.href === pathname ||
              item.children?.some((child) => pathname === child.href || pathname.startsWith(child.href + '/'));

            if (!hasChildren) {
              return (
                <Link
                  key={item.title}
                  href={item.href || '#'}
                  onClick={onCloseMobile}
                  className={cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group',
                    pathname === item.href
                      ? 'bg-[#E8D5B5] text-[#2F241D] font-bold shadow-xs border-l-2 border-[#5A3E2B]'
                      : 'text-[#5A3E2B] hover:text-[#2F241D] hover:bg-[#E8D5B5]/60'
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0 text-[#5A3E2B] transition-transform group-hover:scale-110" />
                  <span>{item.title}</span>
                </Link>
              );
            }

            return (
              <div key={item.title} className="space-y-1">
                <button
                  onClick={() => toggleSection(item.title)}
                  className={cn(
                    'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group select-none',
                    isParentActive && !isOpen
                      ? 'text-[#2F241D] bg-[#E8D5B5] font-bold'
                      : 'text-[#5A3E2B] hover:text-[#2F241D] hover:bg-[#E8D5B5]/60'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0 text-[#5A3E2B] transition-transform group-hover:scale-110" />
                    <span>{item.title}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {item.badge && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E8D5B5] text-[#5A3E2B] border border-[#DED2C2]">
                        {item.badge}
                      </span>
                    )}
                    <ChevronDown
                      className={cn(
                        'w-3.5 h-3.5 text-[#806F61] transition-transform duration-200',
                        isOpen ? 'rotate-180' : ''
                      )}
                    />
                  </div>
                </button>

                {isOpen && (
                  <div className="pl-9 pr-1 py-1 space-y-0.5 animate-in fade-in-50 duration-200">
                    {item.children?.map((child) => {
                      const isChildActive = pathname === child.href || pathname.startsWith(child.href + '/');
                      return (
                        <Link
                          key={child.title}
                          href={child.href}
                          onClick={onCloseMobile}
                          className={cn(
                            'block px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                            isChildActive
                              ? 'text-[#2F241D] font-bold bg-[#E8D5B5] shadow-xs border-l-2 border-[#B58B45]'
                              : 'text-[#806F61] hover:text-[#2F241D] hover:bg-[#E8D5B5]/40'
                          )}
                        >
                          {child.title}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-[#DED2C2] bg-[#EFE5D5]">
          <div className="flex items-center gap-2 text-[11px] text-[#806F61]">
            <ShieldCheck className="w-4 h-4 text-[#B58B45]" />
            <span>Luxury Apparel Suite v1.0</span>
          </div>
        </div>
      </aside>
    </>
  );
}
