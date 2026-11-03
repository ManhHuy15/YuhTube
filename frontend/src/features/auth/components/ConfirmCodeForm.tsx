import { useState } from 'react'
import { useAuthStore } from '../hooks/useAuthStore'

export function ConfirmCodeForm() {
  const { pendingEmail, verifyCode, resendCode, setModalTab, isLoading } = useAuthStore()
  const [code, setCode] = useState('')
  const [resendSuccess, setResendSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!pendingEmail || !code) return
    const success = await verifyCode(pendingEmail, code)
    if (success) {
      setCode('')
    }
  }

  async function handleResend() {
    if (!pendingEmail) return
    const success = await resendCode(pendingEmail)
    if (success) {
      setResendSuccess(true)
      setTimeout(() => setResendSuccess(false), 4000)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-xs text-white/60">
        We sent a 6-digit confirmation code to{' '}
        <strong className="text-white">{pendingEmail}</strong>. Enter it below to activate your account.
      </p>

      <div className="space-y-1.5">
        <label htmlFor="confirm-code" className="block text-xs font-medium text-white/70">
          Verification code
        </label>
        <input
          id="confirm-code"
          type="text"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          required
          autoFocus
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="123456"
          className="w-full tracking-widest text-center px-3.5 py-3 rounded-lg bg-[#121212] border border-white/15 focus:border-red-500 focus:outline-none text-lg font-bold text-white placeholder-white/20 transition-colors"
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
        <span>Verify & Continue</span>
      </button>

      <div className="flex items-center justify-between pt-2 text-xs">
        <button
          type="button"
          onClick={handleResend}
          disabled={isLoading}
          className="text-red-400 hover:text-red-300 cursor-pointer"
        >
          {resendSuccess ? 'Code resent!' : 'Resend code'}
        </button>
        <button
          type="button"
          onClick={() => setModalTab('signin')}
          className="text-white/50 hover:text-white cursor-pointer"
        >
          Back to Sign In
        </button>
      </div>
    </form>
  )
}
