import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import EmployeeMobileHeader, { type HeaderChip } from "./components/EmployeeMobileHeader";
import { useMobileShell } from "../../hooks/useMobileShell";
import { useMobileScreenTitle } from "../../components/MobileShell/MobileScreenTitle";
import { useDispatch } from "react-redux";
import {
  Box,
  Button,
  IconButton,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { IconArrowLeft, IconBeach, IconBriefcase, IconCalendarMonth, IconCalendarX, IconId, IconMail, IconReceipt, IconShieldExclamation, IconUser, IconWallet } from "@tabler/icons-react";
import { Employee } from "../../models/Employee";
import { getEmployeePositionsLabel } from "@choferes/shared";
import * as EmployeeService from "../../services/employeeService";
import { useAuthContext } from "../../context/AuthContext";
import { PERMISSION_CODES } from "../../constants/permissions.constants";
import NOTIFICATIONS from "../../constants/notifications.constants";
import { AppDispatch } from "../../store/store";
import { deleteEmployee, updateEmployee } from "../../store/slices/employeeSlice";
import DialogComponent from "../../components/Dialog/Dialog.component";
import { useAppNotifications } from "../../components/Snackbar/Snackbar.component";
import EmployeeAvatar from "../../components/EmployeeAvatar/EmployeeAvatar.component";
import PersonalInfoTab from "./components/PersonalInfoTab";
import HoursTab from "./components/HoursTab";
import PaymentsTab from "./components/PaymentsTab";
import VacationsTab from "./components/VacationsTab";
import LicensesTab from "./components/LicensesTab";
import DisciplinaryTab from "./components/DisciplinaryTab";
import { formatMoney } from "../../utils/paymentSlipPdf";
import { EmptyState, LoadingState, PageCard, PageContainer } from "../../components/Layout";
import {
  backButtonStyles,
  contentBoxStyles,
  detailHeaderStyles,
  emailStyles,
  identityBoxStyles,
  metaChipStyles,
  metaChipsRowStyles,
  nameStyles,
  tabsBoxStyles,
} from "./styles";
import ROUTES from "../../constants/routes.constants";

type TabKey =
  | "data"
  | "hours"
  | "payments"
  | "vacations"
  | "licenses"
  | "disciplinary";

type TabDescriptor = {
  key: TabKey;
  label: string;
  icon: React.ElementType;
  visible: boolean;
};

const TAB_KEYS: readonly TabKey[] = [
  "data",
  "hours",
  "payments",
  "vacations",
  "licenses",
  "disciplinary",
];

const isTabKey = (value: string | null): value is TabKey =>
  value !== null && (TAB_KEYS as readonly string[]).includes(value);

// Employee detail page: personal data, hours, biweekly payments (boletas)
// and vacation requests for a single employee.
const EmployeeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const { userPermissions } = useAuthContext();
  const dispatch = useDispatch<AppDispatch>();
  const { showNotification } = useAppNotifications();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const isMobileShell = useMobileShell();
  // El nombre ya va en grande en el encabezado: la barra solo indica la pantalla.
  useMobileScreenTitle(employee ? "Empleado" : null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  // La pestaña vive en la URL (?tab=) para que un enlace de notificación abra
  // directo la sección, incluso si ya estás viendo otro empleado o la misma
  // ficha en otra pestaña.
  const requestedTab = searchParams.get("tab");
  const tab: TabKey = isTabKey(requestedTab) ? requestedTab : "data";
  const setTab = useCallback(
    (value: TabKey) =>
      setSearchParams(value === "data" ? {} : { tab: value }, { replace: true }),
    [setSearchParams],
  );
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openTerminationDialog, setOpenTerminationDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const canDelete = userPermissions.includes(PERMISSION_CODES.EDIT_EMPLOYEES);
  const canViewPayments = userPermissions.includes(PERMISSION_CODES.VIEW_PAYMENTS);
  const canViewVacations = userPermissions.includes(PERMISSION_CODES.VIEW_VACATIONS);
  // El backend omite estos campos si el rol no administra la compensación, así
  // que "no viene" y "no está registrado" se distinguen por permiso, no por null.
  const canSeePayroll = canViewPayments;
  const canSeeVacationBalance = canViewVacations;
  const canViewLicenses = userPermissions.includes(PERMISSION_CODES.VIEW_LICENSES);
  const canViewDisciplinary = userPermissions.includes(PERMISSION_CODES.VIEW_DISCIPLINARY);

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

  // Eliminar es una acción de página (no de un tarb): el admin la confirma y
  // vuelve al listado. Antes vivía en la columna de acciones de Planilla.
  const handleDeleteEmployee = async () => {
    if (Number.isNaN(employeeId)) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteEmployee(employeeId)).unwrap();
      showNotification(NOTIFICATIONS.EMPLOYEE_DELETE_SUCCESS, {
        severity: "success",
        duration: 3000,
      });
      navigate(ROUTES.EMPLOYEES);
    } catch (error) {
      showNotification(NOTIFICATIONS.EMPLOYEE_DELETE_ERROR, {
        severity: "error",
        duration: 5000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Marcar empleado como finalizado (egreso) - más suave que borrar.
  const handleTerminateEmployee = async () => {
    if (Number.isNaN(employeeId)) return;
    setIsDeleting(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      await dispatch(
        updateEmployee({
          id: employeeId,
          updatedEmployee: {
            terminationDate: today,
            terminationReason: "despido",
            isActive: false,
          } as Partial<Employee>,
        }),
      ).unwrap();
      await loadEmployee();
      showNotification("Empleado marcado como finalizado", { severity: "success" });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo finalizar al empleado";
      showNotification(message, { severity: "error" });
    } finally {
      setIsDeleting(false);
      setOpenTerminationDialog(false);
    }
  };

  if (isLoading) {
    return (
      <PageContainer>
        <PageCard>
          <LoadingState label="Cargando empleado…" />
        </PageCard>
      </PageContainer>
    );
  }

  if (loadError || !employee) {
    return (
      <PageContainer>
        <PageCard>
          <EmptyState
            icon={<IconUser />}
            title={loadError || "Empleado no encontrado"}
            action={
              <Button
                variant="outlined"
                startIcon={<IconArrowLeft size={16} />}
                onClick={() => navigate(ROUTES.EMPLOYEES)}
              >
                Volver a empleados
              </Button>
            }
          />
        </PageCard>
      </PageContainer>
    );
  }

  // Con un solo card, el icono del tab repite el del card para que la
  // sección se lea como una unidad (Horas, Pagos, Licencias, Amonestaciones).
  // Con varios cards (Datos, Vacaciones) el tab usa su propio icono.
  const tabs: TabDescriptor[] = [
    { key: "data", label: "Datos", icon: IconUser, visible: true },
    { key: "hours", label: "Horas", icon: IconCalendarMonth, visible: true },
    { key: "payments", label: "Pagos", icon: IconReceipt, visible: canViewPayments },
    { key: "vacations", label: "Vacaciones", icon: IconBeach, visible: canViewVacations },
    { key: "licenses", label: "Licencias", icon: IconId, visible: canViewLicenses },
    {
      key: "disciplinary",
      label: "Amonestaciones",
      icon: IconShieldExclamation,
      visible: canViewDisciplinary,
    },
  ];
  const visibleTabs = tabs.filter((item) => item.visible);
  const activeTab = visibleTabs.some((item) => item.key === tab) ? tab : visibleTabs[0].key;

  const employeePosition = getEmployeePositionsLabel(employee, employee.gender);

  const tabsBar = (
  <Box sx={tabsBoxStyles(theme)}>
    <Tabs
      value={activeTab}
      onChange={(_event, value: TabKey) => setTab(value)}
      variant={isSmallScreen ? "scrollable" : "standard"}
      // Swipe to scroll on phones; arrow buttons only ate horizontal room.
      scrollButtons={false}
      aria-label="Secciones del expediente"
    >
      {visibleTabs.map((item) => {
        const Icon = item.icon;
        return (
          <Tab
            key={item.key}
            value={item.key}
            label={item.label}
            icon={<Icon size={17} />}
            iconPosition="start"
            disableRipple
          />
        );
      })}
    </Tabs>
  </Box>
  );

  const headerChips: HeaderChip[] = [
    ...(canSeePayroll
      ? [{
          icon: <IconWallet size={14} stroke={1.75} />,
          label: employee.hourlyRate != null ? `${formatMoney(Number(employee.hourlyRate), "CRC")}/h` : "Sin tarifa",
        }]
      : []),
    ...(canSeeVacationBalance
      ? [{
          icon: <IconBeach size={14} stroke={1.75} />,
          label: employee.vacationDays != null ? `${employee.vacationDays} días disponibles` : "Sin saldo de vacaciones",
        }]
      : []),
  ];

  return (
    <PageContainer>
      <PageCard sx={isMobileShell ? { overflow: "visible" } : undefined}>
        {isMobileShell && (
          <>
            <EmployeeMobileHeader
              employee={employee}
              position={employeePosition}
              chips={headerChips}
              onTerminate={canDelete && !employee.terminationDate ? () => setOpenTerminationDialog(true) : undefined}
            />
            <Box
              sx={{
                position: "sticky",
                top: 0,
                zIndex: 5,
                backgroundColor: theme.palette.background.paper,
                borderTop: theme.tokens.borders.hairline,
                borderBottom: theme.tokens.borders.hairline,
              }}
            >
              {tabsBar}
            </Box>
          </>
        )}
        {/* Header: back navigation + identity + quick metrics */}
        {!isMobileShell && (
        <Box sx={detailHeaderStyles(theme)}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
            }}
          >
            <Button
              startIcon={<IconArrowLeft size={18} />}
              onClick={() => navigate(ROUTES.EMPLOYEES)}
              sx={backButtonStyles(theme)}
            >
              {isSmallScreen ? "Volver" : "Empleados"}
            </Button>
            {canDelete && !employee.terminationDate && (
              <Tooltip title="El empleado finalizó labores">
                <IconButton
                  color="warning"
                  aria-label="El empleado finalizó labores"
                  onClick={() => setOpenTerminationDialog(true)}
                >
                  <IconCalendarX size={20} />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          <Box sx={identityBoxStyles}>
            <EmployeeAvatar
              employee={employee}
              size={isSmallScreen ? 52 : 64}
              sx={{ border: `2px solid ${theme.palette.background.paper}` }}
            />

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
                <Typography sx={nameStyles}>
                  {employee.firstName} {employee.lastName}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, minWidth: 0 }}>
                <IconMail
                  size={13}
                  stroke={1.75}
                  style={{ flexShrink: 0, opacity: 0.5 }}
                />
                <Typography sx={emailStyles}>
                  {employee.email || "Sin correo registrado"}
                </Typography>
              </Box>

              <Box sx={metaChipsRowStyles}>
                {canSeePayroll && (
                  <Box component="span" sx={metaChipStyles(theme)}>
                    <IconWallet size={13} stroke={1.75} style={{ opacity: 0.7 }} />
                    {employee.hourlyRate != null
                      ? `${formatMoney(Number(employee.hourlyRate), "CRC")}/h`
                      : "Sin tarifa"}
                  </Box>
                )}
                {canSeeVacationBalance && (
                  <Box component="span" sx={metaChipStyles(theme)}>
                    <IconBeach size={13} stroke={1.75} style={{ opacity: 0.7 }} />
                    {employee.vacationDays != null
                      ? `${employee.vacationDays} días disponibles`
                      : "Sin saldo de vacaciones"}
                  </Box>
                )}
                {employeePosition && (
                  <Box component="span" sx={metaChipStyles(theme)}>
                    <IconBriefcase size={13} stroke={1.75} style={{ opacity: 0.7 }} />
                    {employeePosition}
                  </Box>
                )}
              </Box>
            </Box>
          </Box>

          {!isMobileShell && tabsBar}
        </Box>
        )}

        <Box sx={contentBoxStyles(theme)}>
          {activeTab === "data" && (
            <PersonalInfoTab
              employee={employee}
              onEmployeeUpdated={handleEmployeeUpdated}
              onEmployeeRefresh={loadEmployee}
            />
          )}
          {activeTab === "hours" && <HoursTab employee={employee} />}
          {activeTab === "payments" && (
            <PaymentsTab employee={employee} onEmployeeRefresh={loadEmployee} />
          )}
          {activeTab === "vacations" && (
            <VacationsTab employee={employee} onEmployeeRefresh={loadEmployee} />
          )}
          {activeTab === "licenses" && <LicensesTab employee={employee} />}
          {activeTab === "disciplinary" && <DisciplinaryTab employee={employee} />}
        </Box>
      </PageCard>

      <DialogComponent
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={() => void handleDeleteEmployee()}
        title="Eliminar empleado"
        message={`¿Seguro que quieres eliminar a ${employee.firstName} ${employee.lastName}? Esta acción no se puede deshacer.`}
        type="delete"
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={isDeleting}
      />
      <DialogComponent
        open={openTerminationDialog}
        onClose={() => setOpenTerminationDialog(false)}
        onConfirm={() => void handleTerminateEmployee()}
        title="El empleado finalizó labores"
        message={`¿Marcar a ${employee.firstName} ${employee.lastName} como finalizado? Se registrará la fecha de hoy como egreso y quedará inactivo.`}
        type="warning"
        confirmText="Confirmar finalización"
        cancelText="Cancelar"
        loading={isDeleting}
      />
    </PageContainer>
  );
};

export default EmployeeDetailPage;
