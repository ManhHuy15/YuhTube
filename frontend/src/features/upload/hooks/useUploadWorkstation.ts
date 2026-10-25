import { useState, useRef, useEffect, type ChangeEvent, type DragEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVideoUpload } from './useVideoUpload'
import { SAMPLE_THUMBNAILS } from '../constants/upload.constants'
import type { UploadStep, VisibilityMode } from '../types/upload.types'

export function useUploadWorkstation() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const thumbInputRef = useRef<HTMLInputElement>(null)

  const [currentStep, setCurrentStep] = useState<UploadStep>(1)
  const [file, setFile] = useState<File | null>(null)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedThumbnail, setSelectedThumbnail] = useState<string>(SAMPLE_THUMBNAILS[0].url)
  const [customThumbnail, setCustomThumbnail] = useState<string | null>(null)
  const [visibility, setVisibility] = useState<VisibilityMode>('public')
  const [isPremiere, setIsPremiere] = useState(false)
  const [isScheduleOpen, setIsScheduleOpen] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('2026-10-25')
  const [scheduleTime, setScheduleTime] = useState('20:00')
  const [isCopied, setIsCopied] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)

  // Real AWS S3 Multipart Upload Hook
  const { error, isUploading, progress, reset, result, upload } = useVideoUpload()

  const videoId = result?.videoId || 's3-stream-99'
  const videoShareUrl = `https://yuhtube.vn/watch?v=${videoId}`

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

    // Execute real multipart upload to AWS S3
    upload(selected)
  }

  function onFileInputChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0]
    if (selected) {
      handleFileSelected(selected)
    }
  }

  function onCustomThumbChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0]
    if (selected) {
      const url = URL.createObjectURL(selected)
      setCustomThumbnail(url)
      setSelectedThumbnail(url)
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

  function handlePublish() {
    setIsPublishing(true)
    setTimeout(() => {
      setIsPublishing(false)
      navigate(`/watch/${videoId}`)
    }, 1200)
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

    // Upload & Network State
    error,
    isUploading,
    progress,
    result,
    upload,

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
    triggerFileSelect,
    triggerThumbSelect,
  }
}
