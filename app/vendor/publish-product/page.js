'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import {
  ArrowLeft,
  Upload,
  Activity,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Package,
  Heart,
  ShoppingCart,
  User as UserIcon,
  Settings,
  LogOut,
  FileText
} from 'lucide-react'
import { toast } from '../../../lib/toast'
import { createProduct } from './actions'

export default function PublishProductPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [creatingCategory, setCreatingCategory] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    priceHourly: '',
    totalStock: '',
    isRentable: true,
    image: ''
  })
  const [errors, setErrors] = useState({})

  // Auth check
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'VENDOR') {
      router.push('/')
    }
  }, [status, session, router])

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (response.ok) {
          const data = await response.json()
          setCategories(data.categories || [])
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }
    fetchCategories()
  }, [])

  const handleCreateCategory = async (e) => {
    e.preventDefault()
    if (!newCategoryName.trim()) {
      toast.error('Category name is required')
      return
    }

    setCreatingCategory(true)
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName })
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Failed to create category')
        setCreatingCategory(false)
        return
      }

      // Add new category to list
      setCategories(prev => [...prev, data.category])
      setFormData(prev => ({ ...prev, categoryId: data.category.id.toString() }))
      toast.success('Category created successfully!')
      setNewCategoryName('')
      setShowCategoryModal(false)
      setCreatingCategory(false)
    } catch (error) {
      console.error('Error creating category:', error)
      toast.error('Failed to create category')
      setCreatingCategory(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      const result = await createProduct(formData)

      if (!result.success) {
        toast.error(result.error)
        if (result.errors) {
          setErrors(result.errors)
        }
        setLoading(false)
        return
      }

      toast.success('Product published successfully! Awaiting admin approval.')
      // Reset form
      setFormData({
        name: '',
        description: '',
        categoryId: '',
        priceHourly: '',
        totalStock: '',
        isRentable: true,
        image: ''
      })

      // Redirect to vendor dashboard
      setTimeout(() => {
        router.push('/vendor')
      }, 2000)
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error('Failed to publish product')
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#EAEFEF] flex items-center justify-center">
        <div className="text-center">
          <Package size={48} className="mx-auto mb-4 opacity-30 animate-pulse" />
          <p className="text-sm font-bold opacity-50">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#EAEFEF] font-sans text-[#25343F]">
      {/* Navbar */}
      <nav className="p-6 sticky top-0 z-50 bg-white border-b border-[#BFC9D1] shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
              <Activity size={28} style={{ color: '#FF9B51' }} /> PRO<span className="opacity-60">RENT</span>
            </Link>
            <Link href="/vendor" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-[#FF9B51] transition">
              <ArrowLeft size={16} /> Back to Dashboard
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 border-r border-[#BFC9D1] pr-6">
              <button className="relative hover:text-[#FF9B51] transition">
                <Heart size={20} />
              </button>
              <Link href="/cart" className="relative hover:text-[#FF9B51] transition">
                <ShoppingCart size={20} />
              </Link>
            </div>

            {/* Account Profile */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 px-4 py-2 rounded-full border-2 border-[#25343F] hover:bg-[#25343F] hover:text-white transition-all"
              >
                <UserIcon size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">Account</span>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white border border-[#BFC9D1] rounded-2xl shadow-2xl overflow-hidden">
                  <div className="p-4 border-b border-[#EAEFEF] bg-[#EAEFEF]/50">
                    <p className="text-[10px] font-black opacity-40 uppercase">Vendor</p>
                    <p className="text-xs font-bold text-[#FF9B51]">{session?.user?.name}</p>
                  </div>
                  <Link href="/vendor" className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold hover:bg-[#EAEFEF]">
                    <Package size={14} /> Dashboard
                  </Link>
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold hover:bg-[#EAEFEF]">
                    <Settings size={14} /> Settings
                  </button>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold hover:bg-red-50 text-red-500 border-t"
                  >
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-black uppercase tracking-tighter">
            Publish <span className="text-[#FF9B51]">Product</span>
          </h1>
          <p className="text-sm opacity-60 mt-2">Add a new rental product to your inventory</p>
        </div>

        <div className="bg-white rounded-2xl p-8 border-2 border-[#BFC9D1]">
          {/* Approval Note */}
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
            <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-blue-900">Awaiting Admin Approval</p>
              <p className="text-xs text-blue-800 mt-1">
                Products you publish will be reviewed by administrators before appearing in the marketplace.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-black uppercase mb-2">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., LCD Projector, Professional Camera"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  errors.name
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-slate-300 focus:ring-[#FF9B51] focus:border-[#FF9B51]'
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} /> {errors.name}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-black uppercase mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide details about your product..."
                rows="4"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9B51] focus:border-[#FF9B51]"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-black uppercase mb-2">
                Category
              </label>
              <div className="flex gap-2">
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9B51]"
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(true)}
                  className="px-4 py-3 border-2 border-[#FF9B51] text-[#FF9B51] rounded-lg font-black uppercase text-xs hover:bg-[#FF9B51] hover:text-white transition"
                >
                  + New
                </button>
              </div>
            </div>

            {/* Price & Stock - Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-black uppercase mb-2">
                  Hourly Rate (Rs) *
                </label>
                <input
                  type="number"
                  name="priceHourly"
                  value={formData.priceHourly}
                  onChange={handleChange}
                  placeholder="e.g., 500"
                  min="1"
                  step="0.01"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.priceHourly
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-slate-300 focus:ring-[#FF9B51] focus:border-[#FF9B51]'
                  }`}
                />
                {errors.priceHourly && (
                  <p className="mt-1 text-sm text-red-600">{errors.priceHourly}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-black uppercase mb-2">
                  Total Stock *
                </label>
                <input
                  type="number"
                  name="totalStock"
                  value={formData.totalStock}
                  onChange={handleChange}
                  placeholder="e.g., 5"
                  min="1"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.totalStock
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-slate-300 focus:ring-[#FF9B51] focus:border-[#FF9B51]'
                  }`}
                />
                {errors.totalStock && (
                  <p className="mt-1 text-sm text-red-600">{errors.totalStock}</p>
                )}
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-black uppercase mb-2">
                Product Image URL
              </label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://example.com/product.jpg"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9B51]"
              />
            </div>

            {/* Rentable Checkbox */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isRentable"
                  checked={formData.isRentable}
                  onChange={handleChange}
                  className="w-5 h-5 accent-[#FF9B51]"
                />
                <span className="text-sm font-bold">Available for Rental</span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-[#FF9B51] text-white px-6 py-3 rounded-lg font-black uppercase tracking-widest text-sm hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    Publish Product
                  </>
                )}
              </button>
              <Link
                href="/vendor"
                className="px-6 py-3 rounded-lg font-black uppercase tracking-widest text-sm border-2 border-[#25343F] hover:bg-[#25343F] hover:text-white transition"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
      {/* Category Creation Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full">
            <h2 className="text-2xl font-black uppercase mb-4">Create New Category</h2>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-black uppercase mb-2">Category Name *</label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g., Electronics, Furniture, Tools"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9B51]"
                  disabled={creatingCategory}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={creatingCategory}
                  className="flex-1 bg-[#FF9B51] text-white px-4 py-3 rounded-lg font-black uppercase text-sm hover:brightness-110 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {creatingCategory ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Category'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCategoryModal(false)
                    setNewCategoryName('')
                  }}
                  disabled={creatingCategory}
                  className="px-4 py-3 rounded-lg font-black uppercase text-sm border-2 border-slate-300 hover:bg-slate-100 transition disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}    </div>
  )
}