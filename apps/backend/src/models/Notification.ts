import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";

// Notification model definition for Sequelize ORM
export class Notification extends Model {
  public id!: number; // Unique identifier for the notification

  public userId!: number; // User the notification belongs to

  public title!: string; // Notification title

  public message!: string; // Notification message body

  public type!: "info" | "success" | "warning" | "error"; // Notification type

  public category!: "employee" | "schedule" | "vehicle" | "system" | "report"; // Notification category

  public priority!: "low" | "medium" | "high"; // Notification priority

  public read!: boolean; // Whether the notification has been read

  public actionUrl?: string; // Optional URL for the action button

  public actionText?: string; // Optional text for the action button

  public source?: string; // Dedupe key (e.g. "payment-1:2026-07") to avoid duplicates

  public createdAt!: Date; // Record creation timestamp

  public updatedAt!: Date; // Record update timestamp
}

Notification.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "info",
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "system",
    },
    priority: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "medium",
    },
    read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    actionUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    actionText: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    source: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Notification",
    tableName: "notifications",
  },
);

export default Notification;
