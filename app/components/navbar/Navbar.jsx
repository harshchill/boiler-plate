"use client";

import React, { useState } from "react";
import {
  Activity,
  User,
  Package,
  Settings,
  Heart,
  ShoppingCart,
  FileText,
  LogOut,
} from "lucide-react";

const Navbar = () => {
  // 1. STATE DEFINITION (Iske bina error aata hai)
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 p-4 bg-[#25343F] text-white shadow-2xl">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo Section */}
        <div className="flex items-center gap-2">
          <Activity className="text-[#FF9B51]" />
          <h1 className="font-black tracking-tighter text-xl italic uppercase">
            PRO<span className="text-[#FF9B51]">RENT</span>
          </h1>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-4">
          <button className="hidden md:flex text-white hover:text-[#FF9B51] transition text-sm font-medium items-center gap-1">
            <FileText size={18} />{" "}
            <span className="text-[10px] font-black uppercase">Terms</span>
          </button>

          <button className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition">
            <Heart size={18} />
          </button>

          <button className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition relative">
            <ShoppingCart size={18} />
            <span className="absolute -top-1 -right-1 bg-[#FF9B51] text-[8px] font-bold px-1.5 py-0.5 rounded-full">
              3
            </span>
          </button>

          {/* User Profile Dropdown Section */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)} // State toggle function
              className="w-10 h-10 bg-white/10 rounded-full border-2 border-transparent hover:border-[#FF9B51] transition flex items-center justify-center"
            >
              <User size={18} />
            </button>

            {/* ERROR FIXED HERE: isProfileOpen variable is now defined */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white text-[#25343F] rounded-2xl shadow-2xl border border-[#BFC9D1] overflow-hidden z-50">
                <div className="p-4 bg-[#EAEFEF] border-b border-[#BFC9D1]">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    Logged in as
                  </p>
                  <p className="font-bold text-sm">Vendor / Admin</p> 
                </div>

                <div className="p-2">
                  <a
                    href="#"
                    className="flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase hover:bg-[#EAEFEF] rounded-xl transition"
                  >
                    <Package size={16} className="text-[#FF9B51]" /> My Rental
                    Orders [cite: 16]
                  </a>
                  <a
                    href="#"
                    className="flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase hover:bg-[#EAEFEF] rounded-xl transition"
                  >
                    <Settings size={16} className="text-[#FF9B51]" /> Profile
                    Settings [cite: 104]
                  </a>
                  <hr className="my-2 border-[#EAEFEF]" />
                  <a
                    href="#"
                    className="flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase text-red-500 hover:bg-red-50 rounded-xl transition"
                  >
                    <LogOut size={16} /> Logout
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
