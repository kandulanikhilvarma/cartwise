'use client'

import { useRef, useState } from 'react'
import { isFullCrop, type CropRect } from '@/features/grocery/lib/client-ocr'

type ReceiptCropperProps = {
  src: string
  alt: string
  crop: CropRect | null
  onChange: (crop: CropRect | null) => void
  disabled?: boolean
}

type Point = { x: number; y: number }

function clamp01(value: number): number {
  return value < 0 ? 0 : value > 1 ? 1 : value
}

function rectBetween(start: Point, end: Point): CropRect {
  return {
    x: Math.min(start.x, end.x),
    y: Math.min(start.y, end.y),
    width: Math.abs(end.x - start.x),
    height: Math.abs(end.y - start.y),
  }
}

/**
 * Drag a box over the photo to cut the table, the till and whatever else was in
 * frame. Tesseract reads a receipt far better when the receipt is most of the
 * picture, and this is the only part of that a phone camera cannot do itself.
 *
 * Deliberately drag-to-select with no resize handles: a second gesture replaces
 * the box, which is fewer moving parts than eight draggable corners.
 */
export function ReceiptCropper({ src, alt, crop, onChange, disabled }: ReceiptCropperProps) {
  const frameRef = useRef<HTMLDivElement>(null)
  const startRef = useRef<Point | null>(null)
  const [drag, setDrag] = useState<CropRect | null>(null)

  function pointFrom(event: React.PointerEvent): Point | null {
    const frame = frameRef.current?.getBoundingClientRect()
    if (!frame || frame.width === 0 || frame.height === 0) return null
    return {
      x: clamp01((event.clientX - frame.left) / frame.width),
      y: clamp01((event.clientY - frame.top) / frame.height),
    }
  }

  function handleDown(event: React.PointerEvent<HTMLDivElement>) {
    if (disabled) return
    const point = pointFrom(event)
    if (!point) return
    event.currentTarget.setPointerCapture(event.pointerId)
    startRef.current = point
    setDrag({ x: point.x, y: point.y, width: 0, height: 0 })
  }

  function handleMove(event: React.PointerEvent<HTMLDivElement>) {
    const start = startRef.current
    if (!start) return
    const point = pointFrom(event)
    if (point) setDrag(rectBetween(start, point))
  }

  function handleUp() {
    const box = drag
    startRef.current = null
    setDrag(null)
    if (!box) return
    // A tap, not a drag. Treat it as "no crop" rather than a 2px selection.
    if (box.width < 0.05 || box.height < 0.05) {
      onChange(null)
      return
    }
    onChange(box)
  }

  const shown = drag ?? crop
  const cropped = !isFullCrop(crop)

  return (
    <div className="cropper">
      <div
        className="cropper-frame"
        ref={frameRef}
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onPointerCancel={handleUp}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} draggable={false} />
        {shown ? (
          <span
            className="cropper-box"
            style={{
              left: `${shown.x * 100}%`,
              top: `${shown.y * 100}%`,
              width: `${shown.width * 100}%`,
              height: `${shown.height * 100}%`,
            }}
          />
        ) : null}
      </div>
      <p className="cropper-hint">
        {cropped
          ? 'Only the selected area will be read. Drag again to change it.'
          : 'Drag a box around the receipt to leave the background out.'}
        {cropped ? (
          <button className="link-button" onClick={() => onChange(null)} type="button">
            Use the whole photo
          </button>
        ) : null}
      </p>
    </div>
  )
}
