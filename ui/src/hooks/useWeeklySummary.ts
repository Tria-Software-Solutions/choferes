import { useState, useEffect, useCallback } from "react";
import * as WeeklySummaryService from "../services/weeklySummaryService";
import { WeeklySummary } from "../models/WeeklySummary";

// Custom hook for managing weekly summaries state and operations
export const useWeeklySummaries = () => {
  const [weeklySummaries, setWeeklySummaries] = useState<WeeklySummary[]>([]);
  const [totalCountWeeklySummaries, setTotalCountWeeklySummaries] = useState(0);
  const [isLoadingWeeklySummaries, setIsLoadingWeeklySummaries] =
    useState(false);

  // Fetch all weekly summaries from the service and update state
  const getWeeklySummaries = useCallback(async () => {
    setIsLoadingWeeklySummaries(true);
    try {
      const data = await WeeklySummaryService.getWeeklySummaries();
      setWeeklySummaries(data);
      setTotalCountWeeklySummaries(data.length);
    } catch (error) {
      // console.error("Error fetching Weekly Summaries:", error);
    } finally {
      setIsLoadingWeeklySummaries(false);
    }
  }, []);

  // Fetch the current weekly summary for a specific employee and week
  const getCurrentWeeklySummary = useCallback(
    async (
      employeeId: number,
      weekNumber: number,
      month: number,
      year: number,
    ) => {
      setIsLoadingWeeklySummaries(true);
      try {
        return await WeeklySummaryService.getCurrentWeeklySummary(
          employeeId,
          weekNumber,
          month,
          year,
        );
      } catch (error) {
        // console.error("Error fetching current Weekly Summary", error);
      } finally {
        setIsLoadingWeeklySummaries(false);
      }
    },
    [],
  );

  // Check if an employee has worked in the current weekly summary
  const hasWorkedCurrenWeeklySummary = useCallback(
    async (
      employeeId: number,
      weekNumber: number,
      month: number,
      year: number,
    ) => {
      setIsLoadingWeeklySummaries(true);
      try {
        return await WeeklySummaryService.hasWorkedCurrenWeeklySummary(
          employeeId,
          weekNumber,
          month,
          year,
        );
      } catch (error) {
        // console.error("Error fetching current Weekly Summary", error);
      } finally {
        setIsLoadingWeeklySummaries(false);
      }
    },
    [],
  );

  // Create a new weekly summary and update state
  const createWeeklySummary = async (
    newWeeklySummary: Omit<WeeklySummary, "id">,
  ) => {
    const createdWeeklySummary =
      await WeeklySummaryService.createWeeklySummary(newWeeklySummary);
    setWeeklySummaries((prev) => [...prev, createdWeeklySummary]);
    setTotalCountWeeklySummaries((prev) => prev + 1);
  };

  // Update a weekly summary and update state
  const updateWeeklySummary = async (
    id: number,
    updatedWeeklySummary: Partial<WeeklySummary>,
  ) => {
    await WeeklySummaryService.updateWeeklySummary(id, updatedWeeklySummary);
    setWeeklySummaries((prev) =>
      prev.map((weeklySummary) =>
        weeklySummary.id === id
          ? { ...weeklySummary, ...updatedWeeklySummary }
          : weeklySummary,
      ),
    );
  };

  // Create or update a weekly summary based on presence of ID
  const createOrUpdateWeeklySummary = async (
    newWeeklySummary: Omit<WeeklySummary, "id"> | WeeklySummary,
  ) => {
    if ("id" in newWeeklySummary) {
      await updateWeeklySummary(newWeeklySummary.id, newWeeklySummary);
    } else {
      await createWeeklySummary(newWeeklySummary);
    }
  };

  // Delete a weekly summary and update state
  const deleteWeeklySummary = async (id: number) => {
    await WeeklySummaryService.deleteWeeklySummary(id);
    setWeeklySummaries((prev) =>
      prev.filter((weeklySummary) => weeklySummary.id !== id),
    );
    setTotalCountWeeklySummaries((prev) => prev - 1);
  };

  // Fetch weekly summaries on mount
  useEffect(() => {
    getWeeklySummaries();
  }, [getWeeklySummaries]);

  return {
    weeklySummaries,
    totalCountWeeklySummaries,
    isLoadingWeeklySummaries,
    getWeeklySummaries,
    getCurrentWeeklySummary,
    hasWorkedCurrenWeeklySummary,
    createWeeklySummary,
    updateWeeklySummary,
    createOrUpdateWeeklySummary,
    deleteWeeklySummary,
  };
};
