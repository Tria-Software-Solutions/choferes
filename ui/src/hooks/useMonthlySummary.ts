import { useState, useEffect, useCallback } from "react";
import * as MonthlySummaryService from "../services/monthlySummaryService";
import { MonthlySummary } from "../models/MonthlySummary";

// Custom hook for managing monthly summaries state and operations
export const useMonthlySummaries = () => {
  const [monthlySummaries, setMonthlySummaries] = useState<MonthlySummary[]>(
    [],
  );
  const [totalCountMonthlySummaries, setTotalCountMonthlySummaries] =
    useState(0);
  const [isLoadingMonthlySummaries, setIsLoadingMonthlySummaries] =
    useState(false);

  // Fetch all monthly summaries from the service and update state
  const getMonthlySummaries = useCallback(async () => {
    setIsLoadingMonthlySummaries(true);
    try {
      const data = await MonthlySummaryService.getMonthlySummaries();
      setMonthlySummaries(data);
      setTotalCountMonthlySummaries(data.length);
    } catch (error) {
      // console.error("Error fetching Monthly Summaries:", error);
    } finally {
      setIsLoadingMonthlySummaries(false);
    }
  }, []);

  // Fetch the current monthly summary for a specific employee and month
  const getCurrentMonthlySummary = useCallback(
    async (employeeId: number, month: number, year: number) => {
      setIsLoadingMonthlySummaries(true);
      try {
        return await MonthlySummaryService.getCurrentMonthlySummary(
          employeeId,
          month,
          year,
        );
      } catch (error) {
        // console.error("Error fetching current Biweekly Summary", error);
      } finally {
        setIsLoadingMonthlySummaries(false);
      }
    },
    [],
  );

  // Create a new monthly summary and update state
  const createMonthlySummary = async (
    newMonthlySummary: Omit<MonthlySummary, "id">,
  ) => {
    const createdMonthlySummary =
      await MonthlySummaryService.createMonthlySummary(newMonthlySummary);
    setMonthlySummaries((prev) => [...prev, createdMonthlySummary]);
    setTotalCountMonthlySummaries((prev) => prev + 1);
  };

  // Update a monthly summary and update state
  const updateMonthlySummary = async (
    id: number,
    updatedMonthlySummary: Partial<MonthlySummary>,
  ) => {
    await MonthlySummaryService.updateMonthlySummary(id, updatedMonthlySummary);
    setMonthlySummaries((prev) =>
      prev.map((monthlySummary) =>
        monthlySummary.id === id
          ? { ...monthlySummary, ...updatedMonthlySummary }
          : monthlySummary,
      ),
    );
  };

  // Create or update a monthly summary based on presence of ID
  const createOrUpdateMonthlySummary = async (
    newMonthlySummary: Omit<MonthlySummary, "id"> | MonthlySummary,
  ) => {
    if ("id" in newMonthlySummary) {
      await updateMonthlySummary(newMonthlySummary.id, newMonthlySummary);
    } else {
      await createMonthlySummary(newMonthlySummary);
    }
  };

  // Delete a monthly summary and update state
  const deleteMonthlySummary = async (id: number) => {
    await MonthlySummaryService.deleteMonthlySummary(id);
    setMonthlySummaries((prev) =>
      prev.filter((monthlySummary) => monthlySummary.id !== id),
    );
    setTotalCountMonthlySummaries((prev) => prev - 1);
  };

  // Fetch monthly summaries on mount
  useEffect(() => {
    getMonthlySummaries();
  }, [getMonthlySummaries]);

  return {
    monthlySummaries,
    totalCountMonthlySummaries,
    isLoadingMonthlySummaries,
    getMonthlySummaries,
    getCurrentMonthlySummary,
    createMonthlySummary,
    updateMonthlySummary,
    createOrUpdateMonthlySummary,
    deleteMonthlySummary,
  };
};
