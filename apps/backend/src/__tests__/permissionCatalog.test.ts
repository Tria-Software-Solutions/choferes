import {
  PERMISSION_CATALOG,
  PERMISSION_CODES,
  PERMISSION_DEFINITIONS,
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

  it("grants Gerencia the full catalog", () => {
    expect([...DEFAULT_ROLE_PERMISSIONS.Gerencia].sort()).toEqual(
      PERMISSION_DEFINITIONS.map((def) => def.code).sort(),
    );
  });
});
