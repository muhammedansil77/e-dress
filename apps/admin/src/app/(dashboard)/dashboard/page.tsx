'use client';

import React from 'react';
import Link from 'next/link';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  FolderTree,
  Plus,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { categoryService } from '../../../services/category.service';

export default function DashboardPage() {
  const { data: categoriesResponse } = useQuery({
    queryKey: ['categories', 'summary'],
    queryFn: () => categoryService.getCategories({ limit: 5 }),
  });

  const categoryTotal = categoriesResponse?.meta?.total || 14;

  const KPI_CARDS = [
    {
      title: 'Total Sales',
      value: '$128,450.00',
      change: '+14.8%',
      isPositive: true,
      icon: DollarSign,
    },
    {
      title: 'Total Orders',
      value: '1,420',
      change: '+8.2%',
      isPositive: true,
      icon: ShoppingCart,
    },
    {
      title: 'Total Customers',
      value: '3,890',
      change: '+12.1%',
      isPositive: true,
      icon: Users,
    },
    {
      title: 'Total Catalog Products',
      value: '348',
      change: '+5.4%',
      isPositive: true,
      icon: Package,
    },
  ];

  const SECONDARY_METRICS = [
    {
      title: "Today's Sales",
      value: '$3,480.00',
      subtext: '42 transactions today',
      icon: DollarSign,
    },
    {
      title: "Today's Orders",
      value: '42 Orders',
      subtext: '5 processing now',
      icon: ShoppingBag,
    },
    {
      title: 'Pending Fulfillment',
      value: '18 Orders',
      subtext: 'Require dispatching',
      icon: Clock,
      alert: true,
    },
    {
      title: 'Low Stock Alerts',
      value: '6 Variants',
      subtext: 'Stock below threshold',
      icon: AlertTriangle,
      alert: true,
    },
  ];

  const TOP_CATEGORIES = [
    { name: 'Dresses', count: '84 Products', share: '32%', color: 'bg-coffee-700' },
    { name: 'Sarees', count: '62 Products', share: '24%', color: 'bg-gold-500' },
    { name: 'Shirts', count: '48 Products', share: '18%', color: 'bg-coffee-600' },
    { name: 'Kurtis', count: '42 Products', share: '16%', color: 'bg-gold-600' },
    { name: 'Jeans', count: '26 Products', share: '10%', color: 'bg-cream-400' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-cream-200 border border-cream-400 p-6 md:p-8 text-coffee-900 shadow-sm">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-700 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-gold-600" />
            <span>Apparel Commerce Operations</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-coffee-900">
            Store Performance & Catalog Overview
          </h1>
          <p className="mt-2 text-xs md:text-sm text-coffee-600 leading-relaxed">
            Monitor real-time fashion sales, fulfillment queues, multi-level category taxonomies, and variant inventories.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/catalog/categories">
              <Button variant="primary" size="sm" className="shadow-sm">
                <FolderTree className="w-4 h-4" />
                <span>Manage Categories ({categoryTotal})</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Ambient glow decoration */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-gold-500/10 blur-3xl" />
        <div className="pointer-events-none absolute right-48 -bottom-16 h-64 w-64 rounded-full bg-cream-300/40 blur-3xl" />
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="p-5 rounded-2xl bg-cream-50 border border-cream-400 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-coffee-600 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className="w-9 h-9 rounded-xl bg-cream-200 border border-cream-300 text-coffee-700 flex items-center justify-center shadow-sm">
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-4 flex items-baseline justify-between">
                <h3 className="text-2xl font-black text-coffee-900 tracking-tight">
                  {card.value}
                </h3>
                <div className="flex items-center text-xs font-bold text-emerald-700">
                  <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                  <span>{card.change}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Secondary Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {SECONDARY_METRICS.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.title}
              className="p-4 rounded-xl bg-cream-50 border border-cream-400 shadow-sm flex items-center gap-3.5"
            >
              <div
                className={`p-2.5 rounded-xl border ${
                  metric.alert
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-cream-200 text-coffee-700 border-cream-300'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-[11px] font-semibold text-coffee-600">
                  {metric.title}
                </span>
                <span className="block text-sm font-black text-coffee-900">
                  {metric.value}
                </span>
                <span className="block text-[10px] text-coffee-600">{metric.subtext}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout: Sales Overview Chart Placeholder & Top Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales & Orders Overview Visualization */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-cream-50 border border-cream-400 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-cream-300">
              <div>
                <h3 className="text-base font-bold text-coffee-900">
                  Revenue & Orders Overview
                </h3>
                <p className="text-xs text-coffee-600">Weekly progression of apparel sales volume</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-cream-200 border border-cream-300 text-coffee-700">
                  This Week
                </span>
              </div>
            </div>

            {/* Custom SVG Bar Visualization */}
            <div className="mt-6 h-56 flex items-end justify-between gap-3 px-2">
              {[
                { day: 'Mon', height: '55%', sales: '$14.2k' },
                { day: 'Tue', height: '70%', sales: '$18.5k' },
                { day: 'Wed', height: '45%', sales: '$12.0k' },
                { day: 'Thu', height: '85%', sales: '$22.8k' },
                { day: 'Fri', height: '95%', sales: '$26.4k' },
                { day: 'Sat', height: '80%', sales: '$21.2k' },
                { day: 'Sun', height: '65%', sales: '$16.9k' },
              ].map((bar) => (
                <div key={bar.day} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <span className="text-[10px] font-semibold text-gold-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    {bar.sales}
                  </span>
                  <div className="w-full bg-cream-200/70 rounded-t-xl overflow-hidden h-40 flex items-end">
                    <div
                      style={{ height: bar.height }}
                      className="w-full bg-coffee-700 hover:bg-gold-500 rounded-t-xl transition-all duration-300"
                    />
                  </div>
                  <span className="text-xs font-semibold text-coffee-600">{bar.day}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-cream-300 flex items-center justify-between text-xs text-coffee-600">
            <span>Peak Sales day: <strong className="text-coffee-900">Friday ($26.4k)</strong></span>
            <span className="text-gold-600 hover:text-gold-700 font-semibold cursor-pointer hover:underline transition-colors">
              View Detailed Analytics →
            </span>
          </div>
        </div>

        {/* Top Fashion Categories Breakdown */}
        <div className="p-6 rounded-2xl bg-cream-50 border border-cream-400 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-cream-300">
              <h3 className="text-base font-bold text-coffee-900">
                Top Categories
              </h3>
              <Link
                href="/catalog/categories"
                className="text-xs font-semibold text-gold-600 hover:text-gold-700 transition-colors"
              >
                All Categories →
              </Link>
            </div>

            <div className="mt-5 space-y-4">
              {TOP_CATEGORIES.map((cat) => (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-coffee-900">{cat.name}</span>
                    <span className="text-coffee-600">{cat.count}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-cream-200 overflow-hidden">
                    <div
                      style={{ width: cat.share }}
                      className={`h-full rounded-full ${cat.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-cream-300">
            <Link href="/catalog/categories" className="block">
              <Button variant="outline" size="sm" className="w-full">
                <Plus className="w-3.5 h-3.5 mr-1" />
                <span>Add New Category</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
