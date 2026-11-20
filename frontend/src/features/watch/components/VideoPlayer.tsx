import { useVideoPlayer } from '../hooks/useVideoPlayer'
export type { QualityLevel } from '../types/watch.types'

interface VideoPlayerProps {
  playbackUrl?: string
  posterUrl?: string
  title?: string
  onViewQualified?: () => void
}

export function VideoPlayer({ playbackUrl, posterUrl, title, onViewQualified }: VideoPlayerProps) {
  const {
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
    isSettingsOpen,
    setIsSettingsOpen,
    activeQualityBadge,
    activePlayingLevelLabel,
    selectedQualityLabel,
    togglePlay,
    handleTimeUpdate,
    handleSeek,
    toggleMute,
    handleVolumeChange,
    toggleFullscreen,
    handleSelectQuality,
    formatTime,
  } = useVideoPlayer({ playbackUrl, onViewQualified })

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
          <span>{activeQualityBadge}</span>
          <span className="text-white/40">•</span>
          <span className="text-sky-300 font-semibold">HLS ABR</span>
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
      {!isPlaying && !isBuffering && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/30 backdrop-blur-[2px] transition-all"
        >
          <div className="w-20 h-20 rounded-full bg-red-600/90 hover:bg-red-500 hover:scale-110 flex items-center justify-center text-white shadow-2xl shadow-red-600/50 transition-all duration-200">
            <span className="material-symbols-outlined text-[48px] translate-x-0.5">play_arrow</span>
          </div>
        </div>
      )}

      {/* Center Buffering Spinner */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/40 backdrop-blur-[1px] z-10 transition-opacity">
          <div className="w-12 h-12 border-4 border-white/20 border-t-red-500 rounded-full animate-spin shadow-xl" />
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
              className="p-1 hover:text-red-400 transition-colors flex items-center cursor-pointer"
              title={isPlaying ? 'Tạm dừng (k)' : 'Phát (k)'}
            >
              <span className="material-symbols-outlined text-[28px]">
                {isPlaying ? 'pause' : 'play_arrow'}
              </span>
            </button>
            <button
              className="p-1 hover:text-white/80 transition-colors hidden sm:flex items-center cursor-pointer"
              title="Video tiếp theo"
            >
              <span className="material-symbols-outlined text-[24px]">skip_next</span>
            </button>
            <div className="flex items-center gap-2 group/volume">
              <button
                onClick={toggleMute}
                className="p-1 hover:text-white/80 transition-colors cursor-pointer"
                title="Âm lượng"
              >
                <span className="material-symbols-outlined text-[24px]">
                  {isMuted || volume === 0
                    ? 'volume_off'
                    : volume > 0.5
                      ? 'volume_up'
                      : 'volume_down'}
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

          <div className="flex items-center gap-3 relative">
            {/* Quality Settings Dropdown Menu */}
            {isSettingsOpen && (
              <div
                className="quality-settings-menu absolute right-0 bottom-12 bg-[#18181c]/95 backdrop-blur-2xl rounded-2xl p-3 border border-white/15 shadow-2xl z-40 min-w-[210px] text-xs text-white animate-in fade-in zoom-in-95 duration-150 select-none"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-2 pb-2 mb-2 border-b border-white/10 font-bold text-white/90">
                  <span className="material-symbols-outlined text-[17px] text-red-500">tune</span>
                  <span>Chất lượng video</span>
                </div>

                <div className="space-y-1 max-h-56 overflow-y-auto">
                  {/* Auto Option */}
                  <button
                    type="button"
                    onClick={() => handleSelectQuality(-1)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-150 active:scale-[0.98] cursor-pointer text-left ${
                      selectedLevel === -1
                        ? 'bg-red-500/20 text-red-400 font-bold border border-red-500/30'
                        : 'text-white/80 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>Tự động</span>
                      {activePlayingLevelLabel && (
                        <span className="text-[10px] text-white/40 font-mono">
                          ({activePlayingLevelLabel})
                        </span>
                      )}
                    </div>
                    {selectedLevel === -1 && (
                      <span className="material-symbols-outlined text-[16px]">check</span>
                    )}
                  </button>

                  {/* Specific Resolutions */}
                  {qualityLevels.map((lvl) => {
                    const isSelected = selectedLevel === lvl.id
                    return (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => handleSelectQuality(lvl.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-150 active:scale-[0.98] cursor-pointer text-left ${
                          isSelected
                            ? 'bg-red-500/20 text-red-400 font-bold border border-red-500/30'
                            : 'text-white/80 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono">{lvl.label}</span>
                          {lvl.height >= 2160 ? (
                            <span className="px-1.5 py-0.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[9px] font-extrabold rounded">
                              4K
                            </span>
                          ) : lvl.height >= 1440 ? (
                            <span className="px-1.5 py-0.5 bg-indigo-600 text-white text-[9px] font-extrabold rounded">
                              2K
                            </span>
                          ) : lvl.height >= 720 ? (
                            <span className="px-1.5 py-0.5 bg-red-600 text-white text-[9px] font-bold rounded">
                              HD
                            </span>
                          ) : null}
                        </div>
                        {isSelected && (
                          <span className="material-symbols-outlined text-[16px]">check</span>
                        )}
                      </button>
                    )
                  })}

                  {qualityLevels.length === 0 && (
                    <div className="px-3 py-2 text-white/40 text-[11px] italic">
                      Đang tải danh sách chất lượng...
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quality Selector Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setIsSettingsOpen((prev) => !prev)
              }}
              className="quality-settings-toggle p-1 hover:text-white transition-all duration-150 active:scale-95 text-xs font-mono px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Cài đặt chất lượng video"
            >
              <span className="material-symbols-outlined text-[16px] text-red-400">tune</span>
              <span>{selectedQualityLabel}</span>
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-1 hover:text-white/80 transition-colors cursor-pointer"
              title="Toàn màn hình (f)"
            >
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
