export type GroceryItem = {
  id: string
  productName: string
  quantity: number
  unit?: string | null
  caloriesKcal?: number | null
  proteinG?: number | null
  carbsG?: number | null
  fatG?: number | null
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
  items: GroceryItem[]
}
