"use client"

import { cn } from "@/lib/utils"

export type GalleryItem = {
  id: string
  width: number
  height: number
  thumbUrl: string
  displayUrl: string
  alt: string
  caption?: string
}

export function JustifiedGallery({
  items,
  targetRowHeight = 220,
  gap = 6,
  onSelect,
  className,
}: {
  items: GalleryItem[]
  targetRowHeight?: number
  gap?: number
  onSelect?: (item: GalleryItem, index: number) => void
  className?: string
}) {
  return (
    <div className={cn("flex w-full flex-wrap", className)} style={{ gap }}>
      {items.map((item, index) => {
        const aspect = item.width / Math.max(item.height, 1)
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect?.(item, index)}
            className="photo-plate group relative overflow-hidden"
            style={{
              height: targetRowHeight,
              width: aspect * targetRowHeight,
              flexGrow: aspect * 100,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.thumbUrl}
              alt={item.alt}
              className="size-full object-cover motion-safe:transition motion-safe:duration-300 motion-safe:group-hover:scale-[1.03]"
              loading={index < 20 ? "eager" : "lazy"}
              fetchPriority={index < 8 ? "high" : "low"}
              decoding="async"
            />
            {item.caption ? (
              <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2 pb-1.5 pt-8 text-left text-[0.7rem] text-foreground opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                {item.caption}
              </span>
            ) : null}
          </button>
        )
      })}
      <div aria-hidden className="pointer-events-none" style={{ height: targetRowHeight, flexGrow: 999 }} />
    </div>
  )
}
