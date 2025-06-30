"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteHoursWorked =
  exports.updateHoursWorked =
  exports.createHoursWorked =
  exports.getHoursWorkedById =
  exports.getHoursWorked =
    void 0;
const HoursWorked_1 = require("../models/HoursWorked");
const Employee_1 = require("../models/Employee");
const Schedule_1 = require("../models/Schedule");
const getHoursWorked = async () => {
  return await HoursWorked_1.HoursWorked.findAll({
    include: [
      { model: Employee_1.Employee, attributes: ["firstName", "lastName"] },
      { model: Schedule_1.Schedule, attributes: ["days", "label", "hours"] },
    ],
  });
};
exports.getHoursWorked = getHoursWorked;
const getHoursWorkedById = async (id) => {
  return await HoursWorked_1.HoursWorked.findByPk(id, {
    include: [
      { model: Employee_1.Employee, attributes: ["firstName", "lastName"] },
      { model: Schedule_1.Schedule, attributes: ["days", "label", "hours"] },
    ],
  });
};
exports.getHoursWorkedById = getHoursWorkedById;
const createHoursWorked = async (data) => {
  const newHoursWorked = await HoursWorked_1.HoursWorked.create(data);
  await newHoursWorked.reload();
  return newHoursWorked;
};
exports.createHoursWorked = createHoursWorked;
const updateHoursWorked = async (id, data) => {
  await HoursWorked_1.HoursWorked.update(data, { where: { id } });
  return HoursWorked_1.HoursWorked.findByPk(id);
};
exports.updateHoursWorked = updateHoursWorked;
const deleteHoursWorked = async (id) => {
  return await HoursWorked_1.HoursWorked.destroy({ where: { id } });
};
exports.deleteHoursWorked = deleteHoursWorked;
//# sourceMappingURL=hoursWorkedService.js.map
