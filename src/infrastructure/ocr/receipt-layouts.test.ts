import { describe, expect, it } from 'vitest'
import {
  detectCurrency,
  extractTotalSpend,
  joinPages,
  parseItemLine,
  parseItemLines,
  parseReceiptDate,
} from './receipt-parse'

// Real receipt layouts that the single-line parser got wrong. Each case names
// the audit finding it covers.
describe('receipt layouts', () => {
  it('drops payment, subtotal and savings lines [C-2]', () => {
    for (const line of [
      'SUB TOTAL 45.67',
      'CONTACTLESS 45.67',
      'TO PAY 45.67',
      'YOU SAVED 2.10',
      '12 ITEMS TOTAL 45.67',
      'MULTIBUY SAVING -0.50',
      'CLUBCARD PRICE 1.00-',
    ]) {
      expect(parseItemLine(line), line).toBeNull()
    }
  })

  it('keeps a product whose name contains "total" [C-2]', () => {
    expect(parseItemLine('TOTAL GREEK YOGURT 500g 2.10')?.productName).toBe('Total Greek Yogurt')
  })

  it('merges a name line with the price line under it [C-1]', () => {
    const items = parseItemLines(['BANANAS', '0.456 kg @ 2.99/kg 1.36', 'MILK', '2 @ 1.50 3.00'])
    expect(items).toEqual([
      { productName: 'Bananas', quantity: 1, packGrams: 456, linePrice: 1.36 },
      { productName: 'Milk', quantity: 2, packGrams: null, linePrice: 3 },
    ])
  })

  it('keeps two different sizes of one product [C-3]', () => {
    const items = parseItemLines(['YOGURT 500g 1.20', 'YOGURT 150g 0.60'])
    expect(items.map((item) => item.packGrams)).toEqual([500, 150])
  })

  it('keeps a line bought twice, and drops the overlap between photos [C-3]', () => {
    expect(parseItemLines(['MILK 1.20', 'MILK 1.20'])).toHaveLength(2)
    expect(joinPages([['BREAD 1.00', 'MILK 1.20'], ['MILK 1.20', 'EGGS 2.10']])).toEqual([
      'BREAD 1.00',
      'MILK 1.20',
      'EGGS 2.10',
    ])
  })

  it('reads a multiplication sign [C-4]', () => {
    expect(parseItemLine('3 × 500 ml OAT MILK 4.50')).toMatchObject({
      productName: 'Oat Milk',
      quantity: 3,
      packGrams: 500,
    })
  })

  it('does not treat a count inside a pack as packs [C-5]', () => {
    expect(parseItemLine('6 BREAD ROLLS 300g 1.20')).toMatchObject({ quantity: 1, packGrams: 300 })
    expect(parseItemLine('YOGURT 4 x 125g 2.00')).toMatchObject({
      productName: 'Yogurt',
      quantity: 1,
      packGrams: 500,
    })
  })

  it('reads the real total, with thousands separators [C-6]', () => {
    expect(extractTotalSpend(['MILK 1.20', 'TOTAL SAVINGS 2.50', 'TOTAL 45.67'])).toBe(45.67)
    expect(extractTotalSpend(['TOTAL 1,234.56'])).toBe(1234.56)
    expect(extractTotalSpend(['TOTAL 12,48'])).toBe(12.48)
  })

  it('accepts a date whose day equals its month [C-7]', () => {
    const year = new Date().getUTCFullYear() - 1
    expect(parseReceiptDate([`05/05/${year}`])?.toISOString().slice(0, 10)).toBe(`${year}-05-05`)
  })

  it('takes the most frequent currency symbol [C-17]', () => {
    expect(detectCurrency(['MILK £1.20', 'BREAD £1.00', 'TOTAL £12.48 (US$ 15)'])).toBe('GBP')
    expect(detectCurrency(['DAL ₹120.00'])).toBe('INR')
  })
})
