'use client'

import { Suspense } from 'react'
import LoginForm from './LoginForm'

function LoginFormFallback() {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8 border border-slate-200">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#25343F] rounded-full mb-4 animate-pulse" />
        <div className="h-8 bg-slate-200 rounded mb-2 animate-pulse" />
        <div className="h-4 bg-slate-200 rounded w-32 mx-auto animate-pulse" />
      </div>
      <div className="space-y-5">
        <div className="h-10 bg-slate-200 rounded animate-pulse" />
        <div className="h-10 bg-slate-200 rounded animate-pulse" />
        <div className="h-10 bg-slate-200 rounded animate-pulse" />
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Suspense fallback={<LoginFormFallback />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
