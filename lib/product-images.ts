import { GridFSBucket, ObjectId } from "mongodb";
import type { GridFSFile } from "mongodb";
import { Readable } from "node:stream";
import { getDb } from "@/lib/mongodb";

const BUCKET_NAME = "product_images";

async function getBucket(): Promise<GridFSBucket> {
  const db = await getDb();
  return new GridFSBucket(db, { bucketName: BUCKET_NAME });
}

/** Uploads image bytes to GridFS and returns the new file's id (hex string). */
export async function uploadProductImage(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  const bucket = await getBucket();
  return new Promise((resolve, reject) => {
    // This driver's GridFS types dropped the top-level contentType field in
    // favor of the current GridFS spec, which stores it under metadata.
    const uploadStream = bucket.openUploadStream(filename, {
      metadata: { contentType },
    });
    uploadStream.once("error", reject);
    uploadStream.once("finish", () => resolve(uploadStream.id.toString()));
    Readable.from(buffer).pipe(uploadStream);
  });
}

export type ProductImageDownload = {
  stream: NodeJS.ReadableStream;
  contentType: string;
  length: number;
};

/** Opens a download stream for a stored image, or null if the id is invalid/missing. */
export async function openImageDownloadStream(
  id: string
): Promise<ProductImageDownload | null> {
  let objectId: ObjectId;
  try {
    objectId = new ObjectId(id);
  } catch {
    return null;
  }

  const bucket = await getBucket();
  const files: GridFSFile[] = await bucket.find({ _id: objectId }).toArray();
  const file = files[0];
  if (!file) return null;

  return {
    stream: bucket.openDownloadStream(objectId),
    contentType:
      (file.metadata?.contentType as string | undefined) ??
      "application/octet-stream",
    length: file.length,
  };
}

/** Best-effort delete — a missing/invalid id is not an error here. */
export async function deleteProductImage(id: string): Promise<void> {
  let objectId: ObjectId;
  try {
    objectId = new ObjectId(id);
  } catch {
    return;
  }

  const bucket = await getBucket();
  try {
    await bucket.delete(objectId);
  } catch (error) {
    console.error(`[product-images] failed to delete ${id}`, error);
  }
}
