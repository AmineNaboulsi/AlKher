// Seeds the 4 products that used to be hardcoded in lib/products.ts into
// MongoDB, uploading their existing public/products/*.jpeg files into GridFS.
// Safe to re-run — skips any product whose slug already exists.
// Run with: node --env-file=.env.local scripts/seed-products.mjs
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MongoClient, GridFSBucket } from "mongodb";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_PRODUCTS_DIR = path.join(__dirname, "..", "public", "products");

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error(
    "MONGODB_URI is not set. Run with: node --env-file=.env.local scripts/seed-products.mjs"
  );
  process.exit(1);
}
const dbName = process.env.MONGODB_DB ?? "alkhayr";

const PRODUCTS = [
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
      { weightGrams: 200, priceMAD: 22, inStock: false },
      { weightGrams: 1000, priceMAD: 95, inStock: false },
    ],
    imageFiles: ["palmas-single.jpeg", "palmas.jpg"],
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
      notes: "ملعقة كبيرة لكل براد. أضف النعناع بعد الغلي لا قبله حتى لا يمرّ طعمه.",
    },
    variants: [{ weightGrams: 200, priceMAD: 20 }],
    imageFiles: ["sakiya-single.jpeg", "sakiya.jpg"],
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
      notes: "لا تُطِل الغلي — الدرجات الفاخرة تمرّ بسرعة. سكّر خفيف يكفي لإبراز العطر.",
    },
    variants: [{ weightGrams: 200, priceMAD: 23 }],
    imageFiles: ["smara-single.jpeg", "smara.jpg"],
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
      notes: "مناسب للبراد الكبير. يمكن إعادة الغلي مرة ثانية دون أن يفقد الطعم.",
    },
    variants: [{ weightGrams: 200, priceMAD: 20 }],
    imageFiles: ["bit-fakhar-single.jpeg", "bit-lfakhama.jpg"],
    inStock: true,
  },
];

function contentTypeFor(filename) {
  if (filename.endsWith(".png")) return "image/png";
  if (filename.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

async function uploadImage(bucket, filename) {
  const buffer = await readFile(path.join(PUBLIC_PRODUCTS_DIR, filename));
  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, {
      metadata: { contentType: contentTypeFor(filename) },
    });
    uploadStream.once("error", reject);
    uploadStream.once("finish", () => resolve(uploadStream.id.toString()));
    uploadStream.end(buffer);
  });
}

const client = new MongoClient(uri);

try {
  await client.connect();
  const db = client.db(dbName);
  const bucket = new GridFSBucket(db, { bucketName: "product_images" });
  const products = db.collection("products");

  for (const { imageFiles, ...product } of PRODUCTS) {
    const existing = await products.findOne({ slug: product.slug });
    if (existing) {
      console.log(`skip ${product.slug} — already exists`);
      continue;
    }

    const images = [];
    for (const filename of imageFiles) {
      const id = await uploadImage(bucket, filename);
      images.push(`/api/images/${id}`);
    }

    const now = new Date();
    await products.insertOne({
      ...product,
      images,
      archived: false,
      createdAt: now,
      updatedAt: now,
    });
    console.log(`seeded ${product.slug} with ${images.length} image(s)`);
  }

  console.log("done");
} finally {
  await client.close();
}
