#!/usr/bin/env node
/**
 * Inject `<figure class="lesson-hero">` blocks into existing lesson HTML
 * files for all three courses. Idempotent — re-running does nothing once
 * the marker exists. After running, reseed the database so DB-stored
 * `contentHtml` picks up the change.
 */

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const HERO_MARKER = "<!-- LESSON_HERO_INJECTED -->";

const COURSES = [
  {
    courseSlug: "nestjs",
    files: [
      ["nestjs-1-intro.html",                1],
      ["nestjs-2-building-blocks.html",      2],
      ["nestjs-3-request-pipeline.html",     3],
      ["nestjs-4-data-layer.html",           4],
      ["nestjs-5-auth-security.html",        5],
      ["nestjs-6-validation-dtos.html",      6],
      ["nestjs-7-apis-at-scale.html",        7],
      ["nestjs-8-async-power.html",          8],
      ["nestjs-9-microservices.html",        9],
      ["nestjs-10-production-ready.html",   10],
      ["nestjs-11-fohlio-architecture.html",11],
      ["nestjs-12-fohlio-multitenant.html", 12],
    ],
    alt: (n) =>
      `Editorial illustration for NestJS Lesson ${n} (airport-themed)`,
  },
  {
    courseSlug: "mikroorm",
    files: [
      ["mikroorm-1-intro.html",              1],
      ["mikroorm-2-entities.html",           2],
      ["mikroorm-3-entity-manager.html",     3],
      ["mikroorm-4-relations.html",          4],
      ["mikroorm-5-loading.html",            5],
      ["mikroorm-6-query-builder.html",      6],
      ["mikroorm-7-migrations.html",         7],
      ["mikroorm-8-advanced.html",           8],
      ["mikroorm-9-nestjs-integration.html", 9],
      ["mikroorm-10-production.html",       10],
    ],
    alt: (n) =>
      `Editorial illustration for MikroORM Lesson ${n} (library-themed)`,
  },
  {
    courseSlug: "fohlio-tech-course",
    files: [
      ["lesson1-git_intro.html",         1],
      ["lesson2-architecture.html",      2],
      ["lesson3-frontend-deep-dive.html",3],
      ["lesson4-ai-fundamentals.html",   4],
      ["lesson5-mcp-in-practice.html",   5],
      ["lesson6-skills-for-gtm.html",    6],
    ],
    alt: (n) =>
      `Editorial illustration for Fohlio Tech Course Lesson ${n}`,
  },
];

function buildHero(courseSlug, lessonNumber, altText) {
  const url = `/lessons/images/${courseSlug}/lesson-${lessonNumber}-hero.webp`;
  return [
    HERO_MARKER,
    `<figure class="lesson-hero" style="margin:0 0 32px 0;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.06);">`,
    `<img src="${url}" alt="${altText}" width="1600" height="900" loading="eager" decoding="async" style="display:block;width:100%;height:auto;">`,
    `</figure>`,
  ].join("\n");
}

const lessonsDir = resolve(process.cwd(), "public/lessons");
let inserted = 0;
let skipped = 0;
let missing = 0;

for (const course of COURSES) {
  for (const [file, lessonNumber] of course.files) {
    const path = resolve(lessonsDir, file);
    let html;
    try {
      html = await readFile(path, "utf-8");
    } catch {
      console.warn(`missing ${file}`);
      missing++;
      continue;
    }

    if (html.includes(HERO_MARKER)) {
      skipped++;
      continue;
    }

    const heroBlock = buildHero(
      course.courseSlug,
      lessonNumber,
      course.alt(lessonNumber),
    );

    const next = html.replace(
      /(<div class="container">)/,
      (match) => `${match}\n\n${heroBlock}\n`,
    );

    if (next === html) {
      console.warn(`no injection point in ${file}`);
      missing++;
      continue;
    }

    await writeFile(path, next, "utf-8");
    console.log(`injected ${file}`);
    inserted++;
  }
}

console.log(`\nDone. injected=${inserted} skipped=${skipped} missing=${missing}`);
