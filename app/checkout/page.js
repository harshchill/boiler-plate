"use client";
import React, { useEffect, useState, useTransition } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Activity, ArrowLeft, Package, ShoppingCart, CheckCircle2 } from 'lucide-react';
import { getCheckoutData, saveAddress, saveDeliveryMethod, confirmOrder, payNow } from './actions';

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [user, setUser] = useState(null);
  const [address, setAddress] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('COD');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin?callbackUrl=/checkout');
      return;
    }
    if (status === 'authenticated') {
      (async () => {
        setLoading(true);
        const res = await getCheckoutData();
        if (res?.error === 'Unauthorized') {
          router.push('/api/auth/signin?callbackUrl=/checkout');
          return;
        }
        setUser(res.user || null);
        setOrder(res.order || null);
        setAddress(res.order?.shippingAddress || res.user?.address || '');
        setDeliveryMethod(res.order?.deliveryMethod || 'COD');
        setIsLocked(res.order?.status === 'SALE_ORDER');
        setLoading(false);
      })();
    }
  }, [status, router]);

  const subtotal = Number(order?.totalAmount || order?.items?.reduce((s, it) => s + Number(it.price || 0), 0) || 0);
  const gst = subtotal * 0.18;
  const total = subtotal + gst;

  const handleSaveAddress = () => {
    setError('');
    startTransition(async () => {
      const r = await saveAddress(address);
      if (r?.error) setError(r.error);
    });
  };

  const handleSaveMethod = (method) => {
    setDeliveryMethod(method);
    setError('');
    startTransition(async () => {
      const r = await saveDeliveryMethod(method);
      if (r?.error) setError(r.error);
    });
  };

  const handleConfirmOrPay = () => {
    setError('');
    if (!isLocked) {
      startTransition(async () => {
        const r = await confirmOrder();
        if (r?.error) {
          setError(r.error);
        } else {
          setIsLocked(true);
        }
      });
    } else {
      startTransition(async () => {
        const r = await payNow();
        if (r?.error) {
          setError(r.error);
        } else {
          setSuccessMsg('Payment successful. Your rental is confirmed.');
          // Optional redirect after a short delay
          setTimeout(() => router.push('/'), 1800);
        }
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EAEFEF] flex items-center justify-center">
        <div className="text-center">
          <Package size={48} className="mx-auto mb-4 opacity-30 animate-pulse" />
          <p className="text-sm font-bold opacity-50">Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EAEFEF] font-sans pb-20" style={{ color: '#25343F' }}>
      {/* Navbar */}
      <nav className="p-6 sticky top-0 z-50 bg-white border-b border-[#BFC9D1] shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
              <Activity size={28} style={{ color: '#FF9B51' }} /> PRO<span className="opacity-60">RENT</span>
            </Link>
            <Link href="/cart" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-[#FF9B51] transition">
              <ArrowLeft size={16} /> Back to Cart
            </Link>
          </div>
          <Link href="/cart" className="relative hover:text-[#FF9B51] transition">
            <ShoppingCart size={20} />
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Confirm Order</h1>
          <p className="text-sm opacity-60">Complete your details and confirm your rental</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm font-bold">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-2xl text-sm font-bold flex items-center gap-2">
            <CheckCircle2 size={18} /> {successMsg}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Address + Delivery Method */}
          <div className="lg:col-span-2 space-y-6">
            {/* Address */}
            <div className="bg-white rounded-[2.5rem] p-8 border-2 border-[#BFC9D1]">
              <h2 className="text-xl font-black uppercase mb-4">Shipping Address</h2>
              <textarea
                className="w-full border-2 border-[#BFC9D1] rounded-2xl p-4 outline-none focus:border-[#FF9B51] text-sm"
                rows={4}
                placeholder="Enter your full address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={isLocked || isPending}
              />
              <div className="mt-3 flex justify-end">
                <button
                  onClick={handleSaveAddress}
                  disabled={isLocked || isPending}
                  className="bg-[#25343F] text-white rounded-2xl font-black uppercase tracking-widest text-xs py-3 px-6 disabled:opacity-50"
                >
                  Save Address
                </button>
              </div>
            </div>

            {/* Delivery Method */}
            <div className="bg-white rounded-[2.5rem] p-8 border-2 border-[#BFC9D1]">
              <h2 className="text-xl font-black uppercase mb-4">Delivery Method</h2>
              <div className="flex gap-4">
                <button
                  onClick={() => handleSaveMethod('COD')}
                  disabled={isLocked || isPending}
                  className={`flex-1 border-2 rounded-2xl p-4 font-bold text-sm ${deliveryMethod === 'COD' ? 'border-[#FF9B51] text-[#FF9B51]' : 'border-[#BFC9D1] text-[#25343F]'}`}
                >
                  Cash on Delivery (COD)
                </button>
                <button
                  onClick={() => handleSaveMethod('PICKUP')}
                  disabled={isLocked || isPending}
                  className={`flex-1 border-2 rounded-2xl p-4 font-bold text-sm ${deliveryMethod === 'PICKUP' ? 'border-[#FF9B51] text-[#FF9B51]' : 'border-[#BFC9D1] text-[#25343F]'}`}
                >
                  Self Pickup
                </button>
              </div>
            </div>
          </div>

          {/* Right: Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[2.5rem] p-8 border-2 border-[#BFC9D1] sticky top-24">
              <h2 className="text-xl font-black uppercase mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="opacity-60">Subtotal</span>
                  <span className="font-bold">Rs{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="opacity-60">GST (18%)</span>
                  <span className="font-bold">Rs{gst.toFixed(2)}</span>
                </div>
                <div className="border-t border-[#EAEFEF] pt-4 flex justify-between">
                  <span className="font-black uppercase">Total</span>
                  <span className="text-2xl font-black text-[#FF9B51]">Rs{total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleConfirmOrPay}
                disabled={isPending || (!order?.items?.length)}
                className={`w-full ${isLocked ? 'bg-green-600' : 'bg-[#FF9B51]'} text-white rounded-2xl font-black uppercase tracking-widest text-xs py-4 hover:brightness-110 transition disabled:opacity-50`}
              >
                {isLocked ? 'Pay Now' : 'Confirm Order'}
              </button>

              <Link
                href="/"
                className="block w-full text-center mt-4 text-sm font-bold text-[#25343F] hover:text-[#FF9B51] transition"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
