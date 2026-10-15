import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";

// Nivel de acceso concedido al destinatario de un documento compartido.
export type DocumentSharePermission = "view" | "comment" | "edit";

// Compartición explícita de un archivo con un empleado (`employeeId`) o un
// usuario (`userId`). Exactamente uno de los dos está definido. El dueño del
// documento no cambia: estas filas solo conceden acceso adicional.
export class DocumentShare extends Model {
  public id!: number;

  public documentId!: number;

  public employeeId?: number | null;

  public userId?: number | null;

  public permission!: DocumentSharePermission;

  /** Usuario de gestión que concedió el acceso. */
  public createdBy?: number | null;

  public createdAt!: Date;

  public updatedAt!: Date;
}

DocumentShare.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    documentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "documents", key: "id" },
      onDelete: "CASCADE",
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "employees", key: "id" },
      onDelete: "CASCADE",
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "users", key: "id" },
      onDelete: "CASCADE",
    },
    permission: {
      type: DataTypes.STRING(16),
      allowNull: false,
      defaultValue: "view",
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "DocumentShare",
    tableName: "document_shares",
  },
);

export default DocumentShare;
