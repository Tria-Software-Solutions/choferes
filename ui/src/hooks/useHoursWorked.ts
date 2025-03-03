import { useState, useEffect, useCallback } from "react";
import * as HoursWorkedService from "../services/hoursWorkedService";
import { HoursWorked } from "../models/HoursWorked";

export const useHoursWorked = () => {
  const [hoursWorked, setHoursWorked] = useState<HoursWorked[]>([]);
  const [totalCountHoursWorked, setTotalCountHoursWorked] = useState(0);
  const [isLoadingHours, setIsLoadingHours] = useState(false);

  const fetchHoursWorked = useCallback(async (): Promise<HoursWorked[]> => {
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

  const handleAddHours = async (newHours: Omit<HoursWorked, "id">) => {
    const createdHoursWorked = await HoursWorkedService.createHoursWorked(newHours);
    setHoursWorked((prev) => [...prev, createdHoursWorked]);
    setTotalCountHoursWorked((prev) => prev + 1);
  };

  const handleUpdateHours = async (
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

  const handleAddOrUpdateHours = async (
    newHours: Omit<HoursWorked, "id"> | HoursWorked
  ) => {
    if ("id" in newHours) {
      await handleUpdateHours(newHours.id, newHours);
    } else {
      await handleAddHours(newHours);
    }
  };

  const handleDeleteHours = async (id: number) => {
    await HoursWorkedService.deleteHoursWorked(id);
    setHoursWorked((prev) => prev.filter((hours) => hours.id !== id));
    setTotalCountHoursWorked((prev) => prev - 1);
  };

  useEffect(() => {
    fetchHoursWorked();
  }, [fetchHoursWorked]);

  return {
    hoursWorked,
    totalCountHoursWorked,
    isLoadingHours,
    fetchHoursWorked,
    handleAddHours,
    handleUpdateHours,
    handleAddOrUpdateHours,
    handleDeleteHours,
  };
};
