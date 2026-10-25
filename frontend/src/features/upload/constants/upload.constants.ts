import type { UploadThumbnailItem } from '../types/upload.types'

export const UPLOAD_URL_BATCH_SIZE = 20
export const UPLOAD_CONCURRENCY = 4

export const SAMPLE_THUMBNAILS: UploadThumbnailItem[] = [
  {
    id: 't1',
    time: '00:04:12',
    url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80',
    alt: 'Serverless Cloud Architecture',
  },
  {
    id: 't2',
    time: '00:15:38',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
    alt: 'Pipeline Code Editor',
  },
  {
    id: 't3',
    time: '00:24:02',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
    alt: 'Cloud Monitoring Latency Dashboard',
  },
]

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

