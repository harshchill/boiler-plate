'use client'

import { Suspense } from 'react'
import ProductContent from './ProductContent'
import { Package } from 'lucide-react'

function ProductFallback() {
  return (
    <div className="min-h-screen bg-[#EAEFEF] flex items-center justify-center">
      <div className="text-center">
        <Package size={48} className="mx-auto mb-4 opacity-30 animate-pulse" />
        <p className="text-sm font-bold opacity-50">Loading product...</p>
      </div>
    </div>
  )
}

export default function ProductPage() {
  return (
    <Suspense fallback={<ProductFallback />}>
      <ProductContent />
    </Suspense>
  )
}