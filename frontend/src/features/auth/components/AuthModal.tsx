import { useEffect, useRef } from 'react'
import { useAuthStore } from '../hooks/useAuthStore'
import { SignInForm } from './SignInForm'
import { SignUpForm } from './SignUpForm'
import { ConfirmCodeForm } from './ConfirmCodeForm'

export function AuthModal() {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { isModalOpen, modalTab, error, closeModal, setModalTab, clearError } = useAuthStore()

  // Native <dialog> open/close management
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isModalOpen) {
      if (!dialog.open) {
        dialog.showModal()
      }
    } else {
      if (dialog.open) {
        dialog.close()
      }
    }
  }, [isModalOpen])

  function handleCancel(e: React.SyntheticEvent<HTMLDialogElement, Event>) {
    e.preventDefault()
    closeModal()
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    const dialog = dialogRef.current
    if (!dialog) return
    const rect = dialog.getBoundingClientRect()
    const isOutside =
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom

    if (isOutside) {
      closeModal()
    }
  }

  if (!isModalOpen) return null

  return (
    <dialog
      ref={dialogRef}
      onCancel={handleCancel}
      onClick={handleBackdropClick}
      aria-labelledby="auth-modal-title"
      className="m-auto p-0 rounded-2xl bg-[#1e1e1e] text-[#f1f1f1] border border-white/10 shadow-2xl backdrop:bg-black/75 max-w-md w-full overflow-hidden"
    >
      <div className="p-6 sm:p-8 flex flex-col space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-5 bg-gradient-to-tr from-red-600 to-rose-500 rounded flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-[14px] text-white">play_arrow</span>
            </div>
            <h2 id="auth-modal-title" className="text-xl font-bold tracking-tight text-white">
              {modalTab === 'signin' && 'Sign in to YuhTube'}
              {modalTab === 'signup' && 'Create your account'}
              {modalTab === 'confirm' && 'Verify your email'}
            </h2>
          </div>
          <button
            type="button"
            onClick={closeModal}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Tab switcher for Sign In / Sign Up */}
        {modalTab !== 'confirm' && (
          <div className="flex rounded-lg bg-white/5 p-1 border border-white/10 text-sm font-medium">
            <button
              type="button"
              onClick={() => {
                clearError()
                setModalTab('signin')
              }}
              className={`flex-1 py-1.5 rounded-md transition-all text-center cursor-pointer ${
                modalTab === 'signin'
                  ? 'bg-red-600 text-white shadow-sm font-semibold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                clearError()
                setModalTab('signup')
              }}
              className={`flex-1 py-1.5 rounded-md transition-all text-center cursor-pointer ${
                modalTab === 'signup'
                  ? 'bg-red-600 text-white shadow-sm font-semibold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Error notification */}
        {error && (
          <div className="p-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-start gap-2">
            <span className="material-symbols-outlined text-[18px] text-red-400 shrink-0">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Dynamic Form Content */}
        {modalTab === 'signin' && <SignInForm />}
        {modalTab === 'signup' && <SignUpForm />}
        {modalTab === 'confirm' && <ConfirmCodeForm />}
      </div>
    </dialog>
  )
}
