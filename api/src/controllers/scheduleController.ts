import { Request, Response } from 'express';
import * as scheduleService from '../services/scheduleService';

export const getSchedules = async (req: Request, res: Response) => {
  try {
    const schedules = await scheduleService.getSchedules();
    return res.status(200).json(schedules);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching Schedules', error });
  }
};

export const getScheduleById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const schedule = await scheduleService.getScheduleById(id);
    if (schedule) {
      return res.status(200).json(schedule);
    } else {
      return res.status(404).json({ message: 'Schedule not found' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching Schedule', error });
  }
};

export const createSchedule = async (req: Request, res: Response) => {
  try {
    const newSchedule = await scheduleService.createSchedule(req.body);
    return res.status(201).json(newSchedule);
  } catch (error) {
    return res.status(500).json({ message: 'Error creating Schedule', error });
  }
};

export const updateSchedule = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const updatedSchedule = await scheduleService.updateSchedule(id, req.body);
    if (updatedSchedule) {
      return res.status(200).json(updatedSchedule);
    } else {
      return res.status(404).json({ message: 'Schedule not found' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error updating Schedule', error });
  }
};

export const deleteSchedule = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await scheduleService.deleteSchedule(id);
    if (deleted) {
      return res.status(204).end();
    } else {
      return res.status(404).json({ message: 'Schedule not found' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting Schedule', error });
  }
};
