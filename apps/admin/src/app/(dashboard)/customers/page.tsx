'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerService, CustomerUser, CustomerStatus } from '../../../services/customer.service';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Skeleton } from '../../../components/ui/skeleton';
import { EmptyState } from '../../../components/ui/empty-state';
import { Modal } from '../../../components/ui/modal';
import { useToast } from '../../../components/ui/toast';
import {
  Users,
  UserCheck,
  Heart,
  ShoppingBag,
  Search,
  RefreshCw,
  Eye,
  ShieldAlert,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Layers,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  PackageX,
  ExternalLink,
} from 'lucide-react';

export default function CustomersPage() {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | CustomerStatus>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Selected customer for modal
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerUser | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'addresses' | 'wishlist' | 'cart'>('overview');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch Customers Query
  const {
    data: response,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['customers', { page: currentPage, limit: pageSize, search: debouncedSearch, status: statusFilter }],
    queryFn: () =>
      customerService.getCustomers({
        page: currentPage,
        limit: pageSize,
        search: debouncedSearch || undefined,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
  });

  const customers = response?.data || [];
  const meta = response?.meta;

  // Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: CustomerStatus }) =>
      customerService.updateCustomerStatus(id, status),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      success(`Customer status updated to ${updated.status}`);
      if (selectedCustomer && selectedCustomer._id === updated._id) {
        setSelectedCustomer((prev) => (prev ? { ...prev, status: updated.status } : null));
      }
    },
    onError: (err: any) => {
      toastError(err?.response?.data?.message || 'Failed to update customer status');
    },
  });

  const handleToggleStatus = (customer: CustomerUser, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const nextStatus: CustomerStatus = customer.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    updateStatusMutation.mutate({ id: customer._id, status: nextStatus });
  };

  const handleOpenDetails = (customer: CustomerUser) => {
    setSelectedCustomer(customer);
    setActiveTab('overview');
    setIsDetailsOpen(true);
  };

  // KPI Calculations
  const totalCustomers = meta?.total || customers.length;
  const activeShoppersCount = customers.filter((c) => c.status === 'ACTIVE').length;
  const totalWishlistedItems = customers.reduce((acc, c) => acc + (c.wishlist?.length || 0), 0);
  const totalCartItems = customers.reduce(
    (acc, c) => acc + (c.cart?.reduce((sub, i) => sub + (i.quantity || 1), 0) || 0),
    0
  );

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#DED2C2] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#E8D5B5] text-[#5A3E2B]">
              <Sparkles className="w-3 h-3 text-[#B58B45]" />
              Luxury Fashion CRM
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-serif font-bold text-[#2F241D] tracking-tight">
            Customer Directory & Shopper Intelligence
          </h1>
          <p className="text-sm text-[#806F61] mt-1">
            Monitor registered luxury shoppers, live wishlists, active carts, and manage customer account security.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
            className="border-[#DED2C2] text-[#5A3E2B] hover:bg-[#E8D5B5]/50 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 text-[#B58B45] ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-[#DED2C2] bg-[#FFFDF8] shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#806F61]">Total Shoppers</span>
            <div className="w-9 h-9 rounded-lg bg-[#F7F1E7] border border-[#DED2C2] flex items-center justify-center text-[#5A3E2B]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-serif font-bold text-[#2F241D] mt-2">{totalCustomers}</p>
          <p className="text-xs text-[#806F61] mt-1">Registered ecommerce accounts</p>
        </div>

        <div className="p-5 rounded-xl border border-[#DED2C2] bg-[#FFFDF8] shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#806F61]">Active Shoppers</span>
            <div className="w-9 h-9 rounded-lg bg-[#ecfdf5] border border-[#a7f3d0] flex items-center justify-center text-[#059669]">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-serif font-bold text-[#059669] mt-2">{activeShoppersCount}</p>
          <p className="text-xs text-[#806F61] mt-1">Authorized to shop & checkout</p>
        </div>

        <div className="p-5 rounded-xl border border-[#DED2C2] bg-[#FFFDF8] shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#806F61]">Wishlist Engagement</span>
            <div className="w-9 h-9 rounded-lg bg-[#fdf2f8] border border-[#fbcfe8] flex items-center justify-center text-[#e11d48]">
              <Heart className="w-4 h-4 fill-current" />
            </div>
          </div>
          <p className="text-2xl font-serif font-bold text-[#e11d48] mt-2">{totalWishlistedItems}</p>
          <p className="text-xs text-[#806F61] mt-1">Dresses & apparel saved</p>
        </div>

        <div className="p-5 rounded-xl border border-[#DED2C2] bg-[#FFFDF8] shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#806F61]">Active Cart Units</span>
            <div className="w-9 h-9 rounded-lg bg-[#fffbeb] border border-[#fef3c7] flex items-center justify-center text-[#B58B45]">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-serif font-bold text-[#B58B45] mt-2">{totalCartItems}</p>
          <p className="text-xs text-[#806F61] mt-1">Items waiting in customer carts</p>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="p-4 rounded-xl border border-[#DED2C2] bg-[#FFFDF8] shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#806F61] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-[#F7F1E7] border border-[#DED2C2] text-[#2F241D] placeholder-[#806F61]/70 focus:outline-none focus:ring-1 focus:ring-[#5A3E2B] focus:border-[#5A3E2B]"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-[#806F61] whitespace-nowrap">Status:</span>
          <div className="inline-flex rounded-lg border border-[#DED2C2] bg-[#F7F1E7] p-0.5">
            {(['ALL', 'ACTIVE', 'BLOCKED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  statusFilter === st
                    ? 'bg-[#5A3E2B] text-[#FFFDF8] shadow-sm'
                    : 'text-[#806F61] hover:text-[#2F241D]'
                }`}
              >
                {st === 'ALL' ? 'All' : st === 'ACTIVE' ? 'Active' : 'Blocked'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Customer Data Table */}
      <div className="rounded-xl border border-[#DED2C2] bg-[#FFFDF8] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#DED2C2] bg-[#F7F1E7]/70 text-[11px] font-semibold tracking-wider uppercase text-[#806F61]">
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Contact & Location</th>
                <th className="py-3.5 px-4 text-center">Wishlist</th>
                <th className="py-3.5 px-4 text-center">Cart</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4">Joined On</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DED2C2] text-sm text-[#2F241D]">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#EFE5D5]" />
                        <div className="space-y-1.5">
                          <div className="h-4 w-28 bg-[#EFE5D5] rounded" />
                          <div className="h-3 w-36 bg-[#EFE5D5] rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 w-24 bg-[#EFE5D5] rounded mb-1" />
                      <div className="h-3 w-32 bg-[#EFE5D5] rounded" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="h-5 w-10 bg-[#EFE5D5] rounded-full mx-auto" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="h-5 w-10 bg-[#EFE5D5] rounded-full mx-auto" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="h-5 w-16 bg-[#EFE5D5] rounded-full mx-auto" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-3 w-20 bg-[#EFE5D5] rounded" />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="h-8 w-16 bg-[#EFE5D5] rounded ml-auto" />
                    </td>
                  </tr>
                ))
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12">
                    <EmptyState
                      title="No shoppers found"
                      description={
                        debouncedSearch
                          ? `No customer accounts matching "${debouncedSearch}".`
                          : 'No registered customer accounts yet.'
                      }
                      icon={<Users className="w-10 h-10 text-[#806F61]" />}
                    />
                  </td>
                </tr>
              ) : (
                customers.map((cust) => {
                  const defaultAddr = cust.addresses?.find((a) => a.isDefault) || cust.addresses?.[0];
                  const wishlistCount = cust.wishlist?.length || 0;
                  const cartCount = cust.cart?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;
                  const isBlocked = cust.status === 'BLOCKED';

                  return (
                    <tr
                      key={cust._id}
                      onClick={() => handleOpenDetails(cust)}
                      className="hover:bg-[#F7F1E7]/40 transition-colors cursor-pointer group"
                    >
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {cust.avatar ? (
                            <img
                              src={cust.avatar}
                              alt={cust.name}
                              className="w-10 h-10 rounded-full object-cover border border-[#DED2C2]"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-[#EFE5D5] border border-[#DED2C2] flex items-center justify-center font-serif font-bold text-[#5A3E2B]">
                              {cust.name ? cust.name.slice(0, 2).toUpperCase() : 'CU'}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-[#2F241D] group-hover:text-[#5A3E2B] transition-colors">
                              {cust.name}
                            </p>
                            <p className="text-xs text-[#806F61] flex items-center gap-1">
                              <Mail className="w-3 h-3 text-[#B58B45]" />
                              {cust.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Contact & Location */}
                      <td className="py-3.5 px-4">
                        <p className="text-xs text-[#2F241D] flex items-center gap-1">
                          <Phone className="w-3 h-3 text-[#806F61]" />
                          {cust.phone || 'No phone'}
                        </p>
                        <p className="text-xs text-[#806F61] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-[#B58B45]" />
                          {defaultAddr ? `${defaultAddr.city}, ${defaultAddr.state || defaultAddr.country}` : 'No saved address'}
                        </p>
                      </td>

                      {/* Wishlist */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            wishlistCount > 0
                              ? 'bg-[#fdf2f8] text-[#e11d48] border border-[#fbcfe8]'
                              : 'bg-[#F7F1E7] text-[#806F61]'
                          }`}
                        >
                          <Heart className={`w-3 h-3 ${wishlistCount > 0 ? 'fill-current' : ''}`} />
                          {wishlistCount}
                        </span>
                      </td>

                      {/* Cart */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            cartCount > 0
                              ? 'bg-[#fffbeb] text-[#B58B45] border border-[#fef3c7]'
                              : 'bg-[#F7F1E7] text-[#806F61]'
                          }`}
                        >
                          <ShoppingBag className="w-3 h-3" />
                          {cartCount}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            cust.status === 'ACTIVE'
                              ? 'bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0]'
                              : 'bg-[#fff1f2] text-[#e11d48] border border-[#fecdd3]'
                          }`}
                        >
                          {cust.status === 'ACTIVE' ? (
                            <>
                              <ShieldCheck className="w-3 h-3" />
                              Active
                            </>
                          ) : (
                            <>
                              <ShieldAlert className="w-3 h-3" />
                              Blocked
                            </>
                          )}
                        </span>
                      </td>

                      {/* Created At */}
                      <td className="py-3.5 px-4 text-xs text-[#806F61]">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#806F61]" />
                          {new Date(cust.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDetails(cust);
                            }}
                            className="p-1.5 rounded-lg border border-[#DED2C2] bg-[#FFFDF8] hover:bg-[#E8D5B5]/60 text-[#5A3E2B] transition-colors"
                            title="View Customer Profile & Activity"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleToggleStatus(cust, e)}
                            disabled={updateStatusMutation.isPending}
                            className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
                              isBlocked
                                ? 'border-[#a7f3d0] bg-[#ecfdf5] text-[#059669] hover:bg-[#d1fae5]'
                                : 'border-[#fecdd3] bg-[#fff1f2] text-[#e11d48] hover:bg-[#ffe4e6]'
                            }`}
                            title={isBlocked ? 'Restore Customer Shopping Privileges' : 'Block Customer from Placing Orders'}
                          >
                            {isBlocked ? 'Unblock' : 'Block'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Pagination */}
        {meta && meta.totalPages && meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#DED2C2] bg-[#F7F1E7]/50 text-xs text-[#806F61]">
            <div>
              Showing <span className="font-semibold text-[#2F241D]">{(meta.page! - 1) * meta.limit! + 1}</span> to{' '}
              <span className="font-semibold text-[#2F241D]">
                {Math.min(meta.page! * meta.limit!, meta.total || 0)}
              </span>{' '}
              of <span className="font-semibold text-[#2F241D]">{meta.total}</span> shoppers
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={!meta.hasPrevPage}
                className="border-[#DED2C2] text-[#5A3E2B] hover:bg-[#E8D5B5]/50 h-8 px-2.5"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <span className="px-2 font-medium text-[#2F241D]">
                {meta.page} / {meta.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={!meta.hasNextPage}
                className="border-[#DED2C2] text-[#5A3E2B] hover:bg-[#E8D5B5]/50 h-8 px-2.5"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 6. Customer Details Drawer / Modal */}
      <Modal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title={selectedCustomer?.name ? `${selectedCustomer.name}'s Luxury Profile` : 'Customer Details'}
        size="lg"
      >
        {selectedCustomer && (
          <div className="space-y-6">
            {/* Customer Summary Card */}
            <div className="p-4 rounded-xl border border-[#DED2C2] bg-[#F7F1E7]/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {selectedCustomer.avatar ? (
                  <img
                    src={selectedCustomer.avatar}
                    alt={selectedCustomer.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-[#B58B45]"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-[#EFE5D5] border-2 border-[#B58B45] flex items-center justify-center font-serif text-xl font-bold text-[#5A3E2B]">
                    {selectedCustomer.name ? selectedCustomer.name.slice(0, 2).toUpperCase() : 'CU'}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-serif font-bold text-[#2F241D]">{selectedCustomer.name}</h3>
                  <p className="text-xs text-[#806F61] flex items-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3 text-[#B58B45]" />
                    {selectedCustomer.email}
                  </p>
                  <p className="text-xs text-[#806F61] flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-[#806F61]" />
                    {selectedCustomer.phone || 'No phone registered'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                    selectedCustomer.status === 'ACTIVE'
                      ? 'bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0]'
                      : 'bg-[#fff1f2] text-[#e11d48] border border-[#fecdd3]'
                  }`}
                >
                  {selectedCustomer.status === 'ACTIVE' ? (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Active Customer
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Blocked Customer
                    </>
                  )}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleToggleStatus(selectedCustomer)}
                  disabled={updateStatusMutation.isPending}
                  className="border-[#DED2C2] text-[#5A3E2B] hover:bg-[#E8D5B5]"
                >
                  {selectedCustomer.status === 'ACTIVE' ? 'Block Access' : 'Activate Access'}
                </Button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-[#DED2C2] flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`pb-2.5 px-3 text-xs font-semibold transition-colors border-b-2 flex items-center gap-1.5 ${
                  activeTab === 'overview'
                    ? 'border-[#5A3E2B] text-[#5A3E2B]'
                    : 'border-transparent text-[#806F61] hover:text-[#2F241D]'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                Account Overview
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('addresses')}
                className={`pb-2.5 px-3 text-xs font-semibold transition-colors border-b-2 flex items-center gap-1.5 ${
                  activeTab === 'addresses'
                    ? 'border-[#5A3E2B] text-[#5A3E2B]'
                    : 'border-transparent text-[#806F61] hover:text-[#2F241D]'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-[#B58B45]" />
                Address Book ({selectedCustomer.addresses?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('wishlist')}
                className={`pb-2.5 px-3 text-xs font-semibold transition-colors border-b-2 flex items-center gap-1.5 ${
                  activeTab === 'wishlist'
                    ? 'border-[#5A3E2B] text-[#5A3E2B]'
                    : 'border-transparent text-[#806F61] hover:text-[#2F241D]'
                }`}
              >
                <Heart className="w-3.5 h-3.5 text-[#e11d48]" />
                Saved Wishlist ({selectedCustomer.wishlist?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('cart')}
                className={`pb-2.5 px-3 text-xs font-semibold transition-colors border-b-2 flex items-center gap-1.5 ${
                  activeTab === 'cart'
                    ? 'border-[#5A3E2B] text-[#5A3E2B]'
                    : 'border-transparent text-[#806F61] hover:text-[#2F241D]'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5 text-[#B58B45]" />
                Shopping Cart ({selectedCustomer.cart?.length || 0})
              </button>
            </div>

            {/* Tab Contents */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-lg border border-[#DED2C2] bg-[#F7F1E7]/40 space-y-2">
                  <p className="font-semibold text-[#5A3E2B] uppercase tracking-wider text-[10px]">Registration Info</p>
                  <div className="flex justify-between py-1 border-b border-[#DED2C2]/60">
                    <span className="text-[#806F61]">Customer ID:</span>
                    <span className="font-mono text-[#2F241D]">{selectedCustomer._id}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#DED2C2]/60">
                    <span className="text-[#806F61]">Joined Date:</span>
                    <span className="text-[#2F241D]">{new Date(selectedCustomer.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#806F61]">Last Active:</span>
                    <span className="text-[#2F241D]">
                      {selectedCustomer.lastLoginAt
                        ? new Date(selectedCustomer.lastLoginAt).toLocaleString()
                        : 'Never logged in'}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg border border-[#DED2C2] bg-[#F7F1E7]/40 space-y-2">
                  <p className="font-semibold text-[#5A3E2B] uppercase tracking-wider text-[10px]">Apparel Activity</p>
                  <div className="flex justify-between py-1 border-b border-[#DED2C2]/60">
                    <span className="text-[#806F61]">Wishlisted Items:</span>
                    <span className="font-bold text-[#e11d48]">{selectedCustomer.wishlist?.length || 0} dresses</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#DED2C2]/60">
                    <span className="text-[#806F61]">Cart Line Items:</span>
                    <span className="font-bold text-[#B58B45]">{selectedCustomer.cart?.length || 0} items</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#806F61]">Total Cart Units:</span>
                    <span className="font-bold text-[#5A3E2B]">
                      {selectedCustomer.cart?.reduce((acc, i) => acc + (i.quantity || 1), 0) || 0} pieces
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {selectedCustomer.addresses && selectedCustomer.addresses.length > 0 ? (
                  selectedCustomer.addresses.map((addr, idx) => (
                    <div
                      key={addr._id || idx}
                      className="p-3.5 rounded-lg border border-[#DED2C2] bg-[#F7F1E7]/30 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#2F241D]">{addr.fullName}</span>
                          <span className="px-2 py-0.5 rounded bg-[#E8D5B5] text-[#5A3E2B] text-[10px] font-semibold uppercase">
                            {addr.type}
                          </span>
                          {addr.isDefault && (
                            <span className="px-2 py-0.5 rounded bg-[#ecfdf5] text-[#059669] text-[10px] font-semibold">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-[#806F61]">{addr.street}</p>
                        <p className="text-[#806F61]">
                          {addr.city}, {addr.state} {addr.postalCode} • {addr.country}
                        </p>
                        <p className="text-[#5A3E2B] font-medium flex items-center gap-1">
                          <Phone className="w-3 h-3 text-[#B58B45]" />
                          {addr.phone}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-xs text-[#806F61]">
                    No addresses recorded in this customer's address book.
                  </div>
                )}
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {selectedCustomer.wishlist && selectedCustomer.wishlist.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedCustomer.wishlist.map((item: any, idx) => {
                      const isPopulated = typeof item === 'object' && item !== null;
                      const title = isPopulated ? item.name : `Product ID: ${item}`;
                      const price = isPopulated ? item.discountPrice || item.price : null;
                      const image = isPopulated ? item.images?.[0] : null;

                      return (
                        <div
                          key={idx}
                          className="p-3 rounded-lg border border-[#DED2C2] bg-[#F7F1E7]/30 flex items-center gap-3 text-xs"
                        >
                          {image ? (
                            <img
                              src={image}
                              alt={title}
                              className="w-12 h-14 rounded object-cover border border-[#DED2C2]"
                            />
                          ) : (
                            <div className="w-12 h-14 rounded bg-[#EFE5D5] flex items-center justify-center text-[#5A3E2B]">
                              <Heart className="w-4 h-4 text-[#e11d48]" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-[#2F241D] truncate">{title}</p>
                            {price && <p className="text-[#5A3E2B] font-serif font-bold mt-0.5">${price}</p>}
                            <span className="text-[10px] text-[#806F61] flex items-center gap-1 mt-0.5">
                              <CheckCircle2 className="w-3 h-3 text-[#059669]" />
                              Saved in Wishlist
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-xs text-[#806F61]">
                    Customer's wishlist is currently empty.
                  </div>
                )}
              </div>
            )}

            {activeTab === 'cart' && (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {selectedCustomer.cart && selectedCustomer.cart.length > 0 ? (
                  <div className="space-y-2">
                    {selectedCustomer.cart.map((item, idx) => {
                      const isPopulated = typeof item.productId === 'object' && item.productId !== null;
                      const title = isPopulated ? (item.productId as any).name : 'Apparel Item';
                      const image = isPopulated ? (item.productId as any).images?.[0] : null;

                      return (
                        <div
                          key={idx}
                          className="p-3 rounded-lg border border-[#DED2C2] bg-[#F7F1E7]/30 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {image ? (
                              <img
                                src={image}
                                alt={title}
                                className="w-11 h-13 rounded object-cover border border-[#DED2C2]"
                              />
                            ) : (
                              <div className="w-11 h-13 rounded bg-[#EFE5D5] flex items-center justify-center text-[#5A3E2B]">
                                <ShoppingBag className="w-4 h-4 text-[#B58B45]" />
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-[#2F241D]">{title}</p>
                              <p className="text-[11px] font-mono text-[#806F61]">SKU: {item.variantSku}</p>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#E8D5B5] text-[#5A3E2B] text-xs font-bold">
                              Qty: {item.quantity}
                            </span>
                            <p className="text-[10px] text-[#806F61] mt-0.5">
                              Added {item.addedAt ? new Date(item.addedAt).toLocaleDateString() : 'recently'}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-xs text-[#806F61]">
                    Customer has no active items in cart.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
