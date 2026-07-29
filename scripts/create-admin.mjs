// Creates (or resets the password of) an admin account for /admin.
// Run with: npm run admin:create -- <email> <password> [name]
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

const [, , email, password, name] = process.argv;

if (!email || !password) {
  console.error("Usage: npm run admin:create -- <email> <password> [name]");
  process.exit(1);
}

if (password.length < 8) {
  console.error("Password must be at least 8 characters.");
  process.exit(1);
}

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error(
    "MONGODB_URI is not set. Run with: node --env-file=.env.local scripts/create-admin.mjs"
  );
  process.exit(1);
}

const dbName = process.env.MONGODB_DB ?? "alkhayr";
const normalisedEmail = email.trim().toLowerCase();

const client = new MongoClient(uri);

try {
  await client.connect();
  const db = client.db(dbName);
  const passwordHash = await bcrypt.hash(password, 12);

  await db.collection("admins").updateOne(
    { email: normalisedEmail },
    {
      $set: { email: normalisedEmail, passwordHash, name: name ?? normalisedEmail },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true }
  );

  console.log(`Admin account ready: ${normalisedEmail}`);
} finally {
  await client.close();
}
