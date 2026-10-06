// Identidad visual compartida por TODOS los documentos exportados (boleta de
// pago, reportes en PDF y en Excel): encabezado con el escudo y "Su auto…
// nuestro chofer." sobre una línea gruesa, y pie legal con el enlace del sitio.
// La boleta fue el diseño de origen; los demás exports lo reutilizan desde aquí.
import shieldLogo from "../assets/images/boleta/logo-escudo.png";
import brandLogo from "../assets/images/boleta/logo-su-auto.png";
import { COMPANY, COMPANY_FOOTER_TEXT } from "./boletaFormat";

export type Rgb = [number, number, number];

export const BRAND_INK: Rgb = [36, 36, 36]; // #242424
export const BRAND_MUTED: Rgb = [107, 114, 128]; // #6B7280
export const BRAND_LINK: Rgb = [31, 73, 125]; // #1F497D
export const BRAND_RULE: Rgb = [0, 0, 0];

// Proporciones reales de las imágenes (ancho / alto).
const SHIELD_RATIO = 174 / 184;
const BRAND_RATIO = 257 / 186;
// El lema mide 62/106 del alto del escudo y se apoya en la línea base del encabezado.
const BRAND_HEIGHT_RATIO = 62 / 106;

export interface BrandAssets {
  shield: string | null;
  brand: string | null;
}

const imageCache = new Map<string, string | null>();

export const loadImageDataUrl = async (src: string): Promise<string | null> => {
  if (imageCache.has(src)) return imageCache.get(src) ?? null;
  try {
    const blob = await (await fetch(src)).blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
    imageCache.set(src, dataUrl);
    return dataUrl;
  } catch {
    imageCache.set(src, null);
    return null;
  }
};

export const loadBrandAssets = async (): Promise<BrandAssets> => {
  const [shield, brand] = await Promise.all([loadImageDataUrl(shieldLogo), loadImageDataUrl(brandLogo)]);
  return { shield, brand };
};

/** Medidas del encabezado para una altura dada (en cualquier unidad). */
export const brandHeaderSizes = (height: number) => {
  const brandH = height * BRAND_HEIGHT_RATIO;
  return {
    shield: { w: height * SHIELD_RATIO, h: height },
    brand: { w: brandH * BRAND_RATIO, h: brandH },
  };
};

// Subconjunto de jsPDF que usan los helpers (evita acoplar este módulo al import dinámico).
interface PdfLike {
  internal: { scaleFactor: number; pageSize: { getWidth(): number; getHeight(): number } };
  addImage(data: string, format: string, x: number, y: number, w: number, h: number): unknown;
  setDrawColor(r: number, g: number, b: number): unknown;
  setLineWidth(width: number): unknown;
  line(x1: number, y1: number, x2: number, y2: number): unknown;
  setFont(name: string, style?: string): unknown;
  setFontSize(size: number): unknown;
  setTextColor(r: number, g: number, b: number): unknown;
  text(text: string, x: number, y: number, options?: { align?: string }): unknown;
  textWithLink(text: string, x: number, y: number, options: { url: string }): unknown;
  getTextWidth(text: string): number;
  getStringUnitWidth(text: string): number;
  getFontSize(): number;
}

interface HeaderBox {
  left: number;
  right: number;
  top: number;
  /** Alto del escudo, en unidades del documento. */
  height: number;
}

/**
 * Dibuja el encabezado de marca y devuelve la `y` de la línea gruesa que lo
 * cierra (en unidades del documento), para continuar debajo de ella.
 */
export function drawBrandHeader(doc: PdfLike, assets: BrandAssets, box: HeaderBox): number {
  const k = doc.internal.scaleFactor; // puntos por unidad del documento
  const sizes = brandHeaderSizes(box.height);
  const bottom = box.top + box.height;
  try {
    if (assets.shield) {
      doc.addImage(assets.shield, "PNG", box.left, box.top, sizes.shield.w, sizes.shield.h);
    }
    if (assets.brand) {
      doc.addImage(assets.brand, "PNG", box.right - sizes.brand.w, bottom - sizes.brand.h, sizes.brand.w, sizes.brand.h);
    }
  } catch {
    // Imagen ilegible: el documento sigue sin ella.
  }
  const ruleY = bottom + 6 / k;
  doc.setDrawColor(...BRAND_RULE);
  doc.setLineWidth(2.25 / k);
  doc.line(box.left, ruleY, box.right, ruleY);
  return ruleY;
}

/** Encabezado compacto (páginas siguientes): escudo pequeño, texto a la derecha y línea fina. */
export function drawCompactBrandHeader(
  doc: PdfLike,
  assets: BrandAssets,
  box: { left: number; right: number; top: number; height: number },
  label: string,
): void {
  const k = doc.internal.scaleFactor;
  const sizes = brandHeaderSizes(box.height);
  try {
    if (assets.shield) doc.addImage(assets.shield, "PNG", box.left, box.top, sizes.shield.w, sizes.shield.h);
  } catch {
    // sin imagen
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...BRAND_INK);
  doc.text(label, box.right, box.top + box.height / 2 + 1 / k, { align: "right" });
  doc.setDrawColor(...BRAND_RULE);
  doc.setLineWidth(1 / k);
  doc.line(box.left, box.top + box.height + 4 / k, box.right, box.top + box.height + 4 / k);
}

/**
 * Pie legal centrado con el sitio web como enlace. `y` es la línea base del
 * texto (unidades del documento).
 */
export function drawBrandFooter(
  doc: PdfLike,
  { y, fontSize = 8, color = BRAND_INK }: { y: number; fontSize?: number; color?: Rgb },
): void {
  const k = doc.internal.scaleFactor;
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFont("helvetica", "normal");
  doc.setFontSize(fontSize);
  const text = `${COMPANY_FOOTER_TEXT} /`;
  // getTextWidth ignora los espacios finales: se suma el espacio a mano.
  const spaceWidth = (doc.getStringUnitWidth(" ") * doc.getFontSize()) / k;
  const textWidth = doc.getTextWidth(text) + spaceWidth;
  const linkWidth = doc.getTextWidth(COMPANY.website);
  const startX = (pageWidth - textWidth - linkWidth) / 2;
  doc.setTextColor(...color);
  doc.text(text, startX, y);
  doc.setTextColor(...BRAND_LINK);
  doc.textWithLink(COMPANY.website, startX + textWidth, y, { url: COMPANY.websiteUrl });
  doc.setDrawColor(...BRAND_LINK);
  doc.setLineWidth(0.4 / k);
  doc.line(startX + textWidth, y + 1.2 / k, startX + textWidth + linkWidth, y + 1.2 / k);
  doc.setTextColor(...BRAND_INK);
}
