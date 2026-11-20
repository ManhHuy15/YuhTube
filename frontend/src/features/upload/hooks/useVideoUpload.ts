import { useUploadStore } from './useUploadStore'

export function useVideoUpload() {
  const {
    error,
    isUploading,
    isCompleted,
    progress,
    result,
    videoId,
    resumedFromParts,
    totalPartCount,
    startUpload,
    cancelUpload,
    dismiss,
    checkSavedSession,
  } = useUploadStore()

  return {
    error,
    isUploading,
    isCompleted,
    progress,
    result,
    videoId,
    resumedFromParts,
    totalPartCount,
    upload: startUpload,
    cancel: cancelUpload,
    reset: dismiss,
    checkSavedSession,
  }
}
