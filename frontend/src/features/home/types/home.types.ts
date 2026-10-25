export interface VideoFeedItem {
  id: string
  title: string
  thumbnailUrl: string
  duration: string
  views: string
  createdAt: string
  badge?: string
  uploader: {
    id: string
    name: string
    avatar: string
    isVerified?: boolean
  }
}
