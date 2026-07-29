import { Readable } from "node:stream";
import { openImageDownloadStream } from "@/lib/product-images";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/images/[id]">
) {
  const { id } = await ctx.params;
  const result = await openImageDownloadStream(id);
  if (!result) {
    return new Response("Not found", { status: 404 });
  }

  const webStream = Readable.toWeb(
    result.stream as Readable
  ) as ReadableStream<Uint8Array>;

  return new Response(webStream, {
    headers: {
      "Content-Type": result.contentType,
      "Content-Length": String(result.length),
      // A new upload always gets a new id, so a given URL's bytes never change.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
