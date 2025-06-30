import { useState, useEffect, useCallback } from "react";
import * as BiweeklySummaryService from "../services/biweeklySummaryService";
import { BiweeklySummary } from "../models/BiweeklySummary";

export const useBiweeklySummaries = () => {
  const [biweeklySummaries, setBiweeklySummaries] = useState<BiweeklySummary[]>(
    [],
  );
  const [totalCountBiweeklySummaries, setTotalCountBiweeklySummaries] =
    useState(0);
  const [isLoadingBiweeklySummaries, setIsLoadingBiweeklySummaries] =
    useState(false);

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

  const createBiweeklySummary = async (
    newBiweeklySummary: Omit<BiweeklySummary, "id">,
  ) => {
    const createdBiweeklySummary =
      await BiweeklySummaryService.createBiweeklySummary(newBiweeklySummary);
    setBiweeklySummaries((prev) => [...prev, createdBiweeklySummary]);
    setTotalCountBiweeklySummaries((prev) => prev + 1);
  };

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

  const createOrUpdateBiweeklySummary = async (
    newBiweeklySummary: Omit<BiweeklySummary, "id"> | BiweeklySummary,
  ) => {
    if ("id" in newBiweeklySummary) {
      await updateBiweeklySummary(newBiweeklySummary.id, newBiweeklySummary);
    } else {
      await createBiweeklySummary(newBiweeklySummary);
    }
  };

  const deleteBiweeklySummary = async (id: number) => {
    await BiweeklySummaryService.deleteBiweeklySummary(id);
    setBiweeklySummaries((prev) =>
      prev.filter((biweeklySummary) => biweeklySummary.id !== id),
    );
    setTotalCountBiweeklySummaries((prev) => prev - 1);
  };

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
