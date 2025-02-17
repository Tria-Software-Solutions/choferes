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
    newBiweeklySummary: BiweeklySummary
  ) => {
    await BiweeklySummaryService.addBiweeklySummary(newBiweeklySummary);
    setBiweeklySummaries((prev) => [...prev, newBiweeklySummary]);
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
    newBiweeklySummary: BiweeklySummary
  ) => {
    const existingSummary = biweeklySummaries.find(
      (summary) => summary.id === newBiweeklySummary.id
    );

    if (existingSummary) {
      await BiweeklySummaryService.updateBiweeklySummary(
        newBiweeklySummary.id!,
        newBiweeklySummary
      );
      setBiweeklySummaries((prev) =>
        prev.map((summary) =>
          summary.id === newBiweeklySummary.id
            ? { ...summary, ...newBiweeklySummary }
            : summary
        )
      );
    } else {
      await BiweeklySummaryService.addBiweeklySummary(newBiweeklySummary);
      setBiweeklySummaries((prev) => [...prev, newBiweeklySummary]);
      setTotalCount((prev) => prev + 1);
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
