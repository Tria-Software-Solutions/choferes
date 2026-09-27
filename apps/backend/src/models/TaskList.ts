import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";

// TaskList model: a user's personal to-do list (page "Tareas").
export class TaskList extends Model {
  public id!: number; // Unique identifier for the list

  public userId!: number; // Owner

  public name!: string; // Display name

  public color!: string; // Palette key (indigo, sky, emerald, amber, rose, violet, slate)

  public position!: number; // Sidebar order

  public createdAt!: Date; // Record creation timestamp

  public updatedAt!: Date; // Record update timestamp
}

TaskList.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING(80), allowNull: false },
    color: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "indigo" },
    position: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  },
  {
    sequelize,
    modelName: "TaskList",
    tableName: "task_lists",
  },
);

export default TaskList;
