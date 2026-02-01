'use client'

import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from '../../../lib/toast'
import {
  FileText,
  Plus,
  Hash,
  IndianRupee,
  Calendar as CalendarIcon,
  ArrowLeft,
  Package,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  Trash2
} from 'lucide-react'

export default function VendorOrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)

  // Form state
  const [form, setForm] = useState({ userId: '', items: [] })
  const [creating, setCreating] = useState(false)

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
      fetchOrders()
      fetchCustomers()
      fetchProducts()
    }
  }, [status, session, router])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/vendor/orders')
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setOrders(data.orders || [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/vendor/customers')
      if (res.ok) {
        const data = await res.json()
        setCustomers(data.customers || [])
      }
    } catch (err) { console.error(err) }
  }

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/vendor/products')
      if (res.ok) {
        const data = await res.json()
        setProducts(data.products || [])
      }
    } catch (err) { console.error(err) }
  }

  const addLine = () => {
    setForm(prev => ({ ...prev, items: [...prev.items, { productId: '', quantity: 1, startDate: '', endDate: '' }] }))
  }
  const updateLine = (idx, key, val) => {
    setForm(prev => {
      const next = { ...prev }
      next.items = next.items.map((it, i) => i === idx ? { ...it, [key]: val } : it)
      return next
    })
  }
  const removeLine = (idx) => {
    setForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }))
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.userId) return toast.error('Select a customer')
    if (!form.items.length) return toast.error('Add at least one item')

    setCreating(true)
    try {
      const res = await fetch('/api/vendor/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Failed to create order'); setCreating(false); return }
      toast.success('Quotation created')
      setShowCreate(false)
      setForm({ userId: '', items: [] })
      fetchOrders()
    } catch (err) {
      console.error(err)
      toast.error('Failed to create order')
    } finally { setCreating(false) }
  }

  const handleAction = async (orderId, action) => {
    try {
      const res = await fetch('/api/vendor/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, action })
      })
      const data = await res.json()
      if (!res.ok) return toast.error(data.error || 'Failed')
      toast.success(data.message || 'Updated')
      fetchOrders()
    } catch (err) { console.error(err); toast.error('Failed') }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8fafb] to-[#f0f3f6] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#25343F] mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading orders...</p>
        </div>
      </div>
    )
  }

  const getStatusColor = (status) => {
    const colors = {
      'QUOTATION': 'bg-yellow-100 text-yellow-800',
      'SALE_ORDER': 'bg-blue-100 text-blue-800',
      'SALE_ORDER_CONFIRMED': 'bg-purple-100 text-purple-800',
      'INVOICED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getPaymentColor = (status) => {
    const colors = {
      'PAID': 'text-green-600',
      'PARTIAL': 'text-orange-600',
      'UNPAID': 'text-red-600'
    }
    return colors[status] || 'text-slate-600'
  }

  const totalOrders = orders.length
  const confirmedOrders = orders.filter(o => o.status === 'SALE_ORDER_CONFIRMED').length
  const totalValue = orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafb] to-[#f0f3f6]" style={{ color: '#25343F' }}>
      {/* Header */}
      <header className="bg-white border-b border-[#BFC9D1] shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-[#25343F] rounded-lg text-white">
                <FileText size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-black">Order Management</h1>
                <p className="text-sm text-slate-500">Track quotations, orders, and invoices</p>
              </div>
            </div>
            <button onClick={() => setShowCreate(true)} className="bg-[#FF9B51] hover:bg-[#FF9B51]/90 text-white px-6 py-3 rounded-lg font-black flex items-center gap-2 transition shadow-lg">
              <Plus size={20} /> Create Order
            </button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-[#EAEFEF] to-[#BFC9D1] rounded-xl p-4">
              <p className="text-[10px] font-black uppercase text-slate-600 mb-1">Total Orders</p>
              <p className="text-3xl font-black">{totalOrders}</p>
            </div>
            <div className="bg-gradient-to-br from-[#FF9B51]/10 to-[#FF9B51]/5 rounded-xl p-4 border border-[#FF9B51]/20">
              <p className="text-[10px] font-black uppercase text-[#FF9B51] mb-1">Confirmed</p>
              <p className="text-3xl font-black text-[#FF9B51]">{confirmedOrders}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-4 border border-green-200">
              <p className="text-[10px] font-black uppercase text-green-700 mb-1">Total Value</p>
              <p className="text-3xl font-black text-green-700">₹{totalValue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-block p-4 bg-white rounded-full mb-4">
              <FileText size={48} className="text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No Orders Yet</h2>
            <p className="text-slate-500 mb-6">Start by creating your first quotation</p>
            <button onClick={() => setShowCreate(true)} className="bg-[#FF9B51] text-white px-6 py-2 rounded-lg font-bold">Create Order</button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <div key={o.id} className="bg-white rounded-2xl border border-[#BFC9D1] shadow-sm hover:shadow-lg transition overflow-hidden">
                {/* Order Header */}
                <div className="p-6 border-b border-[#EAEFEF]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-[#EAEFEF] rounded-lg">
                        <Hash size={20} className="text-[#25343F]" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Order ID</p>
                        <p className="text-2xl font-black">#{o.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${getStatusColor(o.status)}`}>
                        {o.status.replace(/_/g, ' ')}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${o.invoice?.status === 'PAID' ? 'bg-green-100 text-green-800' : o.invoice?.status === 'PARTIAL' ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'}`}>
                        {o.invoice?.status || 'UNPAID'}
                      </span>
                    </div>
                  </div>

                  {/* Customer & Value */}
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-500 tracking-widest mb-1">Customer</p>
                      <p className="font-bold text-sm">{o.user?.name || 'Guest'}</p>
                      <p className="text-xs text-slate-500">{o.user?.email}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-500 tracking-widest mb-1">Order Value</p>
                      <p className="text-2xl font-black text-[#FF9B51]">₹{Number(o.totalAmount || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-500 tracking-widest mb-1">Created</p>
                      <p className="font-bold text-sm">{new Date(o.createdAt).toLocaleDateString()}</p>
                      <p className="text-xs text-slate-500">{new Date(o.createdAt).toLocaleTimeString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-500 tracking-widest mb-1">Delivery</p>
                      <p className="font-bold text-sm capitalize">{o.deliveryStatus || 'PENDING'}</p>
                      <p className="text-xs text-slate-500 capitalize">{o.deliveryMethod || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Items Section */}
                <div className="p-6 border-b border-[#EAEFEF]">
                  <div className="flex items-center gap-2 mb-4">
                    <Package size={18} className="text-[#FF9B51]" />
                    <p className="text-sm font-black uppercase tracking-widest">Order Items ({o.items?.length || 0})</p>
                  </div>
                  <div className="space-y-3">
                    {o.items?.map((it) => (
                      <div key={it.id} className="bg-[#EAEFEF] rounded-lg p-4 flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-bold text-sm mb-1">{it.product?.name}</p>
                          <div className="flex items-center gap-4 text-[10px] text-slate-600">
                            <span>Qty: {it.quantity}</span>
                            <span>Rate: ₹{Number(it.price || 0).toLocaleString()}</span>
                            {it.startDate && <span>{new Date(it.startDate).toLocaleDateString()} to {new Date(it.endDate).toLocaleDateString()}</span>}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500">Subtotal</p>
                          <p className="text-lg font-black">₹{Number(it.price || 0).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="p-6 bg-[#EAEFEF] flex items-center justify-between gap-3">
                  <button 
                    onClick={() => setSelectedOrder(o)} 
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-[#BFC9D1] text-[#25343F] rounded-lg font-bold hover:bg-[#EAEFEF] transition"
                  >
                    <Eye size={16} /> View Details
                  </button>
                  <div className="flex gap-2">
                    {o.status === 'QUOTATION' && (
                      <button 
                        onClick={() => handleAction(o.id, 'mark_confirmed')} 
                        className="px-4 py-2 bg-[#25343F] text-white rounded-lg font-bold hover:bg-[#1a252f] transition"
                      >
                        Confirm Order
                      </button>
                    )}
                    {(o.status === 'SALE_ORDER' || o.status === 'SALE_ORDER_CONFIRMED') && (
                      <button 
                        onClick={() => handleAction(o.id, 'mark_invoiced')} 
                        className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition"
                      >
                        Generate Invoice
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-2xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black">Create Quotation</h3>
              <button onClick={() => setShowCreate(false)} className="text-[#BFC9D1] hover:text-[#25343F] text-2xl">×</button>
            </div>
            <form onSubmit={handleCreate} className="space-y-6">
              <div>
                <label className="block text-sm font-black uppercase text-slate-600 mb-2">Select Customer</label>
                <select value={form.userId} onChange={(e) => setForm(prev => ({ ...prev, userId: e.target.value }))} className="w-full border-2 border-[#BFC9D1] p-3 rounded-lg focus:border-[#FF9B51] outline-none font-medium">
                  <option value="">— Choose a customer —</option>
                  {customers.map(c => (<option key={c.id} value={c.id}>{c.name} ({c.email})</option>))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-black uppercase text-slate-600">Items</label>
                  <button type="button" onClick={addLine} className="text-sm bg-[#FF9B51] text-white px-3 py-1 rounded-lg font-bold flex items-center gap-1 hover:bg-[#FF9B51]/90 transition">
                    <Plus size={14} /> Add Item
                  </button>
                </div>
                {form.items.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">No items added yet. Click Add Item to start.</p>
                ) : (
                  <div className="space-y-3 bg-[#EAEFEF] rounded-lg p-4">
                    {form.items.map((it, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-3 border border-[#BFC9D1] space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Product</label>
                            <select className="w-full border border-[#BFC9D1] p-2 rounded text-sm" value={it.productId} onChange={(e) => updateLine(idx, 'productId', e.target.value)}>
                              <option value="">Select product</option>
                              {products.map(p => (<option key={p.id} value={p.id}>{p.name} — ₹{Number(p.priceHourly||0).toFixed(2)}/hr</option>))}
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Quantity</label>
                            <input type="number" className="w-full border border-[#BFC9D1] p-2 rounded text-sm" value={it.quantity} onChange={(e) => updateLine(idx, 'quantity', e.target.value)} min={1} />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Start Date</label>
                            <input type="datetime-local" className="w-full border border-[#BFC9D1] p-2 rounded text-sm" value={it.startDate} onChange={(e) => updateLine(idx, 'startDate', e.target.value)} />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">End Date</label>
                            <input type="datetime-local" className="w-full border border-[#BFC9D1] p-2 rounded text-sm" value={it.endDate} onChange={(e) => updateLine(idx, 'endDate', e.target.value)} />
                          </div>
                        </div>
                        <button type="button" onClick={() => removeLine(idx)} className="w-full text-sm text-red-600 font-bold hover:bg-red-50 py-2 rounded transition">
                          Remove Item
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t border-[#EAEFEF]">
                <button type="submit" disabled={creating} className="flex-1 px-6 py-3 bg-[#FF9B51] text-white rounded-lg font-black hover:bg-[#FF9B51]/90 disabled:opacity-50 flex items-center justify-center gap-2 transition">
                  {creating ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Create Quotation
                    </>
                  )}
                </button>
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 px-6 py-3 border-2 border-[#BFC9D1] text-[#25343F] rounded-lg font-black hover:bg-[#EAEFEF] transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-2xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black">Order #{selectedOrder.id} Details</h3>
              <button onClick={() => setSelectedOrder(null)} className="text-[#BFC9D1] hover:text-[#25343F] text-2xl">×</button>
            </div>
            <div className="space-y-6">
              <div className="bg-[#EAEFEF] rounded-lg p-4">
                <p className="text-[10px] font-bold uppercase text-slate-500 mb-2">Summary</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Customer</p>
                    <p className="font-bold">{selectedOrder.user?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Total Amount</p>
                    <p className="text-xl font-black text-[#FF9B51]">₹{Number(selectedOrder.totalAmount || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase mt-1 ${getStatusColor(selectedOrder.status)}`}>{selectedOrder.status.replace(/_/g, ' ')}</span>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Payment Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase mt-1 ${selectedOrder.invoice?.status === 'PAID' ? 'bg-green-100 text-green-800' : selectedOrder.invoice?.status === 'PARTIAL' ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'}`}>{selectedOrder.invoice?.status || 'UNPAID'}</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-bold uppercase text-slate-600 mb-3">Items ({selectedOrder.items?.length || 0})</p>
                <div className="space-y-2">
                  {selectedOrder.items?.map((it) => (
                    <div key={it.id} className="bg-[#EAEFEF] rounded-lg p-3 flex justify-between">
                      <div>
                        <p className="font-bold">{it.product?.name}</p>
                        <p className="text-xs text-slate-600">Qty: {it.quantity}</p>
                      </div>
                      <p className="font-black">₹{Number(it.price || 0).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={() => setSelectedOrder(null)} className="w-full px-4 py-3 bg-[#25343F] text-white rounded-lg font-bold hover:bg-[#1a252f] transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
