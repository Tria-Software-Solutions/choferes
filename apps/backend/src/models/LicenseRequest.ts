import { Model, DataTypes } from "sequelize";
import { Employee } from "./Employee";
import { EmployeeLicense } from "./EmployeeLicense";
import sequelize from "../config/database";

// Cambio de licencia propuesto por el propio empleado. El empleado no escribe
// `employee_licenses` directamente: deja aquí la solicitud y Gerencia/Administrativo
// la aprueba o la rechaza. Aprobar aplica el cambio a la licencia real.
export type LicenseRequestAction = "create" | "update" | "delete";
export type LicenseRequestStatus = "pending" | "approved" | "rejected";

export class LicenseRequest extends Model {
  public id!: number;

  public employeeId!: number;

  /** Licencia afectada; null cuando la solicitud es crear una nueva. */
  public licenseId?: number | null;

  public action!: LicenseRequestAction;

  /** Campos propuestos (licenseType, licenseNumber, issuedAt, expiresAt, notes). */
  public payload?: Record<string, unknown> | null;

  public status!: LicenseRequestStatus;

  /** Usuario que aprobó o rechazó la solicitud. */
  public reviewedBy?: number | null;

  public reviewedAt?: Date | null;

  public reviewNotes?: string | null;

  public createdAt!: Date;

  public updatedAt!: Date;
}

LicenseRequest.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Employee, key: "id" },
      onDelete: "CASCADE",
    },
    licenseId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: EmployeeLicense, key: "id" },
      onDelete: "SET NULL",
    },
    action: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    payload: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "pending",
    },
    reviewedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    reviewNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "LicenseRequest",
    tableName: "license_requests",
  },
);

export default LicenseRequest;
