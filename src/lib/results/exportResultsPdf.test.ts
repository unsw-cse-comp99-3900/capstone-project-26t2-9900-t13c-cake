import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  calculatePdfPageSlices,
  findRenderedContentBottom,
} from "./exportResultsPdf";

describe("calculatePdfPageSlices", () => {
  it("keeps content on one page when it fits", () => {
    expect(calculatePdfPageSlices(700, 1000, [])).toEqual([{ start: 0, end: 700 }]);
  });

  it("moves a result card to the next page rather than cutting through it", () => {
    expect(
      calculatePdfPageSlices(1700, 1000, [{ top: 850, bottom: 1120 }]),
    ).toEqual([
      { start: 0, end: 850 },
      { start: 850, end: 1700 },
    ]);
  });

  it("uses a normal page break when moving a block would leave a mostly empty page", () => {
    expect(
      calculatePdfPageSlices(1700, 1000, [{ top: 200, bottom: 1100 }]),
    ).toEqual([
      { start: 0, end: 1000 },
      { start: 1000, end: 1700 },
    ]);
  });

  it("returns no slices for invalid dimensions", () => {
    expect(calculatePdfPageSlices(0, 1000, [])).toEqual([]);
    expect(calculatePdfPageSlices(1000, 0, [])).toEqual([]);
  });

  it("finds the last rendered row while ignoring a pure white tail", () => {
    const width = 2;
    const height = 4;
    const pixels = new Uint8ClampedArray(width * height * 4).fill(255);
    const renderedPixelOffset = (2 * width + 1) * 4;
    pixels[renderedPixelOffset] = 0;
    pixels[renderedPixelOffset + 1] = 64;
    pixels[renderedPixelOffset + 2] = 64;

    expect(findRenderedContentBottom(pixels, width, height)).toBe(3);
  });

  it("returns zero when a rendered canvas contains no visible content", () => {
    const pixels = new Uint8ClampedArray(2 * 3 * 4).fill(255);

    expect(findRenderedContentBottom(pixels, 2, 3)).toBe(0);
  });

  it("preserves the screen surface while using an export-compatible background", () => {
    const resultsPanel = readFileSync(
      resolve(process.cwd(), "src/components/results/ResultsPanel.tsx"),
      "utf8",
    );
    const globalStyles = readFileSync(
      resolve(process.cwd(), "src/app/globals.css"),
      "utf8",
    );

    expect(resultsPanel).toContain("data-pdf-surface");
    expect(resultsPanel).toContain("bg-white/92");
    expect(globalStyles).toMatch(
      /\.pdf-export-staging \[data-pdf-surface\][\s\S]*?background-color: rgba\(255, 255, 255, 0\.92\) !important;/,
    );
  });
});
