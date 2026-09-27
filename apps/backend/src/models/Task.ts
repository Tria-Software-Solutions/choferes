import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";

export type TaskRecurrence = "none" | "daily" | "weekdays" | "weekly" | "monthly" | "yearly";

export interface TaskSubtask {
  id: string;
  title: string;
  done: boolean;
}

// Task model: an item of a user's to-do list, with optional due date, reminder,
// priority, recurrence and checklist steps.
export class Task extends Model {
  public id!: number; // Unique identifier for the task

  public userId!: number; // Owner

  public listId?: number | null; // List (null = default "Tareas" inbox)

  public title!: string; // What to do

  public notes?: string | null; // Free-form notes

  public dueDate?: string | null; // Due day (YYYY-MM-DD)

  public dueTime?: string | null; // Optional due time (HH:mm)

  public remindAt?: Date | null; // When to send the reminder notification

  public reminderSentAt?: Date | null; // When the reminder was delivered

  public priority!: number; // 0 none · 1 low · 2 medium · 3 high

  public isImportant!: boolean; // Starred

  public recurrence!: TaskRecurrence; // Repeats when completed

  public subtasks!: TaskSubtask[]; // Checklist steps

  public position!: number; // Manual order inside its list

  public completedAt?: Date | null; // Completion timestamp (null = open)

  public createdAt!: Date; // Record creation timestamp

  public updatedAt!: Date; // Record update timestamp
}

Task.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    listId: { type: DataTypes.INTEGER, allowNull: true },
    title: { type: DataTypes.STRING(500), allowNull: false },
    notes: { type: DataTypes.TEXT, allowNull: true },
    dueDate: { type: DataTypes.DATEONLY, allowNull: true },
    dueTime: { type: DataTypes.STRING(5), allowNull: true },
    remindAt: { type: DataTypes.DATE, allowNull: true },
    reminderSentAt: { type: DataTypes.DATE, allowNull: true },
    priority: { type: DataTypes.SMALLINT, allowNull: false, defaultValue: 0 },
    isImportant: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    recurrence: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "none" },
    subtasks: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
    position: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    completedAt: { type: DataTypes.DATE, allowNull: true },
  },
  {
    sequelize,
    modelName: "Task",
    tableName: "tasks",
  },
);

export default Task;
