export const FOOD_GROUPS = [
  'produce',
  'protein',
  'dairy',
  'grain',
  'pantry',
  'snack',
  'drink',
] as const

export type FoodGroup = (typeof FOOD_GROUPS)[number]

export const FOOD_GROUP_LABEL: Record<FoodGroup, string> = {
  produce: 'Fresh produce',
  protein: 'Meat, fish and eggs',
  dairy: 'Dairy',
  grain: 'Grains and bread',
  pantry: 'Pantry',
  snack: 'Snacks and sweets',
  drink: 'Drinks',
}

// Ordered most-specific first: "coconut milk" is a drink, not produce, so the
// drink terms are tested before the produce ones.
const RULES: Array<{ group: FoodGroup; terms: RegExp }> = [
  {
    group: 'drink',
    terms:
      /\b(juice|soda|cola|lemonade|water|sparkling|coffee|tea|beer|wine|cider|kombucha|smoothie|squash|cordial|energy drink)(?:e?s)?\b/i,
  },
  {
    group: 'snack',
    terms:
      /\b(crisps|chips|biscuit|cookie|cracker|candy|chocolate|sweets|ice cream|doughnut|donut|cake|pastry|popcorn|pretzel|bar|gum|jelly)(?:e?s)?\b/i,
  },
  {
    group: 'dairy',
    terms:
      /\b(milk|cheese|yoghurt|yogurt|butter|cream|creme fraiche|kefir|mozzarella|cheddar|brie|feta|paneer|ghee)(?:e?s)?\b/i,
  },
  {
    group: 'protein',
    terms:
      /\b(chicken|beef|pork|lamb|turkey|bacon|sausage|ham|mince|steak|fish|salmon|tuna|cod|prawn|shrimp|egg|eggs|tofu|tempeh|lentil|chickpea|bean|beans|hummus)(?:e?s)?\b/i,
  },
  {
    group: 'grain',
    terms:
      /\b(bread|roll|bagel|tortilla|wrap|pasta|spaghetti|penne|noodle|rice|oat|oats|cereal|granola|flour|quinoa|couscous|barley|bun|baguette|pitta|pita)(?:e?s)?\b/i,
  },
  {
    group: 'produce',
    terms:
      /\b(apple|banana|orange|lemon|lime|grape|berry|berries|strawberr|blueberr|raspberr|melon|mango|peach|pear|plum|kiwi|avocado|tomato|potato|onion|garlic|carrot|broccoli|spinach|lettuce|kale|cabbage|pepper|cucumber|courgette|zucchini|aubergine|eggplant|mushroom|celery|leek|squash|pumpkin|sweetcorn|corn|pea|peas|bean sprout|salad|herb|basil|coriander|parsley|ginger|beetroot|radish|asparagus|cauliflower|sprout)(?:e?s)?\b/i,
  },
  {
    group: 'pantry',
    terms:
      /\b(oil|vinegar|salt|sugar|spice|sauce|ketchup|mayo|mustard|honey|jam|peanut butter|stock|broth|tin|canned|soup|paste|seasoning|baking)(?:e?s)?\b/i,
  },
]

/**
 * Coarse food group from a product name. Deliberately conservative: an
 * unrecognised name returns null rather than being filed under a group it may
 * not belong to, because the batch read reports group counts to the user.
 */
export function classifyFoodGroup(productName: string): FoodGroup | null {
  const name = productName.toLowerCase()
  for (const rule of RULES) {
    if (rule.terms.test(name)) return rule.group
  }
  return null
}

/** Open Food Facts ships its own category tags; prefer them when present. */
export function foodGroupFromOffCategories(tags: string[]): FoodGroup | null {
  const joined = tags.join(' ').toLowerCase()
  if (/\b(beverages|waters|juices|sodas)\b/.test(joined)) return 'drink'
  if (/\b(snacks|confectioner|biscuits|chocolate|desserts)\b/.test(joined)) return 'snack'
  if (/\b(dairies|milk|cheeses|yogurts)\b/.test(joined)) return 'dairy'
  if (/\b(meats|seafood|fish|eggs|legumes)\b/.test(joined)) return 'protein'
  if (/\b(cereals|breads|pastas|rice)\b/.test(joined)) return 'grain'
  if (/\b(fruits|vegetables|plant-based-foods)\b/.test(joined)) return 'produce'
  if (/\b(groceries|condiments|sauces|canned)\b/.test(joined)) return 'pantry'
  return null
}
