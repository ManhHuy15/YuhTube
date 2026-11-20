import { useState, useRef, useEffect, type ChangeEvent, type DragEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVideoUpload } from './useVideoUpload'
import { useUploadStore } from './useUploadStore'
import { updateVideoMetadata, uploadThumbnail } from '../services/upload.service'
import type { UploadStep, VisibilityMode } from '../types/upload.types'

export function useUploadWorkstation() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const thumbInputRef = useRef<HTMLInputElement>(null)

  const storeFile = useUploadStore((s) => s.file)
  const storeTitle = useUploadStore((s) => s.title)
  const storeDescription = useUploadStore((s) => s.description)

  const [currentStep, setCurrentStep] = useState<UploadStep>(1)
  const [file, setFile] = useState<File | null>(() => storeFile)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(() =>
    storeFile ? URL.createObjectURL(storeFile) : null
  )
  const [title, setTitle] = useState(() => storeTitle || '')
  const [description, setDescription] = useState(() => storeDescription || '')
  const [selectedThumbnail, setSelectedThumbnail] = useState<string>('')
  const [customThumbnail, setCustomThumbnail] = useState<string | null>(null)
  const [customThumbFile, setCustomThumbFile] = useState<File | null>(null)
  const [visibility, setVisibility] = useState<VisibilityMode>('public')
  const [isCopied, setIsCopied] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [savedSessionInfo, setSavedSessionInfo] = useState<{
    fileName: string
    videoId: string
    fileSizeBytes?: number
  } | null>(() => {
    try {
      const raw = localStorage.getItem('yuhtube_active_upload_session')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed?.fileName && parsed?.videoId) {
          return {
            fileName: parsed.fileName,
            videoId: parsed.videoId,
            fileSizeBytes: parsed.fileSizeBytes,
          }
        }
      }
    } catch {
      // Ignore
    }
    return null
  })

  // Real AWS S3 Multipart Upload Hook (Zustand-backed)
  const {
    error,
    isUploading,
    isCompleted,
    progress,
    reset,
    result,
    upload,
    videoId: uploadVideoId,
    resumedFromParts,
    totalPartCount,
  } = useVideoUpload()

  function clearSavedSession() {
    try {
      localStorage.removeItem('yuhtube_active_upload_session')
    } catch {
      // Ignore
    }
    setSavedSessionInfo(null)
  }

  const videoId = result?.videoId || uploadVideoId || ''
  const videoShareUrl = videoId ? `https://yuhtube.vn/watch?v=${videoId}` : 'Đang tạo liên kết...'

  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle')
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isInitialMount = useRef(true)

  // YouTube-style auto-save draft metadata (Title, Description, Visibility)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    if (!videoId || !title.trim()) return

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(async () => {
      setSaveStatus('saving')
      try {
        await updateVideoMetadata(videoId, {
          title: title.trim(),
          description: description.trim(),
          isPrivate: visibility === 'private',
        })
        setSaveStatus('saved')
      } catch (err) {
        console.warn('Auto-save video metadata draft failed:', err)
        setSaveStatus('idle')
      }
    }, 1000)

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [title, description, visibility, videoId])

  // Cleanup object URL on unmount or when replaced
  useEffect(() => {
    return () => {
      if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl)
      }
    }
  }, [videoPreviewUrl])

  function handleFileSelected(selected: File) {
    setFile(selected)
    reset()

    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl)
    }
    const previewUrl = URL.createObjectURL(selected)
    setVideoPreviewUrl(previewUrl)

    // Auto-fill title from filename if title is empty
    const rawTitle = selected.name.replace(/\.[^/.]+$/, '')
    setTitle(rawTitle)

    // Execute real multipart upload to AWS S3 (with Resumable S3 Check)
    upload(selected, rawTitle)
  }

  function onFileInputChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0]
    if (selected) {
      handleFileSelected(selected)
    }
  }

  async function onCustomThumbChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0]
    if (selected) {
      setCustomThumbFile(selected)
      const url = URL.createObjectURL(selected)
      setCustomThumbnail(url)
      setSelectedThumbnail(url)

      if (videoId) {
        setSaveStatus('saving')
        try {
          const uploadedUrl = await uploadThumbnail(videoId, selected)
          await updateVideoMetadata(videoId, {
            title: title || 'Untitled Video',
            description,
            thumbnailUrl: uploadedUrl,
            isPrivate: visibility === 'private',
          })
          setSaveStatus('saved')
        } catch (err) {
          console.warn('Auto-save custom thumbnail failed:', err)
          setSaveStatus('idle')
        }
      }
    }
  }

  function onDropFile(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragOver(false)
    const dropped = event.dataTransfer.files?.[0]
    if (dropped && dropped.type.startsWith('video/')) {
      handleFileSelected(dropped)
    }
  }

  function onDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragOver(true)
  }

  function onDragLeave() {
    setIsDragOver(false)
  }

  function copyVideoLink() {
    navigator.clipboard.writeText(videoShareUrl)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  async function handlePublish() {
    setIsPublishing(true)
    try {
      if (result?.videoId) {
        let finalThumbnailUrl: string | undefined = undefined

        if (customThumbFile) {
          try {
            finalThumbnailUrl = await uploadThumbnail(result.videoId, customThumbFile)
          } catch (uploadErr) {
            console.warn('Could not upload custom thumbnail to S3, fallback to default:', uploadErr)
          }
        }

        await updateVideoMetadata(result.videoId, {
          title: title || 'Untitled Video',
          description,
          thumbnailUrl: finalThumbnailUrl,
          isPrivate: visibility === 'private',
        })
      }
    } catch (err) {
      console.warn('Could not save metadata to backend, proceeding with local view:', err)
    } finally {
      setIsPublishing(false)
      navigate(`/watch/${videoId}`)
    }
  }

  function handleMinimize() {
    useUploadStore.getState().minimize()
    navigate('/studio')
  }

  function triggerFileSelect() {
    fileInputRef.current?.click()
  }

  function triggerThumbSelect() {
    thumbInputRef.current?.click()
  }

  return {
    // Refs
    fileInputRef,
    thumbInputRef,

    // Step & Mode
    currentStep,
    setCurrentStep,

    // File & Preview
    file,
    videoPreviewUrl,

    // Metadata
    title,
    setTitle,
    description,
    setDescription,
    selectedThumbnail,
    customThumbnail,
    visibility,
    setVisibility,
    saveStatus,

    // Upload & Network State
    error,
    isUploading,
    isCompleted,
    progress,
    result,
    upload,
    resumedFromParts,
    totalPartCount,
    savedSessionInfo,
    clearSavedSession,

    // Video Identifiers & Sharing
    videoId,
    videoShareUrl,
    isCopied,
    isPublishing,
    isDragOver,

    // Handlers
    handleFileSelected,
    onFileInputChange,
    onCustomThumbChange,
    onDropFile,
    onDragOver,
    onDragLeave,
    copyVideoLink,
    handlePublish,
    handleMinimize,
    triggerFileSelect,
    triggerThumbSelect,
  }
}
