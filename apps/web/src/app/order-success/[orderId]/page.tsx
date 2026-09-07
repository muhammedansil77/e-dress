'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { orderService } from '../../../services/order.service';
import {
  CheckCircle,
  Package,
  Calendar,
  Truck,
  MapPin,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function OrderSuccessPage() {
  const params = useParams();
  const orderId = params.orderId as string;

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderService.getOrderById(orderId),
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <div className="bg-[#FFFDF8] rounded-3xl border border-[#DED2C2] p-8 sm:p-12 shadow-sm text-center space-y-8">
        {/* Success Icon */}
        <div className="w-20 h-20 rounded-full bg-[#ecfdf5] border-2 border-[#a7f3d0] flex items-center justify-center mx-auto text-[#059669]">
          <CheckCircle className="w-10 h-10" />
        </div>

        {/* Confirmation Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8D5B5] text-[#5A3E2B] text-xs font-semibold">
            <Sparkles className="w-3 h-3 text-[#B58B45]" />
            Order Confirmed & Atelier Dispatched
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2F241D]">
            Thank You For Your Purchase!
          </h1>
          <p className="text-xs sm:text-sm text-[#806F61] max-w-md mx-auto">
            Your designer apparel is being carefully hand-packed with boutique care.
          </p>
        </div>

        {/* Order Details Card */}
        {isLoading ? (
          <div className="p-6 rounded-2xl bg-[#F7F1E7]/60 border border-[#DED2C2] animate-pulse h-40" />
        ) : order ? (
          <div className="rounded-2xl bg-[#F7F1E7]/50 border border-[#DED2C2] p-6 text-left space-y-6 text-xs">
            {/* Meta */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-b border-[#DED2C2] pb-4">
              <div>
                <span className="text-[#806F61] block text-[10px] uppercase font-bold">Order Number</span>
                <span className="font-mono font-bold text-[#5A3E2B] text-sm">{order.orderNumber}</span>
              </div>
              <div>
                <span className="text-[#806F61] block text-[10px] uppercase font-bold">Placed On</span>
                <span className="font-medium text-[#2F241D]">
                  {new Date(order.placedAt).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-[#806F61] block text-[10px] uppercase font-bold">Payment Method</span>
                <span className="font-medium text-[#2F241D]">{order.paymentMethod}</span>
              </div>
              <div>
                <span className="text-[#806F61] block text-[10px] uppercase font-bold">Total Paid / Due</span>
                <span className="font-serif font-bold text-[#5A3E2B] text-sm">${order.grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-3">
              <span className="text-[10px] uppercase font-bold text-[#806F61] block">Purchased Pieces</span>
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3 py-1">
                  <div className="flex items-center gap-3">
                    {item.thumbnail && (
                      <img
                        src={item.thumbnail}
                        alt={item.productTitle}
                        className="w-10 h-12 rounded object-cover border border-[#DED2C2]"
                      />
                    )}
                    <div>
                      <p className="font-semibold text-[#2F241D]">{item.productTitle}</p>
                      <p className="text-[10px] text-[#806F61]">
                        Size: {item.size} • Color: {item.colorName} • Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-serif font-bold text-[#2F241D]">${item.itemTotal.toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Delivery address */}
            <div className="border-t border-[#DED2C2] pt-4 flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#B58B45] flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#2F241D]">{order.shippingAddress.fullName}</span>
                <p className="text-[#806F61]">
                  {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-[#F7F1E7] border border-[#DED2C2] text-xs text-[#806F61]">
            Order Ref: <span className="font-mono font-bold text-[#2F241D]">{orderId}</span>
          </div>
        )}

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/shop"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#5A3E2B] hover:bg-[#432C1D] text-[#FFFDF8] text-xs uppercase tracking-widest font-semibold transition-all flex items-center justify-center gap-2"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
