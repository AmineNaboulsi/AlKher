import { cache } from "react";
import { getDb } from "@/lib/mongodb";
import type { SiteSettings } from "@/lib/site-settings";

export const SETTINGS_COLLECTION = "settings";
const SETTINGS_ID = "site";

type SettingsDoc = Partial<SiteSettings> & { _id: string; updatedAt?: Date };

/** Same numbers `lib/whatsapp.ts` used before this became DB-editable — kept as the seed default. */
function envOrderAlertPhones(): string[] {
  return (process.env.WHATSAPP_OWNER_NUMBERS ?? "")
    .split(",")
    .map((n) => n.trim())
    .filter(Boolean);
}

function defaults(): SiteSettings {
  return {
    storeName: "الخير",
    contactPhone: "+212 654711474",
    contactEmail: null,
    address: "مراكش، المغرب",
    orderAlertPhones: envOrderAlertPhones(),
    sendCustomerWhatsApp: true,
  };
}

/**
 * Cosmetic, low-stakes data — if the DB is unreachable, fall back to defaults
 * instead of breaking every page's header/footer.
 */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  try {
    const db = await getDb();
    const doc = await db
      .collection<SettingsDoc>(SETTINGS_COLLECTION)
      .findOne({ _id: SETTINGS_ID });
    return { ...defaults(), ...doc };
  } catch (error) {
    console.error("[site-settings] failed to load settings, using defaults", error);
    return defaults();
  }
});

export type SiteSettingsInput = Partial<SiteSettings>;

/** Admin write path — unlike the read above, lets DB errors propagate so the admin form can report them. */
export async function updateSiteSettings(
  input: SiteSettingsInput
): Promise<SiteSettings> {
  const db = await getDb();
  await db.collection<SettingsDoc>(SETTINGS_COLLECTION).updateOne(
    { _id: SETTINGS_ID },
    { $set: { ...input, updatedAt: new Date() } },
    { upsert: true }
  );
  const doc = await db
    .collection<SettingsDoc>(SETTINGS_COLLECTION)
    .findOne({ _id: SETTINGS_ID });
  return { ...defaults(), ...doc };
}
