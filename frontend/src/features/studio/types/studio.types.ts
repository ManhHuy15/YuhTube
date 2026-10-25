export interface StudioVideoRow {
  id: string
  title: string
  subtitle: string
  thumbnailUrl: string
  duration: string
  visibility: 'Công khai' | 'Không công khai' | 'Riêng tư'
  restrictions: string
  publishedDate: string
  views: string
  comments: number
  likePercentage: string
}

export interface LatestVideoStats {
  title: string
  thumbnailUrl: string
  duration: string
  rank: string
  views: string
  viewsGrowth: string
  ctr: string
  ctrGrowth: string
  avgDuration: string
}

export interface ChannelAnalytics {
  subscribers: string
  subscribersGrowth: string
  views28Days: string
  watchTimeHours: string
  estimatedRevenue: string
  topVideos48h: Array<{
    title: string
    views: string
  }>
}

export interface UploadFormData {
  file: File | null
  title: string
  description: string
  thumbnailUrl: string
  visibility: 'public' | 'unlisted' | 'private'
  isScheduled: boolean
  scheduleDate?: string
}
