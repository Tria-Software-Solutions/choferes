import { useState, useEffect, useCallback } from "react";
import * as WeeklySummaryService from "../services/weeklySummaryService";
import { WeeklySummary } from "../models/WeeklySummary";

export const useWeeklySummaries = () => {
  const [weeklySummaries, setWeeklySummaries] = useState<WeeklySummary[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoadingWeeklySummaries, setIsLoadingWeeklySummaries] =
    useState(false);

  const fetchWeeklySummaries = useCallback(async () => {
    setIsLoadingWeeklySummaries(true);
    try {
      const data = await WeeklySummaryService.fetchWeeklySummaries();
      setWeeklySummaries(data);
      setTotalCount(data.length);
    } catch (error) {
      console.error("Error fetching weekly summaries:", error);
    } finally {
      setIsLoadingWeeklySummaries(false);
    }
  }, []);

  const handleAddWeeklySummary = async (
    newWeeklySummary: Omit<WeeklySummary, "id">
  ) => {
    const createdWeeklySummary = await WeeklySummaryService.addWeeklySummary(
      newWeeklySummary
    );
    setWeeklySummaries((prev) => [...prev, createdWeeklySummary]);
    setTotalCount((prev) => prev + 1);
  };

  const handleUpdateWeeklySummary = async (
    id: number,
    updatedWeeklySummary: Partial<WeeklySummary>
  ) => {
    await WeeklySummaryService.updateWeeklySummary(id, updatedWeeklySummary);
    setWeeklySummaries((prev) =>
      prev.map((weeklySummary) =>
        weeklySummary.id === id
          ? { ...weeklySummary, ...updatedWeeklySummary }
          : weeklySummary
      )
    );
  };

  const handleAddOrUpdateWeeklySummary = async (
    newWeeklySummary: Omit<WeeklySummary, "id"> | WeeklySummary
  ) => {
    if ("id" in newWeeklySummary) {
      await handleUpdateWeeklySummary(newWeeklySummary.id, newWeeklySummary);
    } else {
      await handleAddWeeklySummary(newWeeklySummary);
    }
  };

  const handleDeleteWeeklySummary = async (id: number) => {
    await WeeklySummaryService.deleteWeeklySummary(id);
    setWeeklySummaries((prev) =>
      prev.filter((weeklySummary) => weeklySummary.id !== id)
    );
    setTotalCount((prev) => prev - 1);
  };

  const totalWeeklyHours =
    WeeklySummaryService.calculateTotalWeeklyHours(weeklySummaries);

  useEffect(() => {
    fetchWeeklySummaries();
  }, [fetchWeeklySummaries]);

  return {
    weeklySummaries,
    totalCount,
    isLoadingWeeklySummaries,
    fetchWeeklySummaries,
    handleAddWeeklySummary,
    handleUpdateWeeklySummary,
    handleAddOrUpdateWeeklySummary,
    handleDeleteWeeklySummary,
    totalWeeklyHours,
  };
};
