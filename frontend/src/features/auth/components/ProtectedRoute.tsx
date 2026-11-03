import { type ReactNode } from 'react'
import { useAuthStore } from '../hooks/useAuthStore'

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, openModal } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#1e1e1e] border border-white/10 rounded-2xl p-8 text-center shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-full bg-red-600/10 border border-red-600/30 flex items-center justify-center mx-auto text-red-500">
            <span className="material-symbols-outlined text-3xl">lock</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold tracking-tight">Authentication Required</h2>
            <p className="text-sm text-white/60">
              You must sign in with your YuhTube account to access this page, manage your channel, and upload videos.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => openModal('signin')}
              className="flex-1 py-2.5 px-4 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-sm transition-all shadow-md shadow-red-600/30 cursor-pointer"
            >
              Sign in now
            </button>
            <a
              href="/"
              className="py-2.5 px-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-sm transition-all text-center"
            >
              Back to Home
            </a>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
