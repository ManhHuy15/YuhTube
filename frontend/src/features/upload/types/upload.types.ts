export interface InitiateUploadRequest {
  fileName: string
  contentType: string
  fileSizeBytes: number
}

export interface InitiateUploadResponse {
  videoId: string
  uploadId: string
  objectKey: string
  partSizeBytes: number
  partCount: number
}

export interface CreateUploadPartUrlsRequest {
  partNumbers: number[]
}

export interface UploadPartUrl {
  partNumber: number
  url: string
}

export interface CreateUploadPartUrlsResponse {
  expiresAt: string
  parts: UploadPartUrl[]
}

export interface CompletedPart {
  partNumber: number
  eTag: string
}

export interface CompleteUploadRequest {
  parts: CompletedPart[]
}

export interface CompleteUploadResponse {
  videoId: string
  objectKey: string
  eTag: string
}

export interface VideoUploadResult extends InitiateUploadResponse {
  parts: CompletedPart[]
  completion: CompleteUploadResponse
}

export type UploadStep = 1 | 2
export type VisibilityMode = 'public' | 'unlisted' | 'private'

export interface UploadThumbnailItem {
  id: string
  time: string
  url: string
  alt: string
}

