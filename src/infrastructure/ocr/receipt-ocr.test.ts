import { describe, it, expect } from 'vitest'
import {
  cleanLine,
  isNoiseLine,
  extractQuantity,
  deriveProductName,
  deriveStoreName,
  hasRealName,
  looksLikeReceipt,
  extractPrice,
  extractPackGrams,
  extractTotalSpend,
  detectCurrency,
  parseReceiptDate,
  parseItemLine,
} from './receipt-parse'

describe('receipt-ocr parsing helpers', () => {
  it('drops payment/total/code noise lines', () => {
    expect(isNoiseLine(cleanLine('TOTAL 42.10'))).toBe(true)
    expect(isNoiseLine(cleanLine('12.99'))).toBe(true)
    expect(isNoiseLine(cleanLine('VISA'))).toBe(true)
    expect(isNoiseLine(cleanLine('0123456789012'))).toBe(true)
    expect(isNoiseLine(cleanLine('Whole Milk'))).toBe(false)
  })

  it('extracts a short leading quantity, ignores long codes', () => {
    expect(extractQuantity('2 x Bananas')).toBe(2)
    expect(extractQuantity('3 Eggs 4.50')).toBe(3)
    expect(extractQuantity('085123 Whole Milk 3.99')).toBe(1)
    expect(extractQuantity('Cheddar Cheese')).toBe(1)
  })

  it('strips SKU codes, quantities and trailing prices to leave the name', () => {
    expect(deriveProductName('2 x Whole Milk 3.99')).toBe('Whole Milk')
    expect(deriveProductName('085123 BANANAS 1.20')).toBe('BANANAS')
    expect(deriveProductName('COCA COLA 1234567890123 2.00')).toBe('COCA COLA')
    expect(deriveProductName('BANANAS 0.68 lb @ 0.58/lb')).toBe('BANANAS')
  })

  it('rejects code-only names', () => {
    expect(hasRealName('012345')).toBe(false)
    expect(hasRealName('X9')).toBe(false)
    expect(hasRealName('Milk')).toBe(true)
  })

  it('reads an all-caps store name from the header, title-cased', () => {
    expect(deriveStoreName(['WHOLE FOODS MARKET', '123 Main St', '2 Milk 3.99'])).toBe('Whole Foods Market')
  })

  it('accepts a grocery receipt, rejects non-receipt text', () => {
    const receipt = ['FRESH MART', 'Whole Milk 3.99', 'Bananas 1.20', 'Bread 2.49', 'TOTAL 7.68']
    expect(looksLikeReceipt(receipt)).toBe(true)

    const notReceipt = ['Meeting notes', 'Call the dentist', 'Pick up laundry']
    expect(looksLikeReceipt(notReceipt)).toBe(false)
  })
})

describe('receipt money and mass extraction', () => {
  it('reads the line-item price at the right edge', () => {
    expect(extractPrice('Whole Milk 3.99')).toBe(3.99)
    expect(extractPrice('CHEDDAR $4.50 T')).toBe(4.5)
    expect(extractPrice('Bananas')).toBeNull()
  })

  it('does not read a trailing weight as money', () => {
    expect(extractPrice('BANANAS 1.24 kg')).toBeNull()
  })

  it('converts stated pack weights to grams', () => {
    expect(extractPackGrams('MILK 2L')).toBe(2000)
    expect(extractPackGrams('BREAD 800g')).toBe(800)
    expect(extractPackGrams('BANANAS 1.24 kg')).toBe(1240)
    expect(extractPackGrams('MINCE 1 lb')).toBeCloseTo(453.6, 1)
    expect(extractPackGrams('Cheddar Cheese')).toBeNull()
  })

  it('rejects an implausible mass as OCR noise', () => {
    expect(extractPackGrams('ITEM 900 kg')).toBeNull()
  })

  it('reads the printed total, never a sum', () => {
    expect(extractTotalSpend(['Milk 3.99', 'TOTAL 12.48'])).toBe(12.48)
    expect(extractTotalSpend(['Milk 3.99'])).toBeNull()
  })

  it('detects the currency from its symbol', () => {
    expect(detectCurrency(['TOTAL $12.48'])).toBe('USD')
    expect(detectCurrency(['TOTAL £12.48'])).toBe('GBP')
    expect(detectCurrency(['TOTAL 12.48'])).toBeNull()
  })
})

describe('parseReceiptDate', () => {
  const recent = new Date()
  recent.setMonth(recent.getMonth() - 1)
  const iso = recent.toISOString().slice(0, 10)

  it('reads an ISO date', () => {
    expect(parseReceiptDate([`Date ${iso}`])?.toISOString().slice(0, 10)).toBe(iso)
  })

  it('resolves a numeric date when one part cannot be a month', () => {
    const y = recent.getUTCFullYear()
    const parsed = parseReceiptDate([`25/01/${y}`])
    expect(parsed?.getUTCDate()).toBe(25)
    expect(parsed?.getUTCMonth()).toBe(0)
  })

  it('refuses an ambiguous numeric date rather than guessing', () => {
    expect(parseReceiptDate(['03/04/2026'])).toBeNull()
  })

  it('refuses a future or ancient date', () => {
    expect(parseReceiptDate(['2099-01-01'])).toBeNull()
    expect(parseReceiptDate(['2001-01-01'])).toBeNull()
  })
})

describe('parseItemLine', () => {
  it('returns name, quantity, mass and price in one pass', () => {
    expect(parseItemLine('2 x ORGANIC MILK 2L 3.99')).toMatchObject({
      productName: 'Organic Milk',
      quantity: 2,
      packGrams: 2000,
      linePrice: 3.99,
    })
  })

  it('drops noise lines', () => {
    expect(parseItemLine('TOTAL 42.10')).toBeNull()
    expect(parseItemLine('0123456789012')).toBeNull()
  })

  // A line with neither money nor a weight is not a purchase. Without this the
  // shop name and its street address parsed as groceries.
  it('refuses header and address lines that carry no price or weight', () => {
    expect(parseItemLine('FRESH MART')).toBeNull()
    expect(parseItemLine('119 Bridge Street')).toBeNull()
    expect(parseItemLine('THANK YOU FOR SHOPPING')).toBeNull()
  })
})

describe('multi-word product names', () => {
  // The trailing-code stripper used to eat any last word of 6+ letters, so
  // "BABY SPINACH" became "Baby" and nothing matched as produce.
  it('keeps the whole name when the last word is not a code', () => {
    expect(deriveProductName('BABY SPINACH 200g 1.85')).toBe('BABY SPINACH')
    expect(deriveProductName('CHERRY TOMATOES 400g 2.10')).toBe('CHERRY TOMATOES')
    expect(deriveProductName('ORGANIC BANANAS 1.24 kg 2.18')).toBe('ORGANIC BANANAS')
    expect(deriveProductName('CHICKEN BREAST 550g 6.75')).toBe('CHICKEN BREAST')
  })

  it('still strips a trailing code, which always carries a digit', () => {
    expect(deriveProductName('COCA COLA 1234567890123 2.00')).toBe('COCA COLA')
    expect(deriveProductName('OAT MILK SKU12345 1.50')).toBe('OAT MILK')
  })
})
