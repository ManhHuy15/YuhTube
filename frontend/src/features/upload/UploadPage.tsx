import { StudioHeader } from '../studio/components/StudioHeader'
import { StudioSidebar } from '../studio/components/StudioSidebar'
import { useUploadWorkstation } from './hooks/useUploadWorkstation'
import { UploadDropzone } from './components/UploadDropzone'
import { UploadHeader } from './components/UploadHeader'
import { UploadStepOne } from './components/UploadStepOne'
import { UploadStepTwo } from './components/UploadStepTwo'
import { UploadFooter } from './components/UploadFooter'

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
    setSelectedThumbnail,
    customThumbnail,
    visibility,
    setVisibility,
    isPremiere,
    setIsPremiere,
    isScheduleOpen,
    setIsScheduleOpen,
    scheduleDate,
    setScheduleDate,
    scheduleTime,
    setScheduleTime,
    error,
    isUploading,
    progress,
    result,
    upload,
    videoShareUrl,
    isCopied,
    isPublishing,
    isDragOver,
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
    <div className="min-h-screen bg-[#131315] text-[#e5e1e4] flex flex-col font-sans select-none selection:bg-red-500/30">
      {/* Studio Top Header */}
      <StudioHeader onOpenUpload={triggerFileSelect} />

      <div className="flex flex-1 pt-14">
        {/* Studio Sidebar */}
        <StudioSidebar />

        {/* Studio Main Upload Workstation Area */}
        <main className="flex-1 min-h-[calc(100vh-3.5rem)] bg-[#131315] lg:ml-64 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
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
            <UploadDropzone
              isDragOver={isDragOver}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDropFile}
              onSelectFile={triggerFileSelect}
            />
          ) : (
            /* STATE 2: 2-Step Workstation (When file is chosen and AWS S3 Upload is active) */
            <div className="relative z-10 w-full max-w-6xl bg-[#1c1b1d] rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-in fade-in duration-300">
              <UploadHeader
                title={title}
                currentStep={currentStep}
                onSelectStep={setCurrentStep}
                onChangeFile={triggerFileSelect}
              />

              {/* Error Notification Banner */}
              {error && (
                <div className="px-6 py-3 bg-red-950/80 border-b border-red-800 text-red-200 text-xs flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">error</span>
                    <span>Lỗi tải lên AWS S3: {error}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => upload(file)}
                    className="px-3 py-1 rounded-lg bg-red-700 hover:bg-red-600 text-white text-xs font-bold transition-colors cursor-pointer"
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
                  setSelectedThumbnail={setSelectedThumbnail}
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
                  isPremiere={isPremiere}
                  setIsPremiere={setIsPremiere}
                  isScheduleOpen={isScheduleOpen}
                  setIsScheduleOpen={setIsScheduleOpen}
                  scheduleDate={scheduleDate}
                  setScheduleDate={setScheduleDate}
                  scheduleTime={scheduleTime}
                  setScheduleTime={setScheduleTime}
                  videoShareUrl={videoShareUrl}
                  copyVideoLink={copyVideoLink}
                  isCopied={isCopied}
                  onBackToStepOne={() => setCurrentStep(1)}
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
    </div>
  )
}
