/**
 * Ad-landing copy is kept separate from the product catalogue: the catalogue
 * describes what the product *is* (lib/products.ts), this describes how it's
 * pitched on a single-product ad page (lib/lp/[slug]) built for paid traffic.
 * Adding a product here without a matching slug in the catalogue is harmless —
 * the page just 404s — but every catalogue slug should have an entry so any
 * product can be turned into an ad campaign.
 */

export type AdLandingCopy = {
  /** Cutout/hero product shot — from public/ads, not the catalogue gallery. */
  heroImage: string;
  headline: string;
  subheadline: string;
  /** Short checkmark bullets shown under the description. */
  bullets: string[];
};

export const AD_LANDING_COPY: Record<string, AdLandingCopy> = {
  "las-palmas": {
    heroImage: "/ads/palmas-single-removebg-preview.png",
    headline: "شاي لاس بالماس الأصلي — نفس طعم البراد المغربي",
    subheadline:
      "شنمي سوبر إكسترا 41022، عبوة اقتصادية 500 غرام تكفي البيت لمدة طويلة",
    bullets: [
      "أوراق ملفوفة تتحمّل الغلي المتكرر في البراد دون أن تفقد قوّتها",
      "رغوة كثيفة عند الصبّ من علوّ — كما يحبها أهل البيت",
      "عبوة كبيرة 500 غرام بسعر المحل، توفير على المدى الطويل",
    ],
  },
  "sa9iya-l7amra": {
    heroImage: "/ads/sakiya-single-removebg-preview.png",
    headline: "شاي الساقية الحمراء — نكهة الجنوب المغربي الأصيلة",
    subheadline: "شنمي 41022 درجة AAAAAA، توازن بين المرارة والحلاوة",
    bullets: [
      "مذاق متوازن يناسب أتاي الضيافة وأتاي الصحراء بثلاث كؤوس",
      "درجة AAAAAA معروفة في الجنوب المغربي والصحراء",
      "عبوة 200 غرام سهلة الحمل والتخزين",
    ],
  },
  smara: {
    heroImage: "/ads/smara-single-removebg-preview.png",
    headline: "شاي سمارة الفاخر — كوب أنظف وأقل مرارة",
    subheadline:
      "شاي أخضر بدرجة فاخرة (de luxe) في علبته السوداء والذهبية المميزة",
    bullets: [
      "فرز أدقّ للأوراق يعطي طعماً أنظف وأقل مرارة من الدرجات العادية",
      "عطري خفيف بلون ذهبي يليق بضيافة المناسبات",
      "عبوة 200 غرام",
    ],
  },
  "bit-lfakhama": {
    heroImage: "/ads/bit-fakhar-single-removebg-preview.png",
    headline: "شاي بيت الفخامة — الخيار اليومي بسعر معقول",
    subheadline:
      "قوة تتحمّل السكر والنعناع، وطعم ثابت من الكأس الأول إلى الثالث",
    bullets: [
      "يتحمّل إعادة الغلي مرة ثانية دون أن يفقد طعمه",
      "مناسب للبراد الكبير والاستعمال اليومي",
      "عبوة 200 غرام بسعر اقتصادي",
    ],
  },
};

export function getAdLandingCopy(slug: string): AdLandingCopy | null {
  return AD_LANDING_COPY[slug] ?? null;
}
