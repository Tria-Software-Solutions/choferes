import { useState, useEffect, useCallback } from "react";
import * as BiweeklySummaryService from "../services/biweeklySummaryService";
import { BiweeklySummary } from "../models/BiweeklySummary";

export const useBiweeklySummaries = () => {
  const [biweeklySummaries, setBiweeklySummaries] = useState<BiweeklySummary[]>(
    []
  );
  const [totalCount, setTotalCount] = useState(0);
  const [isLoadingBiweeklySummaries, setIsLoadingBiweeklySummaries] =
    useState(false);

  const fetchBiweeklySummaries = useCallback(async () => {
    setIsLoadingBiweeklySummaries(true);
    try {
      const data = await BiweeklySummaryService.fetchBiweeklySummaries();
      setBiweeklySummaries(data);
      setTotalCount(data.length);
    } catch (error) {
      console.error("Error fetching biweekly summaries:", error);
    } finally {
      setIsLoadingBiweeklySummaries(false);
    }
  }, []);

  const handleAddBiweeklySummary = async (
    newBiweeklySummary: Omit<BiweeklySummary, "id">
  ) => {
    const createdBiweeklySummary =
      await BiweeklySummaryService.addBiweeklySummary(newBiweeklySummary);
    setBiweeklySummaries((prev) => [...prev, createdBiweeklySummary]);
    setTotalCount((prev) => prev + 1);
  };

  const handleUpdateBiweeklySummary = async (
    id: number,
    updatedBiweeklySummary: Partial<BiweeklySummary>
  ) => {
    await BiweeklySummaryService.updateBiweeklySummary(
      id,
      updatedBiweeklySummary
    );
    setBiweeklySummaries((prev) =>
      prev.map((biweeklySummary) =>
        biweeklySummary.id === id
          ? { ...biweeklySummary, ...updatedBiweeklySummary }
          : biweeklySummary
      )
    );
  };

  const handleAddOrUpdateBiweeklySummary = async (
    newBiweeklySummary: Omit<BiweeklySummary, "id"> | BiweeklySummary
  ) => {
    if ("id" in newBiweeklySummary) {
      await handleUpdateBiweeklySummary(
        newBiweeklySummary.id,
        newBiweeklySummary
      );
    } else {
      await handleAddBiweeklySummary(newBiweeklySummary);
    }
  };

  const handleDeleteBiweeklySummary = async (id: number) => {
    await BiweeklySummaryService.deleteBiweeklySummary(id);
    setBiweeklySummaries((prev) =>
      prev.filter((biweeklySummary) => biweeklySummary.id !== id)
    );
    setTotalCount((prev) => prev - 1);
  };

  const totalBiweeklyHours =
    BiweeklySummaryService.calculateTotalBiweeklyHours(biweeklySummaries);

  useEffect(() => {
    fetchBiweeklySummaries();
  }, [fetchBiweeklySummaries]);

  return {
    biweeklySummaries,
    totalCount,
    isLoadingBiweeklySummaries,
    fetchBiweeklySummaries,
    handleAddBiweeklySummary,
    handleUpdateBiweeklySummary,
    handleAddOrUpdateBiweeklySummary,
    handleDeleteBiweeklySummary,
    totalBiweeklyHours,
  };
};
