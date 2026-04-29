/**
 * SVG Export: converts annotation data to a vector SVG file.
 *
 * Supports: rectangle, ellipse, line, arrow, text, numbering
 * Note: pencil, highlighter, mosaic, blur, spotlight are raster-only (excluded)
 */

import type { Annotation } from "./CanvasContext";

interface ExportOptions {
  backgroundImage?: string; // base64 data URL
  width: number;
  height: number;
}

export function annotationsToSvg(
  annotations: Annotation[],
  options: ExportOptions
): string {
  const { backgroundImage, width, height } = options;

  const svgParts: string[] = [];
  svgParts.push(
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">`,
  );

  // Background image
  if (backgroundImage) {
    svgParts.push(
      `<image href="${escapeXml(backgroundImage)}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice"/>`
    );
  }

  // Annotations
  for (const ann of annotations) {
    const s = ann.style;
    const b = ann.bounds;

    switch (ann.toolType) {
      case "rectangle":
        svgParts.push(
          `<rect x="${b.x}" y="${b.y}" width="${b.width}" height="${b.height}" ` +
          `stroke="${s.strokeColor}" stroke-width="${s.strokeWidth}" ` +
          `fill="${s.fillColor || "none"}" ` +
          `${s.dashed ? 'stroke-dasharray="8 4"' : ""}/>`
        );
        break;

      case "ellipse": {
        const cx = b.x + b.width / 2;
        const cy = b.y + b.height / 2;
        const rx = b.width / 2;
        const ry = b.height / 2;
        svgParts.push(
          `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" ` +
          `stroke="${s.strokeColor}" stroke-width="${s.strokeWidth}" ` +
          `fill="${s.fillColor || "none"}" ` +
          `${s.dashed ? 'stroke-dasharray="8 4"' : ""}/>`
        );
        break;
      }

      case "line":
        if (ann.points && ann.points.length >= 2) {
          const p0 = ann.points[0];
          const p1 = ann.points[ann.points.length - 1];
          svgParts.push(
            `<line x1="${p0.x}" y1="${p0.y}" x2="${p1.x}" y2="${p1.y}" ` +
            `stroke="${s.strokeColor}" stroke-width="${s.strokeWidth}" ` +
            `${s.dashed ? 'stroke-dasharray="8 4"' : ""}/>`
          );
        }
        break;

      case "arrow": {
        if (ann.points && ann.points.length >= 2) {
          const p0 = ann.points[0];
          const p1 = ann.points[ann.points.length - 1];
          const angle = Math.atan2(p1.y - p0.y, p1.x - p0.x);
          const headSize = Math.max(s.strokeWidth * 4, 10);
          const x1 = p1.x - headSize * Math.cos(angle);
          const y1 = p1.y - headSize * Math.sin(angle);

          svgParts.push(
            `<line x1="${p0.x}" y1="${p0.y}" x2="${x1}" y2="${y1}" ` +
            `stroke="${s.strokeColor}" stroke-width="${s.strokeWidth}" />`
          );

          // Arrow head
          const xl = p1.x - headSize * Math.cos(angle - Math.PI / 6);
          const yl = p1.y - headSize * Math.sin(angle - Math.PI / 6);
          const xr = p1.x - headSize * Math.cos(angle + Math.PI / 6);
          const yr = p1.y - headSize * Math.sin(angle + Math.PI / 6);

          const headFill = s.arrowHead === "solid" ? s.strokeColor : "none";
          svgParts.push(
            `<polygon points="${p1.x},${p1.y} ${xl},${yl} ${xr},${yr}" ` +
            `fill="${headFill}" stroke="${s.strokeColor}" stroke-width="${s.strokeWidth}" />`
          );
        }
        break;
      }

      case "text":
        if (ann.text) {
          svgParts.push(
            `<text x="${b.x}" y="${b.y + s.fontSize}" ` +
            `fill="${s.strokeColor}" font-size="${s.fontSize}" font-family="${s.fontFamily}">` +
            `${escapeXml(ann.text)}</text>`
          );
        }
        break;

      case "numbering":
        if (ann.number !== undefined) {
          const cx = b.x;
          const cy = b.y;
          const r = s.fontSize;
          svgParts.push(
            `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${s.strokeColor}"/>`,
            `<text x="${cx}" y="${cy + r / 3}" text-anchor="middle" ` +
            `fill="${s.fillColor || "#FFFFFF"}" font-size="${r}" font-weight="bold">` +
            `${ann.number}</text>`
          );
        }
        break;

      default:
        // pencil, highlighter, mosaic, blur, spotlight - skipped (raster only)
        break;
    }
  }

  svgParts.push(`</svg>`);
  return svgParts.join("\n");
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Download SVG file via browser.
 */
export function downloadSvg(svgContent: string, filename: string = "opensnip-export.svg") {
  const blob = new Blob([svgContent], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
