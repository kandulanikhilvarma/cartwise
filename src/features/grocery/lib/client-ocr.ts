// Runs Tesseract OCR in the browser so the server stays a fast, serverless-safe
// request. Dynamically imported to keep the WASM engine out of the initial bundle.
export async function ocrReceiptToLines(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<string[]> {
  const Tesseract = (await import('tesseract.js')).default
  const { data } = await Tesseract.recognize(file, 'eng', {
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
