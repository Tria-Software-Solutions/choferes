import { useState, useEffect, useCallback } from "react";
import * as ScheduleService from "../services/scheduleService";
import { Schedule } from "../models/Schedule";

export const useSchedules = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [totalCountSchedules, setTotalCountSchedules] = useState(0);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);

  const getSchedules = useCallback(async () => {
    setIsLoadingSchedules(true);
    try {
      const data = await ScheduleService.getSchedules();
      setSchedules(data);
      setTotalCountSchedules(data.length);
    } catch (error) {
      console.error("Error fetching schedules:", error);
    } finally {
      setIsLoadingSchedules(false);
    }
  }, []);

  const createSchedule = async (newSchedule: Omit<Schedule, "id">) => {
    const createdSchedule = await ScheduleService.createSchedule(newSchedule);
    setSchedules((prev) => [...prev, createdSchedule]);
    setTotalCountSchedules((prev) => prev + 1);
  };

  const updateSchedule = async (
    id: number,
    updatedSchedule: Partial<Schedule>
  ) => {
    await ScheduleService.updateSchedule(id, updatedSchedule);
    setSchedules((prev) =>
      prev.map((schedule) =>
        schedule.id === id ? { ...schedule, ...updatedSchedule } : schedule
      )
    );
  };

  const deleteSchedule = async (id: number) => {
    await ScheduleService.deleteSchedule(id);
    setSchedules((prev) => prev.filter((schedule) => schedule.id !== id));
    setTotalCountSchedules((prev) => prev - 1);
  };

  useEffect(() => {
    getSchedules();
  }, [getSchedules]);

  return {
    schedules,
    totalCountSchedules,
    isLoadingSchedules,
    getSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
  };
};
