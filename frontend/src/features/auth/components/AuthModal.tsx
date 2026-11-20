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
      className="m-auto p-0 rounded-[32px] bg-[#121217]/95 text-[#f1f1f1] border border-white/15 backdrop-blur-3xl shadow-2xl backdrop:bg-black/80 max-w-md w-full overflow-hidden"
    >
      <div className="p-6 sm:p-8 flex flex-col space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-tr from-rose-600 to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-600/30">
              <span className="material-symbols-outlined text-[17px] text-white">play_arrow</span>
            </div>
            <h2 id="auth-modal-title" className="text-xl font-extrabold tracking-tight text-white">
              {modalTab === 'signin' && 'Đăng nhập YuhTube'}
              {modalTab === 'signup' && 'Tạo tài khoản'}
              {modalTab === 'confirm' && 'Xác minh email'}
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
          <div className="flex rounded-full bg-white/[0.04] p-1 border border-white/10 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                clearError()
                setModalTab('signin')
              }}
              className={`flex-1 py-2 rounded-full transition-all text-center cursor-pointer ${
                modalTab === 'signin'
                  ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md shadow-rose-600/30 font-bold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              onClick={() => {
                clearError()
                setModalTab('signup')
              }}
              className={`flex-1 py-2 rounded-full transition-all text-center cursor-pointer ${
                modalTab === 'signup'
                  ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md shadow-rose-600/30 font-bold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Đăng ký mới
            </button>
          </div>
        )}

        {/* Error notification */}
        {error && (
          <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
            <span className="material-symbols-outlined text-[18px] text-rose-400 shrink-0">error</span>
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
