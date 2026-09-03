// Pure receipt-text parsing helpers. No tesseract/runtime deps so they stay
// unit-testable without loading the OCR engine.

const PRICE = /\d+[.,]\d{2}\b/
const RECEIPT_KEYWORDS =
  /(total|subtotal|receipt|invoice|bill|cash|change|tender|visa|mastercard|debit|credit|balance|amount|qty|quantity|tax|gst|vat|store|market|grocery|supermart|checkout)/i

export function cleanLine(line: string): string {
  return line
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s.,&'/@%$£€-]/g, ' ')
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
  if (/^[\d\s.,:;$£€%*#/()+-]+$/.test(normalized)) return true
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

// ---------------------------------------------------------------------------
// Money
// ---------------------------------------------------------------------------

const CURRENCY_BY_SYMBOL: Record<string, string> = { $: 'USD', '£': 'GBP', '€': 'EUR' }

/**
 * The line-item price a receipt prints at the right edge. Deliberately anchored
 * to the end of the line: a mid-line "@ 0.58/lb" is a unit rate, not the amount
 * charged, and a leading number is a quantity or SKU.
 */
export function extractPrice(line: string): number | null {
  const match = line.match(/(?:[$£€]\s?)?(\d{1,4})[.,](\d{2})\s*[a-z]?$/i)
  if (!match) return null

  // A trailing weight ("1.24 kg") must not be read as money.
  if (/\d+(?:[.,]\d+)?\s*(?:kg|g|lb|lbs|oz|ml|l|ct|pk|ea)\s*$/i.test(line)) return null

  const value = Number(`${match[1]}.${match[2]}`)
  return Number.isFinite(value) && value > 0 && value < 10_000 ? value : null
}

export function detectCurrency(lines: string[]): string | null {
  for (const symbol of Object.keys(CURRENCY_BY_SYMBOL)) {
    if (lines.some((line) => line.includes(symbol))) return CURRENCY_BY_SYMBOL[symbol]
  }
  return null
}

/** The printed TOTAL, when the receipt states one. Never inferred from a sum. */
export function extractTotalSpend(lines: string[]): number | null {
  for (const raw of lines) {
    const line = cleanLine(raw)
    if (!/^(total|amount due|balance due|grand total)\b/i.test(line)) continue
    const match = line.match(/(\d{1,5})[.,](\d{2})\s*$/)
    if (match) {
      const value = Number(`${match[1]}.${match[2]}`)
      if (Number.isFinite(value) && value > 0) return value
    }
  }
  return null
}

// ---------------------------------------------------------------------------
// Mass
// ---------------------------------------------------------------------------

// Volume converts 1:1 because groceries priced by volume are overwhelmingly
// water-based; the error is smaller than the OCR noise it sits inside.
const GRAMS_PER_UNIT: Record<string, number> = {
  kg: 1000,
  g: 1,
  lb: 453.592,
  lbs: 453.592,
  oz: 28.3495,
  l: 1000,
  ml: 1,
}

/**
 * The real mass of what was bought, in grams. Nutrition arrives per 100 g, so
 * without this a batch total is the sum of arbitrary 100 g portions. Returns
 * null when the receipt does not say — an unknown mass stays unknown.
 */
export function extractPackGrams(line: string): number | null {
  const match = line.match(/(\d+(?:[.,]\d+)?)\s*(kg|g|lbs|lb|oz|ml|l)\b/i)
  if (!match) return null

  const amount = Number(match[1].replace(',', '.'))
  const grams = GRAMS_PER_UNIT[match[2].toLowerCase()]
  if (!Number.isFinite(amount) || amount <= 0 || !grams) return null

  const total = amount * grams
  // A single grocery line above 50 kg is OCR noise, not a purchase.
  return total > 0 && total <= 50_000 ? Math.round(total * 10) / 10 : null
}

// ---------------------------------------------------------------------------
// Date
// ---------------------------------------------------------------------------

const MONTHS = [
  'jan', 'feb', 'mar', 'apr', 'may', 'jun',
  'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
]

function plausible(date: Date): boolean {
  const time = date.getTime()
  if (!Number.isFinite(time)) return false
  const now = Date.now()
  const twoYears = 730 * 24 * 60 * 60 * 1000
  // A shop cannot be in the future, and a receipt older than two years is noise.
  return time <= now + 24 * 60 * 60 * 1000 && time > now - twoYears
}

/**
 * When the shop actually happened. Only unambiguous forms are accepted: ISO,
 * a written month, or a numeric date where one part exceeds 12. A bare
 * "03/04/2026" could be March or April, so it is left for the caller to
 * default rather than guessed at.
 */
export function parseReceiptDate(lines: string[]): Date | null {
  const joined = lines.join(' ')

  const iso = joined.match(/\b(20\d{2})-(\d{1,2})-(\d{1,2})\b/)
  if (iso) {
    const date = new Date(Date.UTC(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3])))
    if (plausible(date)) return date
  }

  const written = joined.match(
    /\b(\d{1,2})[\s-]*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s,-]*(20\d{2}|\d{2})\b/i,
  )
  if (written) {
    const year = written[3].length === 2 ? 2000 + Number(written[3]) : Number(written[3])
    const date = new Date(Date.UTC(year, MONTHS.indexOf(written[2].toLowerCase()), Number(written[1])))
    if (plausible(date)) return date
  }

  const numeric = joined.match(/\b(\d{1,2})[/.-](\d{1,2})[/.-](20\d{2}|\d{2})\b/)
  if (numeric) {
    const first = Number(numeric[1])
    const second = Number(numeric[2])
    const year = numeric[3].length === 2 ? 2000 + Number(numeric[3]) : Number(numeric[3])
    // Only resolvable when one part cannot be a month.
    const [day, month] = first > 12 ? [first, second] : second > 12 ? [second, first] : [0, 0]
    if (day) {
      const date = new Date(Date.UTC(year, month - 1, day))
      if (plausible(date)) return date
    }
  }

  return null
}

// ---------------------------------------------------------------------------
// Name
// ---------------------------------------------------------------------------

// Remove leading item/SKU/PLU/UPC codes and trailing prices/weights/codes so the
// product name is left, not the register codes a receipt prints around it.
export function stripCodes(line: string): string {
  let s = line
  // Leading quantity ("2 x", "3 ").
  s = s.replace(/^(\d+(?:\.\d+)?)\s*(?:x|×)?\s+/i, '')
  // Leading code token: 4+ chars containing a digit (UPC/SKU/PLU), optional #/*.
  s = s.replace(/^[#*]?(?=[a-z0-9]*\d)[a-z0-9]{4,}\s+/i, '')
  // Trailing price, optionally tax-flagged ("3.49", "$3.49 T").
  s = s.replace(/\s+[$£€]?\d+[.,]\d{2}\s*[a-z]?$/i, '')
  // Trailing weight/unit tail ("0.68 lb", "1.2 kg @ 0.58/lb").
  s = s.replace(/\s+\d+(?:\.\d+)?\s*(?:kg|g|lb|lbs|oz|ml|l|ea|ct|pk)\b.*$/i, '')
  // Trailing "@ $x" unit-price tail.
  s = s.replace(/\s+@\s*[$£€]?\d.*$/i, '')
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

export type ParsedLine = {
  productName: string
  quantity: number
  packGrams: number | null
  unitPrice: number | null
}

/**
 * Everything one receipt line carries. Extraction happens before stripCodes
 * removes the price and weight tails, which is why it lives in one pass.
 */
export function parseItemLine(rawLine: string): ParsedLine | null {
  const line = cleanLine(rawLine)
  if (isNoiseLine(line)) return null

  const rawName = deriveProductName(line)
  if (!hasRealName(rawName)) return null

  return {
    productName: toTitleCase(rawName),
    quantity: extractQuantity(line),
    packGrams: extractPackGrams(line),
    unitPrice: extractPrice(line),
  }
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
