import axios from 'axios'
import { apiClient } from '../../../common/api/apiClient'
import type {
  CompleteUploadRequest,
  CompleteUploadResponse,
  CreateUploadPartUrlsRequest,
  CreateUploadPartUrlsResponse,
  InitiateUploadRequest,
  InitiateUploadResponse,
} from '../types/upload.types'

export async function initiateUpload(
  request: InitiateUploadRequest,
): Promise<InitiateUploadResponse> {
  const { data } = await apiClient.post<InitiateUploadResponse>('/uploads', request)
  return data
}

export async function createUploadPartUrls(
  videoId: string,
  request: CreateUploadPartUrlsRequest,
): Promise<CreateUploadPartUrlsResponse> {
  const { data } = await apiClient.post<CreateUploadPartUrlsResponse>(
    `/uploads/${videoId}/parts`,
    request,
  )
  return data
}

export async function uploadPart(
  url: string,
  chunk: Blob,
  contentType: string,
  onProgress: (loadedBytes: number) => void,
): Promise<string> {
  const response = await axios.put(url, chunk, {
    headers: { 'Content-Type': contentType },
    onUploadProgress: ({ loaded }) => onProgress(loaded),
  })
  const eTag = response.headers.etag
  if (typeof eTag !== 'string' || !eTag) {
    throw new Error('S3 did not expose the ETag response header.')
  }

  return eTag
}

export async function completeUpload(
  videoId: string,
  request: CompleteUploadRequest,
): Promise<CompleteUploadResponse> {
  const { data } = await apiClient.post<CompleteUploadResponse>(
    `/uploads/${videoId}/complete`,
    request,
  )
  return data
}
