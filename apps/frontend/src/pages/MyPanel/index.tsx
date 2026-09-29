import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, Button, useTheme } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  IconAlertTriangle,
  IconBeach,
  IconClock,
  IconFolder,
  IconLayoutDashboard,
  IconLinkOff,
  IconReceipt,
} from "@tabler/icons-react";
import { useAuthContext } from "../../context/AuthContext";
import type { MyPanelOverview } from "../../models/MyPanel";
import { getMyOverview } from "../../services/meService";
import { EmptyState, PageCard, PageContainer } from "../../components/Layout";
import { contentBoxStyles } from "../EmployeeDetail/styles";
import { getTabAlerts, isLinkedOverview, isPanelTabKey, type PanelTabKey } from "./panelModel";
import { HoursTab } from "./components/HoursTab";
import { MyPanelHeader, type PanelTabDescriptor } from "./components/MyPanelHeader";
import { MyVacationRequestDialog } from "./components/MyVacationRequestDialog";
import { PanelSkeleton } from "./components/PanelSkeleton";
import { PaymentsTab } from "./components/PaymentsTab";
import { RecordTab } from "./components/RecordTab";
import { SummaryTab } from "./components/SummaryTab";
import { VacationsTab } from "./components/VacationsTab";

const TAB_DEFINITIONS: { key: PanelTabKey; label: string; icon: React.ElementType }[] = [
  { key: "resumen", label: "Resumen", icon: IconLayoutDashboard },
  { key: "horas", label: "Horas", icon: IconClock },
  { key: "vacaciones", label: "Vacaciones", icon: IconBeach },
  { key: "pagos", label: "Pagos", icon: IconReceipt },
  { key: "expediente", label: "Expediente", icon: IconFolder },
];

// Panel personal ("Mi Panel"): la información del empleado vinculado al usuario
// que inició sesión. "Resumen" concentra lo más importante y el detalle se
// reparte en pestañas (horas, vacaciones, pagos y expediente). Todo proviene de
// GET /me/overview, que el servidor resuelve a partir de users.employeeId, así
// que un usuario solo ve su propia información. La pestaña activa vive en la
// URL (?tab=horas) para poder enlazarla y sobrevivir a una recarga.
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
  const activeTab: PanelTabKey = isPanelTabKey(requestedTab) ? requestedTab : "resumen";

  const setTab = useCallback(
    (tab: PanelTabKey) => {
      setSearchParams(tab === "resumen" ? {} : { tab }, { replace: true });
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

  const tabs: PanelTabDescriptor[] = useMemo(() => {
    const alerts = getTabAlerts(overview);
    return TAB_DEFINITIONS.map((tab) => ({ ...tab, alert: alerts[tab.key] }));
  }, [overview]);

  const openVacationRequest = () => setVacationOpen(true);

  const renderTab = (data: NonNullable<typeof linked>) => {
    switch (activeTab) {
      case "horas":
        return <HoursTab overview={data} now={now} />;
      case "vacaciones":
        return <VacationsTab overview={data} now={now} onRequest={openVacationRequest} />;
      case "pagos":
        return <PaymentsTab overview={data} />;
      case "expediente":
        return <RecordTab overview={data} />;
      default:
        return <SummaryTab overview={data} now={now} onOpenTab={setTab} onNavigate={navigate} />;
    }
  };

  const renderContent = () => {
    if (linked) {
      // `key` reinicia la animación de entrada al cambiar de pestaña.
      return (
        <Box key={activeTab} sx={{ display: "flex", flexDirection: "column", flex: "1 0 auto" }}>
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
          activeTab={activeTab}
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
