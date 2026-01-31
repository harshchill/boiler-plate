"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, Save, X, ImageIcon, ChevronRight, 
  Layers, Tag, Info, ShieldCheck, Globe 
} from 'lucide-react';

import VendorNavbar from '@/app/components/navbar/Vendornavbar';

const AddProduct = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [isPublished, setIsPublished] = useState(false);
  const userRole = 'vendor'; // Admin logic validation 

  const tabVariants = {
    initial: { opacity: 0, x: 10 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -10 }
  };
   
  return (
    <div className="min-h-screen bg-[#F4F7F7] font-sans text-[#25343F] selection:bg-[#FF9B51]/30">
    <VendorNavbar/>

      <main className="max-w-6xl mx-auto p-4 md:p-10">
        {/* Superior Header Navigation */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#FF9B51]">
              <Package size={14} /> Catalog Management
            </div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic flex items-center gap-3">
              New <span className="text-slate-400">/</span> <span className="text-[#25343F]">Product</span>
            </h1>
          </div>

          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
            <motion.button 
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="bg-[#25343F] text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-[#FF9B51] hover:text-[#25343F] transition-all"
            >
              <Save size={16} /> Save Product
            </motion.button>
            <button className="p-2.5 hover:bg-red-50 rounded-xl text-red-500 transition-colors border border-transparent hover:border-red-100">
              <X size={20} />
            </button>
          </div>
        </header>

        {/* Input Focus Area */}
        <div className="mb-12 group">
          <label className="text-[10px] font-black uppercase opacity-40 mb-2 block tracking-[0.3em] group-focus-within:text-[#FF9B51] transition-colors">
            Identity Label
          </label>
          <input 
            type="text" 
            placeholder="What are we renting today? (e.g. Industrial Drone)" 
            className="w-full bg-transparent border-b-4 border-slate-200 text-3xl md:text-5xl font-black outline-none py-4 focus:border-[#25343F] transition-all placeholder:text-slate-200"
          />
        </div>

        {/* Core Management Surface */}
        <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/60 border border-white overflow-hidden flex flex-col md:flex-row">
          
          {/* Vertical Smart Tabs */}
          <aside className="w-full md:w-72 bg-[#25343F] p-4 flex md:flex-col gap-2">
            {[
              { id: 'general', label: 'General Info', icon: <Info size={16}/> },
              { id: 'variants', label: 'Attributes', icon: <Layers size={16}/> },
              { id: 'inventory', label: 'Inventory', icon: <Package size={16}/> }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab.id 
                  ? 'bg-[#FF9B51] text-[#25343F] shadow-lg shadow-[#FF9B51]/20 translate-x-1' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </aside>

          {/* Form Content Area */}
          <div className="flex-1 p-8 md:p-14">
            <AnimatePresence mode="wait">
              {activeTab === 'general' && (
                <motion.div 
                  variants={tabVariants} initial="initial" animate="animate" exit="exit"
                  className="grid grid-cols-1 lg:grid-cols-12 gap-12"
                >
                  {/* Left Form Block */}
                  <div className="lg:col-span-7 space-y-10">
                    {/* Product Type Selection */}
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Classification</label>
                      <div className="flex gap-4">
                        {['Goods', 'Service'].map((type) => (
                          <label key={type} className="flex-1 relative cursor-pointer group">
                            <input type="radio" name="pType" className="peer sr-only" defaultChecked={type === 'Goods'} />
                            <div className="p-4 border-2 border-slate-100 rounded-2xl text-center font-bold text-sm peer-checked:border-[#25343F] peer-checked:bg-[#25343F] peer-checked:text-white group-hover:border-slate-300 transition-all uppercase tracking-tighter">
                              {type}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Pricing Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Sales Price </label>
                        <div className="flex items-center bg-slate-50 rounded-2xl p-4 border border-slate-100 focus-within:border-[#FF9B51] transition-all">
                          <span className="font-black mr-2 opacity-30"></span>
                          <input type="number" placeholder="0.00" className="bg-transparent outline-none w-full font-bold" />
                          <select className="bg-white text-[9px] font-black uppercase px-2 py-1 rounded-lg border shadow-sm outline-none">
                            <option>Per Day</option>
                            <option>Per Hour</option>
                            <option>Unit</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Cost Price </label>
                        <div className="flex items-center bg-slate-50 rounded-2xl p-4 border border-slate-100">
                          <span className="font-black mr-2 opacity-30">₹</span>
                          <input type="number" placeholder="0.00" className="bg-transparent outline-none w-full font-bold" />
                        </div>
                      </div>
                    </div>

                    {/* Category Selection */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Inventory Category</label>
                      <div className="relative group">
                        <select className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 outline-none font-bold text-sm appearance-none cursor-pointer">
                          <option>Electronics / Gadgets</option>
                          <option>Heavy Construction</option>
                          <option>Event Furniture</option>
                        </select>
                        <ChevronRight className="absolute right-4 top-4 rotate-90 opacity-20 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </div>

                  {/* Right Media Block */}
                  <div className="lg:col-span-5 space-y-8">
                    {/* Visual Asset Container */}
                    <div className="w-full aspect-[4/3] bg-[#EAEFEF] rounded-[2.5rem] border-4 border-dashed border-white shadow-inner flex flex-col items-center justify-center text-[#25343F] relative overflow-hidden group">
                      <div className="flex flex-col items-center group-hover:scale-110 transition-transform duration-500">
                        <ImageIcon size={48} className="text-[#FF9B51] mb-2" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Drop Product Image</span>
                      </div>
                      <div className="absolute inset-0 bg-[#25343F]/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <button className="bg-[#FF9B51] text-[#25343F] px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest">Select File</button>
                      </div>
                    </div>

                    {/* Administrative Status Block [cite: 22, 46] */}
                    <div className={`p-8 rounded-[2rem] border-2 transition-all ${isPublished ? 'bg-green-50 border-green-100' : 'bg-slate-50 border-slate-100'}`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-xs font-black uppercase flex items-center gap-2">
                            <Globe size={14} className={isPublished ? 'text-green-600' : 'text-slate-400'} />
                            Web Visibility
                          </p>
                          <p className="text-[9px] font-bold opacity-40 mt-1 italic uppercase tracking-tighter">
                            {isPublished ? 'Visible in Online Store' : 'Draft / Private Mode'}
                          </p>
                        </div>
                        <button 
                          onClick={() => userRole === 'admin' && setIsPublished(!isPublished)}
                          className={`w-14 h-8 rounded-full p-1.5 transition-all relative ${isPublished ? 'bg-[#25343F]' : 'bg-slate-300'} ${userRole !== 'admin' && 'opacity-30 grayscale cursor-not-allowed'}`}
                        >
                          <motion.div animate={{ x: isPublished ? 24 : 0 }} className="w-5 h-5 bg-white rounded-full shadow-md" />
                        </button>
                      </div>
                      {userRole !== 'admin' && (
                        <div className="mt-4 flex items-center gap-2 text-[8px] font-black text-red-500 bg-red-50 p-2 rounded-lg border border-red-100">
                           <ShieldCheck size={12} /> RESTRICTED: ADMIN PERMISSION REQUIRED
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AddProduct;