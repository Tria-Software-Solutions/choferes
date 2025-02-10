import { useState, useEffect, useCallback } from "react";
import * as ScheduleService from "../services/scheduleService";
import { Schedule } from "../models/Schedule";

export const useSchedules = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);

  const fetchSchedules = useCallback(async () => {
    setIsLoadingSchedules(true);
    try {
      const data = await ScheduleService.fetchSchedules();
      setSchedules(data);
      setTotalCount(data.length);
    } catch (error) {
      console.error("Error fetching schedules:", error);
    } finally {
      setIsLoadingSchedules(false);
    }
  }, []);

  const handleAddSchedule = async (newSchedule: Schedule) => {
    await ScheduleService.addSchedule(newSchedule);
    setSchedules((prev) => [...prev, newSchedule]);
    setTotalCount((prev) => prev + 1);
  };

  const handleUpdateSchedule = async (
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

  const handleDeleteSchedule = async (id: number) => {
    await ScheduleService.deleteSchedule(id);
    setSchedules((prev) => prev.filter((schedule) => schedule.id !== id));
    setTotalCount((prev) => prev - 1);
  };

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  return {
    schedules,
    totalCount,
    isLoadingSchedules,
    fetchSchedules,
    handleAddSchedule,
    handleUpdateSchedule,
    handleDeleteSchedule,
  };
};
