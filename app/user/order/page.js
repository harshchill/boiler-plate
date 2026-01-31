import React from 'react'
import Link from 'next/link'
import prisma from '../../../lib/prisma'
import { getServerSessionHelper } from '../../../lib/auth'
import { redirect } from 'next/navigation'

function formatDate(dt) {
  return new Date(dt).toLocaleString()
}

export default async function OrdersPage() {
  const session = await getServerSessionHelper()
  if (!session?.user) {
    redirect('/login')
  }
  // Normalize and validate user id (NextAuth sometimes stores it as a string)
  const rawUserId = session.user.id
  const userId = typeof rawUserId === 'string' ? parseInt(rawUserId, 10) : Number(rawUserId)
  if (!Number.isFinite(userId) || Number.isNaN(userId)) {
    console.error('Invalid session user id:', rawUserId)
    redirect('/login')
  }

  // Fetch orders that have a PAID invoice
  let orders = []
  try {
    orders = await prisma.order.findMany({
      where: {
        userId: userId,
        invoice: {
          is: {
            status: 'PAID'
          }
        }
      },
      include: {
        items: { include: { product: true } },
        invoice: true
      },
      orderBy: { createdAt: 'desc' }
    })
  } catch (err) {
    console.error('Error fetching orders for user', userId, err)
    orders = []
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8" style={{ color: '#25343F' }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-black">My Orders</h1>
          <p className="text-sm opacity-60">Showing completed (paid) orders only</p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center">
            <p className="text-lg font-bold">No completed orders yet</p>
            <p className="text-sm opacity-60 mt-2">Your orders will appear here once fully paid.</p>
            <Link href="/" className="inline-block mt-6 bg-[#FF9B51] text-white px-6 py-2 rounded-2xl font-bold">Browse Products</Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl p-6 border border-slate-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-xs uppercase font-black opacity-40">Order #{order.id}</div>
                    <div className="text-sm mt-1">Placed: {formatDate(order.createdAt)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm opacity-60">Total</div>
                    <div className="text-2xl font-black text-[#FF9B51]">Rs{Number(order.totalAmount || 0).toFixed(2)}</div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <ul className="space-y-3">
                      {order.items.map((it) => (
                        <li key={it.id} className="flex items-center gap-4">
                          <div className="w-16 h-12 bg-[#EAEFEF] rounded-md overflow-hidden flex-shrink-0">
                            {it.product?.image ? (
                              <img src={it.product.image} alt={it.product.name} className="w-full h-full object-cover" />
                            ) : null}
                          </div>
                          <div>
                            <div className="font-bold">{it.product?.name || 'Product'}</div>
                            <div className="text-xs opacity-60">{new Date(it.startDate).toLocaleDateString()} → {new Date(it.endDate).toLocaleDateString()}</div>
                            <div className="text-xs opacity-40">Qty: {it.quantity} · Rs{Number(it.price || 0).toFixed(2)}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="md:col-span-1 space-y-3">
                    <div className="p-3 bg-[#F8FAFC] rounded-lg border border-slate-100">
                      <div className="text-xs opacity-60">Delivery Method</div>
                      <div className="font-bold">{order.deliveryMethod || 'N/A'}</div>
                    </div>

                    <div className="p-3 rounded-lg border border-slate-100">
                      <div className="text-xs opacity-60">Delivery Status</div>
                      <div className="font-bold">{order.deliveryStatus || 'PENDING'}</div>
                    </div>

                    <div className="p-3 rounded-lg border border-slate-100">
                      <div className="text-xs opacity-60">Invoice</div>
                      <div className="font-bold">{order.invoice?.status}</div>
                      {order.invoice?.id && (
                        <Link href={`/invoices/${order.invoice.id}`} className="text-sm text-[#FF9B51]">View Invoice</Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
