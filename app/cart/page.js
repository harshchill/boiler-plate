"use client";
import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Activity, ArrowLeft, ShoppingCart, Trash2, Plus, Minus,
  Calendar, Package, User, Settings, LogOut, Heart, FileText
} from 'lucide-react';
import { getCart, removeCartItem, updateCartItemQuantity } from './actions';

export default function CartPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [updatingItems, setUpdatingItems] = useState(new Set());

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const result = await getCart();
      if (result.error) {
        console.error(result.error);
      } else {
        setCart(result.cart);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (itemId) => {
    setUpdatingItems(prev => new Set(prev).add(itemId));
    try {
      const result = await removeCartItem(itemId);
      if (result.error) {
        alert(result.error);
      } else {
        await fetchCart();
      }
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Failed to remove item');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity <= 0) return;
    
    setUpdatingItems(prev => new Set(prev).add(itemId));
    try {
      const result = await updateCartItemQuantity(itemId, newQuantity);
      if (result.error) {
        alert(result.error);
      } else {
        await fetchCart();
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Failed to update quantity');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCategory = (category) => {
    if (!category) return 'N/A';
    return category.name || category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EAEFEF] flex items-center justify-center">
        <div className="text-center">
          <Package size={48} className="mx-auto mb-4 opacity-30 animate-pulse" />
          <p className="text-sm font-bold opacity-50">Loading cart...</p>
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
            <Link href="/" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-[#FF9B51] transition">
              <ArrowLeft size={16} /> Back to Catalog
            </Link>
            <div className="hidden lg:flex space-x-6 text-[10px] font-black uppercase tracking-widest opacity-70">
              <a href="#" className="hover:text-[#FF9B51] flex items-center gap-1"><FileText size={14}/>Terms & Conditions</a>
              <a href="#" className="hover:text-[#FF9B51] transition">Product</a>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 border-r border-[#BFC9D1] pr-6">
              <button className="relative hover:text-[#FF9B51] transition">
                <Heart size={20} />
                <span className="absolute -top-2 -right-2 bg-[#FF9B51] text-white text-[8px] px-1.5 rounded-full">0</span>
              </button>
              <Link href="/cart" className="relative hover:text-[#FF9B51] transition">
                <ShoppingCart size={20} />
                <span className="absolute -top-2 -right-2 bg-[#25343F] text-white text-[8px] px-1.5 rounded-full">
                  {cart?.items?.length || 0}
                </span>
              </Link>
            </div>

            {/* Account Profile */}
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 px-4 py-2 rounded-full border-2 border-[#25343F] hover:bg-[#25343F] hover:text-white transition-all group"
              >
                <User size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">Account</span>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white border border-[#BFC9D1] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                  <div className="p-4 border-b border-[#EAEFEF] bg-[#EAEFEF]/50">
                    <p className="text-[10px] font-black opacity-40 uppercase">Signed in as</p>
                    <p className="text-xs font-bold truncate text-[#FF9B51]">
                      {session?.user?.name || 'Guest'} {session?.user?.role && `(${session.user.role})`}
                    </p>
                  </div>
                  <Link href="/cart" className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold hover:bg-[#EAEFEF] transition-colors">
                    <ShoppingCart size={14}/> My Cart
                  </Link>
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold hover:bg-[#EAEFEF] transition-colors"><Package size={14}/> My Orders</button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold hover:bg-[#EAEFEF] transition-colors"><Settings size={14}/> Settings</button>
                  <button 
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold hover:bg-red-50 text-red-500 transition-colors border-t border-[#EAEFEF]"
                  >
                    <LogOut size={14}/> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Your Cart</h1>
          <p className="text-sm opacity-60">Review your rental items</p>
        </div>

        {!cart || !cart.items || cart.items.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-16 border-2 border-[#BFC9D1] text-center">
            <ShoppingCart size={64} className="mx-auto mb-6 opacity-20" />
            <h2 className="text-2xl font-black mb-4">Your cart is empty</h2>
            <p className="text-sm opacity-60 mb-8">Start adding products to your cart</p>
            <Link 
              href="/"
              className="inline-block bg-[#FF9B51] text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:brightness-110 transition"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => {
                const isUpdating = updatingItems.has(item.id);
                const hours = Math.ceil((new Date(item.endDate) - new Date(item.startDate)) / (1000 * 60 * 60));
                
                return (
                  <div key={item.id} className="bg-white rounded-[2.5rem] p-6 border-2 border-[#BFC9D1]">
                    <div className="flex gap-6">
                      {/* Product Image */}
                      <div className="w-32 h-32 rounded-2xl bg-[#EAEFEF] overflow-hidden flex-shrink-0">
                        {item.product.image ? (
                          <img 
                            src={item.product.image} 
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-full h-full p-6 opacity-20" />
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-xl font-black mb-1">{item.product.name}</h3>
                            <p className="text-[10px] font-black uppercase opacity-40 mb-2">
                              {formatCategory(item.product.category)}
                            </p>
                            <p className="text-xs opacity-60">
                              Vendor: {item.product.vendor?.companyName || item.product.vendor?.name || 'Unknown'}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={isUpdating}
                            className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition disabled:opacity-50"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                        {/* Rental Period */}
                        <div className="flex items-center gap-4 mb-4 text-xs">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="opacity-40" />
                            <span className="font-bold">
                              {formatDate(item.startDate)} - {formatDate(item.endDate)}
                            </span>
                          </div>
                          <span className="opacity-40">•</span>
                          <span className="opacity-60">{hours} hours</span>
                        </div>

                        {/* Quantity and Price */}
                        <div className="flex justify-between items-center">
                          <div className="flex items-center bg-[#EAEFEF] rounded-2xl p-1">
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              disabled={isUpdating || item.quantity <= 1}
                              className="w-8 h-8 flex items-center justify-center hover:text-[#FF9B51] transition disabled:opacity-50"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-8 text-center font-black text-sm">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              disabled={isUpdating}
                              className="w-8 h-8 flex items-center justify-center hover:text-[#FF9B51] transition disabled:opacity-50"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-black text-[#FF9B51]">
                              Rs{Number(item.price || 0).toFixed(2)}
                            </p>
                            <p className="text-[10px] opacity-40">
                              Rs{Number(item.product.priceHourly || 0).toFixed(2)}/hour × {hours}h × {item.quantity}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-[2.5rem] p-8 border-2 border-[#BFC9D1] sticky top-24">
                <h2 className="text-xl font-black uppercase mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="opacity-60">Subtotal</span>
                    <span className="font-bold">Rs{Number(cart.totalAmount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="opacity-60">GST (18%)</span>
                    <span className="font-bold">Rs{(Number(cart.totalAmount || 0) * 0.18).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-[#EAEFEF] pt-4 flex justify-between">
                    <span className="font-black uppercase">Total</span>
                    <span className="text-2xl font-black text-[#FF9B51]">
                      Rs{(Number(cart.totalAmount || 0) * 1.18).toFixed(2)}
                    </span>
                  </div>
                </div>

                <button className="w-full bg-[#FF9B51] text-white rounded-2xl font-black uppercase tracking-widest text-xs py-4 hover:brightness-110 transition">
                  Proceed to Checkout
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
        )}
      </main>
    </div>
  );
}
