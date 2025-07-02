import { useState, useEffect, useCallback } from "react";
import * as BiweeklySummaryService from "../services/biweeklySummaryService";
import { BiweeklySummary } from "../models/BiweeklySummary";

// Custom hook for managing biweekly summaries state and operations
export const useBiweeklySummaries = () => {
  const [biweeklySummaries, setBiweeklySummaries] = useState<BiweeklySummary[]>(
    [],
  );
  const [totalCountBiweeklySummaries, setTotalCountBiweeklySummaries] =
    useState(0);
  const [isLoadingBiweeklySummaries, setIsLoadingBiweeklySummaries] =
    useState(false);

  // Fetch all biweekly summaries from the service and update state
  const getBiweeklySummaries = useCallback(async () => {
    setIsLoadingBiweeklySummaries(true);
    try {
      const data = await BiweeklySummaryService.getBiweeklySummaries();
      setBiweeklySummaries(data);
      setTotalCountBiweeklySummaries(data.length);
    } catch (error) {
      // console.error("Error fetching Biweekly Summaries:", error);
    } finally {
      setIsLoadingBiweeklySummaries(false);
    }
  }, []);

  // Fetch the current biweekly summary for a specific employee and biweek
  const getCurrentBiweeklySummary = useCallback(
    async (
      employeeId: number,
      biweekNumber: number,
      month: number,
      year: number,
    ) => {
      setIsLoadingBiweeklySummaries(true);
      try {
        return await BiweeklySummaryService.getCurrentBiweeklySummary(
          employeeId,
          biweekNumber,
          month,
          year,
        );
      } catch (error) {
        // console.error("Error fetching current Biweekly Summary", error);
      } finally {
        setIsLoadingBiweeklySummaries(false);
      }
    },
    [],
  );

  // Create a new biweekly summary and update state
  const createBiweeklySummary = async (
    newBiweeklySummary: Omit<BiweeklySummary, "id">,
  ) => {
    const createdBiweeklySummary =
      await BiweeklySummaryService.createBiweeklySummary(newBiweeklySummary);
    setBiweeklySummaries((prev) => [...prev, createdBiweeklySummary]);
    setTotalCountBiweeklySummaries((prev) => prev + 1);
  };

  // Update a biweekly summary and update state
  const updateBiweeklySummary = async (
    id: number,
    updatedBiweeklySummary: Partial<BiweeklySummary>,
  ) => {
    await BiweeklySummaryService.updateBiweeklySummary(
      id,
      updatedBiweeklySummary,
    );
    setBiweeklySummaries((prev) =>
      prev.map((biweeklySummary) =>
        biweeklySummary.id === id
          ? { ...biweeklySummary, ...updatedBiweeklySummary }
          : biweeklySummary,
      ),
    );
  };

  // Create or update a biweekly summary based on presence of ID
  const createOrUpdateBiweeklySummary = async (
    newBiweeklySummary: Omit<BiweeklySummary, "id"> | BiweeklySummary,
  ) => {
    if ("id" in newBiweeklySummary) {
      await updateBiweeklySummary(newBiweeklySummary.id, newBiweeklySummary);
    } else {
      await createBiweeklySummary(newBiweeklySummary);
    }
  };

  // Delete a biweekly summary and update state
  const deleteBiweeklySummary = async (id: number) => {
    await BiweeklySummaryService.deleteBiweeklySummary(id);
    setBiweeklySummaries((prev) =>
      prev.filter((biweeklySummary) => biweeklySummary.id !== id),
    );
    setTotalCountBiweeklySummaries((prev) => prev - 1);
  };

  // Fetch biweekly summaries on mount
  useEffect(() => {
    getBiweeklySummaries();
  }, [getBiweeklySummaries]);

  return {
    biweeklySummaries,
    totalCountBiweeklySummaries,
    isLoadingBiweeklySummaries,
    getBiweeklySummaries,
    getCurrentBiweeklySummary,
    createBiweeklySummary,
    updateBiweeklySummary,
    createOrUpdateBiweeklySummary,
    deleteBiweeklySummary,
  };
};
