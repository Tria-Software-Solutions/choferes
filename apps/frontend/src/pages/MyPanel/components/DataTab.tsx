import React from "react";
import PersonalInfoTab from "../../EmployeeDetail/components/PersonalInfoTab";
import type { LinkedOverview } from "../panelModel";

interface DataTabProps {
  overview: LinkedOverview;
  /** Recarga el panel tras guardar los datos propios. */
  onRefresh: () => Promise<void> | void;
}

// "Datos" de Mi Panel: la misma pestaña "Datos" del expediente de gerencia
// (PersonalInfoTab), pero en modo autoservicio: cada tarjeta (información
// personal, identificación y residencia, vehículos) trae su propio botón
// "Editar" y guarda por la vía de `updateMyProfile`. Se ocultan contrato,
// compensación y acceso al sistema, que administra gerencia.
export const DataTab: React.FC<DataTabProps> = ({ overview, onRefresh }) => (
  <PersonalInfoTab
    employee={overview.employee}
    onEmployeeUpdated={() => undefined}
    onEmployeeRefresh={onRefresh}
    selfService
  />
);

export default DataTab;
