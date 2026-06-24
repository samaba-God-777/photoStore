export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-neutral-800 ${className}`} />;
}

export function PackageCardSkeleton() {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-neutral-950/80 overflow-hidden">
      <Skeleton className="h-60 w-full rounded-none" />
      <div className="p-6 space-y-3">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-9 w-1/3 mt-4" />
      </div>
    </div>
  );
}

export function GalleryPhotoSkeleton() {
  return <Skeleton className="aspect-square w-full" />;
}
