import sanitizeHtml from "sanitize-html";
import type { LessonAsset } from "./types";

interface PreparedLessonHtml {
  html: string;
  unresolvedMediaSources: string[];
}

const ALLOWED_TAGS = [
  "a",
  "article",
  "aside",
  "b",
  "blockquote",
  "br",
  "code",
  "details",
  "div",
  "em",
  "figcaption",
  "figure",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "i",
  "img",
  "li",
  "mark",
  "ol",
  "p",
  "picture",
  "pre",
  "section",
  "small",
  "source",
  "span",
  "strong",
  "sub",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "th",
  "thead",
  "tr",
  "u",
  "ul",
  "video",
  // SVG tags for inline diagrams
  "svg",
  "defs",
  "marker",
  "g",
  "path",
  "rect",
  "circle",
  "ellipse",
  "line",
  "polyline",
  "polygon",
  "text",
  "tspan",
  "use",
  "symbol",
  "linearGradient",
  "radialGradient",
  "stop",
  "desc",
  "foreignObject",
];

const SVG_ATTRIBUTES = [
  "viewBox",
  "xmlns",
  "x",
  "y",
  "x1",
  "y1",
  "x2",
  "y2",
  "cx",
  "cy",
  "r",
  "rx",
  "ry",
  "d",
  "points",
  "width",
  "height",
  "fill",
  "fill-rule",
  "fill-opacity",
  "stroke",
  "stroke-width",
  "stroke-dasharray",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-opacity",
  "opacity",
  "transform",
  "text-anchor",
  "font-family",
  "font-weight",
  "font-size",
  "dx",
  "dy",
  "offset",
  "stop-color",
  "stop-opacity",
  "dominant-baseline",
  "alignment-baseline",
  "marker-end",
  "marker-start",
  "marker-mid",
  "refX",
  "refY",
  "markerWidth",
  "markerHeight",
  "markerUnits",
  "orient",
  "gradientUnits",
  "preserveAspectRatio",
];

const ALLOWED_ATTRIBUTES: sanitizeHtml.IOptions["allowedAttributes"] = {
  "*": [
    "class",
    "id",
    "style",
    "title",
    "data-widget",
    "data-config",
    "data-state",
  ],
  a: ["href", "name", "target", "rel"],
  img: [
    "src",
    "alt",
    "width",
    "height",
    "loading",
    "decoding",
    "sizes",
    "srcset",
  ],
  picture: [],
  source: ["src", "srcset", "sizes", "type", "media"],
  video: ["src", "poster", "controls", "playsinline", "preload"],
  svg: SVG_ATTRIBUTES,
  defs: SVG_ATTRIBUTES,
  marker: SVG_ATTRIBUTES,
  g: SVG_ATTRIBUTES,
  path: SVG_ATTRIBUTES,
  rect: SVG_ATTRIBUTES,
  circle: SVG_ATTRIBUTES,
  ellipse: SVG_ATTRIBUTES,
  line: SVG_ATTRIBUTES,
  polyline: SVG_ATTRIBUTES,
  polygon: SVG_ATTRIBUTES,
  text: SVG_ATTRIBUTES,
  tspan: SVG_ATTRIBUTES,
  use: SVG_ATTRIBUTES,
  symbol: SVG_ATTRIBUTES,
  linearGradient: SVG_ATTRIBUTES,
  radialGradient: SVG_ATTRIBUTES,
  stop: SVG_ATTRIBUTES,
  desc: SVG_ATTRIBUTES,
};

function extractHtmlBody(raw: string): { body: string; css: string } {
  const styles = Array.from(raw.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi))
    .map((match) => match[1]?.trim() ?? "")
    .filter(Boolean)
    .join("\n");

  const bodyMatch = raw.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const body = bodyMatch?.[1] ?? raw;

  return {
    body: body.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "").trim(),
    css: styles,
  };
}

function isRelativeAssetPath(value: string): boolean {
  if (!value) return false;

  return !(
    value.startsWith("/") ||
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:") ||
    value.startsWith("blob:")
  );
}

function rewriteMediaSource(
  value: string,
  assetByName: Map<string, LessonAsset>,
  unresolved: Set<string>,
): string {
  if (!isRelativeAssetPath(value)) {
    return value;
  }

  const normalized = value.split("?")[0].split("#")[0];
  const fileName = normalized.split("/").pop() ?? normalized;
  const matchedAsset = assetByName.get(fileName);

  if (!matchedAsset) {
    unresolved.add(value);
    return value;
  }

  return matchedAsset.url;
}

function rewriteMediaReferences(
  html: string,
  assets: LessonAsset[],
): PreparedLessonHtml {
  const unresolved = new Set<string>();
  const assetByName = new Map(assets.map((asset) => [asset.fileName, asset]));

  const rewrittenHtml = html
    .replace(
      /(<img[^>]*\ssrc=["'])([^"']+)(["'][^>]*>)/gi,
      (_match, prefix, src, suffix) =>
        `${prefix}${rewriteMediaSource(src, assetByName, unresolved)}${suffix}`,
    )
    .replace(
      /(<source[^>]*\ssrc=["'])([^"']+)(["'][^>]*>)/gi,
      (_match, prefix, src, suffix) =>
        `${prefix}${rewriteMediaSource(src, assetByName, unresolved)}${suffix}`,
    )
    .replace(
      /(<video[^>]*\ssrc=["'])([^"']+)(["'][^>]*>)/gi,
      (_match, prefix, src, suffix) =>
        `${prefix}${rewriteMediaSource(src, assetByName, unresolved)}${suffix}`,
    )
    .replace(
      /(<video[^>]*\sposter=["'])([^"']+)(["'][^>]*>)/gi,
      (_match, prefix, src, suffix) =>
        `${prefix}${rewriteMediaSource(src, assetByName, unresolved)}${suffix}`,
    );

  return {
    html: rewrittenHtml,
    unresolvedMediaSources: Array.from(unresolved),
  };
}

function scopeSelector(line: string): string {
  const braceIndex = line.indexOf("{");

  if (braceIndex === -1) {
    return line;
  }

  const selector = line.slice(0, braceIndex).trim();
  const rest = line.slice(braceIndex);

  if (
    selector === "body" ||
    selector === "html" ||
    selector === "*" ||
    selector.startsWith(":root")
  ) {
    return line;
  }

  const scopedSelector = selector
    .split(",")
    .map((item) => `.lesson-content ${item.trim()}`)
    .join(", ");

  return `${scopedSelector} ${rest}`;
}

function scopeCss(css: string): string {
  let safeCss = css;

  safeCss = safeCss.replace(/@import\s+url\([^)]+\)\s*;/g, "");
  safeCss = safeCss.replace(/:root\s*\{[^}]*\}/g, "");
  safeCss = safeCss.replace(/\*\s*\{[^}]*\}/g, "");
  safeCss = safeCss.replace(/body\s*\{[^}]*\}/g, "");

  const lines = safeCss.split("\n");
  const result: string[] = [];
  let inMediaQuery = false;
  let mediaDepth = 0;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("@media")) {
      inMediaQuery = true;
      mediaDepth = 0;
      result.push(line);
      continue;
    }

    if (trimmed.startsWith("@") && !inMediaQuery) {
      result.push(line);
      continue;
    }

    if (inMediaQuery) {
      const opens = (trimmed.match(/\{/g) || []).length;
      const closes = (trimmed.match(/\}/g) || []).length;
      mediaDepth += opens - closes;

      if (mediaDepth <= 0) {
        inMediaQuery = false;
        result.push(line);
        continue;
      }

      if (trimmed.includes("{") && !trimmed.startsWith("}")) {
        result.push(scopeSelector(line));
      } else {
        result.push(line);
      }

      continue;
    }

    if (trimmed.includes("{") && !trimmed.startsWith("}") && !trimmed.startsWith("/*")) {
      result.push(scopeSelector(line));
      continue;
    }

    result.push(line);
  }

  return result.join("\n").trim();
}

export function prepareLessonHtml(
  source: string,
  assets: LessonAsset[] = [],
): PreparedLessonHtml {
  const { body, css } = extractHtmlBody(source);
  const sanitizedBody = sanitizeHtml(body, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedSchemes: ["http", "https", "mailto", "data", "blob"],
    allowProtocolRelative: false,
    parseStyleAttributes: false,
    parser: {
      // SVG needs case-sensitive tags (linearGradient) and attrs (viewBox, markerWidth)
      lowerCaseTags: false,
      lowerCaseAttributeNames: false,
    },
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        rel: "noopener noreferrer",
        target: "_blank",
      }),
    },
  });

  const rewritten = rewriteMediaReferences(sanitizedBody, assets);
  const scopedCss = css ? `<style>${scopeCss(css)}</style>` : "";

  return {
    html: `${scopedCss}${rewritten.html}`.trim(),
    unresolvedMediaSources: rewritten.unresolvedMediaSources,
  };
}

export function hasPublishableLessonContent(source: string, contentType: string): boolean {
  if (contentType === "pdf") {
    return true;
  }

  return source.trim().length > 0;
}
