import { useState, useEffect, useCallback } from "react";
import * as MonthlySummaryService from "../services/monthlySummaryService";
import { MonthlySummary } from "../models/MonthlySummary";

export const useMonthlySummaries = () => {
  const [monthlySummaries, setMonthlySummaries] = useState<MonthlySummary[]>(
    []
  );
  const [totalCount, setTotalCount] = useState(0);
  const [isLoadingMonthlySummaries, setIsLoadingMonthlySummaries] =
    useState(false);

  const fetchMonthlySummaries = useCallback(async () => {
    setIsLoadingMonthlySummaries(true);
    try {
      const data = await MonthlySummaryService.fetchMonthlySummaries();
      setMonthlySummaries(data);
      setTotalCount(data.length);
    } catch (error) {
      console.error("Error fetching monthly summaries:", error);
    } finally {
      setIsLoadingMonthlySummaries(false);
    }
  }, []);

  const handleAddMonthlySummary = async (newMonthlySummary: MonthlySummary) => {
    await MonthlySummaryService.addMonthlySummary(newMonthlySummary);
    setMonthlySummaries((prev) => [...prev, newMonthlySummary]);
    setTotalCount((prev) => prev + 1);
  };

  const handleUpdateMonthlySummary = async (
    id: number,
    updatedMonthlySummary: Partial<MonthlySummary>
  ) => {
    await MonthlySummaryService.updateMonthlySummary(id, updatedMonthlySummary);
    setMonthlySummaries((prev) =>
      prev.map((monthlySummary) =>
        monthlySummary.id === id
          ? { ...monthlySummary, ...updatedMonthlySummary }
          : monthlySummary
      )
    );
  };

  const handleDeleteMonthlySummary = async (id: number) => {
    await MonthlySummaryService.deleteMonthlySummary(id);
    setMonthlySummaries((prev) =>
      prev.filter((monthlySummary) => monthlySummary.id !== id)
    );
    setTotalCount((prev) => prev - 1);
  };

  const handleAddOrUpdateMonthlySummary = async (
    newMonthlySummary: MonthlySummary
  ) => {
    const existingSummary = monthlySummaries.find(
      (summary) => summary.id === newMonthlySummary.id
    );

    if (existingSummary) {
      await MonthlySummaryService.updateMonthlySummary(
        newMonthlySummary.id!,
        newMonthlySummary
      );
      setMonthlySummaries((prev) =>
        prev.map((summary) =>
          summary.id === newMonthlySummary.id
            ? { ...summary, ...newMonthlySummary }
            : summary
        )
      );
    } else {
      await MonthlySummaryService.addMonthlySummary(newMonthlySummary);
      setMonthlySummaries((prev) => [...prev, newMonthlySummary]);
      setTotalCount((prev) => prev + 1);
    }
  };

  const totalMonthlyHours =
    MonthlySummaryService.calculateTotalMonthlyHours(monthlySummaries);

  useEffect(() => {
    fetchMonthlySummaries();
  }, [fetchMonthlySummaries]);

  return {
    monthlySummaries,
    totalCount,
    isLoadingMonthlySummaries,
    fetchMonthlySummaries,
    handleAddMonthlySummary,
    handleUpdateMonthlySummary,
    handleAddOrUpdateMonthlySummary,
    handleDeleteMonthlySummary,
    totalMonthlyHours,
  };
};
