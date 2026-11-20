import assert from "node:assert/strict";
import { test } from "node:test";
import sharp from "sharp";
import { galleryThumbnail } from "../lib/gallery/thumbnail.ts";

test("simultaneous requests share one source read and produce a bounded WebP without cropping", async () => {
  const original = await sharp({create: {width: 600, height: 1200, channels: 3, background: "#aca"}}).jpeg().toBuffer();
  let reads = 0;
  const load = async () => { reads++; return original; };
  const [a,b] = await Promise.all([galleryThumbnail("portrait", load), galleryThumbnail("portrait", load)]);
  assert.equal(a, b);
  assert.equal(reads, 1);
  const { width, height, format } = await sharp(a).metadata();
  assert.deepEqual([width, height, format], [240, 480, "webp"]);
});

test("a failed thumbnail can be retried", async () => {
  await assert.rejects(galleryThumbnail("retry", async () => Buffer.from("invalid image")));
  const small = await sharp({create: {width: 80, height: 64, channels: 3, background: "#fff"}}).png().toBuffer();
  const { width, height } = await sharp(await galleryThumbnail("retry", async () => small)).metadata();
  assert.deepEqual([width, height], [80, 64]);
});
