"use client"

import { useEffect, useMemo, useRef, useState } from "react"

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

type LaidOut = GalleryItem & { renderWidth: number; renderHeight: number }

function layoutRows(
  items: GalleryItem[],
  containerWidth: number,
  targetRowHeight: number,
  gap: number
): LaidOut[][] {
  if (containerWidth <= 0 || items.length === 0) return []
  const rows: LaidOut[][] = []
  let current: GalleryItem[] = []
  let aspectSum = 0

  const flush = (stretch: boolean) => {
    if (current.length === 0) return
    const gaps = gap * (current.length - 1)
    const natural = aspectSum * targetRowHeight
    const scale = stretch
      ? Math.max(0.6, (containerWidth - gaps) / natural)
      : 1
    const height = targetRowHeight * scale
    rows.push(
      current.map((item) => {
        const aspect = item.width / item.height
        return {
          ...item,
          renderWidth: aspect * height,
          renderHeight: height,
        }
      })
    )
    current = []
    aspectSum = 0
  }

  for (const item of items) {
    const aspect = item.width / Math.max(item.height, 1)
    current.push(item)
    aspectSum += aspect
    const rowWidth = aspectSum * targetRowHeight + gap * (current.length - 1)
    if (rowWidth >= containerWidth) flush(true)
  }
  flush(false)
  return rows
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
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setWidth(el.clientWidth)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const rows = useMemo(
    () => layoutRows(items, width, targetRowHeight, gap),
    [items, width, targetRowHeight, gap]
  )

  let runningIndex = 0

  return (
    <div ref={ref} className={cn("w-full", className)}>
      {width === 0
        ? items.slice(0, 12).map((item) => (
            <div
              key={item.id}
              className="photo-plate mb-1.5 inline-block align-top"
              style={{ width: "24%", height: targetRowHeight, marginRight: gap }}
            />
          ))
        : rows.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="mb-[var(--gap)] flex"
              style={{ gap, ["--gap" as string]: `${gap}px` }}
            >
              {row.map((item) => {
                const index = runningIndex
                runningIndex += 1
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelect?.(item, index)}
                    className="photo-plate group relative overflow-hidden"
                    style={{
                      width: item.renderWidth,
                      height: item.renderHeight,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.thumbUrl}
                      alt={item.alt}
                      className="size-full object-cover transition duration-300 group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                    {item.caption ? (
                      <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2 pb-1.5 pt-8 text-left text-[0.7rem] text-foreground opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                        {item.caption}
                      </span>
                    ) : null}
                  </button>
                )
              })}
            </div>
          ))}
    </div>
  )
}
