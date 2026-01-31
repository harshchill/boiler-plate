"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  Settings,
  User,
  Mail,
  Phone,
  Plus,
  Filter,
  MoreHorizontal,
} from "lucide-react";

import Customnavbar from "@/app/components/navbar/Customnavbar";

const CustomerDashboard = () => {
  const [viewMode, setViewMode] = useState("kanban");
  const [searchQuery, setSearchQuery] = useState("");

  // Mock Customer Data as per screenshot
  const customers = [
    {
      id: 1,
      name: "Rahul Sharma",
      email: "rahul@example.com",
      phone: "+91 98765 43210",
    },
    {
      id: 2,
      name: "Sneha Rao",
      email: "sneha.rao@org.in",
      phone: "+91 88822 11100",
    },
    {
      id: 3,
      name: "Vikram Seth",
      email: "vikram.seth@logistics.com",
      phone: "+91 77700 99911",
    },
    {
      id: 4,
      name: "Anjali Dua",
      email: "anjali.d@retail.com",
      phone: "+91 99001 12233",
    },
    {
      id: 5,
      name: "Amit Verma",
      email: "averma@services.net",
      phone: "+91 81234 56789",
    },
    {
      id: 6,
      name: "Ishita Roy",
      email: "ishita@studio.com",
      phone: "+91 90000 11111",
    },
  ];

  return (
    <div className="min-h-screen bg-[#EAEFEF] font-sans text-[#25343F]">
      <Customnavbar />

      {/* Main Administrative Container */}
      <main className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Superior Control Bar - Based on Mockup Header */}
        <header className="bg-white rounded-[2rem] shadow-xl p-4 mb-8 border border-white flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <h2 className="text-2xl font-black italic tracking-tighter uppercase px-4">
              Customers
            </h2>
            <button className="p-2 hover:bg-[#EAEFEF] rounded-xl transition-colors text-slate-400">
              <Settings size={20} />
            </button>
          </div>

          {/* Searchbar Component */}
          <div className="flex-1 max-w-xl w-full relative group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#FF9B51] transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by name, email or phone..."
              className="w-full bg-[#EAEFEF] py-3 pl-12 pr-4 rounded-2xl outline-none font-bold text-sm border-2 border-transparent focus:border-[#25343F] transition-all"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* View Switcher & Pager Logic */}
          <div className="flex items-center gap-4">
            <div className="flex bg-[#EAEFEF] p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode("kanban")}
                className={`p-2 rounded-lg transition-all ${viewMode === "kanban" ? "bg-[#25343F] text-white shadow-lg" : "text-slate-400"}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-[#25343F] text-white shadow-lg" : "text-slate-400"}`}
              >
                <List size={18} />
              </button>
            </div>

            {/* Pager Control */}
            <div className="flex bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <button className="p-2.5 hover:bg-[#EAEFEF] transition-colors border-r border-slate-200">
                <ChevronLeft size={18} />
              </button>
              <button className="p-2.5 hover:bg-[#EAEFEF] transition-colors">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </header>

        {/* Dynamic Display Area */}
        <AnimatePresence mode="wait">
          {viewMode === "kanban" ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {customers.map((customer) => (
                <motion.div
                  key={customer.id}
                  whileHover={{ y: -5 }}
                  className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-white hover:border-[#FF9B51] hover:shadow-2xl transition-all group flex gap-5 relative overflow-hidden"
                >
                  {/* Customer Avatar Placeholder */}
                  <div className="w-20 h-20 bg-[#EAEFEF] rounded-3xl flex items-center justify-center text-slate-300 group-hover:bg-[#25343F] group-hover:text-[#FF9B51] transition-all duration-500">
                    <User size={32} />
                  </div>

                  {/* Customer Identity Info */}
                  <div className="flex-1 space-y-2">
                    <h3 className="text-xl font-black tracking-tight uppercase group-hover:text-[#25343F]">
                      {customer.name}
                    </h3>
                    <div className="space-y-1">
                      <p className="flex items-center gap-2 text-xs font-bold text-slate-400">
                        <Mail size={12} className="text-[#FF9B51]" />{" "}
                        {customer.email}
                      </p>
                      <p className="flex items-center gap-2 text-xs font-bold text-slate-400">
                        <Phone size={12} className="text-[#FF9B51]" />{" "}
                        {customer.phone}
                      </p>
                    </div>
                  </div>

                  {/* Corner Accent */}
                  <div className="absolute top-0 right-0 w-16 h-16 bg-[#FF9B51]/5 rounded-bl-[3rem] -z-0 group-hover:bg-[#FF9B51]/20 transition-colors" />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-[2.5rem] shadow-xl border border-white overflow-hidden"
            >
              <table className="w-full text-left">
                <thead className="bg-[#25343F] text-white">
                  <tr>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest">
                      Client Identity
                    </th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest">
                      Contact Details
                    </th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="hover:bg-[#EAEFEF]/50 transition-colors group"
                    >
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-[#EAEFEF] rounded-xl flex items-center justify-center text-slate-400 font-bold group-hover:bg-[#25343F] group-hover:text-white transition-colors uppercase">
                            {customer.name.substring(0, 2)}
                          </div>
                          <span className="font-black text-sm uppercase">
                            {customer.name}
                          </span>
                        </div>
                      </td>
                      <td className="p-6">
                        <p className="text-xs font-bold">{customer.email}</p>
                        <p className="text-[10px] font-bold text-slate-400 italic">
                          {customer.phone}
                        </p>
                      </td>
                      <td className="p-6 text-right">
                        <button className="p-2 hover:bg-white rounded-lg transition-shadow shadow-sm">
                          <MoreHorizontal size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default CustomerDashboard;
