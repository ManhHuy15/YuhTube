import { Link } from 'react-router-dom'
import type { UploadStep } from '../types/upload.types'

interface UploadHeaderProps {
  title: string
  currentStep: UploadStep
  onSelectStep: (step: UploadStep) => void
  onChangeFile: () => void
}

export function UploadHeader({
  title,
  currentStep,
  onSelectStep,
  onChangeFile,
}: UploadHeaderProps) {
  return (
    <header className="px-6 py-4 bg-[#201f21] border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-6 flex-wrap">
        <h1 className="text-lg sm:text-xl text-white font-bold tracking-tight truncate max-w-[280px] sm:max-w-md">
          {title || 'Tải video lên'}
        </h1>

        <nav aria-label="Tiến trình tải lên" className="flex items-center gap-3 text-xs font-mono">
          {/* Step 1 Tab */}
          <button
            onClick={() => onSelectStep(1)}
            className={`flex items-center gap-2 cursor-pointer transition-colors ${
              currentStep === 1
                ? 'text-white font-bold'
                : 'text-[#c6c6cb] hover:text-white opacity-80'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] ${
                currentStep === 1 ? 'bg-red-600 text-white' : 'bg-[#353437] text-[#69d8d4]'
              }`}
            >
              {currentStep === 2 ? (
                <span className="material-symbols-outlined text-[13px]">check</span>
              ) : (
                '1'
              )}
            </span>
            <span>1. Thông tin &amp; Thiết lập</span>
          </button>

          <span className="text-white/30 font-mono">/</span>

          {/* Step 2 Tab */}
          <button
            onClick={() => onSelectStep(2)}
            className={`flex items-center gap-2 cursor-pointer transition-colors ${
              currentStep === 2
                ? 'text-white font-bold'
                : 'text-[#c6c6cb] hover:text-white opacity-80'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] ${
                currentStep === 2 ? 'bg-red-600 text-white' : 'bg-[#353437] text-[#c6c6cb]'
              }`}
            >
              2
            </span>
            <span>2. Xem trước &amp; Xuất bản</span>
          </button>
        </nav>
      </div>

      {/* Window Controls */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onChangeFile}
          className="text-xs text-white/60 hover:text-white px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-1 cursor-pointer"
          title="Chọn tệp khác"
        >
          <span className="material-symbols-outlined text-[15px]">swap_horiz</span>
          <span>Đổi tệp</span>
        </button>
        <Link
          to="/studio"
          className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          title="Về Studio"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </Link>
      </div>
    </header>
  )
}
