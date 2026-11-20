import sharp from "sharp";

// Entries are immutable publication snapshots. The route checks visibility before every lookup.
const thumbnails = new Map<string, Promise<Buffer>>();
const capacity = 64;

export function galleryThumbnail(key: string, load: () => Promise<Buffer>) {
  const existing = thumbnails.get(key);
  if (existing) {
    thumbnails.delete(key);
    thumbnails.set(key, existing);
    return existing;
  }
  const result = load().then(bytes =>
    sharp(bytes).resize(640, 480, { fit: "inside", withoutEnlargement: true }).webp({ quality: 72, effort: 3 }).toBuffer()
  );
  thumbnails.set(key, result);
  if (thumbnails.size > capacity) thumbnails.delete(thumbnails.keys().next().value!);
  result.catch(() => { if (thumbnails.get(key) === result) thumbnails.delete(key); });
  return result;
}
