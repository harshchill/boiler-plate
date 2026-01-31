"use client";

import React from "react";
import { Activity, Bell } from "lucide-react";

const Customnavbar = ({ title = "Products" }) => {
  return (
    <nav className="bg-[#25343F] text-white sticky top-0 z-50 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 border-b border-white/10">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 group cursor-pointer">
              <Activity className="text-[#FF9B51] group-hover:scale-110 transition-transform" />
              <h1 className="font-black tracking-tighter text-xl italic uppercase">
                PRO<span className="text-[#FF9B51]">RENT</span>
              </h1>
            </div>

            <div className="hidden md:flex ml-70 items-center gap-6">
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
      </div>
    </nav>
  );
};

export default Customnavbar;
