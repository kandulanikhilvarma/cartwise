import { describe, expect, it } from 'vitest'
import { normalizeBarcode, toProduct } from './barcode'

describe('normalizeBarcode', () => {
  it('keeps 8 to 14 digits and strips spaces', () => {
    expect(normalizeBarcode('5 000112 548167')).toBe('5000112548167')
    expect(normalizeBarcode('96385074')).toBe('96385074')
  })

  it('rejects anything that cannot be a barcode', () => {
    expect(normalizeBarcode('1234567')).toBeNull()
    expect(normalizeBarcode('123456789012345')).toBeNull()
    expect(normalizeBarcode('abc')).toBeNull()
  })
})

describe('toProduct', () => {
  it('reads per-100 g figures', () => {
    const product = toProduct('5000112548167', {
      product_name: 'Oat drink',
      brands: 'Oatly, Other',
      nutriments: {
        'energy-kcal_100g': 46,
        proteins_100g: 1,
        carbohydrates_100g: 6.7,
        fat_100g: 1.5,
        sodium_100g: 0.04,
      },
    })
    expect(product).toMatchObject({
      productName: 'Oat drink',
      brand: 'Oatly',
      caloriesKcal: 46,
      sodiumMg: 40,
    })
  })

  it('never uses a per-serving figure as a per-100 g one', () => {
    const product = toProduct('5000112548167', {
      product_name: 'Crisps',
      nutriments: { 'energy-kcal_serving': 130, proteins_100g: 6 },
    })
    expect(product?.caloriesKcal).toBe(0)
  })

  it('reads the pack weight only when it is in grams or millilitres', () => {
    const base = { product_name: 'Beans', nutriments: { 'energy-kcal_100g': 80 } }
    expect(toProduct('5000112548167', { ...base, product_quantity: '415', product_quantity_unit: 'g' })?.packGrams).toBe(415)
    expect(toProduct('5000112548167', { ...base, product_quantity: 6, product_quantity_unit: 'pcs' })?.packGrams).toBeNull()
    expect(toProduct('5000112548167', base)?.packGrams).toBeNull()
  })

  it('treats a product with no figures as not found', () => {
    expect(toProduct('5000112548167', { product_name: 'Mystery', nutriments: {} })).toBeNull()
  })
})
