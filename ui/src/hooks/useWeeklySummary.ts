import { useState, useEffect, useCallback } from "react";
import * as WeeklySummaryService from "../services/weeklySummaryService";
import { WeeklySummary } from "../models/WeeklySummary";

export const useWeeklySummaries = () => {
  const [weeklySummaries, setWeeklySummaries] = useState<WeeklySummary[]>([]);
  const [totalCountWeeklySummaries, setTotalCountWeeklySummaries] = useState(0);
  const [isLoadingWeeklySummaries, setIsLoadingWeeklySummaries] =
    useState(false);

  const getWeeklySummaries = useCallback(async () => {
    setIsLoadingWeeklySummaries(true);
    try {
      const data = await WeeklySummaryService.getWeeklySummaries();
      setWeeklySummaries(data);
      setTotalCountWeeklySummaries(data.length);
    } catch (error) {
      console.error("Error fetching Weekly Summaries:", error);
    } finally {
      setIsLoadingWeeklySummaries(false);
    }
  }, []);

  const getWeeklySummaryById = useCallback(async (id: number) => {
    setIsLoadingWeeklySummaries(true);
    try {
      return await WeeklySummaryService.getWeeklySummaryById(id);
    } catch (error) {
      console.error("Error fetching Weekly Summaries by Id", error);
    } finally {
      setIsLoadingWeeklySummaries(false);
    }
  }, []);

  const createWeeklySummary = async (
    newWeeklySummary: Omit<WeeklySummary, "id">
  ) => {
    const createdWeeklySummary = await WeeklySummaryService.createWeeklySummary(
      newWeeklySummary
    );
    setWeeklySummaries((prev) => [...prev, createdWeeklySummary]);
    setTotalCountWeeklySummaries((prev) => prev + 1);
  };

  const updateWeeklySummary = async (
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

  const createOrUpdateWeeklySummary = async (
    newWeeklySummary: Omit<WeeklySummary, "id"> | WeeklySummary
  ) => {
    if ("id" in newWeeklySummary) {
      await updateWeeklySummary(newWeeklySummary.id, newWeeklySummary);
    } else {
      await createWeeklySummary(newWeeklySummary);
    }
  };

  const deleteWeeklySummary = async (id: number) => {
    await WeeklySummaryService.deleteWeeklySummary(id);
    setWeeklySummaries((prev) =>
      prev.filter((weeklySummary) => weeklySummary.id !== id)
    );
    setTotalCountWeeklySummaries((prev) => prev - 1);
  };

  useEffect(() => {
    getWeeklySummaries();
  }, [getWeeklySummaries]);

  return {
    weeklySummaries,
    totalCountWeeklySummaries,
    isLoadingWeeklySummaries,
    getWeeklySummaries,
    getWeeklySummaryById,
    createWeeklySummary,
    updateWeeklySummary,
    createOrUpdateWeeklySummary,
    deleteWeeklySummary,
  };
};
