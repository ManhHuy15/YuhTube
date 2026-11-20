import type { VideoFeedItem } from '../types/home.types'

/**
 * Dynamically extract relevant categories from real videos in the database.
 * No hardcoded, irrelevant tech-stack buzzwords.
 */
export function extractCategoriesFromVideos(videos: VideoFeedItem[]): string[] {
  const categories = new Set<string>(['Tất cả', 'Mới nhất', 'Phổ biến'])

  if (!videos || videos.length === 0) {
    return Array.from(categories)
  }

  // 1. Extract hashtags from video titles (#nature, #music, #game, etc.)
  videos.forEach((video) => {
    const text = video.title || ''
    const matches = text.match(/#[a-zA-Z0-9_\u00C0-\u024F\u1E00-\u1EFF]+/g)
    if (matches) {
      matches.forEach((tag) => categories.add(tag))
    }
  })

  // 2. Add realistic content topic chips ONLY IF matching videos actually exist
  const topicRules: { label: string; keywords: string[] }[] = [
    {
      label: 'Âm nhạc',
      keywords: ['nhạc', 'music', 'song', 'audio', 'remix', 'mv', 'beat', 'âm thanh'],
    },
    {
      label: 'Thiên nhiên & Đời sống',
      keywords: ['thiên nhiên', 'rừng', 'biển', 'cây', 'nature', 'phong cảnh', 'vlog', 'đà lạt', 'du lịch', 'hoa', 'cảnh'],
    },
    {
      label: 'Trò chơi',
      keywords: ['game', 'gaming', 'trò chơi', 'play', 'stream', 'gameplay', 'esport'],
    },
    {
      label: 'Công nghệ',
      keywords: ['công nghệ', 'tech', 'hls', 'code', 'serverless', 'developer', 'aws', 'api', 'lap trình', 'ai'],
    },
    {
      label: 'Điện ảnh',
      keywords: ['trailer', 'phim', 'movie', 'cinema', 'cinematic', 'film', 'hoạt hình', 'anime'],
    },
    {
      label: 'Tin tức & Giáo dục',
      keywords: ['tin tức', 'news', 'hướng dẫn', 'tutorial', 'học', 'chia sẻ', 'review', 'đánh giá'],
    },
  ]

  topicRules.forEach(({ label, keywords }) => {
    const hasMatch = videos.some((v) => {
      const lower = (v.title || '').toLowerCase()
      return keywords.some((kw) => lower.includes(kw))
    })
    if (hasMatch) {
      categories.add(label)
    }
  })

  // 3. Add channel/uploader chip if multiple distinct channels exist
  const uniqueUploaders = Array.from(
    new Set(videos.map((v) => v.uploader?.name).filter(Boolean)),
  )
  if (uniqueUploaders.length > 1) {
    uniqueUploaders.slice(0, 3).forEach((name) => {
      categories.add(`Kênh: ${name}`)
    })
  }

  return Array.from(categories)
}

/**
 * Filter and sort videos accurately according to the selected category.
 */
export function filterVideosByCategory(
  videos: VideoFeedItem[],
  category: string,
): VideoFeedItem[] {
  if (!videos || videos.length === 0) return []

  if (!category || category === 'Tất cả') {
    return videos
  }

  if (category === 'Mới nhất') {
    return [...videos] // DynamoDB GSI2 returns newest first
  }

  if (category === 'Phổ biến') {
    return [...videos].sort((a, b) => {
      const viewsA = parseInt(String(a.views).replace(/\D/g, ''), 10) || 0
      const viewsB = parseInt(String(b.views).replace(/\D/g, ''), 10) || 0
      return viewsB - viewsA
    })
  }

  if (category.startsWith('Kênh: ')) {
    const channelName = category.replace('Kênh: ', '').trim().toLowerCase()
    return videos.filter((v) => (v.uploader?.name || '').toLowerCase() === channelName)
  }

  if (category.startsWith('#')) {
    const tag = category.toLowerCase()
    return videos.filter((v) => (v.title || '').toLowerCase().includes(tag))
  }

  // Topic matching with keywords
  const topicKeywordMap: Record<string, string[]> = {
    'Âm nhạc': ['nhạc', 'music', 'song', 'audio', 'remix', 'mv', 'beat', 'âm thanh'],
    'Thiên nhiên & Đời sống': ['thiên nhiên', 'rừng', 'biển', 'cây', 'nature', 'phong cảnh', 'vlog', 'đà lạt', 'du lịch', 'hoa', 'cảnh'],
    'Trò chơi': ['game', 'gaming', 'trò chơi', 'play', 'stream', 'gameplay', 'esport'],
    'Công nghệ': ['công nghệ', 'tech', 'hls', 'code', 'serverless', 'developer', 'aws', 'api', 'lap trình', 'ai'],
    'Điện ảnh': ['trailer', 'phim', 'movie', 'cinema', 'cinematic', 'film', 'hoạt hình', 'anime'],
    'Tin tức & Giáo dục': ['tin tức', 'news', 'hướng dẫn', 'tutorial', 'học', 'chia sẻ', 'review', 'đánh giá'],
  }

  const keywords = topicKeywordMap[category]
  if (keywords) {
    return videos.filter((v) => {
      const lower = (v.title || '').toLowerCase()
      return keywords.some((kw) => lower.includes(kw))
    })
  }

  // Fallback: match category in title
  const term = category.toLowerCase()
  return videos.filter((v) => (v.title || '').toLowerCase().includes(term))
}
