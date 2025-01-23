import { useState, useEffect, useCallback } from "react";
import * as VehicleService from "../services/vehicleService";
import { Vehicle } from "../models/Vehicle";

export const useVehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchVehicles = useCallback(
    async (page: number = 1, perPage: number = 10) => {
      setLoading(true);
      try {
        const data = await VehicleService.fetchVehicles(page, perPage);
        setVehicles(data);
        setTotalCount(data.length); 
      } catch (error) {
        console.error("Error fetching vehicles", error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleAddVehicle = async (newVehicle: Vehicle) => {
    await VehicleService.addVehicle(newVehicle);
    setVehicles((prev) => [...prev, newVehicle]);
    setTotalCount((prev) => prev + 1); 
  };

  const getVehiclesGroupedByDate = useCallback(
    async (date: string, page: number = 1, perPage: number = 10) => {
      setLoading(true);
      try {
        const data = await VehicleService.getVehiclesGroupedByDate(date, page, perPage);
        setVehicles(data);
      } catch (error) {
        console.error("Error fetching grouped vehicles", error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

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

  return {
    vehicles,
    totalCount,
    loading,
    fetchVehicles,
    handleAddVehicle,
    getVehiclesGroupedByDate,
    handleUpdateVehicle,
    handleDeleteVehicle,
  };
};
