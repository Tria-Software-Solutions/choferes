import { Request, Response } from "express";
import {
  allowSelfOrPermission,
  allowSelfWithPermission,
  requirePermission,
} from "../middleware/authorize";
import type { AuthenticatedRequest } from "../middleware/authorize";

const makeRes = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return res as unknown as Response;
};

const makeReq = (
  user: AuthenticatedRequest["user"],
  params: Record<string, string> = {},
): AuthenticatedRequest => ({ user, params } as AuthenticatedRequest);

describe("requirePermission", () => {
  it("deja pasar a quien tiene el permiso", () => {
    const next = jest.fn();
    requirePermission("employees:view")(
      makeReq({ id: 1, roles: [], permissions: ["employees:view"] }),
      makeRes(),
      next,
    );
    expect(next).toHaveBeenCalled();
  });

  it("deja pasar al comodín", () => {
    const next = jest.fn();
    requirePermission("employees:view")(
      makeReq({ id: 1, roles: [], permissions: ["*"] }),
      makeRes(),
      next,
    );
    expect(next).toHaveBeenCalled();
  });

  it("responde 403 sin el permiso", () => {
    const res = makeRes();
    const next = jest.fn();
    requirePermission("employees:view")(makeReq({ id: 1, roles: [], permissions: [] }), res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("responde 401 sin usuario", () => {
    const res = makeRes();
    requirePermission("employees:view")(makeReq(undefined), res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(401);
  });
});

describe("allowSelfWithPermission", () => {
  const middleware = allowSelfWithPermission("profile:edit", "users:edit");

  it("permite editar la propia cuenta con el permiso de autoservicio", () => {
    const next = jest.fn();
    middleware(
      makeReq({ id: 7, roles: [], permissions: ["profile:edit"] }, { id: "7" }),
      makeRes(),
      next,
    );
    expect(next).toHaveBeenCalled();
  });

  it("bloquea la propia cuenta sin el permiso de autoservicio", () => {
    const res = makeRes();
    const next = jest.fn();
    middleware(makeReq({ id: 7, roles: [], permissions: [] }, { id: "7" }), res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("permite editar otra cuenta con el permiso de gestión", () => {
    const next = jest.fn();
    middleware(
      makeReq({ id: 7, roles: [], permissions: ["users:edit"] }, { id: "9" }),
      makeRes(),
      next,
    );
    expect(next).toHaveBeenCalled();
  });

  it("bloquea otra cuenta con solo el permiso de autoservicio", () => {
    const res = makeRes();
    const next = jest.fn();
    middleware(
      makeReq({ id: 7, roles: [], permissions: ["profile:edit"] }, { id: "9" }),
      res,
      next,
    );
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});

describe("allowSelfOrPermission", () => {
  it("permite la propia cuenta sin más", () => {
    const next = jest.fn();
    allowSelfOrPermission("users:edit")(
      makeReq({ id: 3, roles: [], permissions: [] }, { id: "3" }),
      makeRes(),
      next,
    );
    expect(next).toHaveBeenCalled();
  });
});
