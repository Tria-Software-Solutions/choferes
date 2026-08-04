// ─── PDF icon shapes (official Lucide icon geometry, 24x24 viewBox) ───
// jsPDF cannot render font icons, so the PDF header/legend icons are drawn
// as stroked vectors using the same path data as the `lucide-react` icons
// used in the UI (stroke-width 2 in a 24x24 viewBox, scaled by export.ts).

export type PdfIconElement =
  | { type: "path"; d: string }
  | { type: "circle"; cx: number; cy: number; r: number };

export type PdfIcon = PdfIconElement[];

export const ICON_PERSON: PdfIcon = [
  { type: "path", d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" },
  { type: "circle", cx: 12, cy: 7, r: 4 },
];

export const ICON_CLOCK: PdfIcon = [
  { type: "circle", cx: 12, cy: 12, r: 10 },
  { type: "path", d: "M12 6v6l4 2" },
];

export const ICON_CLOCK_PLUS: PdfIcon = [
  { type: "path", d: "M12 6v6l3.644 1.822" },
  { type: "path", d: "M16 19h6" },
  { type: "path", d: "M19 16v6" },
  { type: "path", d: "M21.92 13.267a10 10 0 1 0-8.653 8.653" },
];

// ─── SVG path → jsPDF path legs ─────────────────────────────────────
// jsPDF's `path()` API consumes absolute `{op, c}` legs, so SVG path
// strings (M/m, L/l, H/h, V/v, C/c, S/s, Q/q, T/t, A/a, Z/z) are parsed
// here. Arcs are approximated with cubic beziers (standard algorithm).

export interface PdfPathLeg {
  op: "m" | "l" | "c" | "h";
  c: number[];
}

const SVG_TOKEN_RE = /[a-zA-Z]|[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/g;

function angleBetween(ux: number, uy: number, vx: number, vy: number): number {
  const dot = ux * vx + uy * vy;
  const len = Math.hypot(ux, uy) * Math.hypot(vx, vy);
  const cos = Math.max(-1, Math.min(1, len === 0 ? 0 : dot / len));
  const sign = ux * vy - uy * vx < 0 ? -1 : 1;
  return sign * Math.acos(cos);
}

/** Appends cubic-bezier legs approximating an SVG elliptical arc. */
function arcToCubics(
  legs: PdfPathLeg[],
  x1: number,
  y1: number,
  rx: number,
  ry: number,
  xAxisRotation: number,
  largeArc: boolean,
  sweep: boolean,
  x2: number,
  y2: number
): void {
  if (x1 === x2 && y1 === y2) return;
  if (rx === 0 || ry === 0) {
    legs.push({ op: "l", c: [x2, y2] });
    return;
  }

  const phi = (xAxisRotation * Math.PI) / 180;
  const cosPhi = Math.cos(phi);
  const sinPhi = Math.sin(phi);
  const dx = (x1 - x2) / 2;
  const dy = (y1 - y2) / 2;
  const x1p = cosPhi * dx + sinPhi * dy;
  const y1p = -sinPhi * dx + cosPhi * dy;

  let rxAbs = Math.abs(rx);
  let ryAbs = Math.abs(ry);
  const lambda = (x1p * x1p) / (rxAbs * rxAbs) + (y1p * y1p) / (ryAbs * ryAbs);
  if (lambda > 1) {
    rxAbs *= Math.sqrt(lambda);
    ryAbs *= Math.sqrt(lambda);
  }

  const rx2 = rxAbs * rxAbs;
  const ry2 = ryAbs * ryAbs;
  const num = rx2 * ry2 - rx2 * y1p * y1p - ry2 * x1p * x1p;
  const den = rx2 * y1p * y1p + ry2 * x1p * x1p;
  const coef =
    (den > 0 ? Math.sqrt(Math.max(0, num / den)) : 0) * (largeArc === sweep ? -1 : 1);
  const cxp = (coef * rxAbs * y1p) / ryAbs;
  const cyp = (-coef * ryAbs * x1p) / rxAbs;
  const cx = cosPhi * cxp - sinPhi * cyp + (x1 + x2) / 2;
  const cy = sinPhi * cxp + cosPhi * cyp + (y1 + y2) / 2;

  const ux = (x1p - cxp) / rxAbs;
  const uy = (y1p - cyp) / ryAbs;
  const vx = (-x1p - cxp) / rxAbs;
  const vy = (-y1p - cyp) / ryAbs;
  let theta1 = angleBetween(1, 0, ux, uy);
  let dTheta = angleBetween(ux, uy, vx, vy);
  if (!sweep && dTheta > 0) dTheta -= 2 * Math.PI;
  else if (sweep && dTheta < 0) dTheta += 2 * Math.PI;

  const segments = Math.max(1, Math.ceil(Math.abs(dTheta) / (Math.PI / 2)));
  const delta = dTheta / segments;

  const pointAt = (theta: number) => ({
    x: cosPhi * rxAbs * Math.cos(theta) - sinPhi * ryAbs * Math.sin(theta) + cx,
    y: sinPhi * rxAbs * Math.cos(theta) + cosPhi * ryAbs * Math.sin(theta) + cy,
  });

  for (let i = 0; i < segments; i += 1) {
    const theta2 = theta1 + delta;
    const p1 = pointAt(theta1);
    const p2 = pointAt(theta2);
    // Cubic approximation factor for an arc segment.
    const k = (4 / 3) * Math.tan(delta / 4);
    // Unrotated tangent vectors at each end of the segment.
    const t1x = -rxAbs * Math.sin(theta1);
    const t1y = ryAbs * Math.cos(theta1);
    const t2x = -rxAbs * Math.sin(theta2);
    const t2y = ryAbs * Math.cos(theta2);
    const c1x = p1.x + k * (cosPhi * t1x - sinPhi * t1y);
    const c1y = p1.y + k * (sinPhi * t1x + cosPhi * t1y);
    const c2x = p2.x - k * (cosPhi * t2x - sinPhi * t2y);
    const c2y = p2.y - k * (sinPhi * t2x + cosPhi * t2y);
    legs.push({ op: "c", c: [c1x, c1y, c2x, c2y, p2.x, p2.y] });
    theta1 = theta2;
  }
}

/** Converts an SVG path `d` string into absolute jsPDF path legs. */
export function parseSvgPath(d: string): PdfPathLeg[] {
  const tokens = d.match(SVG_TOKEN_RE) ?? [];
  const legs: PdfPathLeg[] = [];
  let i = 0;
  let cmd = "";
  let prevCmd = "";
  let x = 0;
  let y = 0;
  let startX = 0;
  let startY = 0;
  let prevCx = 0;
  let prevCy = 0;

  const num = (): number => parseFloat(tokens[i++]);
  const numPair = (): [number, number] => [num(), num()];

  while (i < tokens.length) {
    const token = tokens[i];
    if (/[a-zA-Z]/.test(token)) {
      cmd = token;
      i += 1;
    } else if (!cmd) {
      break;
    }

    const rel = cmd === cmd.toLowerCase();
    const c = cmd.toUpperCase();
    const lastX = x;
    const lastY = y;
    const toAbs = (px: number, py: number): [number, number] =>
      rel ? [px + lastX, py + lastY] : [px, py];

    switch (c) {
      case "M": {
        const [px, py] = numPair();
        [x, y] = toAbs(px, py);
        startX = x;
        startY = y;
        legs.push({ op: "m", c: [x, y] });
        // Any remaining pairs after an explicit moveto are implicit linetos.
        while (i < tokens.length && !/[a-zA-Z]/.test(tokens[i])) {
          const [qx, qy] = numPair();
          [x, y] = toAbs(qx, qy);
          legs.push({ op: "l", c: [x, y] });
        }
        break;
      }
      case "L": {
        const [px, py] = numPair();
        [x, y] = toAbs(px, py);
        legs.push({ op: "l", c: [x, y] });
        break;
      }
      case "H": {
        const v = num();
        x = rel ? x + v : v;
        legs.push({ op: "l", c: [x, y] });
        break;
      }
      case "V": {
        const v = num();
        y = rel ? y + v : v;
        legs.push({ op: "l", c: [x, y] });
        break;
      }
      case "C": {
        const [c1x, c1y] = numPair();
        const [c2x, c2y] = numPair();
        const [px, py] = numPair();
        const [a1x, a1y] = toAbs(c1x, c1y);
        const [a2x, a2y] = toAbs(c2x, c2y);
        [x, y] = toAbs(px, py);
        legs.push({ op: "c", c: [a1x, a1y, a2x, a2y, x, y] });
        prevCx = a2x;
        prevCy = a2y;
        break;
      }
      case "S": {
        const [c2x, c2y] = numPair();
        const [px, py] = numPair();
        const smooth =
          prevCmd === "C" || prevCmd === "c" || prevCmd === "S" || prevCmd === "s";
        const [a1x, a1y] = smooth ? [2 * lastX - prevCx, 2 * lastY - prevCy] : [lastX, lastY];
        const [a2x, a2y] = toAbs(c2x, c2y);
        [x, y] = toAbs(px, py);
        legs.push({ op: "c", c: [a1x, a1y, a2x, a2y, x, y] });
        prevCx = a2x;
        prevCy = a2y;
        break;
      }
      case "Q": {
        const [c1x, c1y] = numPair();
        const [px, py] = numPair();
        const [a1x, a1y] = toAbs(c1x, c1y);
        [x, y] = toAbs(px, py);
        // Quadratic segment converted to an equivalent cubic.
        const cx1 = lastX + (2 / 3) * (a1x - lastX);
        const cy1 = lastY + (2 / 3) * (a1y - lastY);
        const cx2 = x + (2 / 3) * (a1x - x);
        const cy2 = y + (2 / 3) * (a1y - y);
        legs.push({ op: "c", c: [cx1, cy1, cx2, cy2, x, y] });
        prevCx = a1x;
        prevCy = a1y;
        break;
      }
      case "T": {
        const [px, py] = numPair();
        const smooth =
          prevCmd === "Q" || prevCmd === "q" || prevCmd === "T" || prevCmd === "t";
        const [a1x, a1y] = smooth ? [2 * lastX - prevCx, 2 * lastY - prevCy] : [lastX, lastY];
        [x, y] = toAbs(px, py);
        const cx1 = lastX + (2 / 3) * (a1x - lastX);
        const cy1 = lastY + (2 / 3) * (a1y - lastY);
        const cx2 = x + (2 / 3) * (a1x - x);
        const cy2 = y + (2 / 3) * (a1y - y);
        legs.push({ op: "c", c: [cx1, cy1, cx2, cy2, x, y] });
        prevCx = a1x;
        prevCy = a1y;
        break;
      }
      case "A": {
        const rx = num();
        const ry = num();
        const rot = num();
        const largeArc = num() !== 0;
        const sweep = num() !== 0;
        const [px, py] = numPair();
        [x, y] = toAbs(px, py);
        arcToCubics(legs, lastX, lastY, rx, ry, rot, largeArc, sweep, x, y);
        break;
      }
      case "Z": {
        legs.push({ op: "h", c: [] });
        x = startX;
        y = startY;
        break;
      }
    }
    prevCmd = cmd;
  }

  return legs;
}
