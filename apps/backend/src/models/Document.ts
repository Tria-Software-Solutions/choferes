import { Model, DataTypes } from "sequelize";
import { Employee } from "./Employee";
import { DocumentFolder } from "./DocumentFolder";
import sequelize from "../config/database";

// Archivo subido a la página de Documentos. El binario vive en un bucket
// S3-compatible y la fila guarda su clave (`storageKey`). Los archivos antiguos
// todavía pueden traer el contenido como data URL base64 en `data`; los nuevos
// lo dejan vacío. Ámbito del archivo: `ownerEmployeeId` con valor = archivo del
// empleado; `ownerUserId` con valor = archivo privado de ese usuario ("Solo para
// mí"); ambos null = compartido. Nunca están definidos los dos a la vez.
export class Document extends Model {
  public id!: number;

  public folderId?: number | null;

  public ownerEmployeeId?: number | null;

  /** Usuario dueño del archivo privado ("Solo para mí"); null salvo ese caso. */
  public ownerUserId?: number | null;

  public name!: string;

  public mimeType?: string | null;

  /** Tamaño en bytes del archivo original. */
  public size!: number;

  /**
   * Contenido como data URL base64 (`data:<mime>;base64,...`). Solo lo usan los
   * archivos creados antes de mover el binario al bucket; los nuevos van en
   * `storageKey`.
   */
  public data?: string | null;

  /** Clave del objeto en el bucket S3-compatible (null en archivos antiguos). */
  public storageKey?: string | null;

  /** Proveedor de almacenamiento de `storageKey` (p. ej. "s3"). */
  public storageProvider?: string | null;

  /** Sube en cada guardado del editor; cambia la clave para invalidar cachés. */
  public revision!: number;

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
    ownerUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "users", key: "id" },
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
      allowNull: true,
    },
    storageKey: {
      type: DataTypes.STRING(512),
      allowNull: true,
    },
    storageProvider: {
      type: DataTypes.STRING(32),
      allowNull: true,
    },
    revision: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
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
