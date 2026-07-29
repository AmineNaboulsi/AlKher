// Seeds the 2 bundle offers that used to be hardcoded in lib/promos.ts into
// MongoDB. Safe to re-run — skips any promo whose id already exists.
// Run with: node --env-file=.env.local scripts/seed-promos.mjs
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error(
    "MONGODB_URI is not set. Run with: node --env-file=.env.local scripts/seed-promos.mjs"
  );
  process.exit(1);
}
const dbName = process.env.MONGODB_DB ?? "alkhayr";

const PROMOS = [
  {
    id: "duo-las-palmas",
    name: "علبتان لاس بالماس",
    description: "عبوتان من لاس بالماس 41022 توب — 500 غرام لكل واحدة.",
    items: [{ slug: "las-palmas", weightGrams: 500, quantity: 2 }],
    bundlePriceMAD: 90,
  },
  {
    id: "trio-200g",
    name: "الثلاثية — سمارة وبيت الفخامة والساقية الحمراء",
    description:
      "علبة من كل نوع، 200 غرام لكل واحدة: سمارة، بيت الفخامة، والساقية الحمراء.",
    items: [
      { slug: "smara", weightGrams: 200, quantity: 1 },
      { slug: "bit-lfakhama", weightGrams: 200, quantity: 1 },
      { slug: "sa9iya-l7amra", weightGrams: 200, quantity: 1 },
    ],
    bundlePriceMAD: 50,
  },
];

const client = new MongoClient(uri);

try {
  await client.connect();
  const db = client.db(dbName);
  const promos = db.collection("promos");

  for (const promo of PROMOS) {
    const existing = await promos.findOne({ id: promo.id });
    if (existing) {
      console.log(`skip ${promo.id} — already exists`);
      continue;
    }

    const now = new Date();
    await promos.insertOne({ ...promo, archived: false, createdAt: now, updatedAt: now });
    console.log(`seeded ${promo.id}`);
  }

  console.log("done");
} finally {
  await client.close();
}
