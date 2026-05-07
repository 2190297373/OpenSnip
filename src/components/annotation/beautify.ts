/**
 * Beautify effects — one-click visual polish for screenshots.
 */

export interface BeautifyConfig {
  style: "basic" | "developer" | "presentation" | "macos" | "none";
  borderRadius: number;
  shadowOffset: number;
  shadowBlur: number;
  shadowColor: string;
  padding: number;
  backgroundColor: string;
  gradientStart: string;
  gradientEnd: string;
  showWindowFrame: boolean;
}

export const beautifyPresets: Record<string, BeautifyConfig> = {
  basic: {
    style: "basic",
    borderRadius: 12,
    shadowOffset: 4,
    shadowBlur: 20,
    shadowColor: "rgba(0,0,0,0.15)",
    padding: 24,
    backgroundColor: "#FFFFFF",
    gradientStart: "#FFFFFF",
    gradientEnd: "#FFFFFF",
    showWindowFrame: false,
  },
  developer: {
    style: "developer",
    borderRadius: 8,
    shadowOffset: 2,
    shadowBlur: 12,
    shadowColor: "rgba(0,0,0,0.2)",
    padding: 16,
    backgroundColor: "#1E1E1E",
    gradientStart: "#1E1E1E",
    gradientEnd: "#2D2D2D",
    showWindowFrame: true,
  },
  presentation: {
    style: "presentation",
    borderRadius: 16,
    shadowOffset: 6,
    shadowBlur: 30,
    shadowColor: "rgba(0,0,0,0.1)",
    padding: 32,
    backgroundColor: "#FFFFFF",
    gradientStart: "#667eea",
    gradientEnd: "#764ba2",
    showWindowFrame: false,
  },
  macos: {
    style: "macos",
    borderRadius: 10,
    shadowOffset: 3,
    shadowBlur: 25,
    shadowColor: "rgba(0,0,0,0.12)",
    padding: 8,
    backgroundColor: "#F5F5F5",
    gradientStart: "#F5F5F5",
    gradientEnd: "#F5F5F5",
    showWindowFrame: true,
  },
};

/**
 * Apply beautify effects to a source canvas and return a new canvas.
 */
export function applyBeautify(
  sourceCanvas: HTMLCanvasElement,
  config: BeautifyConfig
): HTMLCanvasElement {
  const { borderRadius, shadowOffset, shadowBlur, shadowColor, padding } = config;

  const contentW = sourceCanvas.width;
  const contentH = sourceCanvas.height;

  const outputW = contentW + padding * 2 + shadowBlur * 2 + shadowOffset * 2;
  const outputH = contentH + padding * 2 + shadowBlur * 2 + shadowOffset * 2;

  const canvas = document.createElement("canvas");
  canvas.width = outputW;
  canvas.height = outputH;
  const ctx = canvas.getContext("2d")!;

  const contentX = shadowBlur + shadowOffset + padding;
  const contentY = shadowBlur + shadowOffset + padding;
  const rectX = shadowBlur + shadowOffset;
  const rectY = shadowBlur + shadowOffset;
  const rectW = contentW + padding * 2;
  const rectH = contentH + padding * 2;

  // 1. Draw gradient background
  const hasGradient = config.gradientStart !== config.gradientEnd;
  if (hasGradient) {
    const grad = ctx.createLinearGradient(0, 0, outputW, outputH);
    grad.addColorStop(0, config.gradientStart);
    grad.addColorStop(1, config.gradientEnd);
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = config.backgroundColor;
  }
  ctx.fillRect(0, 0, outputW, outputH);

  // 2. Draw macOS window frame if enabled
  if (config.showWindowFrame) {
    const frameY = shadowBlur;
    const frameH = 32;
    const frameW = rectW;

    // Title bar background
    ctx.fillStyle = "rgba(0,0,0,0.06)";
    ctx.beginPath();
    ctx.moveTo(rectX + borderRadius, frameY);
    ctx.lineTo(rectX + frameW - borderRadius, frameY);
    ctx.arcTo(rectX + frameW, frameY, rectX + frameW, frameY + borderRadius, borderRadius);
    ctx.lineTo(rectX + frameW, frameY + frameH);
    ctx.lineTo(rectX, frameY + frameH);
    ctx.lineTo(rectX, frameY + borderRadius);
    ctx.arcTo(rectX, frameY, rectX + borderRadius, frameY, borderRadius);
    ctx.closePath();
    ctx.fill();

    // Traffic light buttons
    const colors = ["#FF5F56", "#FFBD2E", "#27C93F"];
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = colors[i];
      ctx.beginPath();
      ctx.arc(rectX + 20 + i * 20, frameY + frameH / 2, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 3. Draw shadow
  if (shadowBlur > 0) {
    ctx.shadowColor = shadowColor;
    ctx.shadowOffsetX = shadowOffset;
    ctx.shadowOffsetY = shadowOffset;
    ctx.shadowBlur = shadowBlur;
  }

  // 4. Draw rounded background card
  ctx.fillStyle = config.backgroundColor;
  ctx.beginPath();
  ctx.moveTo(rectX + borderRadius, rectY);
  ctx.lineTo(rectX + rectW - borderRadius, rectY);
  ctx.arcTo(rectX + rectW, rectY, rectX + rectW, rectY + borderRadius, borderRadius);
  ctx.lineTo(rectX + rectW, rectY + rectH - borderRadius);
  ctx.arcTo(rectX + rectW, rectY + rectH, rectX + rectW - borderRadius, rectY + rectH, borderRadius);
  ctx.lineTo(rectX + borderRadius, rectY + rectH);
  ctx.arcTo(rectX, rectY + rectH, rectX, rectY + rectH - borderRadius, borderRadius);
  ctx.lineTo(rectX, rectY + borderRadius);
  ctx.arcTo(rectX, rectY, rectX + borderRadius, rectY, borderRadius);
  ctx.closePath();
  ctx.fill();

  // Reset shadow
  ctx.shadowColor = "transparent";
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.shadowBlur = 0;

  // 5. Draw content with rounded clip
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(contentX + borderRadius, contentY);
  ctx.lineTo(contentX + contentW - borderRadius, contentY);
  ctx.arcTo(contentX + contentW, contentY, contentX + contentW, contentY + borderRadius, borderRadius);
  ctx.lineTo(contentX + contentW, contentY + contentH - borderRadius);
  ctx.arcTo(contentX + contentW, contentY + contentH, contentX + contentW - borderRadius, contentY + contentH, borderRadius);
  ctx.lineTo(contentX + borderRadius, contentY + contentH);
  ctx.arcTo(contentX, contentY + contentH, contentX, contentY + contentH - borderRadius, borderRadius);
  ctx.lineTo(contentX, contentY + borderRadius);
  ctx.arcTo(contentX, contentY, contentX + borderRadius, contentY, borderRadius);
  ctx.closePath();
  ctx.clip();

  ctx.drawImage(sourceCanvas, contentX, contentY);
  ctx.restore();

  return canvas;
}

/**
 * Download beautified canvas as PNG.
 */
export function downloadBeautified(canvas: HTMLCanvasElement, filename = "opensnip-beautified.png") {
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
