'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cartService, LocalCartItem } from '../../services/cart.service';
import { orderService } from '../../services/order.service';
import { CartSummary } from '../../types';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  Lock,
  ArrowRight,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const [items, setItems] = useState<LocalCartItem[]>([]);
  const [summary, setSummary] = useState<CartSummary | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    paymentMethod: 'COD' as 'COD' | 'CARD' | 'UPI',
    notes: '',
  });

  useEffect(() => {
    const local = cartService.getLocalCart();
    setItems(local);
    setSummary(cartService.calculateSummary(local));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (items.length === 0) {
      setErrorMsg('Your shopping bag is empty.');
      return;
    }

    // Basic validation
    if (!formData.name || !formData.email || !formData.phone || !formData.street || !formData.city || !formData.state || !formData.postalCode) {
      setErrorMsg('Please complete all required shipping fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        shippingAddress: {
          fullName: formData.name,
          phone: formData.phone,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
        },
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
        items: items.map((i) => ({
          productId: i.product._id,
          variantSku: i.variant.sku,
          quantity: i.quantity,
        })),
      };

      const createdOrder = await orderService.checkout(orderPayload);

      // Clear cart
      cartService.clearCart();

      // Navigate to order confirmation
      router.push(`/order-success/${createdOrder.orderNumber || createdOrder._id}`);
    } catch (err: any) {
      console.error('Order submission failed', err);
      setErrorMsg(err?.response?.data?.message || 'Failed to place order. Please check your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#EFE5D5] flex items-center justify-center mx-auto text-[#5A3E2B]">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-[#2F241D]">Your Bag is Empty</h2>
        <p className="text-xs text-[#806F61]">Please select an elegant dress before proceeding to checkout.</p>
        <button
          onClick={() => router.push('/shop')}
          className="mt-4 px-6 py-2.5 rounded-xl bg-[#5A3E2B] text-[#FFFDF8] text-xs uppercase tracking-widest font-semibold"
        >
          Explore Collections
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="border-b border-[#DED2C2] pb-6 mb-8">
        <span className="text-xs font-semibold uppercase tracking-widest text-[#B58B45] block mb-1">
          Secure Luxury Checkout
        </span>
        <h1 className="font-serif text-3xl font-bold text-[#2F241D]">
          Complete Your Purchase
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Delivery & Payment Details (7 Cols) */}
        <div className="lg:col-span-7 space-y-8">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-[#fff1f2] border border-[#fecdd3] text-xs text-[#e11d48] font-medium">
              {errorMsg}
            </div>
          )}

          {/* Contact Information */}
          <div className="bg-[#FFFDF8] rounded-2xl border border-[#DED2C2] p-6 space-y-4 shadow-xs">
            <h3 className="font-serif font-bold text-base text-[#2F241D] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#5A3E2B] text-[#FFFDF8] text-xs flex items-center justify-center font-sans">
                1
              </span>
              Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-[#806F61] block mb-1">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-[#F7F1E7] border border-[#DED2C2] rounded-lg px-3 py-2 text-[#2F241D] focus:outline-none focus:ring-1 focus:ring-[#5A3E2B]"
                />
              </div>
              <div>
                <label className="text-[#806F61] block mb-1">Contact Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-[#F7F1E7] border border-[#DED2C2] rounded-lg px-3 py-2 text-[#2F241D] focus:outline-none focus:ring-1 focus:ring-[#5A3E2B]"
                />
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-[#FFFDF8] rounded-2xl border border-[#DED2C2] p-6 space-y-4 shadow-xs">
            <h3 className="font-serif font-bold text-base text-[#2F241D] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#5A3E2B] text-[#FFFDF8] text-xs flex items-center justify-center font-sans">
                2
              </span>
              Shipping Address
            </h3>
            <div className="space-y-4 text-xs">
              <div>
                <label className="text-[#806F61] block mb-1">Recipient Full Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Aanya Sharma"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-[#F7F1E7] border border-[#DED2C2] rounded-lg px-3 py-2 text-[#2F241D] focus:outline-none focus:ring-1 focus:ring-[#5A3E2B]"
                />
              </div>
              <div>
                <label className="text-[#806F61] block mb-1">Street Address, Suite or Villa *</label>
                <input
                  type="text"
                  name="street"
                  required
                  placeholder="Flat 402, Sea Green Apartments, Worli"
                  value={formData.street}
                  onChange={handleChange}
                  className="w-full bg-[#F7F1E7] border border-[#DED2C2] rounded-lg px-3 py-2 text-[#2F241D] focus:outline-none focus:ring-1 focus:ring-[#5A3E2B]"
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[#806F61] block mb-1">City *</label>
                  <input
                    type="text"
                    name="city"
                    required
                    placeholder="Mumbai"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full bg-[#F7F1E7] border border-[#DED2C2] rounded-lg px-3 py-2 text-[#2F241D] focus:outline-none focus:ring-1 focus:ring-[#5A3E2B]"
                  />
                </div>
                <div>
                  <label className="text-[#806F61] block mb-1">State *</label>
                  <input
                    type="text"
                    name="state"
                    required
                    placeholder="Maharashtra"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full bg-[#F7F1E7] border border-[#DED2C2] rounded-lg px-3 py-2 text-[#2F241D] focus:outline-none focus:ring-1 focus:ring-[#5A3E2B]"
                  />
                </div>
                <div>
                  <label className="text-[#806F61] block mb-1">Postal Code *</label>
                  <input
                    type="text"
                    name="postalCode"
                    required
                    placeholder="400018"
                    value={formData.postalCode}
                    onChange={handleChange}
                    className="w-full bg-[#F7F1E7] border border-[#DED2C2] rounded-lg px-3 py-2 text-[#2F241D] focus:outline-none focus:ring-1 focus:ring-[#5A3E2B]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-[#FFFDF8] rounded-2xl border border-[#DED2C2] p-6 space-y-4 shadow-xs">
            <h3 className="font-serif font-bold text-base text-[#2F241D] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#5A3E2B] text-[#FFFDF8] text-xs flex items-center justify-center font-sans">
                3
              </span>
              Payment Option
            </h3>

            <div className="space-y-3">
              <label
                className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                  formData.paymentMethod === 'COD'
                    ? 'border-[#5A3E2B] bg-[#E8D5B5]/30'
                    : 'border-[#DED2C2] bg-[#FFFDF8]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={formData.paymentMethod === 'COD'}
                    onChange={handleChange}
                    className="text-[#5A3E2B] focus:ring-[#5A3E2B]"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#2F241D] block">Cash on Delivery (Pay upon Arrival)</span>
                    <span className="text-[11px] text-[#806F61]">Verify your dress at your doorstep before payment.</span>
                  </div>
                </div>
                <Banknote className="w-5 h-5 text-[#5A3E2B]" />
              </label>

              <label
                className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                  formData.paymentMethod === 'CARD'
                    ? 'border-[#5A3E2B] bg-[#E8D5B5]/30'
                    : 'border-[#DED2C2] bg-[#FFFDF8]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CARD"
                    checked={formData.paymentMethod === 'CARD'}
                    onChange={handleChange}
                    className="text-[#5A3E2B] focus:ring-[#5A3E2B]"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#2F241D] block">Credit / Debit Card (Instant Checkout)</span>
                    <span className="text-[11px] text-[#806F61]">Visa, MasterCard, Amex, RuPay</span>
                  </div>
                </div>
                <CreditCard className="w-5 h-5 text-[#B58B45]" />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary (5 Cols) */}
        <div className="lg:col-span-5 bg-[#FFFDF8] rounded-2xl border border-[#DED2C2] p-6 space-y-6 shadow-sm sticky top-28">
          <h3 className="font-serif font-bold text-lg text-[#2F241D] border-b border-[#DED2C2] pb-3 flex items-center justify-between">
            <span>Order Summary</span>
            <span className="text-xs font-sans text-[#806F61] font-normal">
              {summary?.totalQuantity} items
            </span>
          </h3>

          {/* Line items review */}
          <div className="space-y-3 max-h-60 overflow-y-auto divide-y divide-[#DED2C2]/60 pr-1">
            {items.map((i) => {
              const price = i.variant.discountPrice || i.variant.price || i.product.discountPrice || i.product.price;
              return (
                <div key={i.variant.sku} className="pt-3 first:pt-0 flex items-center gap-3 text-xs">
                  <img
                    src={i.product.images?.[0]}
                    alt={i.product.name}
                    className="w-12 h-14 object-cover rounded border border-[#DED2C2]"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#2F241D] truncate">{i.product.name}</p>
                    <p className="text-[10px] text-[#806F61]">
                      Size: {i.variant.size} • Qty: {i.quantity}
                    </p>
                  </div>
                  <span className="font-serif font-bold text-[#2F241D]">
                    ${(price * i.quantity).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Price Breakdown */}
          {summary && (
            <div className="space-y-2 border-t border-[#DED2C2] pt-4 text-xs">
              <div className="flex justify-between text-[#806F61]">
                <span>Bag Subtotal</span>
                <span className="text-[#2F241D] font-semibold">${summary.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#806F61]">
                <span>Estimated Tax (5% GST)</span>
                <span className="text-[#2F241D] font-semibold">${summary.estimatedTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#806F61]">
                <span>Express Courier Shipping</span>
                <span className="font-semibold text-[#2F241D]">
                  {summary.shippingFee === 0 ? (
                    <span className="text-[#059669]">FREE</span>
                  ) : (
                    `$${summary.shippingFee.toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-base pt-3 border-t border-[#DED2C2] font-serif font-bold text-[#2F241D]">
                <span>Total Due</span>
                <span className="text-[#5A3E2B] text-xl">${summary.grandTotal.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Place Order CTA */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-xl bg-[#5A3E2B] hover:bg-[#432C1D] disabled:opacity-50 text-[#FFFDF8] text-xs uppercase tracking-widest font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Placing Order...' : 'Place Order & Buy Now'}</span>
          </button>

          <div className="text-[10px] text-center text-[#806F61] space-y-1">
            <p className="flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#059669]" />
              <span>Free returns within 14 days of arrival</span>
            </p>
            <p>By placing this order you agree to our Terms of Luxury Service.</p>
          </div>
        </div>
      </form>
    </div>
  );
}
