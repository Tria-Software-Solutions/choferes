"use strict";

/**
 * Reescribe las rutas de las notificaciones ya guardadas a las nuevas, en inglés.
 *
 * Las rutas de la app pasaron de español a inglés (`/mi-panel` -> `/my-panel` y los
 * `?tab=` a claves inglesas). Ese cambio no alcanza a lo que ya está en la base:
 * `notifications.actionUrl` guarda el destino como texto, así que las filas
 * previas a la migración quedarían apuntando a rutas que ya no existen y el
 * destinatario caería en un 404 al abrirlas.
 *
 * Además normaliza `?tab=usuarios` a `?tab=users`: esa variante quedó guardada en
 * producción y nunca coincidió con la pestaña real, así que abría Configuración
 * sin pestaña en lugar de la de Usuarios.
 *
 * Solo datos: no toca el esquema.
 */

// Valor viejo -> valor nuevo. Los `?tab=` se resuelven por separado porque el
// mismo nombre de tab vale en dos rutas distintas.
const ROUTE_RENAMES = {
  "/mi-panel": "/my-panel",
};

const TAB_RENAMES = {
  horas: "hours",
  vacaciones: "vacations",
  pagos: "payments",
  expediente: "record",
  licencias: "licenses",
  // Variantes que nunca fueron claves válidas.
  usuarios: "users",
  usuario: "users",
  datos: "data",
  personal: "profile",
  quickaccess: "quick-access",
  amonestaciones: "disciplinary",
};

/** Divide "/ruta?tab=x&otro=y" en su ruta y sus params. */
const splitUrl = (actionUrl) => {
  const [path, query = ""] = actionUrl.split("?");
  const params = new URLSearchParams(query);
  return { path, params };
};

/** Aplica los renombres a una URL. Devuelve la original si no cambia. */
const renameUrl = (actionUrl) => {
  const { path, params } = splitUrl(actionUrl);
  const nextPath = ROUTE_RENAMES[path] ?? path;

  let changed = nextPath !== path;
  for (const [from, to] of Object.entries(TAB_RENAMES)) {
    // Solo el parámetro `tab`; otros (?task=) no se tocan.
    if (params.get("tab") === from) {
      params.set("tab", to);
      changed = true;
    }
  }

  if (!changed) return null;
  const query = params.toString();
  return query ? `${nextPath}?${query}` : nextPath;
};

module.exports = {
  async up(queryInterface) {
    const { sequelize } = queryInterface;

    const rows = await sequelize.query(
      `SELECT DISTINCT "actionUrl" FROM notifications
       WHERE "actionUrl" IS NOT NULL AND "actionUrl" LIKE '/%'`,
      { type: sequelize.QueryTypes.SELECT },
    );

    const updates = rows
      .map((row) => [renameUrl(row.actionUrl), row.actionUrl])
      .filter(([next]) => next !== null);

    if (updates.length === 0) return;

    await sequelize.transaction(async (transaction) => {
      for (const [next, current] of updates) {
        await sequelize.query(
          `UPDATE notifications SET "actionUrl" = :next WHERE "actionUrl" = :current`,
          { replacements: { next, current }, transaction },
        );
      }
    });
  },

  async down(queryInterface) {
    const { sequelize } = queryInterface;

    const rows = await sequelize.query(
      `SELECT DISTINCT "actionUrl" FROM notifications
       WHERE "actionUrl" IS NOT NULL AND "actionUrl" LIKE '/%'`,
      { type: sequelize.QueryTypes.SELECT },
    );

    // Tablos a los que se vuelve. `users` no se deshace a propósito: es la
    // única forma de distinguir la fila que ya era `?tab=users` de la que era
    // la variante rota `?tab=usuarios`, y deshacer la segunda dejaría la primera
    // en un valor que nunca existió.
    const INVERSE_TABS = {
      hours: "horas",
      vacations: "vacaciones",
      payments: "pagos",
      record: "expediente",
      licenses: "licencias",
      data: "datos",
      profile: "personal",
      "quick-access": "quickaccess",
      disciplinary: "amonestaciones",
    };

    const updates = [];
    for (const row of rows) {
      const { path, params } = splitUrl(row.actionUrl);
      let changed = false;

      const tab = params.get("tab");
      if (tab && INVERSE_TABS[tab]) {
        params.set("tab", INVERSE_TABS[tab]);
        changed = true;
      }

      const nextPath = path === "/my-panel" ? "/mi-panel" : path;
      if (nextPath !== path) changed = true;

      if (!changed) continue;
      const query = params.toString();
      updates.push([query ? `${nextPath}?${query}` : nextPath, row.actionUrl]);
    }

    if (updates.length === 0) return;

    await sequelize.transaction(async (transaction) => {
      for (const [next, current] of updates) {
        await sequelize.query(
          `UPDATE notifications SET "actionUrl" = :next WHERE "actionUrl" = :current`,
          { replacements: { next, current }, transaction },
        );
      }
    });
  },
};
