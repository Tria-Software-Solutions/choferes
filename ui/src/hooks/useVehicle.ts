import { useState, useEffect, useCallback } from "react";
import * as VehicleService from "../services/vehicleService";
import { Vehicle } from "../models/Vehicle";

export const useVehicles = (selectedDate?: string) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  const [totalCountVehicles, setTotalCountVehicles] = useState(0);
  const [totalCountAlVehicles, setTotalCountAlVehicles] = useState(0);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);

  const getVehicles = useCallback(
    async (page: number = 1, perPage: number = 10) => {
      setIsLoadingVehicles(true);
      try {
        const data = await VehicleService.getVehicles(page, perPage);
        setAllVehicles(data);
        setTotalCountAlVehicles(data.length);
      } catch (error) {
        console.error("Error fetching vehicles", error);
      } finally {
        setIsLoadingVehicles(false);
      }
    },
    []
  );

  const getVehiclesByDate = useCallback(async (date: string) => {
    setIsLoadingVehicles(true);
    try {
      const data = await VehicleService.getVehiclesByDate(date);
      setVehicles(data);
      setTotalCountVehicles(data.length);
    } catch (error) {
      console.error("Error fetching vehicles by date", error);
    } finally {
      setIsLoadingVehicles(false);
    }
  }, []);

  const createVehicle = async (newVehicle: Omit<Vehicle, "id">) => {
    const createdVehicle = await VehicleService.createVehicle(newVehicle);
    setVehicles((prev) => [...prev, createdVehicle]);
    setAllVehicles((prev) => [...prev, createdVehicle]);
    setTotalCountAlVehicles((prev) => prev + 1);
  };

  const updateVehicle = async (
    id: number,
    updatedVehicle: Partial<Vehicle>
  ) => {
    await VehicleService.updateVehicle(id, updatedVehicle);
    setVehicles((prev) =>
      prev.map((vehicle) =>
        vehicle.id === id ? { ...vehicle, ...updatedVehicle } : vehicle
      )
    );
    setAllVehicles((prev) =>
      prev.map((vehicle) =>
        vehicle.id === id ? { ...vehicle, ...updatedVehicle } : vehicle
      )
    );
  };

  const deleteVehicle = async (id: number) => {
    await VehicleService.deleteVehicle(id);
    setVehicles((prev) => prev.filter((vehicle) => vehicle.id !== id));
    setAllVehicles((prev) => prev.filter((vehicle) => vehicle.id !== id));
    setTotalCountAlVehicles((prev) => prev - 1);
  };

  useEffect(() => {
    getVehicles();
  }, [getVehicles]);

  useEffect(() => {
    if (selectedDate) {
      getVehiclesByDate(selectedDate);
    }
  }, [selectedDate, getVehiclesByDate]);

  return {
    vehicles,
    allVehicles,
    setAllVehicles,
    totalCountVehicles,
    totalCountAlVehicles,
    isLoadingVehicles,
    getVehicles,
    getVehiclesByDate,
    createVehicle,
    updateVehicle,
    deleteVehicle,
  };
};
