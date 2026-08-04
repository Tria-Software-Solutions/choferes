import { API_URL } from "../services/api";

/**
 * Resolve a stored avatar value to a usable <img src>.
 *
 * Avatars are now stored as base64 data URLs (e.g. "data:image/png;base64,..."),
 * which are used as-is. Legacy avatars stored as "/uploads/avatars/..." paths
 * (files on the old ephemeral server filesystem) still get the API base URL
 * prefixed so existing rows keep working.
 */
export const getAvatarSrc = (avatar?: string | null): string | undefined => {
  if (!avatar) return undefined;
  if (avatar.startsWith("data:") || avatar.startsWith("http")) {
    return avatar;
  }
  return `${API_URL}${avatar}`;
};

/**
 * Downscale an image file before upload so the base64 data URL stored in the
 * DB stays small (avatars are displayed at ~50px, so 256px is plenty).
 * Transparent PNGs are flattened onto white so they don't come out black as
 * JPEG. Returns a new JPEG File.
 */
export const resizeAvatarFile = (file: File): Promise<File> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const MAX = 256;
      const scale = Math.min(1, MAX / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("Canvas not supported"));
        return;
      }
      // Fill white first so transparent PNGs don't come out black as JPEG
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("No se pudo procesar la imagen"));
            return;
          }
          const resized = new File([blob], file.name, {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
          resolve(resized);
        },
        "image/jpeg",
        0.85,
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo leer la imagen"));
    };
    img.src = url;
  });
