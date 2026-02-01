import { redirect } from 'next/navigation'
import Link from 'next/link'
import { fetchVendorProducts } from './actions'
import { Package, CheckCircle2 } from 'lucide-react'

export default async function VendorProductsPage() {
  try {
    const products = await fetchVendorProducts()

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8fafb] to-[#f0f3f6]" style={{ color: '#25343F' }}>
        <header className="bg-white border-b border-[#BFC9D1] shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-[#25343F] rounded-lg text-white">
                <Package size={20} />
              </div>
              <div>
                <h1 className="text-2xl font-black">Your Products</h1>
                <p className="text-sm text-slate-500">Manage items you've listed for rent</p>
              </div>
            </div>
            <div>
              <Link href="/vendor/publish-product" className="bg-[#FF9B51] text-white px-4 py-2 rounded-lg font-bold">Add Product</Link>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-12">
          {products.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-block p-4 bg-white rounded-full mb-4">
                <CheckCircle2 size={48} className="text-[#25343F]" />
              </div>
              <h2 className="text-2xl font-bold mb-2">No Products Yet</h2>
              <p className="text-slate-500">You haven't listed any products. Click Add Product to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <div key={p.id} className="bg-white rounded-2xl border border-[#BFC9D1] shadow-sm hover:shadow-lg transition overflow-hidden">
                  <div className="h-44 bg-[#EAEFEF] flex items-center justify-center overflow-hidden">
                    {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : <div className="text-slate-400"><Package size={40} /></div>}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold mb-1 line-clamp-2">{p.name}</h3>
                    <p className="text-[12px] text-slate-500 mb-3">{p.vendor?.companyName || p.vendor?.name}</p>
                    <p className="text-sm text-slate-600 leading-relaxed mb-4 line-clamp-3">{p.description || 'No description provided'}</p>

                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase text-slate-400">Daily Rate</p>
                        <p className="text-sm font-black text-[#FF9B51]">Rs{p.dailyRate?.toLocaleString() || 0}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase text-slate-400">Stock</p>
                        <p className="text-sm font-bold">{p.totalStock || 0}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-[10px] font-bold uppercase ${p.adminApproved ? 'text-green-600' : 'text-orange-600'}`}>{p.adminApproved ? 'Approved' : 'Pending'}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-3">
                      <Link href={`/vendor/products/${p.id}`} className="flex-1 bg-white border border-[#BFC9D1] text-[#25343F] py-2 rounded-lg font-medium text-center">View</Link>
                      <Link href={`/vendor/publish-product?edit=${p.id}`} className="flex-1 bg-[#25343F] text-white py-2 rounded-lg font-medium text-center">Edit</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    )
  } catch (err) {
    const msg = String(err?.message || err)
    if (msg.includes('Unauthorized')) {
      redirect('/login')
    }
    if (msg.includes('Forbidden')) {
      redirect('/')
    }
    // fallback: show a simple error UI
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="bg-white p-8 rounded shadow">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <pre className="text-sm text-red-600">{msg}</pre>
        </div>
      </div>
    )
  }
}
