export type GroceryItem = {
  id: string
  productName: string
  quantity: number
  unit?: string | null
  /** Real mass bought, in grams. Null when the receipt did not say. */
  packGrams?: number | null
  linePrice?: number | null
  matchConfidence?: number | null
  foodGroup?: string | null
  novaGroup?: number | null
  nutriScore?: string | null
  caloriesKcal?: number | null
  proteinG?: number | null
  carbsG?: number | null
  fatG?: number | null
  sugarG?: number | null
  fiberG?: number | null
  sodiumMg?: number | null
  vitaminDMcg?: number | null
  ironMg?: number | null
  calciumMg?: number | null
  consumed?: boolean
  consumedAt?: string | null
}

export type GroceryBatch = {
  id: string
  storeName?: string | null
  ocrStatus: 'pending' | 'processing' | 'done' | 'failed'
  purchasedAt: string
  totalSpend?: number | null
  currency?: string | null
  itemsTruncated?: boolean
  items: GroceryItem[]
}
