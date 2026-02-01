'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function PendingProducts() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/')
      return
    }
    fetchPending()
  }, [status, session, router])

  const fetchPending = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/products/pending')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setProducts(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const approve = async (id) => {
    try {
      const res = await fetch('/api/admin/products/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error('Approve failed')
      await fetchPending()
    } catch (err) {
      console.error(err)
      alert('Failed to approve product')
    }
  }

  if (status === 'loading' || loading) return <div className="p-8">Loading...</div>

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Pending Product Approvals</h1>
        {products.length === 0 ? (
          <p>No pending products</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {products.map((p) => (
              <div key={p.id} className="bg-white p-4 rounded shadow border">
                <div className="flex gap-4">
                  <div className="w-28 h-20 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                    {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : <span className="text-sm">No Image</span>}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{p.name}</h3>
                    <p className="text-sm text-slate-600">{p.vendor?.companyName || p.vendor?.name}</p>
                    <p className="text-sm mt-2">{p.description?.slice(0, 120)}</p>
                    <div className="mt-4 flex items-center gap-3">
                      <button onClick={() => approve(p.id)} className="bg-green-600 text-white px-4 py-2 rounded">Approve</button>
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
