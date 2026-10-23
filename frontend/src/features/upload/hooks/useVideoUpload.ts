import { useState } from 'react'
import { UPLOAD_CONCURRENCY, UPLOAD_URL_BATCH_SIZE } from '../constants/upload.constants'
import {
  completeUpload,
  createUploadPartUrls,
  initiateUpload,
  uploadPart,
} from '../services/upload.service'
import type { CompletedPart, VideoUploadResult } from '../types/upload.types'

export function useVideoUpload() {
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<VideoUploadResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  function reset() {
    setProgress(0)
    setResult(null)
    setError(null)
  }

  async function upload(file: File) {
    setIsUploading(true)
    reset()

    try {
      const session = await initiateUpload({
        fileName: file.name,
        contentType: file.type || 'video/octet-stream',
        fileSizeBytes: file.size,
      })
      const completedParts: CompletedPart[] = []
      const loadedByPart = new Map<number, number>()
      let uploadedBytes = 0

      for (let firstPart = 1; firstPart <= session.partCount; firstPart += UPLOAD_URL_BATCH_SIZE) {
        const partNumbers = Array.from(
          { length: Math.min(UPLOAD_URL_BATCH_SIZE, session.partCount - firstPart + 1) },
          (_, index) => firstPart + index,
        )
        const { parts } = await createUploadPartUrls(session.videoId, { partNumbers })

        for (let index = 0; index < parts.length; index += UPLOAD_CONCURRENCY) {
          await Promise.all(
            parts.slice(index, index + UPLOAD_CONCURRENCY).map(async (part) => {
              const start = (part.partNumber - 1) * session.partSizeBytes
              const chunk = file.slice(start, Math.min(start + session.partSizeBytes, file.size))
              const updateProgress = (loaded: number) => {
                const currentLoaded = Math.min(loaded, chunk.size)
                const previousLoaded = loadedByPart.get(part.partNumber) ?? 0
                uploadedBytes += currentLoaded - previousLoaded
                loadedByPart.set(part.partNumber, currentLoaded)
                setProgress(Math.min(100, Math.round((uploadedBytes / file.size) * 100)))
              }
              const eTag = await uploadPart(
                part.url,
                chunk,
                file.type || 'application/octet-stream',
                updateProgress,
              )
              updateProgress(chunk.size)
              completedParts.push({ partNumber: part.partNumber, eTag })
            }),
          )
        }
      }

      completedParts.sort((left, right) => left.partNumber - right.partNumber)
      const completion = await completeUpload(session.videoId, { parts: completedParts })
      setResult({ ...session, parts: completedParts, completion })
    } catch (uploadError: unknown) {
      setError(uploadError instanceof Error ? uploadError.message : 'Upload failed.')
    } finally {
      setIsUploading(false)
    }
  }

  return { error, isUploading, progress, reset, result, upload }
}
