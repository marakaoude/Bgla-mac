import React from 'react';

interface QRCodeSVGProps {
  value: string;
  size?: number;
  fgColor?: string;
  bgColor?: string;
}

// Deterministic matrix generation for authentic QR-like look
export const QRCodeSVG: React.FC<QRCodeSVGProps> = ({
  value,
  size = 140,
  fgColor = '#D4AF37',
  bgColor = '#101010',
}) => {
  // Simple deterministic hash to populate modules
  const gridSize = 25;
  const hash = Array.from(value).reduce((acc, char, i) => acc + char.charCodeAt(0) * (i + 1), 0);

  // Generate matrix
  const matrix: boolean[][] = Array(gridSize)
    .fill(false)
    .map(() => Array(gridSize).fill(false));

  // Helper to draw QR finder patterns (7x7)
  const drawFinder = (startX: number, startY: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 ||
          r === 6 ||
          c === 0 ||
          c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          matrix[startY + r][startX + c] = true;
        }
      }
    }
  };

  // 3 standard finders
  drawFinder(0, 0); // Top-left
  drawFinder(gridSize - 7, 0); // Top-right
  drawFinder(0, gridSize - 7); // Bottom-left

  // Timing patterns
  for (let i = 8; i < gridSize - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Populate remainder deterministically based on input value
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      // Don't overwrite finders or timing
      const isTopLeftFinder = r < 8 && c < 8;
      const isTopRightFinder = r < 8 && c >= gridSize - 8;
      const isBottomLeftFinder = r >= gridSize - 8 && c < 8;
      const isTiming = (r === 6 && c >= 8 && c < gridSize - 8) || (c === 6 && r >= 8 && r < gridSize - 8);

      if (!isTopLeftFinder && !isTopRightFinder && !isBottomLeftFinder && !isTiming) {
        const seed = (hash * (r + 1) * 31 + c * 17 + (value.charCodeAt((r + c) % value.length) || 0)) % 100;
        matrix[r][c] = seed < 48;
      }
    }
  }

  const cellSize = size / gridSize;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="rounded-lg shadow-inner"
      style={{ backgroundColor: bgColor }}
    >
      <rect width={size} height={size} fill={bgColor} />
      {matrix.map((row, r) =>
        row.map((cell, c) =>
          cell ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize - 0.2}
              height={cellSize - 0.2}
              rx={cellSize * 0.2}
              fill={fgColor}
            />
          ) : null
        )
      )}
    </svg>
  );
};
