"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  List,
  Calendar,
  Hash,
  ArrowRight,
  Clock,
  AlertCircle,
  IndianRupee,
  Search,
  UserCircle,
} from "lucide-react";

import VendorNavbar from "../components/navbar/Vendornavbar";

const InteractiveVendorDashboard = () => {
  const [viewMode, setViewMode] = useState("kanban");

  // Data mapping based on your requirements
  const [orders] = useState([
    {
      id: "S00001",
      customer: "Smith",
      product: "TV",
      status: "Sale Order",
      start: "Jan 22",
      end: "Jan 26",
      price: 1450,
      color: "bg-[#FF9B51] text-[#25343F]",
    },
    {
      id: "S00006",
      customer: "John",
      product: "Projector",
      status: "",
      start: "Jan 22",
      end: "Jan 24",
      price: 14.5,
      color: "",
    },
    {
      id: "S00010",
      customer: "Mark wood",
      product: "Printer",
      status: "Confirmed",
      start: "Jan 22",
      end: "Jan 23",
      price: 50,
      color: "bg-emerald-500 text-white",
    },
    {
      id: "S00008",
      customer: "Alex",
      product: "Car",
      status: "Invoiced",
      start: "Jan 22",
      end: "Feb 01",
      price: 775,
      color: "bg-blue-500 text-white",
    },
    {
      id: "S00011",
      customer: "Mark wood",
      product: "Printer",
      status: "Sale Order",
      start: "Jan 22",
      end: "Jan 25",
      price: 150,
      color: "bg-[#FF9B51] text-[#25343F]",
    },
  ]);

  const columns = ["Confirmed", "Picked Up", "Late"];
  // 1. Search state define karein (agar pehle se nahi hai)
  const [searchQuery, setSearchQuery] = useState("");

  // 2. Orders ko filter karne ki logic
  const filteredOrders = orders.filter((order) => {
    const query = searchQuery.toLowerCase();
    return (
      order.id.toLowerCase().includes(query) ||
      order.customer.toLowerCase().includes(query) ||
      order.product.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-[#EAEFEF] font-sans text-[#25343F]">
      <VendorNavbar viewMode={viewMode} setViewMode={setViewMode} />

      <main className="max-w-7xl mx-auto p-6 lg:p-10">
        <AnimatePresence mode="wait">
          {viewMode === "kanban" ? (
            <motion.div
              key="kanban"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Kanban Header */}
              <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div>
                  <h1 className="text-4xl font-black tracking-tighter uppercase italic">
                    Vendor <span className="text-[#FF9B51]">Control</span>
                  </h1>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 flex items-center gap-2 mt-2">
                    <Clock size={12} /> Live Inventory & Rental Tracking
                  </p>
                </div>
                <div className="flex bg-white p-2 rounded-3xl shadow-xl border border-[#BFC9D1]">
                  <button
                    onClick={() => setViewMode("kanban")}
                    className="p-2 bg-[#25343F] text-white rounded-xl transition-all"
                  >
                    <LayoutGrid size={20} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className="p-2 text-[#25343F] opacity-40 hover:opacity-100"
                  >
                    <List size={20} />
                  </button>
                </div>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {columns.map((col) => (
                  <div key={col} className="flex flex-col gap-6">
                    <h3 className="font-black uppercase text-xs tracking-widest opacity-60 flex items-center gap-2 px-4">
                      {col === "Late" && (
                        <AlertCircle size={14} className="text-red-500" />
                      )}
                      {col}
                    </h3>
                    <div className="bg-white/40 border-2 border-dashed border-[#BFC9D1] rounded-[2.5rem] p-4 min-h-[500px] flex flex-col gap-4">
                      {orders
                        .filter(
                          (o) =>
                            (col === "Confirmed" &&
                              (o.status === "Confirmed" ||
                                o.status === "Sale Order")) ||
                            (col === "Late" && o.status === "Invoiced"),
                        )
                        .map((order) => (
                          <motion.div
                            key={order.id}
                            whileHover={{ y: -5 }}
                            className="bg-white p-6 rounded-[2rem] shadow-sm border border-[#BFC9D1] hover:border-[#FF9B51] transition-all"
                          >
                            <div className="flex justify-between items-start mb-4">
                              <span className="bg-[#EAEFEF] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                {order.id}
                              </span>
                              <span
                                className={`h-2.5 w-2.5 rounded-full ${order.status === "Invoiced" ? "bg-blue-500" : "bg-green-500"}`}
                              />
                            </div>
                            <h4 className="text-lg font-black uppercase mb-1 tracking-tight">
                              {order.product}
                            </h4>
                            <div className="flex justify-between items-center mb-4">
                              <p className="text-[10px] font-bold opacity-40 uppercase italic">
                                {order.customer}
                              </p>
                              <div className="flex items-center text-[#25343F] font-black">
                                <IndianRupee
                                  size={12}
                                  className="text-[#FF9B51]"
                                />
                                <span>
                                  {order.price.toLocaleString("en-IN")}
                                </span>
                              </div>
                            </div>
                            <div className="bg-[#25343F] text-white p-4 rounded-2xl flex justify-between items-center font-bold text-[11px]">
                              <span>{order.start}</span>
                              <ArrowRight
                                size={12}
                                className="text-[#FF9B51]"
                              />{" "}
                              <span>{order.end}</span>
                            </div>
                          </motion.div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            /* LIST VIEW WITH PREVIOUS THEME & SCREENSHOT DESIGN */
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex flex-col gap-6 mb-8">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-6"></div>
                  <div className="flex items-center gap-4">
                    <div className="flex bg-white rounded-xl border border-[#BFC9D1] overflow-hidden shadow-sm">
                      <button
                        onClick={() => setViewMode("kanban")}
                        className="p-2.5 text-[#25343F] opacity-40 hover:opacity-100 transition-all"
                      >
                        <LayoutGrid size={20} />
                      </button>
                      <button className="p-2.5 bg-[#25343F] text-[#FF9B51]">
                        <List size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* DESIGN FROM SCREENSHOT 4 */}
              <div className="flex border-2 border-[#BFC9D1] rounded-[2.5rem] overflow-hidden bg-white shadow-2xl">
                {/* Vertical Side Label */}
                <div className="bg-[#25343F] border-r border-[#BFC9D1] w-14 flex items-center justify-center">
                  <span className="rotate-[-90deg] whitespace-nowrap text-[10px] font-black tracking-[0.4em] text-white/40 uppercase">
                    Rental Status
                  </span>
                </div>

                <div className="flex-1 overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[#25343F] text-[10px] font-black uppercase tracking-widest border-b border-[#EAEFEF] bg-[#EAEFEF]/50">
                        <th className="p-5 w-12">
                          <input type="checkbox" className="accent-[#25343F]" />
                        </th>
                        <th className="p-5">Order Reference</th>
                        <th className="p-5">Order Date</th>
                        <th className="p-5">Customer Name</th>
                        <th className="p-5">Product</th>
                        <th className="p-5">Total</th>
                        <th className="p-5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAEFEF]">
                      {orders.map((order) => (
                        <tr
                          key={order.id}
                          className="hover:bg-[#EAEFEF]/30 transition-colors group"
                        >
                          <td className="p-5">
                            <input
                              type="checkbox"
                              className="accent-[#25343F]"
                            />
                          </td>
                          <td className="p-5 font-black text-xl tracking-tighter text-[#25343F]">
                            {order.id}
                          </td>
                          <td className="p-5 text-slate-400 font-bold uppercase text-[10px] italic">
                            {order.start}
                          </td>
                          <td className="p-5 text-xl font-black tracking-tight uppercase">
                            {order.customer}
                          </td>
                          <td className="p-5 font-bold text-slate-500 uppercase text-xs">
                            {order.product}
                          </td>
                          <td className="p-5">
                            <div className="flex items-center text-4xl font-black italic tracking-tighter group-hover:text-[#FF9B51] transition-colors">
                              <span className="text-sm mr-1 opacity-30 italic">
                                <IndianRupee
                                  size={24}
                                  className="text-[#f38836]"
                                />
                              </span>
                              {order.price.toLocaleString("en-IN")}
                            </div>
                          </td>
                          <td className="p-5">
                            {order.status && (
                              <span
                                className={`${order.color} text-[9px] font-black uppercase px-4 py-1.5 rounded-lg shadow-md tracking-widest inline-block`}
                              >
                                {order.status}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default InteractiveVendorDashboard;
