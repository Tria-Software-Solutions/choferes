import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";

// Employee model definition for Sequelize ORM
export class Employee extends Model {
  public id!: number; // Unique identifier for the employee
  public firstName!: string; // Employee's first name
  public lastName!: string; // Employee's last name
}

Employee.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Employee",
    tableName: "employees",
  },
);

export default Employee;
