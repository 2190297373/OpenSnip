/**
 * Image processing utilities for annotation effects.
 *
 * - Gaussian blur (real kernel convolution)
 * - Spotlight (dim everything outside a focal region)
 * - Magnifier (zoom view helper)
 */

/**
 * Apply Gaussian blur to canvas image data using a convolution kernel.
 */
export function applyGaussianBlur(
  imageData: ImageData,
  radius: number,
  region: { x: number; y: number; width: number; height: number }
): ImageData {
  const { x, y, width, height } = region;
  const src = imageData;
  const dst = new Uint8ClampedArray(src.data);

  // Generate Gaussian kernel
  const kernel = buildGaussianKernel(radius);
  const halfK = Math.floor(kernel.length / 2);

  // Clamp region to image bounds
  const startX = Math.max(0, Math.floor(x));
  const startY = Math.max(0, Math.floor(y));
  const endX = Math.min(src.width, Math.ceil(x + width));
  const endY = Math.min(src.height, Math.ceil(y + height));

  // Horizontal pass
  const temp = new Uint8ClampedArray(src.data.length);
  for (let cy = startY; cy < endY; cy++) {
    for (let cx = startX; cx < endX; cx++) {
      let r = 0, g = 0, b = 0, a = 0, wSum = 0;
      for (let k = 0; k < kernel.length; k++) {
        const px = cx + k - halfK;
        if (px < 0 || px >= src.width) continue;
        const idx = (cy * src.width + px) * 4;
        const weight = kernel[k];
        r += src.data[idx] * weight;
        g += src.data[idx + 1] * weight;
        b += src.data[idx + 2] * weight;
        a += src.data[idx + 3] * weight;
        wSum += weight;
      }
      const idx = (cy * src.width + cx) * 4;
      temp[idx] = r / wSum;
      temp[idx + 1] = g / wSum;
      temp[idx + 2] = b / wSum;
      temp[idx + 3] = a / wSum;
    }
  }

  // Vertical pass
  for (let cy = startY; cy < endY; cy++) {
    for (let cx = startX; cx < endX; cx++) {
      let r = 0, g = 0, b = 0, a = 0, wSum = 0;
      for (let k = 0; k < kernel.length; k++) {
        const py = cy + k - halfK;
        if (py < 0 || py >= src.height) continue;
        const idx = (py * src.width + cx) * 4;
        const weight = kernel[k];
        r += temp[idx] * weight;
        g += temp[idx + 1] * weight;
        b += temp[idx + 2] * weight;
        a += temp[idx + 3] * weight;
        wSum += weight;
      }
      const idx = (cy * src.width + cx) * 4;
      dst[idx] = r / wSum;
      dst[idx + 1] = g / wSum;
      dst[idx + 2] = b / wSum;
      dst[idx + 3] = a / wSum;
    }
  }

  return new ImageData(dst, src.width, src.height);
}

function buildGaussianKernel(radius: number): number[] {
  const sigma = Math.max(radius / 2, 1);
  const size = Math.ceil(radius * 2 + 1);
  const half = Math.floor(size / 2);
  const kernel: number[] = [];
  let sum = 0;

  for (let i = 0; i < size; i++) {
    const x = i - half;
    const val = Math.exp(-(x * x) / (2 * sigma * sigma));
    kernel.push(val);
    sum += val;
  }

  return kernel.map((v) => v / sum);
}

/**
 * Draw spotlight effect: dims everything outside the specified bounds.
 * ctx must have the full image already drawn on canvas.
 */
export function drawSpotlight(
  ctx: CanvasRenderingContext2D,
  bounds: { x: number; y: number; width: number; height: number },
  canvasWidth: number,
  canvasHeight: number,
  dimColor: string = "rgba(0, 0, 0, 0.6)",
  featherRadius: number = 20
) {
  ctx.save();

  // Create a feathered spotlight using radial gradients at corners + center rect
  const { x, y, width, height } = bounds;
  const outer = ctx.createRadialGradient(
    x + width / 2, y + height / 2, Math.max(width, height) / 2,
    x + width / 2, y + height / 2, Math.max(width, height) / 2 + featherRadius
  );
  outer.addColorStop(0, "rgba(0,0,0,0)");
  outer.addColorStop(1, dimColor);

  // Draw dimming overlay
  ctx.fillStyle = dimColor;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Cut out the spotlight area with gradient edge
  ctx.globalCompositeOperation = "destination-out";
  ctx.fillStyle = "white";
  ctx.fillRect(x, y, width, height);
  ctx.fillStyle = outer;
  ctx.fillRect(
    x - featherRadius,
    y - featherRadius,
    width + featherRadius * 2,
    height + featherRadius * 2
  );

  ctx.restore();
}

/**
 * Magnifier: returns the zoomed pixel data for a region.
 */
export function renderMagnifier(
  canvas: HTMLCanvasElement,
  centerX: number,
  centerY: number,
  zoom: number = 2,
  size: number = 100
): HTMLCanvasElement {
  const magCanvas = document.createElement("canvas");
  magCanvas.width = size;
  magCanvas.height = size;
  const magCtx = magCanvas.getContext("2d")!;

  const halfSize = (size / zoom) / 2;

  // Draw zoomed region
  magCtx.imageSmoothingEnabled = false;
  magCtx.drawImage(
    canvas,
    centerX - halfSize,
    centerY - halfSize,
    size / zoom,
    size / zoom,
    0, 0,
    size, size
  );

  // Draw crosshair
  magCtx.strokeStyle = "rgba(255, 255, 255, 0.8)";
  magCtx.lineWidth = 1;
  magCtx.beginPath();
  magCtx.moveTo(size / 2, 0);
  magCtx.lineTo(size / 2, size);
  magCtx.moveTo(0, size / 2);
  magCtx.lineTo(size, size / 2);
  magCtx.stroke();

  // Border
  magCtx.strokeStyle = "#FF1493";
  magCtx.lineWidth = 2;
  magCtx.strokeRect(0, 0, size, size);

  return magCanvas;
}
