"use client";

import React from "react";
import {
  Activity,
  Search,
  ChevronLeft,
  ChevronRight,
  Settings,
  Bell,
} from "lucide-react";

const VendorNavbar = ({ title = "Products" }) => {
  return (
    <nav className="bg-[#25343F] text-white sticky top-0 z-50 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        {/* Top Tier: Logo & Main Navigation [cite: 125, 22] */}
        <div className="flex items-center justify-between h-16 border-b border-white/10">
          <div className="flex items-center gap-8">
            {/* Logo representing ProRent System */}
            <div className="flex items-center gap-2 group cursor-pointer">
              <Activity className="text-[#FF9B51] group-hover:scale-110 transition-transform" />
              <h1 className="font-black tracking-tighter text-xl italic uppercase">
                PRO<span className="text-[#FF9B51]">RENT</span>
              </h1>
            </div>

            {/* Core Rental Management Links [cite: 19, 108] */}
            <div className="hidden md:flex items-center gap-6">
              {["Orders", "Products", "Reports", "Settings"].map((item) => (
                <button
                  key={item}
                  className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:text-[#FF9B51] ${
                    title === item
                      ? "text-[#FF9B51] border-b-2 border-[#FF9B51] pb-1"
                      : "text-white/60"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Right Actions: Notifications & Role Identification [cite: 74, 125] */}
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-white/10 rounded-full transition relative">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF9B51] rounded-full" />
            </button>
            <div
              className="h-8 w-8 bg-[#FF9B51] rounded-lg flex items-center justify-center text-[#25343F] font-black text-xs shadow-lg"
              title="Vendor Profile"
            >
              V
            </div>
          </div>
        </div>

        {/* Sub Tier: Functional Controls (Search & Pagination) [cite: 91, 116] */}
        <div className="flex flex-col md:flex-row items-center justify-between py-4 gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <h2 className="text-lg font-black uppercase tracking-tight italic min-w-[120px]">
              {title}
            </h2>

            {/* New Search Bar Implementation  */}
            <div className="relative flex-grow md:w-64 group">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-[#FF9B51] transition-colors"
                size={16}
              />
              <input
                type="text"
                placeholder={"Search ..."}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-[#FF9B51] focus:ring-1 focus:ring-[#FF9B51] transition-all placeholder:text-white/20"
              />
            </div>

            <button className="p-1.5 bg-white/5 rounded-lg border border-white/10 hover:border-[#FF9B51] transition-colors">
              <Settings size={16} className="text-white/40" />
            </button>
            {title === "Products" && (
              <button className="hidden sm:block bg-[#FF9B51] text-[#25343F] px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest shadow-lg hover:brightness-110 transition-all">
                New
              </button>
            )}
          </div>

          {/* Pagination Controls [cite: 116] */}
          <div className="flex items-center gap-4 ml-auto">
            <div className="flex bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <button
                className="p-2.5 hover:bg-white/10 transition-colors border-r border-white/10"
                aria-label="Previous Page"
              >
                <ChevronLeft size={18} className="text-white/60" />
              </button>
              <button
                className="p-2.5 hover:bg-white/10 transition-colors"
                aria-label="Next Page"
              >
                <ChevronRight size={18} className="text-white/60" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default VendorNavbar;
