import { keyframes } from "@emotion/react";

// Onda de los tres puntos del loader: cada punto crece y se desvanece en
// cascada. La animación se define aquí y se referencia desde `sx` para que
// emotion inyecte las `@keyframes` en el documento.
export const dotWave = keyframes`
  0%, 80%, 100% { transform: scale(0.5); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
`;

// Barrido de brillo de los esqueletos: la banda clara recorre el bloque.
export const shimmerSweep = keyframes`
  0% { background-position: 180% 0; }
  100% { background-position: -80% 0; }
`;

// Silueta orgánica del bloque esqueleto (morph de bordes redondeados).
export const blobMorph = keyframes`
  0%, 100% { border-radius: 46% 54% 58% 42% / 48% 44% 56% 52%; }
  33% { border-radius: 56% 44% 42% 58% / 54% 58% 42% 46%; }
  66% { border-radius: 50% 50% 54% 46% / 42% 50% 50% 58%; }
`;
