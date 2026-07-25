import { describe, expect, it } from "vitest";
import { calculatePdfPageSlices } from "./exportResultsPdf";

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
});
