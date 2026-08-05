import { describe, it, expect } from 'vitest'
import { cleanLine, isNoiseLine, extractQuantity, deriveProductName, deriveStoreName } from './receipt-parse'

describe('receipt-ocr parsing helpers', () => {
  it('drops payment/total noise lines', () => {
    expect(isNoiseLine(cleanLine('TOTAL'))).toBe(true)
    expect(isNoiseLine(cleanLine('12.99'))).toBe(true)
    expect(isNoiseLine(cleanLine('VISA'))).toBe(true)
    expect(isNoiseLine(cleanLine('Whole Milk'))).toBe(false)
  })

  it('extracts leading quantity, defaults to 1', () => {
    expect(extractQuantity('2 x Bananas')).toBe(2)
    expect(extractQuantity('3 Eggs 4.50')).toBe(3)
    expect(extractQuantity('Cheddar Cheese')).toBe(1)
  })

  it('strips quantity prefix and trailing price from product name', () => {
    expect(deriveProductName('2 x Whole Milk 3.99')).toBe('Whole Milk')
    expect(deriveProductName('Spinach 1.20')).toBe('Spinach')
  })

  it('reads an all-caps store name from the header', () => {
    expect(deriveStoreName(['WHOLE FOODS MARKET', '123 Main St', '2 Milk 3.99'])).toBe('WHOLE FOODS MARKET')
    expect(deriveStoreName(['2 Milk 3.99', '12.00'])).toBeNull()
  })
})
