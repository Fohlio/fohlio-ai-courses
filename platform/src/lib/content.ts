import { readFile } from "fs/promises";
import { join } from "path";
import type { Lesson } from "./types";

export interface HtmlContent {
  type: "html";
  css: string;
  html: string;
}

export interface PdfContent {
  type: "pdf";
  filePath: string;
}

export type LessonContent = HtmlContent | PdfContent;

const LESSONS_DIR = join(process.cwd(), "..", "lessons");

/**
 * Reads lesson content from the filesystem.
 * Returns null if no content file is specified or the file doesn't exist.
 */
export async function readLessonContent(
  lesson: Lesson,
): Promise<LessonContent | null> {
  if (!lesson.contentFile) return null;

  const filePath = join(LESSONS_DIR, lesson.contentFile);

  if (lesson.contentType === "pdf") {
    return { type: "pdf", filePath };
  }

  if (lesson.contentType === "html") {
    try {
      const raw = await readFile(filePath, "utf-8");
      return parseHtmlContent(raw);
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Resolves the absolute path to a lesson's content file.
 */
export function getLessonFilePath(lesson: Lesson): string {
  return join(LESSONS_DIR, lesson.contentFile);
}

/**
 * Extracts scoped CSS and body content from a standalone HTML file.
 * Strips header, goals box, homework section, and footer — those are
 * rendered by existing platform components.
 */
function parseHtmlContent(raw: string): HtmlContent {
  // Extract CSS from <style> tags
  const styleMatch = raw.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  const rawCss = styleMatch?.[1] ?? "";

  // Extract body content
  const bodyMatch = raw.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let html = bodyMatch?.[1] ?? "";

  // Remove the outermost .container wrapper if present — we provide our own
  const containerMatch = html.match(
    /^[\s\S]*?<div class="container">([\s\S]*)<\/div>\s*$/i,
  );
  if (containerMatch) {
    html = containerMatch[1];
  }

  // Strip sections already handled by platform components:
  // - Header (.header div)
  html = stripSection(html, "header");
  // - Goals box (.goals-box div)
  html = stripSection(html, "goals-box");
  // - Homework section (.homework div)
  html = stripSection(html, "homework");

  // Strip the footer (last div with inline style containing "border-top")
  html = html.replace(
    /<!-- FOOTER -->[\s\S]*$/i,
    "",
  );

  // Scope the CSS under .lesson-content
  const css = scopeCss(rawCss);

  return { type: "html", css, html: html.trim() };
}

/**
 * Strips a div with the given class name from the HTML string.
 * Handles nested divs correctly by counting open/close tags.
 */
function stripSection(html: string, className: string): string {
  const pattern = new RegExp(
    `<div\\s+class="${className}"[^>]*>`,
    "i",
  );
  const match = pattern.exec(html);
  if (!match) return html;

  const start = match.index;
  let depth = 1;
  let i = start + match[0].length;

  while (i < html.length && depth > 0) {
    if (html.slice(i).startsWith("</div>")) {
      depth--;
      if (depth === 0) {
        const end = i + "</div>".length;
        return html.slice(0, start) + html.slice(end);
      }
      i += "</div>".length;
    } else if (html.slice(i).match(/^<div[\s>]/)) {
      depth++;
      i++;
    } else {
      i++;
    }
  }

  return html;
}

/**
 * Scopes CSS rules under .lesson-content to prevent style leaking.
 * Transforms selectors like `h3 { ... }` into `.lesson-content h3 { ... }`.
 * Skips @-rules, :root, *, and body/html selectors.
 */
function scopeCss(css: string): string {
  // Remove @import rules (fonts are already loaded by the app)
  css = css.replace(/@import\s+url\([^)]+\)\s*;/g, "");

  // Remove :root block (variables are already in globals.css)
  css = css.replace(/:root\s*\{[^}]*\}/g, "");

  // Remove * reset (handled by Tailwind)
  css = css.replace(/\*\s*\{[^}]*\}/g, "");

  // Remove body rule (handled by app layout)
  css = css.replace(/body\s*\{[^}]*\}/g, "");

  // Scope remaining rules under .lesson-content
  const lines = css.split("\n");
  const result: string[] = [];
  let inMediaQuery = false;
  let mediaDepth = 0;

  for (const line of lines) {
    const trimmed = line.trim();

    // Handle @media queries
    if (trimmed.startsWith("@media")) {
      inMediaQuery = true;
      mediaDepth = 0;
      result.push(line);
      continue;
    }

    // Handle @-rules (keyframes, etc.)
    if (trimmed.startsWith("@") && !inMediaQuery) {
      result.push(line);
      continue;
    }

    // Track brace depth for media queries
    if (inMediaQuery) {
      const opens = (trimmed.match(/\{/g) || []).length;
      const closes = (trimmed.match(/\}/g) || []).length;
      mediaDepth += opens - closes;

      if (mediaDepth <= 0) {
        inMediaQuery = false;
        result.push(line);
        continue;
      }

      // Inside media query — scope selectors (lines with { that aren't just closing braces)
      if (trimmed.includes("{") && !trimmed.startsWith("}")) {
        result.push(scopeSelector(line));
      } else {
        result.push(line);
      }
      continue;
    }

    // Regular rule — scope the selector
    if (trimmed.includes("{") && !trimmed.startsWith("}") && !trimmed.startsWith("/*")) {
      result.push(scopeSelector(line));
    } else {
      result.push(line);
    }
  }

  return result.join("\n").trim();
}

/**
 * Prefixes a CSS selector line with .lesson-content
 */
function scopeSelector(line: string): string {
  const braceIndex = line.indexOf("{");
  if (braceIndex === -1) return line;

  const selector = line.slice(0, braceIndex).trim();
  const rest = line.slice(braceIndex);

  // Skip selectors that shouldn't be scoped
  if (
    selector === "body" ||
    selector === "html" ||
    selector === "*" ||
    selector.startsWith(":root")
  ) {
    return line;
  }

  // Handle comma-separated selectors
  const scopedSelector = selector
    .split(",")
    .map((s) => `.lesson-content ${s.trim()}`)
    .join(", ");

  return `${scopedSelector} ${rest}`;
}
