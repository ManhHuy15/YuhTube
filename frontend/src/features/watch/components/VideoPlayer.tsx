import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'

interface VideoPlayerProps {
  playbackUrl?: string
  posterUrl?: string
  title?: string
}

export function VideoPlayer({ playbackUrl, posterUrl, title }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerContainerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [bufferedPercent, setBufferedPercent] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    let hls: Hls | null = null

    if (playbackUrl && playbackUrl.includes('.m3u8')) {
      if (Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        })
        hls.loadSource(playbackUrl)
        hls.attachMedia(video)
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          // Ready to play
        })
        hls.on(Hls.Events.ERROR, (_event, data) => {
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

    return () => {
      if (hls) {
        hls.destroy()
      }
    }
  }, [playbackUrl])

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

  function handleSeek(event: React.MouseEvent<HTMLDivElement>) {
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

  function handleVolumeChange(event: React.ChangeEvent<HTMLInputElement>) {
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

  function formatTime(seconds: number) {
    if (isNaN(seconds) || seconds <= 0) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      ref={playerContainerRef}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl group select-none border border-white/10"
    >
      {/* Quality Badge Overlay */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-white/90 text-xs font-mono tracking-tight font-medium shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>4K HDR</span>
          <span className="text-white/40">•</span>
          <span>60fps</span>
          <span className="text-white/40">•</span>
          <span className="text-sky-300 font-semibold">HLS QVBR</span>
        </div>
      </div>

      {/* Video Element */}
      <video
        ref={videoRef}
        aria-label={title || 'Trình phát video YuhTube'}
        poster={posterUrl || undefined}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onClick={togglePlay}
        className="w-full h-full object-contain cursor-pointer"
        playsInline
      />

      {/* Center Play/Pause Ripple Button */}
      {!isPlaying && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/30 backdrop-blur-[2px] transition-all"
        >
          <div className="w-20 h-20 rounded-full bg-red-600/90 hover:bg-red-500 hover:scale-110 flex items-center justify-center text-white shadow-2xl shadow-red-600/50 transition-all duration-200">
            <span className="material-symbols-outlined text-[48px] translate-x-0.5">play_arrow</span>
          </div>
        </div>
      )}

      {/* Bottom Controls Bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 pt-12 pb-3 px-4 bg-gradient-to-t from-black/95 via-black/60 to-transparent flex flex-col justify-end gap-2 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Scrubber Progress Bar */}
        <div
          onClick={handleSeek}
          className="relative w-full h-3 flex items-center cursor-pointer group/scrub"
        >
          <div className="w-full h-1 group-hover/scrub:h-1.5 bg-white/20 rounded-full overflow-hidden relative transition-all">
            <div
              className="absolute left-0 top-0 h-full bg-white/30 transition-all"
              style={{ width: `${bufferedPercent}%` }}
            ></div>
            <div
              className="absolute left-0 top-0 h-full bg-red-600 transition-all"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <div
            className="absolute -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-red-500 shadow-md group-hover/scrub:scale-125 transition-transform"
            style={{ left: `${progressPercent}%` }}
          ></div>
        </div>

        {/* Buttons and Time */}
        <div className="flex items-center justify-between text-white text-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="p-1 hover:text-red-400 transition-colors flex items-center"
              title={isPlaying ? 'Tạm dừng (k)' : 'Phát (k)'}
            >
              <span className="material-symbols-outlined text-[28px]">
                {isPlaying ? 'pause' : 'play_arrow'}
              </span>
            </button>
            <button className="p-1 hover:text-white/80 transition-colors hidden sm:flex items-center" title="Video tiếp theo">
              <span className="material-symbols-outlined text-[24px]">skip_next</span>
            </button>
            <div className="flex items-center gap-2 group/volume">
              <button onClick={toggleMute} className="p-1 hover:text-white/80 transition-colors" title="Âm lượng">
                <span className="material-symbols-outlined text-[24px]">
                  {isMuted || volume === 0 ? 'volume_off' : volume > 0.5 ? 'volume_up' : 'volume_down'}
                </span>
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-white/30 rounded-lg accent-red-600 cursor-pointer hidden sm:block"
              />
            </div>
            <div className="text-xs text-white/80 font-mono">
              <span>{formatTime(currentTime)}</span>
              <span className="mx-1 text-white/40">/</span>
              <span>{duration > 0 ? formatTime(duration) : '0:00'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-1 hover:text-white/80 transition-colors text-xs font-mono px-2 py-0.5 rounded bg-white/10 hidden sm:block">
              HLS Auto
            </button>
            <button className="p-1 hover:text-white/80 transition-colors" title="Cài đặt">
              <span className="material-symbols-outlined text-[22px]">settings</span>
            </button>
            <button onClick={toggleFullscreen} className="p-1 hover:text-white/80 transition-colors" title="Toàn màn hình (f)">
              <span className="material-symbols-outlined text-[24px]">
                {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
