# Product Data Model

Use realistic Moroccan tea attributes — not generic "Product 1/2/3" placeholders. Real category names, real origin regions, real brewing conventions.

```ts
export const CATEGORIES = ['نعناع', 'أخضر', 'بابونج', 'شيبة', 'خلطات عشبية'] as const
export type Category = (typeof CATEGORIES)[number]

export type Product = {
  slug: string
  name: string                 // Arabic name, e.g. "أتاي بالنعناع"
  category: Category
  origin: string               // e.g. "جبال الريف، شفشاون"
  shortDescription: string
  description: string          // 2-4 real sentences, not filler
  flavorNotes: string[]        // e.g. ["نعناع طازج", "قوام حلو خفيف"]
  brewing: {
    tempC: number               // e.g. 100
    steepMinutes: number        // e.g. 3
    notes: string                // e.g. "يُغسل الأتاي أولاً بماء ساخن قبل التحضير"
  }
  variants: { weightGrams: 50 | 100 | 250; priceMAD: number }[]
  images: string[]              // real product photos if supplied by user, else clearly-marked placeholders
  rating?: number
  reviewCount?: number
  inStock: boolean
}
```

## Sample seed data (use as a starting point, swap in real products/photos when the user has them)

```ts
export const products: Product[] = [
  {
    slug: 'atay-bel-naana',
    name: 'أتاي بالنعناع',
    category: 'نعناع',
    origin: 'جبال الريف، شفشاون',
    shortDescription: 'أتاي أخضر تقليدي مع نعناع طازج مجفف',
    description: 'مزيج كلاسيكي من الشاي الأخضر الصيني وأوراق النعناع المغربي، يُحضَّر كما في البيوت المغربية منذ أجيال. نكهة منعشة وقوام متوازن بين المرارة الخفيفة والحلاوة.',
    flavorNotes: ['نعناع طازج', 'قوام حلو خفيف', 'رائحة عشبية'],
    brewing: { tempC: 100, steepMinutes: 3, notes: 'يُغسل الأتاي أولاً بماء ساخن قبل التحضير، ويُقدَّم من علوّ لإظهار الرغوة.' },
    variants: [
      { weightGrams: 50, priceMAD: 35 },
      { weightGrams: 100, priceMAD: 60 },
      { weightGrams: 250, priceMAD: 130 },
    ],
    images: [],
    rating: 4.8,
    reviewCount: 214,
    inStock: true,
  },
  // add 5-8 more spanning categories: green, chamomile, wormwood (شيبة), herbal blends
]
```

When the user has real products, replace this seed data entirely rather than layering their products on top of the sample ones.