import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { ArrowLeft, CalendarDays, Clock3, Mail, UsersRound, Wallet } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Employee } from "../../models/Employee";
import * as EmployeeService from "../../services/employeeService";
import { useAuthContext } from "../../context/AuthContext";
import PERMISSIONS from "../../constants/permissions.constants";
import EmployeeAvatar from "../../components/EmployeeAvatar/EmployeeAvatar.component";
import PersonalInfoTab from "./components/PersonalInfoTab";
import HoursTab from "./components/HoursTab";
import PaymentsTab from "./components/PaymentsTab";
import VacationsTab from "./components/VacationsTab";
import LicensesTab from "./components/LicensesTab";
import DisciplinaryTab from "./components/DisciplinaryTab";
import { formatMoney } from "../../utils/paymentSlipPdf";
import {
  avatarRingStyles,
  backButtonStyles,
  centeredCardContentStyles,
  contentBoxStyles,
  detailBoxStyles,
  detailHeaderStyles,
  emailStyles,
  identityBoxStyles,
  metaChipStyles,
  metaChipsRowStyles,
  nameStyles,
  premiumCardStyles,
  tabsBoxStyles,
} from "./styles";

type TabKey =
  | "datos"
  | "horas"
  | "pagos"
  | "vacaciones"
  | "licencias"
  | "amonestaciones";

// Employee detail page: personal data, hours, biweekly payments (boletas)
// and vacation requests for a single employee.
const EmployeeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const { userPermissions } = useAuthContext();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("datos");

  const canViewPayments = userPermissions.includes(PERMISSIONS.VIEW_PAYMENTS);
  const canViewVacations = userPermissions.includes(PERMISSIONS.VIEW_VACATIONS);
  const canViewLicenses = userPermissions.includes(PERMISSIONS.VIEW_LICENSES);
  const canViewDisciplinary = userPermissions.includes(PERMISSIONS.VIEW_DISCIPLINARY);

  const employeeId = parseInt(id || "", 10);

  const loadEmployee = useCallback(async () => {
    if (Number.isNaN(employeeId)) {
      setLoadError("Empleado inválido");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await EmployeeService.getEmployeeById(employeeId);
      setEmployee(data);
    } catch {
      setLoadError("No se pudo cargar el empleado");
    } finally {
      setIsLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    loadEmployee();
  }, [loadEmployee]);

  const handleEmployeeUpdated = useCallback((updated: Employee) => {
    setEmployee(updated);
  }, []);

  if (isLoading) {
    return (
      <Box sx={detailBoxStyles}>
        <Paper elevation={0} sx={premiumCardStyles(theme)}>
          <Box sx={centeredCardContentStyles}>
            <CircularProgress size={30} />
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Cargando empleado…
            </Typography>
          </Box>
        </Paper>
      </Box>
    );
  }

  if (loadError || !employee) {
    return (
      <Box sx={detailBoxStyles}>
        <Paper elevation={0} sx={premiumCardStyles(theme)}>
          <Box sx={centeredCardContentStyles}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: theme.palette.text.secondary,
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(0,0,0,0.04)",
              }}
            >
              <UsersRound size={26} strokeWidth={1.5} />
            </Box>
            <Typography sx={{ fontWeight: 600, color: "text.primary" }}>
              {loadError || "Empleado no encontrado"}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<ArrowLeft size={16} />}
              onClick={() => navigate("/employees")}
            >
              Volver a empleados
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  const tabs: Array<{ key: TabKey; label: string; visible: boolean }> = [
    { key: "datos", label: "Datos", visible: true },
    { key: "horas", label: "Horas", visible: true },
    { key: "pagos", label: "Pagos", visible: canViewPayments },
    { key: "vacaciones", label: "Vacaciones", visible: canViewVacations },
    { key: "licencias", label: "Licencias", visible: canViewLicenses },
    { key: "amonestaciones", label: "Amonestaciones", visible: canViewDisciplinary },
  ];
  const visibleTabs = tabs.filter((item) => item.visible);
  const activeTab = visibleTabs.some((item) => item.key === tab) ? tab : visibleTabs[0].key;

  const registeredAt = employee.createdAt
    ? format(new Date(employee.createdAt), "dd MMM yyyy", { locale: es })
    : null;

  return (
    <Box className="scrollable-content" sx={detailBoxStyles}>
      <Paper elevation={0} sx={premiumCardStyles(theme)}>
        {/* Header: back navigation + identity + quick metrics */}
        <Box sx={detailHeaderStyles(theme)}>
          <Button
            startIcon={<ArrowLeft size={18} />}
            onClick={() => navigate("/employees")}
            sx={backButtonStyles(theme)}
          >
            {isSmallScreen ? "Volver" : "Empleados"}
          </Button>

          <Box sx={identityBoxStyles}>
            <Box sx={avatarRingStyles(theme)}>
              <EmployeeAvatar
                employee={employee}
                size={isSmallScreen ? 52 : 64}
                sx={{ border: `2px solid ${theme.palette.background.paper}` }}
              />
            </Box>

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
                <Typography sx={nameStyles}>
                  {employee.firstName} {employee.lastName}
                </Typography>
                <Chip
                  size="small"
                  label={employee.isActive === false ? "Inactivo" : "Activo"}
                  color={employee.isActive === false ? "default" : "success"}
                  variant={employee.isActive === false ? "outlined" : "filled"}
                />
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, minWidth: 0 }}>
                <Mail
                  size={13}
                  strokeWidth={1.75}
                  style={{ flexShrink: 0, opacity: 0.5 }}
                />
                <Typography sx={emailStyles}>
                  {employee.email || "Sin correo registrado"}
                </Typography>
              </Box>

              <Box sx={metaChipsRowStyles}>
                <Box component="span" sx={metaChipStyles(theme)}>
                  <Wallet size={13} strokeWidth={1.75} style={{ opacity: 0.7 }} />
                  {employee.hourlyRate != null
                    ? `${formatMoney(Number(employee.hourlyRate), "CRC")}/h`
                    : "Sin tarifa"}
                </Box>
                <Box component="span" sx={metaChipStyles(theme)}>
                  <CalendarDays size={13} strokeWidth={1.75} style={{ opacity: 0.7 }} />
                  {employee.vacationDays != null
                    ? `${employee.vacationDays} días disponibles`
                    : "Sin saldo de vacaciones"}
                </Box>
                {registeredAt && (
                  <Box component="span" sx={metaChipStyles(theme)}>
                    <Clock3 size={13} strokeWidth={1.75} style={{ opacity: 0.7 }} />
                    Registrado el {registeredAt}
                  </Box>
                )}
              </Box>
            </Box>
          </Box>

          <Box sx={tabsBoxStyles}>
            <Tabs
              value={activeTab}
              onChange={(_event, value: TabKey) => setTab(value)}
              variant={isSmallScreen ? "scrollable" : "standard"}
              scrollButtons={isSmallScreen ? "auto" : false}
              allowScrollButtonsMobile
            >
              {visibleTabs.map((item) => (
                <Tab key={item.key} value={item.key} label={item.label} />
              ))}
            </Tabs>
          </Box>
        </Box>

        <Box sx={contentBoxStyles(theme)}>
          {activeTab === "datos" && (
            <PersonalInfoTab
              employee={employee}
              onEmployeeUpdated={handleEmployeeUpdated}
              onEmployeeRefresh={loadEmployee}
            />
          )}
          {activeTab === "horas" && <HoursTab employee={employee} />}
          {activeTab === "pagos" && (
            <PaymentsTab employee={employee} onEmployeeRefresh={loadEmployee} />
          )}
          {activeTab === "vacaciones" && (
            <VacationsTab employee={employee} onEmployeeRefresh={loadEmployee} />
          )}
          {activeTab === "licencias" && <LicensesTab employee={employee} />}
          {activeTab === "amonestaciones" && <DisciplinaryTab employee={employee} />}
        </Box>
      </Paper>
    </Box>
  );
};

export default EmployeeDetailPage;
