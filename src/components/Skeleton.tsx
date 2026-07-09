export function SkeletonCard() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-100 animate-pulse">
      <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-5 w-32 bg-gray-200 rounded" />
        <div className="h-3 w-24 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

export function SkeletonDetail() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex items-center gap-4 p-4 rounded-xl bg-white border">
        <div className="w-14 h-14 rounded-full bg-gray-200" />
        <div className="space-y-2 flex-1">
          <div className="h-6 w-40 bg-gray-200 rounded" />
          <div className="h-4 w-28 bg-gray-100 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="aspect-[4/3] rounded-xl bg-gray-200" />
        ))}
      </div>
      <div className="space-y-3">
        <div className="h-4 w-24 bg-gray-200 rounded" />
        <div className="h-10 w-full bg-gray-100 rounded-lg" />
      </div>
    </div>
  );
}
