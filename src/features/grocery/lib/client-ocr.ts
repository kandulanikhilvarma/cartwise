// Runs Tesseract OCR in the browser so the server stays a fast, serverless-safe
// request. Dynamically imported to keep the WASM engine out of the initial bundle.

// Phone cameras produce 3000px+ images. Tesseract does not read them better for
// the extra pixels, it just takes longer, and very large canvases fail on iOS.
const MAX_EDGE = 1800

/**
 * Grayscale, normalise contrast and downscale before recognition. A receipt is
 * black ink on white paper photographed under kitchen light; pushing it back
 * towards that is the cheapest accuracy the pipeline has.
 */
async function preprocess(file: File): Promise<Blob | File> {
  if (typeof document === 'undefined') return file

  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
    const width = Math.round(bitmap.width * scale)
    const height = Math.round(bitmap.height * scale)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context) return file

    context.drawImage(bitmap, 0, 0, width, height)
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
): Promise<string[]> {
  const prepared = await preprocess(file)
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
