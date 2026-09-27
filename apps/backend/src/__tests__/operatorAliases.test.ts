// Services use Sequelize v4 string operators ($or, $iLike, $lt, ...). Only the
// aliases registered in config/database.js are recognized; any other `$op`
// key makes every query that uses it throw "Invalid value" at runtime. Service
// tests mock the models, so this guard checks the source directly.
import fs from "fs";
import path from "path";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const sequelize = require("../config/database");

const SERVICES_DIR = path.resolve(__dirname, "../services");
const OPERATOR_KEY = /\$([a-zA-Z]+)\s*:/g;

const collectOperators = (): Map<string, string[]> => {
  const found = new Map<string, string[]>();
  fs.readdirSync(SERVICES_DIR)
    .filter((file) => file.endsWith(".ts"))
    .forEach((file) => {
      const source = fs.readFileSync(path.join(SERVICES_DIR, file), "utf8");
      [...source.matchAll(OPERATOR_KEY)].forEach(([, name]) => {
        const key = `$${name}`;
        found.set(key, [...(found.get(key) ?? []), file]);
      });
    });
  return found;
};

describe("Sequelize operator aliases", () => {
  it("registra cada operador $op usado en los servicios", () => {
    const registered = Object.keys(sequelize.options.operatorsAliases ?? {});
    const missing = [...collectOperators().entries()].filter(
      ([operator]) => !registered.includes(operator),
    );

    expect(missing).toEqual([]);
  });

  it("genera SQL válido para el filtro de antigüedad de notificaciones", () => {
    const where = sequelize
      .getQueryInterface()
      .QueryGenerator.whereQuery({ userId: 1, createdAt: { $lt: new Date("2026-01-01") } });

    expect(where).toContain('"createdAt" <');
  });
});
