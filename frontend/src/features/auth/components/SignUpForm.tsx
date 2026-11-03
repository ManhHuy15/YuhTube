import { useState } from 'react'
import { useAuthStore } from '../hooks/useAuthStore'
import { AUTH_MESSAGES } from '../constants/auth.constants'

export function SignUpForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { register, isLoading } = useAuthStore()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) return
    await register(email, password, name)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="signup-name" className="block text-xs font-medium text-white/70">
          Channel / Display Name
        </label>
        <input
          id="signup-name"
          type="text"
          name="name"
          autoComplete="name"
          required
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Channel"
          className="w-full px-3.5 py-2.5 rounded-lg bg-[#121212] border border-white/15 focus:border-red-500 focus:outline-none text-sm text-white placeholder-white/30 transition-colors"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="signup-email" className="block text-xs font-medium text-white/70">
          Email address
        </label>
        <input
          id="signup-email"
          type="email"
          name="email"
          autoComplete="username"
          spellCheck={false}
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full px-3.5 py-2.5 rounded-lg bg-[#121212] border border-white/15 focus:border-red-500 focus:outline-none text-sm text-white placeholder-white/30 transition-colors"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="signup-password" className="block text-xs font-medium text-white/70">
            Password (min {AUTH_MESSAGES.PASSWORD_MIN_LENGTH} chars)
          </label>
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="text-xs text-white/50 hover:text-white cursor-pointer"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        <input
          id="signup-password"
          type={showPassword ? 'text' : 'password'}
          name="password"
          autoComplete="new-password"
          required
          minLength={AUTH_MESSAGES.PASSWORD_MIN_LENGTH}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full px-3.5 py-2.5 rounded-lg bg-[#121212] border border-white/15 focus:border-red-500 focus:outline-none text-sm text-white placeholder-white/30 transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 px-4 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-sm transition-all shadow-md shadow-red-600/30 active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
      >
        {isLoading && (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        )}
        <span>Create Account</span>
      </button>
    </form>
  )
}
