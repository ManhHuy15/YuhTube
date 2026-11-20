import { useUploadWorkstation } from './hooks/useUploadWorkstation'
import { UploadDropzone } from './components/UploadDropzone'
import { UploadHeader } from './components/UploadHeader'
import { UploadStepOne } from './components/UploadStepOne'
import { UploadStepTwo } from './components/UploadStepTwo'
import { UploadFooter } from './components/UploadFooter'
import { FloatingNavbar } from '../home/components/FloatingNavbar'

export function UploadPage() {
  const {
    fileInputRef,
    thumbInputRef,
    currentStep,
    setCurrentStep,
    file,
    videoPreviewUrl,
    title,
    setTitle,
    description,
    setDescription,
    selectedThumbnail,
    customThumbnail,
    visibility,
    setVisibility,
    error,
    isUploading,
    progress,
    result,
    upload,
    videoShareUrl,
    isCopied,
    isPublishing,
    isDragOver,
    resumedFromParts,
    totalPartCount,
    savedSessionInfo,
    clearSavedSession,
    handleMinimize,
    saveStatus,
    onFileInputChange,
    onCustomThumbChange,
    onDropFile,
    onDragOver,
    onDragLeave,
    copyVideoLink,
    handlePublish,
    triggerFileSelect,
  } = useUploadWorkstation()

  return (
    <div className="min-h-screen bg-[#0b0b0e] text-[#f4f4f6] flex flex-col font-sans select-none selection:bg-rose-600/30">
      {/* Floating Island Navigation */}
      <FloatingNavbar />

      {/* Main Upload Workstation Area */}
      <main className="flex-1 pt-24 sm:pt-28 pb-20 px-3 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full flex items-center justify-center">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/quicktime,video/webm,video/x-matroska"
          className="hidden"
          onChange={onFileInputChange}
        />

        {/* STATE 1: Initial Dropzone Landing (When no file is selected yet) */}
        {!file ? (
          <div className="flex flex-col items-center w-full max-w-4xl gap-5">
            {savedSessionInfo && (
              <div className="w-full bg-white/[0.04] backdrop-blur-2xl border border-[#69d8d4]/30 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#69d8d4]/10 border border-[#69d8d4]/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[#69d8d4] text-[22px]">history</span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-bold">
                      Tìm thấy phiên tải dở trước đó
                    </p>
                    <p className="text-white/60 text-xs mt-0.5">
                      Tệp: <span className="text-white font-mono">{savedSessionInfo.fileName}</span>{savedSessionInfo.fileSizeBytes ? ` (${(savedSessionInfo.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB)` : ''}. Bạn có thể chọn lại tệp này để tiếp tục tải từ các phần đã có trên AWS S3!
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={clearSavedSession}
                    className="px-3.5 py-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/5 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Bỏ qua
                  </button>
                  <button
                    type="button"
                    onClick={triggerFileSelect}
                    className="px-4 py-2 rounded-full bg-[#69d8d4] hover:bg-[#52beba] text-[#003735] text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[16px]">upload_file</span>
                    <span>Chọn lại để tiếp tục</span>
                  </button>
                </div>
              </div>
            )}
            <UploadDropzone
              isDragOver={isDragOver}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDropFile}
              onSelectFile={triggerFileSelect}
            />
          </div>
        ) : (
          /* STATE 2: 2-Step Workstation (When file is chosen and AWS S3 Upload is active) */
          <div className="relative z-10 w-full max-w-6xl bg-white/[0.03] backdrop-blur-3xl rounded-[32px] border border-white/[0.1] shadow-[0_25px_60px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-in fade-in duration-300">
            <UploadHeader
              title={title}
              currentStep={currentStep}
              onSelectStep={setCurrentStep}
              onChangeFile={triggerFileSelect}
              onMinimize={handleMinimize}
              saveStatus={saveStatus}
              progress={progress}
              isUploading={isUploading}
            />

            {/* Resumed Parts Info Badge */}
            {resumedFromParts > 0 && (
              <div className="px-6 py-2.5 bg-[#69d8d4]/10 border-b border-[#69d8d4]/20 text-[#69d8d4] text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">cloud_sync</span>
                <span>
                  <strong>Tải tiếp tục (Resumed):</strong> Đã khôi phục thành công {resumedFromParts}/{totalPartCount} phần từ AWS S3. Đang tải tiếp các phần còn thiếu.
                </span>
              </div>
            )}

            {/* Error Notification Banner */}
            {error && (
              <div className="px-6 py-3 bg-red-950/80 border-b border-red-800 text-red-200 text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  <span>Lỗi tải video lên: {error}</span>
                </div>
                <button
                  type="button"
                  onClick={() => upload(file)}
                  className="px-3.5 py-1 rounded-full bg-red-700 hover:bg-red-600 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Thử lại
                </button>
              </div>
            )}

            {/* Step Body */}
            {currentStep === 1 ? (
              <UploadStepOne
                file={file}
                videoPreviewUrl={videoPreviewUrl}
                title={title}
                setTitle={setTitle}
                description={description}
                setDescription={setDescription}
                selectedThumbnail={selectedThumbnail}
                customThumbnail={customThumbnail}
                thumbInputRef={thumbInputRef}
                onCustomThumbChange={onCustomThumbChange}
                videoShareUrl={videoShareUrl}
                copyVideoLink={copyVideoLink}
                isCopied={isCopied}
                isUploading={isUploading}
                progress={progress}
                result={result}
              />
            ) : (
              <UploadStepTwo
                file={file}
                videoPreviewUrl={videoPreviewUrl}
                title={title}
                description={description}
                selectedThumbnail={selectedThumbnail}
                visibility={visibility}
                setVisibility={setVisibility}
                videoShareUrl={videoShareUrl}
                copyVideoLink={copyVideoLink}
                isCopied={isCopied}
                onBackToStepOne={() => setCurrentStep(1)}
                isUploading={isUploading}
                progress={progress}
                result={result}
              />
            )}

            {/* Workstation Footer */}
            <UploadFooter
              currentStep={currentStep}
              onSelectStep={setCurrentStep}
              isUploading={isUploading}
              progress={progress}
              result={result}
              isPublishing={isPublishing}
              onPublish={handlePublish}
            />
          </div>
        )}
      </main>
    </div>
  )
}
