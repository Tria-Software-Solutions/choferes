// Plataforma del dispositivo, para que la web móvil imite la convención de cada
// sistema. Equivale a `Platform.OS` de React Native / Expo.
export type AppPlatform = "ios" | "android" | "web";

export const getPlatform = (): AppPlatform => {
  if (typeof navigator === "undefined") return "web";
  // Solo en desarrollo: ?platform=ios|android permite revisar ambos estilos desde un navegador.
  if (process.env.NODE_ENV !== "production") {
    const fromUrl = new URLSearchParams(window.location.search).get("platform");
    if (fromUrl) sessionStorage.setItem("forcePlatform", fromUrl);
    const forced = sessionStorage.getItem("forcePlatform");
    if (forced === "ios" || forced === "android") return forced;
  }
  const ua = navigator.userAgent;
  // iPadOS 13+ se identifica como Mac pero con pantalla táctil.
  const isIpadOs = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
  if (/iPhone|iPad|iPod/.test(ua) || isIpadOs) return "ios";
  if (/Android/.test(ua)) return "android";
  return "web";
};
