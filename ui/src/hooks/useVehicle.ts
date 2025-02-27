import { useState, useEffect, useCallback } from "react";
import * as VehicleService from "../services/vehicleService";
import { Vehicle } from "../models/Vehicle";

export const useVehicles = (
  selectedDate?: string,
) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  const [count, setCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);

  const fetchVehicles = useCallback(
    async (page: number = 1, perPage: number = 10) => {
      setIsLoadingVehicles(true);
      try {
        const data = await VehicleService.fetchVehicles(page, perPage);
        setAllVehicles(data);
        setTotalCount(data.length);
      } catch (error) {
        console.error("Error fetching vehicles", error);
      } finally {
        setIsLoadingVehicles(false);
      }
    },
    []
  );

  const fetchVehiclesByDate = useCallback(
    async (date: string) => {
      setIsLoadingVehicles(true);
      try {
        const data = await VehicleService.getVehiclesByDate(date);
        setVehicles(data);
        setCount(data.length);
      } catch (error) {
        console.error("Error fetching vehicles by date", error);
      } finally {
        setIsLoadingVehicles(false);
      }
    },
    []
  );

  const handleAddVehicle = async (newVehicle: Vehicle) => {
    await VehicleService.addVehicle(newVehicle);
    setVehicles((prev) => [...prev, newVehicle]);
    setTotalCount((prev) => prev + 1);
  };

  const handleUpdateVehicle = async (
    id: number,
    updatedVehicle: Partial<Vehicle>
  ) => {
    await VehicleService.updateVehicle(id, updatedVehicle);
    setVehicles((prev) =>
      prev.map((vehicle) =>
        vehicle.id === id ? { ...vehicle, ...updatedVehicle } : vehicle
      )
    );
  };

  const handleDeleteVehicle = async (id: number) => {
    await VehicleService.deleteVehicle(id);
    setVehicles((prev) => prev.filter((vehicle) => vehicle.id !== id));
    setTotalCount((prev) => prev - 1);
  };

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  useEffect(() => {
    if (selectedDate) {
      fetchVehiclesByDate(selectedDate); 
    }
  }, [selectedDate, fetchVehiclesByDate]);

  return {
    vehicles,
    allVehicles,
    count,
    totalCount,
    isLoadingVehicles,
    fetchVehicles,
    fetchVehiclesByDate,
    handleAddVehicle,
    handleUpdateVehicle,
    handleDeleteVehicle,
  };
};
