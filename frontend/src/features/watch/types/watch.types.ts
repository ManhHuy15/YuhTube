export interface WatchVideoDetail {
  id: string
  title: string
  description: string
  playbackUrl?: string
  posterUrl: string
  views: string
  publishedAt: string
  duration: string
  likesCount: number
  uploader: {
    id: string
    name: string
    avatar: string
    subscribers: string
    isVerified?: boolean
  }
}

export interface WatchComment {
  id: string
  authorName: string
  authorAvatar: string
  content: string
  createdAt: string
  likes: number
}

export interface RelatedVideo {
  id: string
  title: string
  channel: string
  views: string
  time: string
  duration: string
  thumbnail: string
}
