import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, Button, useTheme } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  IconAlertTriangle,
  IconBeach,
  IconClock,
  IconFolder,
  IconId,
  IconLayoutDashboard,
  IconLinkOff,
  IconReceipt,
  IconShieldExclamation,
  IconUser,
} from "@tabler/icons-react";
import { useAuthContext } from "../../context/AuthContext";
import type { MyPanelOverview } from "../../models/MyPanel";
import { getMyOverview } from "../../services/meService";
import { EmptyState, PageCard, PageContainer } from "../../components/Layout";
import { contentBoxStyles } from "../EmployeeDetail/styles";
import {
  getTabAlerts,
  hasDrivingPosition,
  isLinkedOverview,
  resolvePanelTab,
  type PanelTabKey,
} from "./panelModel";
import { DataTab } from "./components/DataTab";
import { DisciplinaryTab } from "./components/DisciplinaryTab";
import { DocumentsTab } from "./components/DocumentsTab";
import { HoursTab } from "./components/HoursTab";
import { LicensesTab } from "./components/LicensesTab";
import { MyPanelHeader, type PanelTabDescriptor } from "./components/MyPanelHeader";
import { MyVacationRequestDialog } from "./components/MyVacationRequestDialog";
import { PanelSkeleton } from "./components/PanelSkeleton";
import { PaymentsTab } from "./components/PaymentsTab";
import { SummaryTab } from "./components/SummaryTab";
import { VacationsTab } from "./components/VacationsTab";

const TAB_DEFINITIONS: { key: PanelTabKey; label: string; icon: React.ElementType }[] = [
  { key: "summary", label: "Resumen", icon: IconLayoutDashboard },
  { key: "data", label: "Datos", icon: IconUser },
  { key: "hours", label: "Horas", icon: IconClock },
  { key: "vacations", label: "Vacaciones", icon: IconBeach },
  { key: "payments", label: "Pagos", icon: IconReceipt },
  { key: "licenses", label: "Licencias", icon: IconId },
  { key: "disciplinary", label: "Amonestaciones", icon: IconShieldExclamation },
  { key: "documents", label: "Documentos", icon: IconFolder },
];  // Panel personal ("Mi Panel"): la información del empleado vinculado al usuario
  // que inició sesión. "Resumen" concentra lo más importante y el detalle se
  // reparte en las mismas pestañas del expediente de administración: Datos (con
  // vehículos), Licencias (solo para puestos que conducen) y Amonestaciones,
  // además de Horas, Vacaciones y Pagos. Todo proviene de GET /me/overview, que
  // el servidor resuelve a partir de users.employeeId, así que un usuario solo ve
  // su propia información. La pestaña activa vive en la URL (?tab=hours) para
  // poder enlazarla y sobrevivir a una recarga. Las claves van en inglés aunque
  // las etiquetas se muestren en español.
const MyPanel: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser } = useAuthContext();
  const contentRef = useRef<HTMLDivElement>(null);

  const [overview, setOverview] = useState<MyPanelOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vacationOpen, setVacationOpen] = useState(false);

  const requestedTab = searchParams.get("tab");
  const activeTab: PanelTabKey = resolvePanelTab(requestedTab) ?? "summary";

  const setTab = useCallback(
    (tab: PanelTabKey) => {
      setSearchParams(tab === "summary" ? {} : { tab }, { replace: true });
      if (contentRef.current) contentRef.current.scrollTop = 0;
    },
    [setSearchParams],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setOverview(await getMyOverview());
    } catch {
      setError("No se pudo cargar tu panel. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Refresco sin vaciar la pantalla (botón de actualizar y tras enviar una solicitud).
  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      setOverview(await getMyOverview());
    } catch {
      // Conserva los datos actuales si el refresco falla.
    } finally {
      setRefreshing(false);
    }
  }, []);

  const linked = isLinkedOverview(overview) ? overview : null;
  const now = new Date();

  // La pestaña de Licencias es de quien conduce: para el resto no aplica.
  const visibleTabDefinitions = useMemo(() => {
    if (!linked || hasDrivingPosition(linked.employee)) return TAB_DEFINITIONS;
    return TAB_DEFINITIONS.filter((tab) => tab.key !== "licenses");
  }, [linked]);

  // Un ?tab= que este empleado no tiene (p. ej. Licencias sin puesto de chofer)
  // cae a Resumen en vez de renderizar una sección que no le toca.
  const activeVisibleTab: PanelTabKey = visibleTabDefinitions.some(
    (tab) => tab.key === activeTab,
  )
    ? activeTab
    : "summary";

  const tabs: PanelTabDescriptor[] = useMemo(() => {
    const alerts = getTabAlerts(overview);
    return visibleTabDefinitions.map((tab) => ({ ...tab, alert: alerts[tab.key] }));
  }, [overview, visibleTabDefinitions]);

  const openVacationRequest = () => setVacationOpen(true);

  const renderTab = (data: NonNullable<typeof linked>) => {
    switch (activeVisibleTab) {
      case "hours":
        return <HoursTab overview={data} now={now} />;
      case "vacations":
        return <VacationsTab overview={data} now={now} onRequest={openVacationRequest} />;
      case "payments":
        return <PaymentsTab overview={data} />;
      case "data":
        return <DataTab overview={data} onRefresh={refresh} />;
      case "licenses":
        return <LicensesTab overview={data} onRefresh={refresh} />;
      case "disciplinary":
        return <DisciplinaryTab overview={data} />;
      case "documents":
        return <DocumentsTab />;
      default:
        return <SummaryTab overview={data} now={now} onOpenTab={setTab} onNavigate={navigate} />;
    }
  };

  const renderContent = () => {
    if (linked) {
      // `key` reinicia la animación de entrada al cambiar de pestaña.
      return (
        <Box key={activeVisibleTab} sx={{ display: "flex", flexDirection: "column", flex: "1 0 auto" }}>
          {renderTab(linked)}
        </Box>
      );
    }
    if (loading) return <PanelSkeleton />;
    if (error) {
      return (
        <EmptyState
          icon={<IconAlertTriangle />}
          title="Algo salió mal"
          description={error}
          action={
            <Button variant="outlined" onClick={() => void load()}>
              Reintentar
            </Button>
          }
        />
      );
    }
    return (
      <EmptyState
        icon={<IconLinkOff />}
        title="Tu cuenta no está vinculada a un empleado"
        description="Para ver tu horario, vacaciones, pagos y demás información, administración debe vincular tu cuenta con tu registro de Planilla."
      />
    );
  };

  return (
    <PageContainer>
      <PageCard>
        <MyPanelHeader
          user={currentUser}
          overview={linked}
          loading={loading}
          refreshing={refreshing}
          onRefresh={() => void refresh()}
          tabs={tabs}
          showTabs={Boolean(linked) || (loading && !error)}
          activeTab={activeVisibleTab}
          onTabChange={setTab}
          now={now}
        />
        <Box ref={contentRef} sx={contentBoxStyles(theme)}>
          {renderContent()}
        </Box>
      </PageCard>

      {linked && (
        <MyVacationRequestDialog
          open={vacationOpen}
          onClose={() => setVacationOpen(false)}
          available={linked.vacationAccrual?.availableDays ?? linked.employee.vacationDays ?? null}
          onRequested={refresh}
        />
      )}
    </PageContainer>
  );
};

export default MyPanel;
