'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity,
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
  UserIcon,
  LogOut,
  Heart,
  ShoppingCart,
  FileText,
  Package,
  Loader2,
} from 'lucide-react'
import { fetchVendorCustomers } from './actions'
import { signOut } from 'next-auth/react'

const CustomerDashboard = () => {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [viewMode, setViewMode] = useState('kanban')
  const [searchQuery, setSearchQuery] = useState('')
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const itemsPerPage = 6

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    if (status === 'authenticated' && session?.user?.role !== 'VENDOR') {
      router.push('/')
      return
    }
    if (status === 'authenticated') {
      loadCustomers()
    }
  }, [status, session, router])

  const loadCustomers = async () => {
    try {
      setLoading(true)
      const data = await fetchVendorCustomers()
      setCustomers(data || [])
    } catch (err) {
      console.error(err)
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-[#EAEFEF] flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="mx-auto mb-4 opacity-30 animate-spin" />
          <p className="text-sm font-bold opacity-50">Loading customers...</p>
        </div>
      </div>
    )
  }

  const filteredCustomers = customers.filter((customer) => {
    const query = searchQuery.toLowerCase()
    return (
      customer.name?.toLowerCase().includes(query) ||
      customer.email?.toLowerCase().includes(query) ||
      customer.phone?.toLowerCase().includes(query)
    )
  })

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage)
  const displayedCustomers = filteredCustomers.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  )

  const handlePrevPage = () => {
    setCurrentPage((p) => Math.max(0, p - 1))
  }

  const handleNextPage = () => {
    setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
  }

  return (
    <div className="min-h-screen bg-[#EAEFEF] font-sans text-[#25343F]">
      {/* Navbar from Vendor Page */}
      <nav className="p-6 sticky top-0 z-50 bg-white border-b border-[#BFC9D1] shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
              <Activity size={28} style={{ color: '#FF9B51' }} /> PRO<span className="opacity-60">RENT</span>
            </Link>
            <div className="hidden lg:flex ml-70 space-x-6 text-[10px] font-black uppercase tracking-widest opacity-70">
              <Link href="/vendor/orders" className="hover:text-[#FF9B51] flex items-center gap-1">
                Orders
              </Link>
              <Link href="/vendor/customersdetails" className="hover:text-[#FF9B51] transition">
                Customers
              </Link>
              <Link href="/vendor/products" className="hover:text-[#FF9B51] flex items-center gap-1">
                Products
              </Link>
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
                <span className="absolute -top-2 -right-2 bg-[#25343F] text-white text-[8px] px-1.5 rounded-full">0</span>
              </Link>
            </div>

            {/* Account Profile */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 px-4 py-2 rounded-full border-2 border-[#25343F] hover:bg-[#25343F] hover:text-white transition-all group"
              >
                <UserIcon size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">Account</span>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white border border-[#BFC9D1] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                  <div className="p-4 border-b border-[#EAEFEF] bg-[#EAEFEF]/50">
                    <p className="text-[10px] font-black opacity-40 uppercase">Signed in as</p>
                    <p className="text-xs font-bold truncate text-[#FF9B51]">
                      {session?.user?.name || 'Vendor'} (VENDOR)
                    </p>
                  </div>
                  <Link href="/vendor/products" className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold hover:bg-[#EAEFEF] transition-colors">
                    <Package size={14} /> My Products
                  </Link>
                  <Link href="/vendor/orders" className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold hover:bg-[#EAEFEF] transition-colors">
                    <FileText size={14} /> My Orders
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors border-t border-[#EAEFEF]"
                  >
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header */}
        <header className="bg-white rounded-[2rem] shadow-xl p-6 mb-8 border border-white flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <h2 className="text-2xl font-black italic tracking-tighter uppercase px-4">
              Customers ({customers.length})
            </h2>
            <button className="p-2 hover:bg-[#EAEFEF] rounded-xl transition-colors text-slate-400">
              <Settings size={20} />
            </button>
          </div>

          {/* Searchbar */}
          <div className="flex-1 max-w-xl w-full relative group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#FF9B51] transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by name, email or phone..."
              className="w-full bg-[#EAEFEF] py-3 pl-12 pr-4 rounded-2xl outline-none font-bold text-sm border-2 border-transparent focus:border-[#25343F] transition-all"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(0)
              }}
            />
          </div>

          {/* View Switcher & Pagination */}
          <div className="flex items-center gap-4">
            <div className="flex bg-[#EAEFEF] p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'kanban' ? 'bg-[#25343F] text-white shadow-lg' : 'text-slate-400'}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[#25343F] text-white shadow-lg' : 'text-slate-400'}`}
              >
                <List size={18} />
              </button>
            </div>

            {/* Pagination */}
            <div className="flex bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 0}
                className="p-2.5 hover:bg-[#EAEFEF] transition-colors border-r border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="px-3 py-2 flex items-center text-xs font-bold">
                {totalPages > 0 ? currentPage + 1 : 0} / {totalPages}
              </div>
              <button
                onClick={handleNextPage}
                disabled={currentPage >= totalPages - 1}
                className="p-2.5 hover:bg-[#EAEFEF] transition-colors border-l border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </header>

        {/* Display Area */}
        {displayedCustomers.length === 0 ? (
          <div className="text-center py-20">
            <User size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-slate-500">No customers found</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {viewMode === 'kanban' ? (
              <motion.div
                key="kanban"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {displayedCustomers.map((customer) => (
                  <motion.div
                    key={customer.id}
                    whileHover={{ y: -5 }}
                    className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-white hover:border-[#FF9B51] hover:shadow-2xl transition-all group flex gap-5 relative overflow-hidden"
                  >
                    {/* Avatar */}
                    <div className="w-20 h-20 bg-[#EAEFEF] rounded-3xl flex items-center justify-center text-slate-300 group-hover:bg-[#25343F] group-hover:text-[#FF9B51] transition-all duration-500 flex-shrink-0">
                      <User size={32} />
                    </div>

                    {/* Customer Info */}
                    <div className="flex-1 space-y-2">
                      <h3 className="text-xl font-black tracking-tight uppercase group-hover:text-[#25343F]">
                        {customer.name}
                      </h3>
                      <div className="space-y-1">
                        <p className="flex items-center gap-2 text-xs font-bold text-slate-400">
                          <Mail size={12} className="text-[#FF9B51]" /> {customer.email}
                        </p>
                        <p className="flex items-center gap-2 text-xs font-bold text-slate-400">
                          <Phone size={12} className="text-[#FF9B51]" /> {customer.phone}
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
                key="list"
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
                    {displayedCustomers.map((customer) => (
                      <tr
                        key={customer.id}
                        className="hover:bg-[#EAEFEF]/50 transition-colors group"
                      >
                        <td className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-[#EAEFEF] rounded-xl flex items-center justify-center text-slate-400 font-bold group-hover:bg-[#25343F] group-hover:text-white transition-colors uppercase text-xs">
                              {customer.name.substring(0, 2)}
                            </div>
                            <span className="font-black text-sm uppercase">{customer.name}</span>
                          </div>
                        </td>
                        <td className="p-6">
                          <p className="text-xs font-bold">{customer.email}</p>
                          <p className="text-[10px] font-bold text-slate-400 italic">{customer.phone}</p>
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
        )}
      </main>
    </div>
  )
}

export default CustomerDashboard
