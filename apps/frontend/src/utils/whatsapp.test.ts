import { canMessageOnWhatsApp, toInternationalPhone, whatsappLink } from './whatsapp';

describe('toInternationalPhone', () => {
  it('antepone el código de Costa Rica a los 8 dígitos nacionales', () => {
    expect(toInternationalPhone('83123456')).toBe('50683123456');
    expect(toInternationalPhone('8312-3456')).toBe('50683123456');
    expect(toInternationalPhone('+506 8312 3456')).toBe('50683123456');
  });

  it('respeta el número que ya trae código de país', () => {
    expect(toInternationalPhone('50683123456')).toBe('50683123456');
  });

  it('quita el 8 duplicado del convencional de 9 dígitos', () => {
    expect(toInternationalPhone('881234567')).toBe('50681234567');
  });

  it('no inventa un número cuando el valor no es un teléfono', () => {
    expect(toInternationalPhone('')).toBeNull();
    expect(toInternationalPhone(null)).toBeNull();
    expect(toInternationalPhone('12345')).toBeNull();
    expect(toInternationalPhone('506831234')).toBeNull();
  });
});

describe('canMessageOnWhatsApp', () => {
  it('acepta los móviles 6xxx, 7xxx y 8xxx', () => {
    expect(canMessageOnWhatsApp('60123456')).toBe(true);
    expect(canMessageOnWhatsApp('70123456')).toBe(true);
    expect(canMessageOnWhatsApp('83123456')).toBe(true);
  });

  it('descarta los fijos, que no pueden tener WhatsApp', () => {
    expect(canMessageOnWhatsApp('22345678')).toBe(false);
  });

  it('descarta lo que no es teléfono', () => {
    expect(canMessageOnWhatsApp(null)).toBe(false);
    expect(canMessageOnWhatsApp('abc')).toBe(false);
  });
});

describe('whatsappLink', () => {
  it('arma el enlace wa.me con el número internacional', () => {
    expect(whatsappLink('8312-3456')).toBe('https://wa.me/50683123456');
  });

  it('no devuelve enlace para fijos ni valores inválidos', () => {
    expect(whatsappLink('2234-5678')).toBeNull();
    expect(whatsappLink(null)).toBeNull();
  });
});
