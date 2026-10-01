import { Model, DataTypes } from "sequelize";
import { Employee } from "./Employee";
import { DocumentFolder } from "./DocumentFolder";
import sequelize from "../config/database";

// Archivo subido a la página de Documentos. El binario se guarda como data URL
// base64 en `data` (mismo criterio que los adjuntos de amonestaciones): no hace
// falta infraestructura de archivos y el archivo viaja en la misma respuesta.
// `ownerEmployeeId` null = archivo compartido; con valor = archivo del empleado.
export class Document extends Model {
  public id!: number;

  public folderId?: number | null;

  public ownerEmployeeId?: number | null;

  public name!: string;

  public mimeType?: string | null;

  /** Tamaño en bytes del archivo original. */
  public size!: number;

  /** Contenido como data URL base64 (`data:<mime>;base64,...`). */
  public data!: string;

  public uploadedBy?: number | null;

  public createdAt!: Date;

  public updatedAt!: Date;
}

Document.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    folderId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: DocumentFolder, key: "id" },
      onDelete: "CASCADE",
    },
    ownerEmployeeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: Employee, key: "id" },
      onDelete: "CASCADE",
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    mimeType: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    data: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    uploadedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Document",
    tableName: "documents",
  },
);

export default Document;
