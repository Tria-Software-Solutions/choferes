"use strict";

// Stub no-op (2026-07-31): esta migración figura en el SequelizeMeta de la
// BD local pero su archivo se perdió y nunca existió en git. El esquema final
// no depende de ella, así que se restaura solo la entrada de la cadena.
// Si el archivo original aparece, reemplazar este stub.

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up() {},

  async down() {},
};
