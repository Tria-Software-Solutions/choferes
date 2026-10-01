import { Model, DataTypes } from "sequelize";
import { Employee } from "./Employee";
import sequelize from "../config/database";

// Carpeta de la página de Documentos. Puede ser global (`ownerEmployeeId` null,
// compartida con toda la empresa) o personal de un empleado. Las carpetas se
// anidan con `parentId`, así que forman un árbol dentro de su ámbito.
export class DocumentFolder extends Model {
  public id!: number;

  public name!: string;

  public parentId?: number | null;

  /** null = carpeta compartida (global); con valor = carpeta de ese empleado. */
  public ownerEmployeeId?: number | null;

  /** Usuario que creó la carpeta. */
  public createdBy?: number | null;

  public createdAt!: Date;

  public updatedAt!: Date;
}

DocumentFolder.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "document_folders", key: "id" },
      onDelete: "CASCADE",
    },
    ownerEmployeeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: Employee, key: "id" },
      onDelete: "CASCADE",
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "DocumentFolder",
    tableName: "document_folders",
  },
);

export default DocumentFolder;
