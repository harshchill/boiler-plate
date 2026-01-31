"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { 
  Calendar, ShieldCheck, Info, ArrowLeft, Star, 
  Plus, Minus, ShoppingCart, Heart, Share2, 
  CheckCircle, Clock, Wallet, AlertCircle,
  Activity, FileText, User, Package, Settings, LogOut  // Added missing icons
} from 'lucide-react';
import Link from 'next/link';

export default function ProductContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const productId = searchParams.get('id');
  
  const [quantity, setQuantity] = useState(1);
  const [rentalDates, setRentalDates] = useState({ start: '', end: '' });
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/products/${productId}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
        } else {
          console.error('Failed to fetch product');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // Helper function to format category name
  const formatCategory = (category) => {
    if (!category) return '';
    return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Calculate price based on hours between dates
  const calculatePrice = (startDate, endDate, hourlyRate, qty = 1) => {
    if (!startDate || !endDate || !hourlyRate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) return 0;
    
    // Calculate difference in milliseconds
    const diffMs = end - start;
    // Convert to hours (round up to nearest hour)
    const hours = Math.ceil(diffMs / (1000 * 60 * 60));
    
    // Calculate total price: hours * hourlyRate * quantity
    const totalPrice = hours * Number(hourlyRate) * qty;
    
    return totalPrice;
  };

  // Calculate current price based on selected dates
  const currentPrice = calculatePrice(
    rentalDates.start,
    rentalDates.end,
    product?.priceHourly || 0,
    quantity
  );

  // Add to cart handler
  const handleAddToCart = async () => {
    if (!product || !rentalDates.start || !rentalDates.end) {
      alert('Please select rental dates');
      return;
    }

    if (new Date(rentalDates.start) >= new Date(rentalDates.end)) {
      alert('End date must be after start date');
      return;
    }

    try {
      setAddingToCart(true);
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: quantity,
          startDate: rentalDates.start,
          endDate: rentalDates.end,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Product added to cart successfully!');
        // Optionally redirect to cart or reset form
      } else {
        alert(data.error || 'Failed to add product to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add product to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EAEFEF] flex items-center justify-center">
        <div className="text-center">
          <Package size={48} className="mx-auto mb-4 opacity-30 animate-pulse" />
          <p className="text-sm font-bold opacity-50">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#EAEFEF] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-sm font-bold opacity-50">Product not found</p>
          <Link href="/" className="mt-4 inline-block text-[#FF9B51] hover:underline">
            Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EAEFEF] font-sans pb-20" style={{ color: '#25343F' }}>
         <nav className="p-6 sticky top-0 z-50 bg-white border-b border-[#BFC9D1] shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
              <Activity size={28} style={{ color: '#FF9B51' }} /> PRO<span className="opacity-60">RENT</span>
            </h1>
            <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-[#FF9B51] transition">
          <Link href="/" className="flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Catalog
          </Link>
        </button>
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
                <span className="absolute -top-2 -right-2 bg-[#25343F] text-white text-[8px] px-1.5 rounded-full">1</span>
              </Link>
            </div>

            {/* Oval Account Profile */}
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

      <main className="max-w-7xl mx-auto px-15 grid lg:grid-cols-12 gap-12">
        
        {/* 2. LEFT COLUMN: IMAGE GALLERY */}
        <div className="lg:col-span-7 space-y-6">
          <div className="aspect-[4/3] bg-white rounded-[3rem] border-2 border-[#BFC9D1] flex items-center justify-center relative overflow-hidden group shadow-xl">
            <div className="absolute top-8 left-8 bg-[#25343F] text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest z-10">
              Vendor: {product.vendor?.companyName || product.vendor?.name || 'Unknown'}
            </div>
            {product.image ? (
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <Package size={120} className="opacity-10 text-[#25343F]" />
            )}
            {/* Tag for In-Stock status */}
            <div className={`absolute bottom-8 right-8 px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 z-10 ${
              product.totalStock > 0 && product.isRentable 
                ? 'bg-green-500 text-white' 
                : 'bg-[#25343F] text-white'
            }`}>
              <CheckCircle size={14} /> 
              {product.totalStock > 0 && product.isRentable ? 'Ready for Pickup' : 'Out of Stock'}
            </div>
          </div>
          
          {/* Thumbnail gallery - using same image for now, can be extended later */}
          {product.image && (
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <img 
                  key={i} 
                  src={product.image} 
                  alt={`${product.name} thumbnail ${i}`} 
                  className="w-full h-full object-cover rounded-2xl border border-[#BFC9D1] hover:border-[#FF9B51] transition-all cursor-pointer" 
                />
              ))}
            </div>
          )}

          {/* Added buttons below images */}
          <div className="flex gap-4">
            <button className="p-3 bg-white rounded-full shadow-sm border border-[#BFC9D1] hover:text-[#FF9B51] transition"><Heart size={18} /></button>
            <button className="p-3 bg-white rounded-full shadow-sm border border-[#BFC9D1] hover:text-[#FF9B51] transition"><Share2 size={18} /></button>
          </div>
        </div>

        {/* 3. RIGHT COLUMN: RENTAL CONFIGURATOR */}
        <div className="lg:col-span-5 space-y-8">
          <div>
            <span className="text-[#FF9B51] font-black uppercase tracking-[0.2em] text-[10px] mb-2 block">{formatCategory(product.category)}</span>
            <h1 className="text-4xl font-black uppercase leading-none tracking-tighter mb-4">{product.name}</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-[#FF9B51]">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < 4 ? "currentColor" : "none"} />)}
              </div>
              <span className="text-[10px] font-black uppercase opacity-40">Verified Product</span>
            </div>
          </div>

          {/* PRICING CARD */}
          <div className="bg-white p-8 rounded-[2.5rem] border-2 border-[#BFC9D1] shadow-2xl space-y-6">
            <div className="flex justify-between items-end pb-6 border-b border-[#EAEFEF]">
              <div>
                <p className="text-[10px] font-black uppercase opacity-40 mb-1">Rental Rate</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black">Rs{product.dailyRate || 0}</span>
                  <span className="text-xs font-bold opacity-40">/ per day</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase opacity-40 mb-1">Stock Available</p>
                <span className="text-xl font-black text-[#25343F]">{product.totalStock || 0} units</span>
              </div>
            </div>

            {/* RENTAL PERIOD PICKER */}
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <Calendar size={14} className="text-[#FF9B51]" /> Select Rental Period
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#EAEFEF] p-4 rounded-2xl border border-transparent focus-within:border-[#FF9B51] transition">
                  <p className="text-[8px] font-black uppercase opacity-40 mb-1">Start Date</p>
                  <input 
                    type="date" 
                    className="bg-transparent outline-none w-full text-xs font-bold" 
                    value={rentalDates.start}
                    onChange={(e) => setRentalDates({...rentalDates, start: e.target.value})}
                  />
                </div>
                <div className="bg-[#EAEFEF] p-4 rounded-2xl border border-transparent focus-within:border-[#FF9B51] transition">
                  <p className="text-[8px] font-black uppercase opacity-40 mb-1">End Date</p>
                  <input 
                    type="date" 
                    className="bg-transparent outline-none w-full text-xs font-bold"
                    value={rentalDates.end}
                    onChange={(e) => setRentalDates({...rentalDates, end: e.target.value})}
                  />
                </div>
              </div>
              
              {/* Calculated Price Display */}
              {rentalDates.start && rentalDates.end && currentPrice > 0 && (
                <div className="bg-[#FF9B51]/10 border border-[#FF9B51]/30 rounded-2xl p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[8px] font-black uppercase opacity-60 mb-1">Estimated Total</p>
                      <p className="text-2xl font-black text-[#FF9B51]">Rs{currentPrice.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-black uppercase opacity-60">
                        {Math.ceil((new Date(rentalDates.end) - new Date(rentalDates.start)) / (1000 * 60 * 60))} hours
                      </p>
                      <p className="text-[8px] font-bold opacity-40">× {quantity} units</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* QUANTITY & ADD TO CART */}
            <div className="flex gap-4">
              <div className="flex items-center bg-[#EAEFEF] rounded-2xl p-2">
                <button onClick={() => setQuantity(q => Math.max(1, q-1))} className="w-10 h-10 flex items-center justify-center hover:text-[#FF9B51] transition"><Minus size={16} /></button>
                <span className="w-8 text-center font-black text-sm">{quantity}</span>
                <button onClick={() => setQuantity(q => q+1)} className="w-10 h-10 flex items-center justify-center hover:text-[#FF9B51] transition"><Plus size={16} /></button>
              </div>
              <button 
                onClick={handleAddToCart}
                disabled={addingToCart || !product.isRentable || product.totalStock === 0 || !rentalDates.start || !rentalDates.end}
                className="flex-1 bg-[#FF9B51] text-white rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 shadow-lg hover:brightness-110 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart size={18} /> 
                {addingToCart ? 'Adding...' : 'Add to Rental Cart'}
              </button>
            </div>

            {/* ERP COMPLIANCE INFO */}
            <div className="p-4 bg-[#25343F] rounded-2xl flex items-center gap-4 text-white">
              <ShieldCheck size={24} className="text-[#FF9B51]" />
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest">GST & Insurance Included</p>
                <p className="text-[8px] opacity-60">Automatic Quotation generation .</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 4. DETAILS TABS SECTION (Medium Highlighted Style) */}
      <section className="max-w-7xl mx-auto px-6 mt-20">
        <div className="bg-white rounded-[3rem] border-2 border-[#BFC9D1] overflow-hidden">
          <div className="flex border-b border-[#EAEFEF] overflow-x-auto">
            {['Specifications', 'Terms of Service', 'Insurance Policy', 'Reviews'].map((tab, i) => (
              <button key={tab} className={`px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all ${i === 0 ? 'bg-[#25343F] text-white' : 'hover:bg-[#EAEFEF]'}`}>
                {tab}
              </button>
            ))}
          </div>
          <div className="p-12 grid md:grid-cols-2 gap-16">
            <div>
              <h4 className="text-xl font-black uppercase mb-6 flex items-center gap-3">
                <Info size={20} className="text-[#FF9B51]" /> Technical Overview
              </h4>
              <p className="text-sm leading-relaxed opacity-70 mb-8 font-medium">
                {product.description || 'No description available for this product.'}
              </p>
              <div className="grid grid-cols-2 gap-y-4">
                <div>
                  <p className="text-[9px] font-black uppercase opacity-40">Category</p>
                  <p className="text-xs font-bold">{formatCategory(product.category)}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase opacity-40">Stock</p>
                  <p className="text-xs font-bold">{product.totalStock} units</p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase opacity-40">Daily Rate</p>
                  <p className="text-xs font-bold">Rs{product.dailyRate || 0}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase opacity-40">Status</p>
                  <p className="text-xs font-bold">{product.isRentable ? 'Available' : 'Not Available'}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#EAEFEF] rounded-3xl p-8 space-y-6">
              <h4 className="text-sm font-black uppercase tracking-widest mb-4">Rental Lifecycle</h4>
              {[
                { icon: Clock, title: '24h Support', desc: 'On-site technical support included.' },
                { icon: Wallet, title: 'Deposit Refund', desc: 'Refunded within 48h of return inspection.' },
                { icon: AlertCircle, title: 'Damage Protection', desc: 'Basic coverage included in daily rate.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm">
                    <item.icon size={18} className="text-[#FF9B51]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase">{item.title}</p>
                    <p className="text-[9px] opacity-50 font-medium">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
