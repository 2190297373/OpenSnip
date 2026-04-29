import React, { useEffect, useRef } from "react";

interface MagnifierProps {
  imageData?: string; // Base64 image data
  position: { x: number; y: number };
  zoom?: number;
  size?: number;
}

export function Magnifier({
  imageData,
  position,
  zoom = 4,
  size = 150,
}: MagnifierProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isVisible = true;

  // Draw magnified view
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageData) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Clear canvas
      ctx.clearRect(0, 0, size, size);

      // Calculate source area (what to zoom in on)
      const sourceSize = size / zoom;
      const sourceX = position.x - sourceSize / 2;
      const sourceY = position.y - sourceSize / 2;

      // Draw magnified area
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(
        img,
        sourceX,
        sourceY,
        sourceSize,
        sourceSize,
        0,
        0,
        size,
        size
      );

      // Draw crosshair
      const centerX = size / 2;
      const centerY = size / 2;

      ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
      ctx.lineWidth = 1;

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(size, centerY);
      ctx.stroke();

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(centerX, 0);
      ctx.lineTo(centerX, size);
      ctx.stroke();

      // Center dot
      ctx.fillStyle = "rgba(255, 0, 0, 0.8)";
      ctx.beginPath();
      ctx.arc(centerX, centerY, 2, 0, Math.PI * 2);
      ctx.fill();

      // Border
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, size, size);
    };
    img.src = imageData;
  }, [imageData, position, zoom, size]);

  if (!isVisible || !imageData) return null;

  // Position magnifier near cursor but not blocking it
  const magnifierStyle: React.CSSProperties = {
    position: "fixed",
    left: position.x + 20,
    top: position.y + 20,
    width: size,
    height: size,
    borderRadius: "50%",
    overflow: "hidden",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5), 0 0 0 2px white",
    cursor: "none",
    zIndex: 9999,
  };

  return (
    <div style={magnifierStyle}>
      <canvas ref={canvasRef} width={size} height={size} />
    </div>
  );
}

export default Magnifier;
