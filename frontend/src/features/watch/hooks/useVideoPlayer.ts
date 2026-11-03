import { useEffect, useRef, useState, type MouseEvent, type ChangeEvent } from 'react'
import Hls from 'hls.js'
import type { QualityLevel } from '../types/watch.types'

interface UseVideoPlayerOptions {
  playbackUrl?: string
}

export function useVideoPlayer({ playbackUrl }: UseVideoPlayerOptions) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerContainerRef = useRef<HTMLDivElement>(null)
  const hlsRef = useRef<Hls | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [isBuffering, setIsBuffering] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [bufferedPercent, setBufferedPercent] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)

  // Quality levels state
  const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([])
  const [selectedLevel, setSelectedLevel] = useState<number>(-1) // -1 is Auto
  const [currentPlayingLevel, setCurrentPlayingLevel] = useState<number>(-1)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // Close quality settings menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: globalThis.MouseEvent) {
      const target = event.target as HTMLElement | null
      if (
        target &&
        !target.closest('.quality-settings-menu') &&
        !target.closest('.quality-settings-toggle')
      ) {
        setIsSettingsOpen(false)
      }
    }
    if (isSettingsOpen) {
      document.addEventListener('click', handleClickOutside)
    }
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isSettingsOpen])

  // Setup HLS or Native Video Source
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    let hls: Hls | null = null

    if (playbackUrl && playbackUrl.includes('.m3u8')) {
      if (Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 30,
          maxBufferLength: 15,
          maxMaxBufferLength: 30,
        })
        hlsRef.current = hls
        hls.loadSource(playbackUrl)
        hls.attachMedia(video)

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (hls && hls.levels && hls.levels.length > 0) {
            const levels: QualityLevel[] = hls.levels.map((lvl, index) => ({
              id: index,
              height: lvl.height,
              bitrate: lvl.bitrate,
              label: lvl.height ? `${lvl.height}p` : `${Math.round(lvl.bitrate / 1000)}k`,
            }))
            // Sort from highest resolution to lowest resolution
            levels.sort((a, b) => b.height - a.height || b.bitrate - a.bitrate)
            setQualityLevels(levels)
          }
        })

        hls.on(Hls.Events.LEVEL_SWITCHING, () => {
          setIsBuffering(true)
        })

        hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
          setCurrentPlayingLevel(data.level)
          setIsBuffering(false)
        })

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.details === Hls.ErrorDetails.BUFFER_STALLED_ERROR) {
            hls?.recoverMediaError()
            return
          }
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls?.startLoad()
                break
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls?.recoverMediaError()
                break
              default:
                hls?.destroy()
                break
            }
          }
        })
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = playbackUrl
      }
    } else if (playbackUrl) {
      video.src = playbackUrl
    }

    const videoEl = videoRef.current
    const handleWaiting = () => setIsBuffering(true)
    const handlePlaying = () => setIsBuffering(false)
    const handleCanPlay = () => setIsBuffering(false)

    videoEl?.addEventListener('waiting', handleWaiting)
    videoEl?.addEventListener('playing', handlePlaying)
    videoEl?.addEventListener('canplay', handleCanPlay)

    return () => {
      videoEl?.removeEventListener('waiting', handleWaiting)
      videoEl?.removeEventListener('playing', handlePlaying)
      videoEl?.removeEventListener('canplay', handleCanPlay)
      if (hls) {
        hls.destroy()
        hlsRef.current = null
      }
    }
  }, [playbackUrl])

  function handleSelectQuality(levelId: number) {
    const hls = hlsRef.current
    const video = videoRef.current
    if (!hls || !video) return

    setSelectedLevel(levelId)
    setIsSettingsOpen(false)

    if (levelId === -1) {
      // Auto mode: hls will adapt automatically
      hls.currentLevel = -1
      return
    }

    if (hls.currentLevel === levelId) {
      return
    }

    // Explicit quality switch requested by user (pause -> buffer new resolution -> resume):
    // 1. Remember if video was actively playing
    const wasPlaying = !video.paused
    const targetTime = video.currentTime

    // 2. Pause video immediately to stop timeline from running ahead
    if (wasPlaying) {
      video.pause()
    }
    setIsBuffering(true)

    // 3. Switch level immediately in Hls.js
    hls.currentLevel = levelId

    // 4. Wait for the new resolution segments to buffer, then resume
    let isResumed = false
    const resumePlayback = () => {
      if (isResumed) return
      isResumed = true
      setIsBuffering(false)
      if (wasPlaying) {
        video.play().catch(() => {})
        setIsPlaying(true)
      }
      cleanup()
    }

    const checkReady = () => {
      if (video.readyState >= 3) {
        resumePlayback()
      }
    }

    const cleanup = () => {
      video.removeEventListener('canplay', resumePlayback)
      hls.off(Hls.Events.FRAG_BUFFERED, checkReady)
    }

    video.addEventListener('canplay', resumePlayback, { once: true })
    hls.on(Hls.Events.FRAG_BUFFERED, checkReady)

    // Fallback safety timeout in case readyState transitions quickly without firing canplay
    setTimeout(() => {
      if (!isResumed) {
        if (Math.abs(video.currentTime - targetTime) > 0.5) {
          video.currentTime = targetTime
        }
        resumePlayback()
      }
    }, 1000)
  }

  function togglePlay() {
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      video.play().catch(() => {})
      setIsPlaying(true)
    } else {
      video.pause()
      setIsPlaying(false)
    }
  }

  function handleTimeUpdate() {
    const video = videoRef.current
    if (!video) return
    setCurrentTime(video.currentTime)
    if (video.duration) {
      setDuration(video.duration)
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1)
        setBufferedPercent(Math.min(100, (bufferedEnd / video.duration) * 100))
      }
    }
  }

  function handleSeek(event: MouseEvent<HTMLDivElement>) {
    const video = videoRef.current
    if (!video || !duration) return
    const rect = event.currentTarget.getBoundingClientRect()
    const pos = (event.clientX - rect.left) / rect.width
    video.currentTime = pos * duration
    setCurrentTime(pos * duration)
  }

  function toggleMute() {
    const video = videoRef.current
    if (!video) return
    video.muted = !isMuted
    setIsMuted(!isMuted)
  }

  function handleVolumeChange(event: ChangeEvent<HTMLInputElement>) {
    const video = videoRef.current
    const val = parseFloat(event.target.value)
    setVolume(val)
    if (video) {
      video.volume = val
      video.muted = val === 0
      setIsMuted(val === 0)
    }
  }

  function toggleFullscreen() {
    if (!playerContainerRef.current) return
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen().catch(() => {})
      setIsFullscreen(false)
    }
  }

  function formatTime(seconds: number): string {
    if (isNaN(seconds) || seconds <= 0) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  const activePlayingLevelLabel =
    currentPlayingLevel >= 0
      ? qualityLevels.find((q) => q.id === currentPlayingLevel)?.label
      : undefined

  const activeQualityBadge = activePlayingLevelLabel || 'Auto'

  const selectedQualityLabel =
    selectedLevel === -1
      ? activePlayingLevelLabel
        ? `Auto (${activePlayingLevelLabel})`
        : 'Auto'
      : qualityLevels.find((q) => q.id === selectedLevel)?.label || 'HD'

  return {
    videoRef,
    playerContainerRef,
    isPlaying,
    setIsPlaying,
    isBuffering,
    currentTime,
    duration,
    bufferedPercent,
    progressPercent,
    volume,
    isMuted,
    isFullscreen,
    showControls,
    setShowControls,
    qualityLevels,
    selectedLevel,
    currentPlayingLevel,
    isSettingsOpen,
    setIsSettingsOpen,
    activeQualityBadge,
    selectedQualityLabel,
    togglePlay,
    handleTimeUpdate,
    handleSeek,
    toggleMute,
    handleVolumeChange,
    toggleFullscreen,
    handleSelectQuality,
    formatTime,
  }
}
