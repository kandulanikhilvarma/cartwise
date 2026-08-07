import { describe, it, expect } from 'vitest'
import {
  cleanLine,
  isNoiseLine,
  extractQuantity,
  deriveProductName,
  deriveStoreName,
  hasRealName,
  looksLikeReceipt,
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
