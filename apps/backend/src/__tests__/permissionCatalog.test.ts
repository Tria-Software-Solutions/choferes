import {
  PERMISSION_CATALOG,
  PERMISSION_CODES,
  PERMISSION_DEFINITIONS,
  PERMISSION_MODULE_ORDER,
  DEFAULT_ROLE_PERMISSIONS,
  ROLE_NAMES,
  isPermissionCode,
  getPermissionByCode,
} from "../constants/permissions";

describe("permission catalog invariants", () => {
  it("defines a non-empty catalog", () => {
    expect(PERMISSION_DEFINITIONS.length).toBeGreaterThan(0);
    expect(PERMISSION_DEFINITIONS.length).toBe(Object.keys(PERMISSION_CATALOG).length);
  });

  it("has unique stable codes", () => {
    const codes = PERMISSION_DEFINITIONS.map((def) => def.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("has unique display labels", () => {
    const labels = PERMISSION_DEFINITIONS.map((def) => def.label);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it("keeps every definition complete and well-formed", () => {
    for (const def of PERMISSION_DEFINITIONS) {
      expect(def.code).toMatch(/^[a-z][a-z-]*(:[a-z-]+)+$/);
      expect(def.module.length).toBeGreaterThan(0);
      expect(def.label.length).toBeGreaterThan(0);
    }
  });

  it("uses a uniform `<resource>:<action>` code (single colon, plural resource)", () => {
    for (const def of PERMISSION_DEFINITIONS) {
      expect(def.code.match(/:/g)).toHaveLength(1);
      const [resource, action] = def.code.split(":");
      expect(resource).toBe(resource.toLowerCase());
      expect(action).toMatch(/^[a-z][a-z-]*$/);
    }
  });

  it("keeps display labels free of technical characters", () => {
    for (const def of PERMISSION_DEFINITIONS) {
      // Nada de guiones bajos, dos puntos ni códigos crudos a la vista del usuario.
      expect(def.label).not.toMatch(/[_:]/);
    }
  });

  it("groups every permission under a known module", () => {
    for (const def of PERMISSION_DEFINITIONS) {
      expect(PERMISSION_MODULE_ORDER).toContain(def.module);
    }
  });

  it("exposes PERMISSION_CODES aligned with the catalog keys", () => {
    expect(Object.keys(PERMISSION_CODES).sort()).toEqual(Object.keys(PERMISSION_CATALOG).sort());
    for (const [key, def] of Object.entries(PERMISSION_CATALOG)) {
      expect(PERMISSION_CODES[key as keyof typeof PERMISSION_CODES]).toBe(def.code);
    }
  });

  it("recognises valid codes and rejects unknown ones", () => {
    expect(isPermissionCode(PERMISSION_CODES.VIEW_ROLES)).toBe(true);
    expect(isPermissionCode("not:a:code")).toBe(false);
    expect(isPermissionCode(undefined)).toBe(false);
  });

  it("resolves definitions by code", () => {
    const def = getPermissionByCode(PERMISSION_CODES.VIEW_PAYMENTS);
    expect(def?.label).toBe("Ver Pagos");
    expect(getPermissionByCode("unknown:code")).toBeUndefined();
  });

  it("only grants default role permissions that exist in the catalog", () => {
    expect(Object.keys(DEFAULT_ROLE_PERMISSIONS).sort()).toEqual([...ROLE_NAMES].sort());
    for (const [role, codes] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
      expect(codes.length).toBeGreaterThan(0);
      for (const code of codes) {
        expect(isPermissionCode(code)).toBe(true);
      }
      const unique = new Set(codes);
      expect(unique.size).toBe(codes.length);
    }
  });

  it("grants Gerencia the full catalog except employee-only permissions", () => {
    // "Mi Panel" es la vista personal del empleado: no la tienen los roles de gestión.
    const employeeOnly = ["my-panel:view"];
    expect([...DEFAULT_ROLE_PERMISSIONS.Gerencia].sort()).toEqual(
      PERMISSION_DEFINITIONS.map((def) => def.code)
        .filter((code) => !employeeOnly.includes(code))
        .sort(),
    );
  });

  it("grants Mi Panel only to the employee roles", () => {
    const withMyPanel = Object.entries(DEFAULT_ROLE_PERMISSIONS)
      .filter(([, codes]) => codes.includes("my-panel:view"))
      .map(([role]) => role)
      .sort();

    expect(withMyPanel).toEqual(
      ["Chofer", "Chofer Coordinador", "Recepcionista", "Supervisor"].sort(),
    );
  });

  it("keeps SysAdmin identical to Gerencia", () => {
    expect([...DEFAULT_ROLE_PERMISSIONS.SysAdmin].sort()).toEqual(
      [...DEFAULT_ROLE_PERMISSIONS.Gerencia].sort(),
    );
  });

  it("makes Administrativo read-only apart from its own self-service data", () => {
    const selfService = [
      "profile:edit",
      "notifications:edit",
      "notifications:delete",
      "tasks:create",
      "tasks:edit",
      "tasks:delete",
      "vacations:request",
      // Documentos es la excepción: Administrativo también sube archivos.
      "documents:manage",
    ];
    const writes = DEFAULT_ROLE_PERMISSIONS.Administrativo.filter(
      (code) => !code.endsWith(":view") && !code.endsWith(":export"),
    );
    expect(writes.sort()).toEqual(selfService.sort());
  });

  it("limits operational roles to self-service, with Supervisor also reading Roles", () => {
    for (const role of ["Chofer", "Chofer Coordinador", "Recepcionista"]) {
      expect(DEFAULT_ROLE_PERMISSIONS[role]).not.toContain("roles:view");
      expect(DEFAULT_ROLE_PERMISSIONS[role]).not.toContain("admin:view");
    }
    const supervisor = DEFAULT_ROLE_PERMISSIONS.Supervisor;
    expect(supervisor).toContain("roles:view");
    expect(supervisor).not.toContain("roles:edit");
    expect(supervisor).not.toContain("employee-hours:edit");
    // Sin páginas de Empleados ni Horarios en el menú.
    expect(supervisor).not.toContain("employees:view");
    expect(supervisor).not.toContain("schedules:view");
    expect(supervisor).not.toContain("admin:view");
  });
});
