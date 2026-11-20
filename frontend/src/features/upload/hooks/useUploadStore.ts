import { create } from 'zustand'
import { UPLOAD_CONCURRENCY, UPLOAD_URL_BATCH_SIZE } from '../constants/upload.constants'
import {
  completeUpload,
  createUploadPartUrls,
  fetchUploadedParts,
  initiateUpload,
  uploadPart,
} from '../services/upload.service'
import type { CompletedPart, ResumableSessionInfo, VideoUploadResult } from '../types/upload.types'

const SESSION_STORAGE_KEY = 'yuhtube_active_upload_session'

interface UploadSessionData {
  videoId: string
  fileName: string
  fileSizeBytes: number
  lastModified: number
  partSizeBytes: number
  partCount: number
  title?: string
  description?: string
}

function saveLocalSession(data: UploadSessionData) {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data))
  } catch (err) {
    console.warn('Could not save upload session to localStorage:', err)
  }
}

function loadLocalSession(): UploadSessionData | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function clearLocalSession() {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY)
  } catch {
    // Ignore
  }
}

function enableBeforeUnload() {
  window.onbeforeunload = (e: BeforeUnloadEvent) => {
    e.preventDefault()
    e.returnValue = ''
    return ''
  }
}

function disableBeforeUnload() {
  window.onbeforeunload = null
}

interface UploadStoreState {
  file: File | null
  videoId: string | null
  title: string
  description: string
  progress: number
  isUploading: boolean
  isCompleted: boolean
  isMinimized: boolean
  error: string | null
  result: VideoUploadResult | null
  resumedFromParts: number
  totalPartCount: number

  // Actions
  startUpload: (file: File, defaultTitle?: string) => Promise<void>
  minimize: () => void
  maximize: () => void
  cancelUpload: () => void
  dismiss: () => void
  setTitle: (title: string) => void
  setDescription: (desc: string) => void
  checkSavedSession: (file: File) => ResumableSessionInfo | null
}

let activeAbortController: AbortController | null = null

export const useUploadStore = create<UploadStoreState>((set) => ({
  file: null,
  videoId: null,
  title: '',
  description: '',
  progress: 0,
  isUploading: false,
  isCompleted: false,
  isMinimized: false,
  error: null,
  result: null,
  resumedFromParts: 0,
  totalPartCount: 0,

  setTitle: (title: string) => set({ title }),
  setDescription: (description: string) => set({ description }),
  minimize: () => set({ isMinimized: true }),
  maximize: () => set({ isMinimized: false }),

  dismiss: () => {
    disableBeforeUnload()
    clearLocalSession()
    set({
      file: null,
      videoId: null,
      progress: 0,
      isUploading: false,
      isCompleted: false,
      isMinimized: false,
      error: null,
      result: null,
      resumedFromParts: 0,
      totalPartCount: 0,
    })
  },

  cancelUpload: () => {
    if (activeAbortController) {
      activeAbortController.abort()
      activeAbortController = null
    }
    disableBeforeUnload()
    clearLocalSession()
    set({
      file: null,
      videoId: null,
      progress: 0,
      isUploading: false,
      isCompleted: false,
      isMinimized: false,
      error: 'Tải lên đã bị hủy bởi người dùng.',
      result: null,
      resumedFromParts: 0,
      totalPartCount: 0,
    })
  },

  checkSavedSession: (file: File): ResumableSessionInfo | null => {
    const saved = loadLocalSession()
    if (
      saved &&
      saved.fileName === file.name &&
      saved.fileSizeBytes === file.size &&
      Math.abs(saved.lastModified - file.lastModified) < 2000
    ) {
      return {
        videoId: saved.videoId,
        fileName: saved.fileName,
        fileSizeBytes: saved.fileSizeBytes,
        lastModified: saved.lastModified,
        partSizeBytes: saved.partSizeBytes,
        partCount: saved.partCount,
        uploadedParts: [],
      }
    }
    return null
  },

  startUpload: async (file: File, defaultTitle?: string) => {
    // Abort any ongoing upload
    if (activeAbortController) {
      activeAbortController.abort()
    }
    activeAbortController = new AbortController()

    const initialTitle = defaultTitle || file.name.replace(/\.[^/.]+$/, '')

    set({
      file,
      title: initialTitle,
      progress: 0,
      isUploading: true,
      isCompleted: false,
      error: null,
      result: null,
      resumedFromParts: 0,
      totalPartCount: 0,
    })

    // Enable browser tab close protection
    enableBeforeUnload()

    try {
      let videoId = ''
      let uploadId = ''
      let objectKey = ''
      let partSizeBytes = 0
      let partCount = 0
      const completedParts: CompletedPart[] = []

      // STEP 1: Check for existing session in localStorage to resume
      const savedSession = loadLocalSession()
      const isSameFile =
        savedSession &&
        savedSession.fileName === file.name &&
        savedSession.fileSizeBytes === file.size &&
        Math.abs(savedSession.lastModified - file.lastModified) < 2000

      let isResumed = false

      if (isSameFile && savedSession) {
        try {
          const s3Session = await fetchUploadedParts(savedSession.videoId)
          if (s3Session && s3Session.status === 'Initiated') {
            videoId = s3Session.videoId
            partSizeBytes = s3Session.partSizeBytes
            partCount = s3Session.partCount
            completedParts.push(...s3Session.uploadedParts)
            isResumed = true
            set({
              videoId,
              resumedFromParts: completedParts.length,
              totalPartCount: partCount,
            })
          }
        } catch (err) {
          console.warn('Could not resume previous S3 upload session, creating fresh session:', err)
        }
      }

      // STEP 2: If not resumed, initiate a new Multipart Upload session
      if (!isResumed) {
        const session = await initiateUpload({
          fileName: file.name,
          contentType: file.type || 'video/octet-stream',
          fileSizeBytes: file.size,
          title: initialTitle,
        })
        videoId = session.videoId
        uploadId = session.uploadId
        objectKey = session.objectKey
        partSizeBytes = session.partSizeBytes
        partCount = session.partCount
        set({
          videoId,
          totalPartCount: partCount,
        })

        // Persist session to localStorage
        saveLocalSession({
          videoId,
          fileName: file.name,
          fileSizeBytes: file.size,
          lastModified: file.lastModified,
          partSizeBytes,
          partCount,
          title: initialTitle,
        })
      }

      // Set of parts already uploaded to S3
      const alreadyUploadedPartNumbers = new Set(completedParts.map((p) => p.partNumber))

      // Track loaded bytes per part
      const loadedByPart = new Map<number, number>()
      let uploadedBytes = 0

      // Account for already completed parts in progress
      for (const p of completedParts) {
        const start = (p.partNumber - 1) * partSizeBytes
        const chunkSize = Math.min(partSizeBytes, file.size - start)
        loadedByPart.set(p.partNumber, chunkSize)
        uploadedBytes += chunkSize
      }

      set({
        progress: Math.min(100, Math.round((uploadedBytes / file.size) * 100)),
      })

      // STEP 3: Upload remaining parts
      const partsToUpload: number[] = []
      for (let pNum = 1; pNum <= partCount; pNum++) {
        if (!alreadyUploadedPartNumbers.has(pNum)) {
          partsToUpload.push(pNum)
        }
      }

      for (let i = 0; i < partsToUpload.length; i += UPLOAD_URL_BATCH_SIZE) {
        const batchPartNumbers = partsToUpload.slice(i, i + UPLOAD_URL_BATCH_SIZE)
        const { parts } = await createUploadPartUrls(videoId, { partNumbers: batchPartNumbers })

        for (let j = 0; j < parts.length; j += UPLOAD_CONCURRENCY) {
          await Promise.all(
            parts.slice(j, j + UPLOAD_CONCURRENCY).map(async (part) => {
              const start = (part.partNumber - 1) * partSizeBytes
              const chunk = file.slice(start, Math.min(start + partSizeBytes, file.size))

              const updateProgress = (loaded: number) => {
                const currentLoaded = Math.min(loaded, chunk.size)
                const previousLoaded = loadedByPart.get(part.partNumber) ?? 0
                uploadedBytes += currentLoaded - previousLoaded
                loadedByPart.set(part.partNumber, currentLoaded)
                set({
                  progress: Math.min(100, Math.round((uploadedBytes / file.size) * 100)),
                })
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

      // STEP 4: Complete Multipart Upload
      completedParts.sort((a, b) => a.partNumber - b.partNumber)
      const completion = await completeUpload(videoId, { parts: completedParts })

      const uploadResult: VideoUploadResult = {
        videoId,
        uploadId,
        objectKey,
        partSizeBytes,
        partCount,
        parts: completedParts,
        completion,
      }

      // Upload finished successfully -> clear local session and browser warning
      clearLocalSession()
      disableBeforeUnload()

      set({
        result: uploadResult,
        progress: 100,
        isUploading: false,
        isCompleted: true,
      })
    } catch (uploadError: any) {
      if (uploadError?.name === 'AbortError') {
        return
      }
      disableBeforeUnload()
      set({
        error: uploadError instanceof Error ? uploadError.message : 'Tải lên video thất bại.',
        isUploading: false,
      })
    }
  },
}))
