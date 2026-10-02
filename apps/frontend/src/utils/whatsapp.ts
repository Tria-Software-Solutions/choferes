/**
 * Enlaces de WhatsApp (wa.me) a partir del teléfono guardado del empleado.
 *
 * No se consulta ninguna API para saber si el número "tiene WhatsApp": no
 * existe un chequeo gratuito y confiable. wa.me resuelve solo — si el número
 * está en WhatsApp abre el chat, y si no, cae a web.whatsapp.com o a la tienda
 * de apps. Por eso el enlace es seguro siempre y no necesita validación previa.
 */

const COSTA_RICA_CODE = '506';

/** Móviles costarricenses: 8 dígitos que empiezan con 6, 7 u 8. Los fijos (2xxx) no. */
const MOBILE_PREFIXES = ['6', '7', '8'];

const onlyDigits = (value?: string | null): string => (value ?? '').replace(/\D/g, '');

/**
 * Normaliza a formato internacional sin signos: `8312-3456` → `50683123456`.
 * Devuelve `null` si el número no es un teléfono costarricense interpretable,
 * para no generar enlaces rotos.
 */
export const toInternationalPhone = (value?: string | null): string | null => {
  const digits = onlyDigits(value);
  if (!digits) return null;

  // Ya viene con código de país: 506 + 8 dígitos.
  if (digits.length === 11 && digits.startsWith(COSTA_RICA_CODE)) return digits;
  // Nacional de 8 dígitos.
  if (digits.length === 8) return `${COSTA_RICA_CODE}${digits}`;
  // Convencional de 9 dígitos con el 8 de móvil duplicado: 881234567 → 50681234567.
  if (digits.length === 9 && digits.startsWith('8')) return `${COSTA_RICA_CODE}${digits.slice(1)}`;

  return null;
};

/**
 * `true` si el número puede tener WhatsApp. Los fijos (2xxx) se descartan para
 * no ofrecer un icono que casi nunca va a funcionar.
 */
export const canMessageOnWhatsApp = (value?: string | null): boolean => {
  const international = toInternationalPhone(value);
  if (!international) return false;
  return MOBILE_PREFIXES.includes(international.charAt(COSTA_RICA_CODE.length));
};

/** Enlace wa.me, o `null` si el número no admite WhatsApp. */
export const whatsappLink = (value?: string | null): string | null =>
  canMessageOnWhatsApp(value) ? `https://wa.me/${toInternationalPhone(value)}` : null;
