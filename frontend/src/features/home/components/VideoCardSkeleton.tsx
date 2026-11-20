export function VideoCardSkeleton() {
  return (
    <div className="flex flex-col space-y-3 animate-pulse">
      {/* Thumbnail Skeleton */}
      <div className="w-full aspect-video rounded-2xl bg-white/[0.06] border border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent animate-shimmer" />
      </div>

      {/* Info Skeleton */}
      <div className="flex gap-3 items-start">
        <div className="w-9 h-9 rounded-full bg-white/[0.08] shrink-0" />
        <div className="flex-1 space-y-2 py-0.5">
          <div className="h-3.5 bg-white/[0.08] rounded w-11/12" />
          <div className="h-3 bg-white/[0.05] rounded w-3/4" />
          <div className="h-2.5 bg-white/[0.04] rounded w-1/2" />
        </div>
      </div>
    </div>
  )
}
