export function VideoCardSkeleton() {
  return (
    <div className="flex flex-col p-2.5 rounded-[26px] bg-white/[0.02] border border-white/[0.05] animate-pulse">
      {/* Thumbnail Skeleton */}
      <div className="w-full aspect-video rounded-[18px] bg-white/[0.05] border border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent animate-shimmer" />
      </div>

      {/* Info Skeleton */}
      <div className="flex gap-3 mt-3 px-1 items-start">
        <div className="w-8 h-8 rounded-full bg-white/[0.07] shrink-0" />
        <div className="flex-1 space-y-2 py-0.5">
          <div className="h-3 bg-white/[0.07] rounded-full w-5/6" />
          <div className="h-2.5 bg-white/[0.04] rounded-full w-1/2" />
          <div className="h-2 bg-white/[0.03] rounded-full w-1/3" />
        </div>
      </div>
    </div>
  )
}
