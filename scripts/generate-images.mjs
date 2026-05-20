#!/usr/bin/env node
/**
 * Generate AI hero images for a course by manifest.
 *
 * Usage:
 *   node scripts/generate-images.mjs scripts/image-manifests/nestjs.json
 *
 * Manifest schema mirrors skills/course-lesson-writer/references/image-generation.md.
 * Existing files are skipped; pass --force to regenerate.
 *
 * Requirements:
 *   - process.env.OPENROUTER_API_KEY
 *   - sharp installed (dev-time)
 *
 * No labels or text are ever requested — every prompt is post-fixed with
 * "no text, no labels, no letters" per the skill recipe.
 */

import { readFile, mkdir, writeFile, access } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import sharp from "sharp";

const args = process.argv.slice(2);
const manifestPath = args.find((a) => !a.startsWith("--"));
const force = args.includes("--force");
const concurrency = 3;

if (!manifestPath) {
  console.error("Usage: node scripts/generate-images.mjs <manifest.json> [--force]");
  process.exit(1);
}

const apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) {
  console.error("OPENROUTER_API_KEY missing in env.");
  process.exit(1);
}

const manifest = JSON.parse(await readFile(manifestPath, "utf-8"));
const outDir = resolve(process.cwd(), manifest.outDir);
await mkdir(outDir, { recursive: true });

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

async function generateOne(image) {
  const outFile = join(outDir, image.file);
  if (!force && (await exists(outFile))) {
    return { skipped: true, file: image.file };
  }

  const fullPrompt = `${image.prompt}. Style: ${manifest.style}. No text, no labels, no letters.`;

  const body = {
    model: manifest.model,
    modalities: ["image", "text"],
    image_config: { aspect_ratio: image.aspectRatio || "16:9" },
    messages: [{ role: "user", content: fullPrompt }],
  };

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenRouter ${response.status}: ${text.slice(0, 400)}`);
  }

  const payload = await response.json();
  const dataUrl =
    payload?.choices?.[0]?.message?.images?.[0]?.image_url?.url;

  if (!dataUrl || !dataUrl.startsWith("data:image/")) {
    const fallbackText = payload?.choices?.[0]?.message?.content;
    throw new Error(
      `No image returned for ${image.file}. Body: ${
        typeof fallbackText === "string" ? fallbackText.slice(0, 300) : "(empty)"
      }`,
    );
  }

  const base64 = dataUrl.split(",")[1];
  const buffer = Buffer.from(base64, "base64");

  const targetWidth = image.aspectRatio === "4:3" ? 1200 : 1600;

  await sharp(buffer)
    .resize({ width: targetWidth, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(outFile);

  return { skipped: false, file: image.file, bytes: buffer.length };
}

const queue = [...manifest.images];
const results = [];

async function worker(id) {
  while (queue.length) {
    const job = queue.shift();
    if (!job) return;
    const started = Date.now();
    try {
      const r = await generateOne(job);
      const elapsed = Date.now() - started;
      console.log(
        r.skipped
          ? `[w${id}] skip ${r.file} (already exists)`
          : `[w${id}] ok   ${r.file} (${elapsed}ms)`,
      );
      results.push(r);
    } catch (error) {
      console.error(`[w${id}] FAIL ${job.file}: ${error.message}`);
      results.push({ skipped: false, file: job.file, error: error.message });
    }
  }
}

await Promise.all(Array.from({ length: concurrency }, (_, i) => worker(i + 1)));

const ok = results.filter((r) => !r.skipped && !r.error).length;
const skip = results.filter((r) => r.skipped).length;
const fail = results.filter((r) => r.error).length;
console.log(`\nDone. generated=${ok} skipped=${skip} failed=${fail}`);

if (fail) process.exit(2);
