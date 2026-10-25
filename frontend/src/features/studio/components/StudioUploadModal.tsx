import { useState, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVideoUpload } from '../../upload/hooks/useVideoUpload'

interface StudioUploadModalProps {
  isOpen: boolean
  onClose: () => void
}

export function StudioUploadModal({ isOpen, onClose }: StudioUploadModalProps) {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState<1 | 2>(1)
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [visibility, setVisibility] = useState<'public' | 'unlisted' | 'private'>('public')

  const { error, isUploading, progress, result, upload } = useVideoUpload()

  if (!isOpen) return null

  function handleFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0]
    if (selected) {
      setFile(selected)
      // Auto-populate Title from filename without extension
      const autoTitle = selected.name.replace(/\.[^/.]+$/, '')
      setTitle(autoTitle)
      // Trigger upload immediately in background
      upload(selected)
    }
  }

  function handlePublish() {
    onClose()
    if (result) {
      navigate(`/watch/${result.videoId}`)
    } else {
      navigate('/watch/v1')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-[#1e1e24] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#161616]">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-white tracking-tight">
              {title || 'Tải video lên'}
            </h2>
            {isUploading && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-medium animate-pulse">
                Đang tải lên {progress}%
              </span>
            )}
            {result && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                Đã xử lý xong S3
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Stepper Navigation */}
        <div className="flex items-center justify-center gap-12 px-6 py-3 border-b border-white/10 bg-[#19191f] text-xs font-semibold">
          <button
            onClick={() => setCurrentStep(1)}
            className={`flex items-center gap-2 pb-1 border-b-2 transition-all cursor-pointer ${
              currentStep === 1
                ? 'border-red-500 text-white font-bold'
                : 'border-transparent text-white/50 hover:text-white/80'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                currentStep === 1 ? 'bg-red-600 text-white' : 'bg-white/10 text-white/60'
              }`}
            >
              1
            </span>
            <span>Chi tiết video</span>
          </button>

          <button
            onClick={() => file && setCurrentStep(2)}
            disabled={!file}
            className={`flex items-center gap-2 pb-1 border-b-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              currentStep === 2
                ? 'border-red-500 text-white font-bold'
                : 'border-transparent text-white/50 hover:text-white/80'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                currentStep === 2 ? 'bg-red-600 text-white' : 'bg-white/10 text-white/60'
              }`}
            >
              2
            </span>
            <span>Khán giả &amp; Xuất bản</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentStep === 1 ? (
            /* STEP 1: Details & Setup */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Form Fields */}
              <div className="lg:col-span-8 space-y-5">
                {!file ? (
                  /* File Dropzone */
                  <div className="p-10 border-2 border-dashed border-white/20 hover:border-red-500/60 rounded-2xl bg-white/[0.02] flex flex-col items-center justify-center text-center transition-all group">
                    <div className="w-16 h-16 rounded-full bg-red-600/10 text-red-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[36px]">upload</span>
                    </div>
                    <h3 className="text-base font-bold text-white">Chọn tệp video để tải lên</h3>
                    <p className="text-xs text-white/50 mt-1 max-w-sm">
                      Các video của bạn sẽ ở chế độ riêng tư cho đến khi bạn xuất bản chúng.
                    </p>
                    <label className="mt-5 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-full shadow-lg shadow-red-600/30 cursor-pointer transition-all">
                      CHỌN TỆP
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleFileSelected}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <>
                    {/* Title */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-white/80 flex justify-between">
                        <span>Tiêu đề (bắt buộc)</span>
                        <span className="text-white/40">{title.length}/100</span>
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Thêm tiêu đề mô tả video của bạn"
                        className="w-full bg-black/40 border border-white/15 focus:border-red-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none transition-all"
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-white/80 flex justify-between">
                        <span>Mô tả</span>
                        <span className="text-white/40">{description.length}/5000</span>
                      </label>
                      <textarea
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Giới thiệu cho người xem về video của bạn..."
                        className="w-full bg-black/40 border border-white/15 focus:border-red-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none transition-all resize-none"
                      />
                    </div>

                    {/* Thumbnail options */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-white/80">Hình thu nhỏ</label>
                      <p className="text-[11px] text-white/50">
                        Chọn hoặc tải một hình ảnh lên thể hiện nội dung trong video của bạn.
                      </p>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="aspect-video rounded-xl border border-dashed border-white/20 hover:border-white/40 flex flex-col items-center justify-center text-center p-2 cursor-pointer bg-white/[0.02]">
                          <span className="material-symbols-outlined text-[20px] text-white/60">
                            add_photo_alternate
                          </span>
                          <span className="text-[10px] text-white/60 mt-1">Tải ảnh lên</span>
                        </div>
                        <div className="aspect-video rounded-xl border border-red-500 bg-black/60 overflow-hidden relative shadow-sm">
                          <img
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWG75euDILAxt0iK0YrD6U1-Suv3GsDLCLs1DLbo8pH-9iipmOaSFpoGtW7_xSLZs6xVrqr_ouxgcx7S7hFrLmLEvzHZNuEoR5IJV0bnYN0zqQcsvo6hgauBfSJUr6mFK-MvGs1uF7xIoCze91Zuxee32FnrcTZWSqFZKwqQq6MT27hAh0eEwb4fWvarMtFcrrow21bYkLN417P9p92VjDmPOEsNJzR7MBPhh6Gso"
                            alt="Frame auto 1"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-1 right-1 bg-red-600 text-white text-[9px] px-1 rounded font-bold">
                            Tự động
                          </span>
                        </div>
                        <div className="aspect-video rounded-xl border border-white/10 bg-black/60 overflow-hidden relative opacity-70 hover:opacity-100 cursor-pointer">
                          <img
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCvuM9iGsJey3uiA-Epp1K2pyUyT6nipl7dh1WlvNQpz-qCgXXE0k_nnil01ivWXufbkMfOiksz9ev-3UtPMRLQcqEgVzMP0ATbNBvr1Z_mDFwZbJHEGuklnJSEIZ38huUBsAib-M_U5tNkoVrOZu_SB-XrtxPFwDxamHdKXhvcGLrCrxU35HCu7EmIXsoH-oe3w0Bya-DfPpcZy0Q0iO_zY-__BPK3BUJAMuCZBQ0"
                            alt="Frame auto 2"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Right Column: Live Video Card Preview */}
              <div className="lg:col-span-4 space-y-4">
                <div className="rounded-xl bg-black/50 border border-white/10 p-3.5 space-y-3">
                  <div className="aspect-video rounded-lg overflow-hidden bg-black/80 relative border border-white/10">
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWG75euDILAxt0iK0YrD6U1-Suv3GsDLCLs1DLbo8pH-9iipmOaSFpoGtW7_xSLZs6xVrqr_ouxgcx7S7hFrLmLEvzHZNuEoR5IJV0bnYN0zqQcsvo6hgauBfSJUr6mFK-MvGs1uF7xIoCze91Zuxee32FnrcTZWSqFZKwqQq6MT27hAh0eEwb4fWvarMtFcrrow21bYkLN417P9p92VjDmPOEsNJzR7MBPhh6Gso"
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-white font-mono text-[10px] px-1.5 py-0.5 rounded">
                      0:00
                    </span>
                  </div>

                  <div>
                    <p className="text-[11px] text-white/50">Đường liên kết của video</p>
                    <p className="text-xs text-sky-400 font-mono truncate mt-0.5">
                      https://yuhtube.vn/watch?v={result?.videoId || 'preview'}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] text-white/50">Tên tệp</p>
                    <p className="text-xs text-white/80 font-medium truncate mt-0.5">
                      {file ? file.name : 'Chưa chọn tệp'}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  {isUploading && (
                    <div className="space-y-1.5 pt-2 border-t border-white/10">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-white/60">Tiến độ Multipart Upload</span>
                        <span className="text-red-400 font-mono font-bold">{progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-600 transition-all duration-200"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {error && <p className="text-xs text-red-400 pt-2">{error}</p>}
                </div>
              </div>
            </div>
          ) : (
            /* STEP 2: Audience & Visibility */
            <div className="max-w-2xl mx-auto space-y-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Chế độ hiển thị
              </h3>
              <p className="text-xs text-white/60">
                Chọn thời điểm xuất bản video của bạn và ai có thể xem video đó.
              </p>

              <div className="p-4 rounded-xl border border-white/10 bg-black/40 space-y-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    value="private"
                    checked={visibility === 'private'}
                    onChange={() => setVisibility('private')}
                    className="mt-1 accent-red-600"
                  />
                  <div>
                    <span className="text-sm font-semibold text-white block">Riêng tư</span>
                    <span className="text-xs text-white/50">
                      Chỉ bạn và những người bạn chọn mới có thể xem video của bạn.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    value="unlisted"
                    checked={visibility === 'unlisted'}
                    onChange={() => setVisibility('unlisted')}
                    className="mt-1 accent-red-600"
                  />
                  <div>
                    <span className="text-sm font-semibold text-white block">Không công khai</span>
                    <span className="text-xs text-white/50">
                      Bất kỳ ai có đường liên kết đến video đều có thể xem video.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    value="public"
                    checked={visibility === 'public'}
                    onChange={() => setVisibility('public')}
                    className="mt-1 accent-red-600"
                  />
                  <div>
                    <span className="text-sm font-semibold text-white block">Công khai</span>
                    <span className="text-xs text-white/50">
                      Mọi người đều có thể xem video của bạn trên trang chủ và tìm kiếm.
                    </span>
                  </div>
                </label>
              </div>

              {/* Automatic Checks */}
              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] space-y-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>Kiểm tra tự động &amp; Chuyển mã HLS</span>
                </div>
                <p className="text-white/70 leading-relaxed">
                  Video sau khi xuất bản sẽ được tự động chuyển đổi sang chuẩn HLS QVBR 720p/1080p bởi AWS Elemental MediaConvert và phát qua CloudFront CDN.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-[#161616]">
          <div className="flex items-center gap-2 text-xs text-white/40">
            <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
            <span>{isUploading ? `Đang tải: ${progress}%` : file ? 'Sẵn sàng' : 'Chưa có tệp'}</span>
          </div>

          <div className="flex items-center gap-3">
            {currentStep === 2 && (
              <button
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 text-xs font-semibold text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                QUAY LẠI
              </button>
            )}

            {currentStep === 1 ? (
              <button
                onClick={() => setCurrentStep(2)}
                disabled={!file}
                className="px-6 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-40 rounded-full text-xs font-semibold text-white tracking-wide transition-all shadow-md shadow-red-600/30 cursor-pointer disabled:cursor-not-allowed"
              >
                TIẾP TỤC
              </button>
            ) : (
              <button
                onClick={handlePublish}
                className="px-6 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 rounded-full text-xs font-semibold text-white tracking-wide transition-all shadow-lg shadow-red-600/40 cursor-pointer active:scale-95"
              >
                XUẤT BẢN
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
