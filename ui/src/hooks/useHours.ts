import { useState, useEffect, useCallback } from "react";
import * as HoursService from "../services/hoursService";
import { HoursWorked } from "../models/HoursWorked";

export const useHours = () => {
  const [hoursWorked, setHoursWorked] = useState<HoursWorked[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoadingHours, setIsLoadingHours] = useState(false);

  const fetchHours = useCallback(async (): Promise<HoursWorked[]> => {
    setIsLoadingHours(true);
    try {
      const data = await HoursService.fetchHours();
      setHoursWorked(data);
      setTotalCount(data.length);
      return data;
    } catch (error) {
      console.error("Error fetching hours:", error);
      return [];
    } finally {
      setIsLoadingHours(false);
    }
  }, []);

  const handleAddHours = async (newHours: HoursWorked) => {
    await HoursService.addHours(newHours);
    setHoursWorked((prev) => [...prev, newHours]);
    setTotalCount((prev) => prev + 1);
  };

  const handleUpdateHours = async (
    id: number,
    updatedHours: Partial<HoursWorked>
  ) => {
    await HoursService.updateHours(id, updatedHours);
    setHoursWorked((prev) =>
      prev.map((hours) =>
        hours.id === id ? { ...hours, ...updatedHours } : hours
      )
    );
  };

  const handleAddOrUpdateHours = async (newHours: HoursWorked) => {
    const existingHours = hoursWorked.find((hours) => hours.id === newHours.id);

    if (existingHours) {
      await HoursService.updateHours(newHours.id!, newHours);
      setHoursWorked((prev) =>
        prev.map((hours) =>
          hours.id === newHours.id ? { ...hours, ...newHours } : hours
        )
      );
    } else {
      await HoursService.addHours(newHours);
      setHoursWorked((prev) => [...prev, newHours]);
    }
  };

  const handleDeleteHours = async (id: number) => {
    await HoursService.deleteHours(id);
    setHoursWorked((prev) => prev.filter((hours) => hours.id !== id));
    setTotalCount((prev) => prev - 1);
  };

  useEffect(() => {
    fetchHours();
  }, [fetchHours]);

  return {
    hoursWorked,
    totalCount,
    isLoadingHours,
    fetchHours,
    handleAddHours,
    handleUpdateHours,
    handleAddOrUpdateHours,
    handleDeleteHours,
  };
};
