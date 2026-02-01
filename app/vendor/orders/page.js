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
  ArrowLeft
} from 'lucide-react'

export default function VendorOrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])

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
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-[#EAEFEF] p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black uppercase">Vendor Orders</h2>
          <div className="flex items-center gap-3">
            <Link href="/vendor" className="px-3 py-2 bg-white rounded">Back</Link>
            <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-[#FF9B51] text-white rounded flex items-center gap-2"><Plus/> Create Order</button>
          </div>
        </div>

        <div className="space-y-4">
          {orders.length === 0 && <div className="bg-white p-6 rounded">No orders yet</div>}
          {orders.map(o => (
            <div key={o.id} className="bg-white p-4 rounded shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3">
                    <Hash/> <strong>#{o.id}</strong>
                    <span className="text-sm opacity-60">— {o.user?.name || 'Guest'}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-4">
                    <div className="flex items-center gap-1"><IndianRupee/> <strong>₹{Number(o.totalAmount || 0).toFixed(2)}</strong></div>
                    <div className="text-xs uppercase font-black bg-blue-100 text-blue-700 px-2 py-1 rounded">{o.status}</div>
                    <div className="text-xs uppercase font-black bg-green-100 text-green-700 px-2 py-1 rounded">{o.invoice?.status || 'UNPAID'}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleAction(o.id, 'mark_confirmed')} className="px-3 py-1 bg-[#25343F] text-white rounded text-sm">Mark Confirmed</button>
                  <button onClick={() => handleAction(o.id, 'mark_invoiced')} className="px-3 py-1 bg-green-600 text-white rounded text-sm">Mark Invoiced</button>
                </div>
              </div>

              <div className="mt-3">
                <div className="text-sm font-bold">Items</div>
                <ul className="mt-2 space-y-2">
                  {o.items.map(it => (
                    <li key={it.id} className="flex justify-between">
                      <div>
                        <div className="font-black">{it.product?.name}</div>
                        <div className="text-xs opacity-60">{it.quantity} × ₹{Number(it.price || 0).toFixed(2)}</div>
                        <div className="text-xs opacity-50">{it.startDate ? new Date(it.startDate).toLocaleString() : ''} → {it.endDate ? new Date(it.endDate).toLocaleString() : ''}</div>
                      </div>
                      <div className="text-right font-black">₹{Number(it.price || 0).toFixed(2)}</div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-3xl rounded p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-black">Create Quotation</h3>
              <button onClick={() => setShowCreate(false)} className="text-sm">Close</button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-black uppercase">Customer</label>
                <select value={form.userId} onChange={(e) => setForm(prev => ({ ...prev, userId: e.target.value }))} className="w-full border p-2 rounded">
                  <option value="">Select customer</option>
                  {customers.map(c => (<option key={c.id} value={c.id}>{c.name} — {c.email}</option>))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-black uppercase">Items</label>
                  <button type="button" onClick={addLine} className="text-sm bg-[#FF9B51] text-white px-2 py-1 rounded">Add Item</button>
                </div>
                <div className="space-y-3">
                  {form.items.map((it, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                      <select className="col-span-4 border p-2 rounded" value={it.productId} onChange={(e) => updateLine(idx, 'productId', e.target.value)}>
                        <option value="">Select product</option>
                        {products.map(p => (<option key={p.id} value={p.id}>{p.name} — ₹{Number(p.priceHourly||0).toFixed(2)}/hr</option>))}
                      </select>
                      <input type="number" className="col-span-2 border p-2 rounded" value={it.quantity} onChange={(e) => updateLine(idx, 'quantity', e.target.value)} min={1} />
                      <input type="datetime-local" className="col-span-3 border p-2 rounded" value={it.startDate} onChange={(e) => updateLine(idx, 'startDate', e.target.value)} />
                      <input type="datetime-local" className="col-span-3 border p-2 rounded" value={it.endDate} onChange={(e) => updateLine(idx, 'endDate', e.target.value)} />
                      <button type="button" onClick={() => removeLine(idx)} className="col-span-12 text-sm text-red-600">Remove</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button type="submit" disabled={creating} className="px-4 py-2 bg-[#FF9B51] text-white rounded font-black">{creating ? 'Creating...' : 'Create Quotation'}</button>
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 border rounded">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
