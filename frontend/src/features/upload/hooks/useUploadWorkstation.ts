import { useState, useRef, useEffect, type ChangeEvent, type DragEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVideoUpload } from './useVideoUpload'
import { updateVideoMetadata, uploadThumbnail } from '../services/upload.service'
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
  const [selectedThumbnail, setSelectedThumbnail] = useState<string>('')
  const [customThumbnail, setCustomThumbnail] = useState<string | null>(null)
  const [customThumbFile, setCustomThumbFile] = useState<File | null>(null)
  const [visibility, setVisibility] = useState<VisibilityMode>('public')
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
      setCustomThumbFile(selected)
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
