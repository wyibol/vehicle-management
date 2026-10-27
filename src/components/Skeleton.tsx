export function SkeletonCard() {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-surface-1 border border-hairline animate-pulse">
      <div className="w-10 h-10 rounded-full bg-surface-2 border border-hairline flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-32 bg-surface-2 rounded" />
        <div className="h-3 w-24 bg-surface-2 rounded" />
      </div>
    </div>
  );
}

export function SkeletonDetail() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-1 border border-hairline">
        <div className="w-14 h-14 rounded-full bg-surface-2" />
        <div className="space-y-2 flex-1">
          <div className="h-6 w-40 bg-surface-2 rounded" />
          <div className="h-4 w-28 bg-surface-2 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="aspect-[4/3] rounded-xl bg-surface-2 border border-hairline" />
        ))}
      </div>
      <div className="space-y-3">
        <div className="h-4 w-24 bg-surface-2 rounded" />
        <div className="h-10 w-full bg-surface-2 rounded-lg" />
      </div>
    </div>
  );
}
