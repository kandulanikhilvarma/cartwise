// Runs Tesseract OCR in the browser so the server stays a fast, serverless-safe
// request. Dynamically imported to keep the WASM engine out of the initial bundle.

// Phone cameras produce 3000px+ images. Tesseract does not read them better for
// the extra pixels, it just takes longer, and very large canvases fail on iOS.
const MAX_EDGE = 1800

/** A crop box in fractions of the image, so it survives any display scale. */
export type CropRect = { x: number; y: number; width: number; height: number }

export const FULL_CROP: CropRect = { x: 0, y: 0, width: 1, height: 1 }

export function isFullCrop(crop?: CropRect | null): boolean {
  if (!crop) return true
  return crop.x <= 0.001 && crop.y <= 0.001 && crop.width >= 0.999 && crop.height >= 0.999
}

function cropPixels(imageWidth: number, imageHeight: number, crop?: CropRect | null) {
  if (isFullCrop(crop) || !crop) {
    return { x: 0, y: 0, width: imageWidth, height: imageHeight }
  }
  // A box dragged to nothing would produce a zero-size canvas, so it is floored
  // at a readable slice rather than rejected.
  const width = Math.max(32, Math.round(crop.width * imageWidth))
  const height = Math.max(32, Math.round(crop.height * imageHeight))
  return {
    x: Math.min(Math.round(crop.x * imageWidth), imageWidth - width),
    y: Math.min(Math.round(crop.y * imageHeight), imageHeight - height),
    width,
    height,
  }
}

/**
 * Grayscale, normalise contrast and downscale before recognition. A receipt is
 * black ink on white paper photographed under kitchen light; pushing it back
 * towards that is the cheapest accuracy the pipeline has.
 */
async function preprocess(file: File, crop?: CropRect | null): Promise<Blob | File> {
  if (typeof document === 'undefined') return file

  try {
    const bitmap = await createImageBitmap(file)
    const source = cropPixels(bitmap.width, bitmap.height, crop)
    const scale = Math.min(1, MAX_EDGE / Math.max(source.width, source.height))
    const width = Math.round(source.width * scale)
    const height = Math.round(source.height * scale)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context) return file

    context.drawImage(
      bitmap,
      source.x,
      source.y,
      source.width,
      source.height,
      0,
      0,
      width,
      height,
    )
    bitmap.close()

    const image = context.getImageData(0, 0, width, height)
    const pixels = image.data

    // Pass one: luminance, and the range actually used by this photograph.
    let min = 255
    let max = 0
    for (let i = 0; i < pixels.length; i += 4) {
      const luma = (pixels[i] * 0.299 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.114) | 0
      pixels[i] = luma
      if (luma < min) min = luma
      if (luma > max) max = luma
    }

    // Pass two: stretch that range back across the full scale.
    const span = Math.max(1, max - min)
    for (let i = 0; i < pixels.length; i += 4) {
      const stretched = ((pixels[i] - min) * 255) / span
      const value = stretched < 0 ? 0 : stretched > 255 ? 255 : stretched
      pixels[i] = value
      pixels[i + 1] = value
      pixels[i + 2] = value
    }

    context.putImageData(image, 0, 0)

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/png'),
    )
    return blob ?? file
  } catch {
    // Any canvas failure falls back to the original photo rather than failing.
    return file
  }
}

export async function ocrReceiptToLines(
  file: File,
  onProgress?: (progress: number) => void,
  crop?: CropRect | null,
): Promise<string[]> {
  const prepared = await preprocess(file, crop)
  const Tesseract = (await import('tesseract.js')).default
  const { data } = await Tesseract.recognize(prepared, 'eng', {
    logger: onProgress
      ? (message) => {
          if (message.status === 'recognizing text') {
            onProgress(message.progress)
          }
        }
      : undefined,
  })

  return data.text.split(/\r?\n/)
}
