// Pure receipt-text parsing helpers. No tesseract/runtime deps so they stay
// unit-testable without loading the OCR engine.

const PRICE = /\d+[.,]\d{2}\b/
const RECEIPT_KEYWORDS =
  /(total|subtotal|receipt|invoice|bill|cash|change|tender|visa|mastercard|debit|credit|balance|amount|qty|quantity|tax|gst|vat|store|market|grocery|supermart|checkout)/i

export function cleanLine(line: string): string {
  return line
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s.,&'/@%$-]/g, ' ')
    .trim()
}

export function isNoiseLine(line: string): boolean {
  const normalized = line.toLowerCase().trim()
  if (!normalized || normalized.length < 3) return true
  // Header/footer/payment lines.
  if (
    /^(total|subtotal|sub-total|tax|gst|vat|change|change due|cash|card|visa|mastercard|debit|credit|tender|thank you|thank|receipt|invoice|store|market|date|time|balance|amount|qty|quantity|account|order|cashier|register|terminal|auth|approval|ref)\b/i.test(
      normalized,
    )
  ) {
    return true
  }
  // Lines that are only digits/symbols (prices, codes, dividers, phone numbers).
  if (/^[\d\s.,:;$%*#/()+-]+$/.test(normalized)) return true
  return false
}

export function extractQuantity(line: string): number {
  // A short leading number followed by a letter is a quantity ("3 Eggs",
  // "2 x Bananas"). A long leading number is a SKU/UPC code, not a quantity.
  const quantityMatch = line.match(/^(\d{1,2})\s*(?:x|×)?\s+(?=[a-z])/i)
  if (!quantityMatch) {
    return 1
  }
  const quantity = Number(quantityMatch[1])
  return Number.isFinite(quantity) && quantity > 0 ? quantity : 1
}

// Remove leading item/SKU/PLU/UPC codes and trailing prices/weights/codes so the
// product name is left, not the register codes a receipt prints around it.
export function stripCodes(line: string): string {
  let s = line
  // Leading quantity ("2 x", "3 ").
  s = s.replace(/^(\d+(?:\.\d+)?)\s*(?:x|×)?\s+/i, '')
  // Leading code token: 4+ chars containing a digit (UPC/SKU/PLU), optional #/*.
  s = s.replace(/^[#*]?(?=[a-z0-9]*\d)[a-z0-9]{4,}\s+/i, '')
  // Trailing price, optionally tax-flagged ("3.49", "$3.49 T").
  s = s.replace(/\s+\$?\d+[.,]\d{2}\s*[a-z]?$/i, '')
  // Trailing weight/unit tail ("0.68 lb", "1.2 kg @ 0.58/lb").
  s = s.replace(/\s+\d+(?:\.\d+)?\s*(?:kg|g|lb|lbs|oz|ea|ct|pk)\b.*$/i, '')
  // Trailing "@ $x" unit-price tail.
  s = s.replace(/\s+@\s*\$?\d.*$/i, '')
  // Trailing long bare code (6+ digits/alnum).
  s = s.replace(/\s+[a-z0-9]{6,}\s*$/i, '')
  return s.replace(/\s{2,}/g, ' ').trim()
}

export function deriveProductName(line: string): string {
  const cleaned = stripCodes(line)
  return cleaned || line.trim()
}

// A real product name has letters forming an actual word, not just a code.
export function hasRealName(name: string): boolean {
  const letters = name.replace(/[^a-z]/gi, '')
  return letters.length >= 3 && /[a-z]{3,}/i.test(name)
}

export function toTitleCase(name: string): string {
  return name
    .toLowerCase()
    .replace(/\b[a-z]/g, (character) => character.toUpperCase())
    .trim()
}

// Guard against non-receipt images: require price patterns or receipt keywords
// plus at least one nameable item line.
export function looksLikeReceipt(lines: string[]): boolean {
  const joined = lines.join(' ')
  const priceCount = (joined.match(new RegExp(PRICE, 'g')) ?? []).length
  const hasKeywords = RECEIPT_KEYWORDS.test(joined)
  const nameableLines = lines
    .map(cleanLine)
    .filter((line) => !isNoiseLine(line) && hasRealName(deriveProductName(line))).length

  // A receipt or bill always carries money or register structure. Plain text
  // (notes, random photos) has neither and is rejected.
  if (priceCount >= 2 && nameableLines >= 1) return true
  if (priceCount >= 1 && hasKeywords) return true
  if (hasKeywords && nameableLines >= 2) return true
  return false
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
      return toTitleCase(line)
    }
  }
  return null
}
