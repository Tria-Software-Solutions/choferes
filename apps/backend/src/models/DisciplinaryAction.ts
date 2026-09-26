import { Model, DataTypes } from "sequelize";
import { Employee } from "./Employee";
import sequelize from "../config/database";

// Llamada de atención / amonestación de un empleado. Los adjuntos se guardan
// como data URLs base64 en un arreglo JSONB (sin filesystem).
export class DisciplinaryAction extends Model {
  public id!: number;

  public employeeId!: number;

  public actionDate!: string; // YYYY-MM-DD

  public type!: string; // llamada_atencion | amonestacion_verbal | ...

  public severity!: string; // leve | grave | muy_grave

  public reason!: string;

  public description?: string | null;

  public attachments?: unknown[] | null;

  public createdBy?: number | null;

  public createdAt!: Date;

  public updatedAt!: Date;
}

DisciplinaryAction.init(
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
    actionDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    severity: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "leve",
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    attachments: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "DisciplinaryAction",
    tableName: "disciplinary_actions",
  },
);

export default DisciplinaryAction;
