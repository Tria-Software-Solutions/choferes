// Validación de data URLs y detección del tipo real de una imagen.
//
// Los adjuntos, documentos y avatares se guardan como data URL base64 y luego
// se sirven al navegador de quien los abre. Un MIME no permitido (por ejemplo
// `text/html` o `image/svg+xml`) se ejecutaría como script en esa sesión, así
// que aquí se restringe a formatos seguros y, en el caso de imágenes, se
// verifica la firma binaria en vez de confiar en el tipo declarado por el cliente.

/** MIME permitidos para adjuntos de amonestaciones y documentos. */
export const ALLOWED_ATTACHMENT_MIME: readonly string[] = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "text/csv",
];

/** Imágenes permitidas como avatar. Sin SVG: puede contener scripts. */
export const ALLOWED_IMAGE_MIME: readonly string[] = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

const DATA_URL_PATTERN = /^data:([\w.+-]+\/[\w.+-]+);base64,([A-Za-z0-9+/=\s]+)$/;

interface ParsedDataUrl {
  mime: string;
  base64: string;
}

/** Separa un data URL base64 en `{ mime, base64 }`, o null si no es válido. */
export const parseDataUrl = (value: string): ParsedDataUrl | null => {
  if (typeof value !== "string") return null;
  const match = DATA_URL_PATTERN.exec(value);
  if (!match) return null;
  return { mime: match[1].toLowerCase(), base64: match[2] };
};

/** true si el data URL es base64 y su MIME está en la allowlist de adjuntos. */
export const isAllowedAttachmentDataUrl = (value: string): boolean => {
  const parsed = parseDataUrl(value);
  return parsed !== null && ALLOWED_ATTACHMENT_MIME.includes(parsed.mime);
};

// Firmas binarias (magic bytes) de cada formato de imagen permitido.
const IMAGE_SIGNATURES: Array<{ mime: string; test: (buffer: Buffer) => boolean }> = [
  { mime: "image/jpeg", test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  {
    mime: "image/png",
    test: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  },
  {
    mime: "image/gif",
    test: (b) => b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38,
  },
  {
    mime: "image/webp",
    test: (b) =>
      b[0] === 0x52 &&
      b[1] === 0x49 &&
      b[2] === 0x46 &&
      b[3] === 0x46 &&
      b[8] === 0x57 &&
      b[9] === 0x45 &&
      b[10] === 0x42 &&
      b[11] === 0x50,
  },
];

/** Devuelve el MIME real de la imagen según sus magic bytes, o null si no es una imagen permitida. */
export const detectImageMime = (buffer: Buffer): string | null => {
  if (!buffer || buffer.length < 12) return null;
  const match = IMAGE_SIGNATURES.find((signature) => signature.test(buffer));
  return match ? match.mime : null;
};
