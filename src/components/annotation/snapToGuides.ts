/**
 * Alignment Guide + Snapping System
 *
 * When moving or resizing an annotation, detects alignment with other annotations
 * and snaps within a threshold, drawing pink guide lines on the canvas.
 */

import type { Bounds } from "./CanvasContext";

const SNAP_THRESHOLD = 5; // pixels within which snapping activates

export interface GuideLine {
  orientation: "horizontal" | "vertical";
  position: number; // x for vertical, y for horizontal
  start: number;
  end: number;
}

export interface SnapResult {
  bounds: Bounds;
  guides: GuideLine[];
}

/**
 * Compute snapped bounds + alignment guides for a moving annotation.
 * @param moving - current bounds of the annotation being moved/resized
 * @param others - all other annotations to align against
 * @param isResize - true if resizing (checks size match), false if moving
 */
export function computeSnap(
  moving: Bounds,
  others: Bounds[],
  isResize: boolean = false
): SnapResult {
  const guides: GuideLine[] = [];
  let snapped = { ...moving };

  if (others.length === 0) return { bounds: snapped, guides: [] };

  // Key points of moving annotation
  const movingLeft = moving.x;
  const movingRight = moving.x + moving.width;
  const movingTop = moving.y;
  const movingBottom = moving.y + moving.height;
  const movingCenterX = moving.x + moving.width / 2;
  const movingCenterY = moving.y + moving.height / 2;

  let bestSnap: { prop: string; value: number; dist: number } | null = null;

  for (const other of others) {
    const otherLeft = other.x;
    const otherRight = other.x + other.width;
    const otherTop = other.y;
    const otherBottom = other.y + other.height;
    const otherCenterX = other.x + other.width / 2;
    const otherCenterY = other.y + other.height / 2;

    // Vertical alignments
    const verticalChecks = [
      { prop: "x", movingVal: movingLeft, otherVal: otherLeft, desc: "left" },
      { prop: "x+width", movingVal: movingRight, otherVal: otherRight, desc: "right" },
      { prop: "centerX", movingVal: movingCenterX, otherVal: otherCenterX, desc: "centerX" },
    ];

    for (const check of verticalChecks) {
      const dist = Math.abs(check.movingVal - check.otherVal);
      if (dist < SNAP_THRESHOLD) {
        const guideX = check.otherVal;
        guides.push({
          orientation: "vertical",
          position: guideX,
          start: Math.min(movingTop, otherTop),
          end: Math.max(movingBottom, otherBottom),
        });

        if (!bestSnap || dist < bestSnap.dist) {
          bestSnap = { prop: check.prop, value: check.otherVal, dist };
        }

        // Apply snap offset
        const dx = check.otherVal - check.movingVal;
        snapped.x += dx;
        // Recalculate after snap for subsequent checks
        break;
      }
    }

    // Horizontal alignments
    const horizontalChecks = [
      { prop: "y", movingVal: movingTop, otherVal: otherTop, desc: "top" },
      { prop: "y+height", movingVal: movingBottom, otherVal: otherBottom, desc: "bottom" },
      { prop: "centerY", movingVal: movingCenterY, otherVal: otherCenterY, desc: "centerY" },
    ];

    for (const check of horizontalChecks) {
      const dist = Math.abs(check.movingVal - check.otherVal);
      if (dist < SNAP_THRESHOLD) {
        const guideY = check.otherVal;
        guides.push({
          orientation: "horizontal",
          position: guideY,
          start: Math.min(movingLeft, otherLeft),
          end: Math.max(movingRight, otherRight),
        });

        if (!bestSnap || dist < bestSnap.dist) {
          bestSnap = { prop: check.prop, value: check.otherVal, dist };
        }

        const dy = check.otherVal - check.movingTop;
        snapped.y += dy;
        break;
      }
    }

    // Size matching (for resize mode)
    if (isResize) {
      const widthMatch = Math.abs(moving.width - other.width) < SNAP_THRESHOLD;
      const heightMatch = Math.abs(moving.height - other.height) < SNAP_THRESHOLD;

      if (widthMatch) {
        guides.push({
          orientation: "vertical",
          position: movingRight,
          start: Math.min(movingTop, otherTop),
          end: Math.max(movingBottom, otherBottom),
        });
        snapped.width = other.width;
      }
      if (heightMatch) {
        guides.push({
          orientation: "horizontal",
          position: movingBottom,
          start: Math.min(movingLeft, otherLeft),
          end: Math.max(movingRight, otherRight),
        });
        snapped.height = other.height;
      }
    }
  }

  // Deduplicate guides
  const uniqueGuides = guides.filter(
    (g, i, arr) =>
      arr.findIndex(
        (gg) =>
          gg.orientation === g.orientation &&
          Math.abs(gg.position - g.position) < 0.5
      ) === i
  );

  return { bounds: snapped, guides: uniqueGuides };
}

/**
 * Draw alignment guides on the canvas.
 */
export function drawGuides(
  ctx: CanvasRenderingContext2D,
  guides: GuideLine[],
  color: string = "#FF1493",
  lineWidth: number = 1
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.setLineDash([4, 4]);

  for (const guide of guides) {
    ctx.beginPath();
    if (guide.orientation === "vertical") {
      ctx.moveTo(guide.position, guide.start);
      ctx.lineTo(guide.position, guide.end);
    } else {
      ctx.moveTo(guide.start, guide.position);
      ctx.lineTo(guide.end, guide.position);
    }
    ctx.stroke();
  }

  ctx.setLineDash([]);
  ctx.restore();
}
