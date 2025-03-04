import { useState, useEffect, useCallback } from "react";
import * as HoursWorkedService from "../services/hoursWorkedService";
import { HoursWorked } from "../models/HoursWorked";

export const useHoursWorked = () => {
  const [hoursWorked, setHoursWorked] = useState<HoursWorked[]>([]);
  const [totalCountHoursWorked, setTotalCountHoursWorked] = useState(0);
  const [isLoadingHours, setIsLoadingHours] = useState(false);

  const getHoursWorked = useCallback(async (): Promise<HoursWorked[]> => {
    setIsLoadingHours(true);
    try {
      const data = await HoursWorkedService.getHoursWorked();
      setHoursWorked(data);
      setTotalCountHoursWorked(data.length);
      return data;
    } catch (error) {
      console.error("Error fetching hours:", error);
      return [];
    } finally {
      setIsLoadingHours(false);
    }
  }, []);

  const createHoursWorked = async (newHours: Omit<HoursWorked, "id">) => {
    const createdHoursWorked = await HoursWorkedService.createHoursWorked(newHours);
    setHoursWorked((prev) => [...prev, createdHoursWorked]);
    setTotalCountHoursWorked((prev) => prev + 1);
  };

  const updateHoursWorked = async (
    id: number,
    updatedHours: Partial<HoursWorked>
  ) => {
    await HoursWorkedService.updateHoursWorked(id, updatedHours);
    setHoursWorked((prev) =>
      prev.map((hours) =>
        hours.id === id ? { ...hours, ...updatedHours } : hours
      )
    );
  };

  const createOrUpdateHoursWorked = async (
    newHours: Omit<HoursWorked, "id"> | HoursWorked
  ) => {
    if ("id" in newHours) {
      await updateHoursWorked(newHours.id, newHours);
    } else {
      await createHoursWorked(newHours);
    }
  };

  const deleteHoursWorked = async (id: number) => {
    await HoursWorkedService.deleteHoursWorked(id);
    setHoursWorked((prev) => prev.filter((hours) => hours.id !== id));
    setTotalCountHoursWorked((prev) => prev - 1);
  };

  useEffect(() => {
    getHoursWorked();
  }, [getHoursWorked]);

  return {
    hoursWorked,
    totalCountHoursWorked,
    isLoadingHours,
    getHoursWorked,
    createHoursWorked,
    updateHoursWorked,
    createOrUpdateHoursWorked,
    deleteHoursWorked,
  };
};
