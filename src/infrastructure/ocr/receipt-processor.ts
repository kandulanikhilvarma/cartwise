import { completeBatch, markBatchFailed } from '@/infrastructure/state/batch-store'
import { extractReceiptItems } from '@/infrastructure/ocr/receipt-ocr'

const inFlightBatches = new Set<string>()

type ProcessResult = {
  ok: boolean
  errorMessage?: string
}

async function tryProcessOnce(ownerEmail: string, batchId: string, file: File): Promise<ProcessResult> {
  try {
    const parsedReceipt = await extractReceiptItems(file)
    const hasItems = parsedReceipt.items.length > 0

    await completeBatch(
      ownerEmail,
      batchId,
      parsedReceipt.items,
      parsedReceipt.storeName ?? file.name ?? 'receipt',
    )

    if (!hasItems) {
      return { ok: true, errorMessage: 'No items could be extracted from the receipt image.' }
    }

    return { ok: true }
  } catch (error) {
    return {
      ok: false,
      errorMessage: error instanceof Error ? error.message : 'Receipt processing failed',
    }
  }
}

export function enqueueReceiptProcessing(ownerEmail: string, batchId: string, file: File): void {
  if (inFlightBatches.has(batchId)) {
    return
  }

  inFlightBatches.add(batchId)

  void (async () => {
    const maxAttempts = 2
    let lastError = 'Receipt processing failed'

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const result = await tryProcessOnce(ownerEmail, batchId, file)
      if (result.ok) {
        inFlightBatches.delete(batchId)
        return
      }

      lastError = result.errorMessage ?? lastError
    }

    await markBatchFailed(ownerEmail, batchId, lastError)
    inFlightBatches.delete(batchId)
  })()
}
