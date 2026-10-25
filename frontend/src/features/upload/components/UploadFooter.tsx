import { Link } from 'react-router-dom'
import type { UploadStep, VideoUploadResult } from '../types/upload.types'

interface UploadFooterProps {
  currentStep: UploadStep
  onSelectStep: (step: UploadStep) => void
  isUploading: boolean
  progress: number
  result: VideoUploadResult | null
  isPublishing: boolean
  onPublish: () => void
}

export function UploadFooter({
  currentStep,
  onSelectStep,
  isUploading,
  progress,
  result,
  isPublishing,
  onPublish,
}: UploadFooterProps) {
  return (
    <footer className="px-6 py-4 bg-[#201f21] border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
      {currentStep === 1 ? (
        <>
          <div className="flex items-center gap-2 text-white/60 text-xs">
            <span
              className={`material-symbols-outlined text-[18px] ${
                result ? 'text-[#69d8d4]' : 'text-amber-400'
              }`}
            >
              {result ? 'cloud_done' : 'cloud_sync'}
            </span>
            <span>
              {isUploading
                ? `Đang truyền tải dữ liệu đa luồng lên S3 (${progress}%)...`
                : result
                ? 'Dữ liệu video đã tải lên S3 an toàn, sẵn sàng xuất bản.'
                : 'Tất cả thay đổi được tự động cập nhật.'}
            </span>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <Link
              to="/studio"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              Hủy
            </Link>
            <button
              type="button"
              onClick={() => onSelectStep(2)}
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold tracking-wide flex items-center gap-1.5 shadow-lg shadow-red-600/30 transition-all cursor-pointer active:scale-95"
            >
              <span>Tiếp tục sang Bước 2</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-[#69d8d4]"></span>
            <span className="text-white font-medium">
              {result
                ? 'Video đã tải lên S3 hoàn tất, sẵn sàng phát hành trên toàn cầu.'
                : 'Video đang được xử lý trong nền.'}
            </span>
            <span className="hidden sm:inline text-white/50">Không còn thiết lập nào còn thiếu.</span>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <button
              type="button"
              onClick={() => onSelectStep(1)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white/60 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Quay lại Bước 1</span>
            </button>
            <button
              type="button"
              disabled={isPublishing}
              onClick={onPublish}
              className="bg-red-600 hover:bg-red-500 disabled:bg-red-800 text-white text-xs font-bold px-6 py-2 rounded-xl tracking-wider uppercase flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all cursor-pointer active:scale-95"
            >
              {isPublishing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>ĐANG PHÁT HÀNH...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">publish</span>
                  <span>XUẤT BẢN NGAY</span>
                </>
              )}
            </button>
          </div>
        </>
      )}
    </footer>
  )
}
