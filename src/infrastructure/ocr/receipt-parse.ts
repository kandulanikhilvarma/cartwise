// Pure receipt-text parsing helpers. No tesseract/runtime deps so they stay
// unit-testable without loading the OCR engine.

export function cleanLine(line: string): string {
  return line
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s.,&'/-]/g, ' ')
    .trim()
}

export function isNoiseLine(line: string): boolean {
  const normalized = line.toLowerCase()
  return (
    !normalized ||
    normalized.length < 3 ||
    /^(total|subtotal|tax|change|cash|card|visa|mastercard|debit|credit|thank you|receipt|store|date|time|balance|amount|qty|quantity)$/i.test(
      normalized,
    ) ||
    /^[\d\s.,-]+$/.test(normalized)
  )
}

export function extractQuantity(line: string): number {
  const quantityMatch = line.match(/^(\d+(?:\.\d+)?)\s*(?:x|×|pcs?|pack|bags?|boxes?)?\b/i)
  if (!quantityMatch) {
    return 1
  }

  const quantity = Number(quantityMatch[1])
  return Number.isFinite(quantity) && quantity > 0 ? quantity : 1
}

export function deriveProductName(line: string): string {
  const quantityStripped = line.replace(/^(\d+(?:\.\d+)?)\s*(?:x|×)?\s*/i, '')
  const priceStripped = quantityStripped.replace(/\s+\$?\d+(?:\.\d{2})?\s*$/i, '')
  const cleaned = priceStripped.replace(/\s{2,}/g, ' ').trim()
  return cleaned || line.trim()
}

export function deriveStoreName(lines: string[]): string | null {
  for (const rawLine of lines.slice(0, 5)) {
    const line = cleanLine(rawLine)
    if (isNoiseLine(line)) {
      continue
    }

    const lettersOnly = line.replace(/[^a-z]/gi, '')
    if (lettersOnly.length < 3) {
      continue
    }

    if (/^[A-Z0-9 &'-]+$/.test(line)) {
      return line
    }
  }

  return null
}
