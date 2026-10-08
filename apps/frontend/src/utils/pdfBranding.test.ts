import { brandHeaderSizes } from "./pdfBranding";

describe("brandHeaderSizes", () => {
  it("reproduces the pay slip header sizes (shield 100×106, motto 86×62)", () => {
    const { shield, brand } = brandHeaderSizes(106);
    expect(Math.round(shield.w)).toBe(100);
    expect(shield.h).toBe(106);
    expect(Math.round(brand.w)).toBe(86);
    expect(Math.round(brand.h)).toBe(62);
  });

  it("scales proportionally", () => {
    const small = brandHeaderSizes(53);
    const big = brandHeaderSizes(106);
    expect(small.shield.w * 2).toBeCloseTo(big.shield.w, 5);
    expect(small.brand.h * 2).toBeCloseTo(big.brand.h, 5);
  });
});
