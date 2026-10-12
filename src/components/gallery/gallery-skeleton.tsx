import { Skeleton } from "@/components/ui/skeleton"

export function GallerySkeleton() {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <Skeleton
          key={index}
          className="aspect-[4/5] w-full"
          style={{ height: 180 + (index % 3) * 28 }}
        />
      ))}
    </div>
  )
}
