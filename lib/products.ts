export const CATEGORIES = ["شنمي", "أخضر فاخر", "أخضر صيني"] as const;

export type Category = (typeof CATEGORIES)[number];

export type WeightGrams = 50 | 100 | 200 | 250 | 500 | 1000;

export type Variant = {
  weightGrams: WeightGrams;
  priceMAD: number;
  /** Defaults to true. Set false to list the size but block ordering it. */
  inStock?: boolean;
};

/** A variant is orderable unless it says otherwise. */
export function isVariantInStock(variant: Variant): boolean {
  return variant.inStock !== false;
}

export type Product = {
  slug: string;
  name: string;
  category: Category;
  origin: string;
  shortDescription: string;
  description: string;
  flavorNotes: string[];
  brewing: {
    tempC: number;
    steepMinutes: number;
    notes: string;
  };
  variants: Variant[];
  images: string[];
  rating?: number;
  reviewCount?: number;
  inStock: boolean;
};

export const products: Product[] = [
  {
    slug: "las-palmas",
    name: "لاس بالماس 41022",
    category: "شنمي",
    origin: "شاي أخضر صيني — يُعبَّأ ويُوزَّع في المغرب",
    shortDescription: "شنمي سوبر إكسترا 41022 توب — عبوة كبيرة 500 غرام",
    description:
      "الشاي الأخضر الصيني من نوع شنمي (Chunmee) درجة 41022 TOP، وهو الأكثر انتشاراً في الأتاي المغربي. أوراق ملفوفة تتحمّل الغلي المتكرر في البراد دون أن تفقد قوّتها، وتُعطي رغوة كثيفة عند الصبّ من علوّ. عبوة 500 غرام الاقتصادية تكفي لاستعمال البيت اليومي.",
    flavorNotes: ["قوي ومرّ خفيف", "أوراق ملفوفة", "رغوة كثيفة"],
    brewing: {
      tempC: 100,
      steepMinutes: 4,
      notes:
        "اغسل الأوراق بماء ساخن وارمِ أول ماء، ثم اترك البراد على النار حتى يغلي، وصبّ من علوّ لإظهار الرغوة.",
    },
    variants: [
      { weightGrams: 500, priceMAD: 50 },
      // TODO: confirm the real prices before these come back in stock —
      // the figures below are scaled from the 500g box, not quoted.
      { weightGrams: 200, priceMAD: 22, inStock: false },
      { weightGrams: 1000, priceMAD: 95, inStock: false },
    ],
    images: ["/products/palmas-single.jpeg"],
    inStock: true,
  },
  {
    slug: "sa9iya-l7amra",
    name: "شاي الساقية الحمراء 41022",
    category: "شنمي",
    origin: "شاي أخضر صيني — يُعبَّأ ويُوزَّع في المغرب",
    shortDescription: "شنمي 41022 درجة AAAAAA — عبوة 200 غرام",
    description:
      "شاي أخضر صيني سوبر بدرجة AAAAAA من نوع شنمي 41022، معروف في الجنوب المغربي والصحراء بعلبته التي تحمل قافلة الجمال. مذاق متوازن بين المرارة والحلاوة، مناسب لأتاي الضيافة كما لأتاي الصحراء الذي يُقدَّم في ثلاث كؤوس. عبوة 200 غرام.",
    flavorNotes: ["متوازن", "عشبي جاف", "نهاية حلوة"],
    brewing: {
      tempC: 100,
      steepMinutes: 4,
      notes:
        "ملعقة كبيرة لكل براد. أضف النعناع بعد الغلي لا قبله حتى لا يمرّ طعمه.",
    },
    variants: [{ weightGrams: 200, priceMAD: 20 }],
    images: ["/products/sakiya-single.jpeg"],
    inStock: true,
  },
  {
    slug: "smara",
    name: "سمارة",
    category: "أخضر فاخر",
    origin: "شاي أخضر صيني — يُعبَّأ ويُوزَّع في المغرب",
    shortDescription: "شاي أخضر فاخر (Thé vert de luxe) — عبوة 200 غرام",
    description:
      "شاي أخضر بدرجة فاخرة (de luxe) في علبة سمارة السوداء والذهبية. فرز أدقّ للأوراق يعطي كوباً أنظف وأقل مرارة من الدرجات العادية، لذلك يُفضَّل للمناسبات وضيافة الزوار. عبوة 200 غرام.",
    flavorNotes: ["أنظف وأقل مرارة", "عطري خفيف", "لون ذهبي"],
    brewing: {
      tempC: 95,
      steepMinutes: 3,
      notes:
        "لا تُطِل الغلي — الدرجات الفاخرة تمرّ بسرعة. سكّر خفيف يكفي لإبراز العطر.",
    },
    variants: [{ weightGrams: 200, priceMAD: 23 }],
    images: ["/products/smara-single.jpeg"],
    inStock: true,
  },
  {
    slug: "bit-lfakhama",
    name: "شاي بيت الفخامة",
    category: "أخضر صيني",
    origin: "شاي أخضر صيني — يُعبَّأ ويُوزَّع في المغرب",
    shortDescription: "شاي أخضر صيني للاستعمال اليومي — عبوة 200 غرام",
    description:
      "شاي أخضر صيني في علبة بيت الفخامة، خيار يومي بسعر معقول. قوّة كافية ليتحمّل السكر والنعناع كما يُحضَّر الأتاي في البيوت المغربية، ويبقى ثابت الطعم من أول كأس إلى الثالث. عبوة 200 غرام.",
    flavorNotes: ["قوي", "يتحمّل السكر والنعناع", "ثابت الطعم"],
    brewing: {
      tempC: 100,
      steepMinutes: 5,
      notes:
        "مناسب للبراد الكبير. يمكن إعادة الغلي مرة ثانية دون أن يفقد الطعم.",
    },
    variants: [{ weightGrams: 200, priceMAD: 20 }],
    images: ["/products/bit-fakhar-single.jpeg"],
    inStock: true,
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getFeaturedProducts(count = 4): Product[] {
  return products.filter((p) => p.inStock).slice(0, count);
}

export function getRelatedProducts(product: Product, count = 3): Product[] {
  const sameCategory = products.filter(
    (p) => p.category === product.category && p.slug !== product.slug
  );
  // With a small catalogue, top up from the rest so the section is never empty.
  const rest = products.filter(
    (p) => p.slug !== product.slug && !sameCategory.includes(p)
  );
  return [...sameCategory, ...rest].slice(0, count);
}
