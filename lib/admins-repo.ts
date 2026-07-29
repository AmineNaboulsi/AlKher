import { getDb } from "@/lib/mongodb";
import { ADMINS_COLLECTION, type AdminDocument } from "@/lib/admins";

export async function getAdminByEmail(
  email: string
): Promise<AdminDocument | null> {
  const db = await getDb();
  return db
    .collection<AdminDocument>(ADMINS_COLLECTION)
    .findOne({ email: email.toLowerCase() });
}
