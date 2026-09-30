import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuthContext } from '../../../context/AuthContext';
import { Employee } from '../../../models/Employee';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../store/store';
import {
  fetchEmployees,
  fetchAllEmployees,
  createEmployee,
  updateEmployeeAvatar,
  removeEmployeeAvatar,
} from '../../../store/slices/employeeSlice';
import SearchBarComponent from '../../../components/SearchBar/SearchBar.component';
import StickyDataGridComponent from '../../../components/Table/StickyDataGrid/StickyDataGrid.component';
import { GridColDef } from '@mui/x-data-grid';
import { useEmployeeBiweeklyHours } from '../../../hooks/useEmployeeBiweeklyHours';
import { formatTenure } from '../../../utils/tenure';
import { maskNationalId, maskPhone } from '../../../utils/mask';
import PremiumTooltip from '../../../components/PremiumTooltip/PremiumTooltip.component';
import AddEmployeeForm from '../../Forms/AddEmployeeForm';
import { useAppNotifications } from '../../../components/Snackbar/Snackbar.component';
import DialogComponent from '../../../components/Dialog/Dialog.component';
import {
  Button,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { createExportOptions, exportFileFormattedDate } from '../../../utils/export';
import APPBAR_MENU from '../../../constants/appbar.constants';
import NavIcon from '../../../components/NavIcon/NavIcon.component';
import PAGE_TITLE from '../../../constants/pageTitle.constants';
import { PERMISSION_CODES } from '../../../constants/permissions.constants';
import NOTIFICATIONS from '../../../constants/notifications.constants';
import MANAGEMENT from '../../../constants/management.constants';
import { IconAlertTriangle, IconBriefcase, IconCalendarWeek, IconCamera, IconCash, IconChevronRight, IconCirclePlus, IconClockHour4, IconHourglassHigh, IconLoader2, IconMail, IconPhone, IconPlus, IconShieldExclamation, IconUsers, IconX } from "@tabler/icons-react";
import SegmentedToggle from '../../../components/SegmentedToggle/SegmentedToggle.component';
import {
  EmptyState,
  LoadingState,
  PageBody,
  PageCard,
  PageContainer,
  PageHeader,
  StatCard,
  StatGrid,
} from '../../../components/Layout';
import ExportMenu from '../../../components/ExportMenu/ExportMenu.component';
import {
  fetchLicenses,
  selectLicenses,
} from '../../../store/slices/licenseSlice';
import { PdfIcon, ExcelIcon } from '../../../components/Icons/FileIcons';
import {
  addDialogPaperSx,
  incompleteBadgeStyles,
} from './styles';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTablePreferences } from '../../../hooks/useTablePreferences';
import { useDebounce } from '../../../hooks/useDebounce';
import { getAvatarSrc, resizeAvatarFile } from '../../../utils/avatar';
import { formatMoney } from '../../../utils/paymentSlipPdf';
import EmployeeAvatar from '../../../components/EmployeeAvatar/EmployeeAvatar.component';

// Pay-related fields the employee still has no value for.
// Las horas vienen con decimales (horas × turnos): se muestran sin ceros inútiles
// ("72 h", "84.5 h") para que la columna no se ensanche.
const formatHours = (value: number): string =>
  `${Number.isInteger(value) ? value : value.toFixed(1)} h`;

const getMissingProfileFields = (employee: Employee): string[] => {
  const missing: string[] = [];
  if (employee.hourlyRate === null || employee.hourlyRate === undefined) {
    missing.push('tarifa por hora');
  }
  if (employee.vacationDays === null || employee.vacationDays === undefined) {
    missing.push('saldo de vacaciones');
  }
  return missing;
};

// Compact summary metric shown in the KPI band above the grid.

const getInitialRowsPerPage = () => {
  // Example: calculate based on window size or available height
  // You can refine this logic as needed
  if (typeof window !== 'undefined') {
    const maxHeight = window.innerHeight * 0.6;
    const headHeight = 56;
    const paginationHeight = 64;
    const extra = 24;
    const availableHeight = maxHeight - headHeight - paginationHeight - extra;
    const rowHeight = 48;
    let rows = Math.floor(availableHeight / rowHeight);
    return Math.max(3, Math.min(100, rows));
  }
  return 25;
};

// Employees management page component
const EmployeesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { userPermissions } = useAuthContext();
  const { employees, allEmployees, isLoadingEmployees } = useSelector(
    (state: RootState) => state.employees,
  );
  const { showNotification } = useAppNotifications();
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Avatar picker modal state (same UX as the user avatar modal)
  const [avatarDialogEmployee, setAvatarDialogEmployee] = useState<Employee | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  // El buscador y el filtro de estado se recuerdan entre navegaciones
  // (persistidos en localStorage junto con el resto de preferencias de la tabla).
  const { search, setSearch, statusFilter, setStatusFilter } = useTablePreferences<
    'all' | 'active' | 'inactive'
  >('employees', getInitialRowsPerPage, 'active');

  const debouncedSearch = useDebounce(search, 400);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();
  const navigate = useNavigate();

  const hasEditPermissions = userPermissions.includes(PERMISSION_CODES.EDIT_EMPLOYEES);

  const licenses = useSelector(selectLicenses);

  // Se recargan al volver a la página: el tab de licencias de un empleado
  // reemplaza la lista del store con las suyas, así que aquí siempre se pide el
  // listado completo para poder alertar en toda la tabla.
  useEffect(() => {
    void dispatch(fetchLicenses({ limit: 10000 }));
  }, [dispatch, location.pathname]);

  // Horas y horas extra de la quincena actual (mismas reglas que el pago).
  const {
    byEmployeeId: hoursByEmployeeId,
    biweekNumber: currentBiweekNumber,
    year: currentBiweekYear,
  } = useEmployeeBiweeklyHours();

  // Peor estado de licencia por empleado, para alertar sin abrir el detalle.
  const licenseAlertByEmployee = useMemo(() => {
    const rank: Record<string, number> = {
      vencida: 3,
      por_vencer: 2,
      vigente: 1,
      sin_vencimiento: 0,
    };
    const map = new Map<number, 'vencida' | 'por_vencer' | 'vigente'>();
    licenses.forEach((license) => {
      const status = license.status ?? 'sin_vencimiento';
      const normalized = status === 'sin_vencimiento' ? 'vigente' : status;
      const current = map.get(license.employeeId);
      if (!current || rank[normalized] > rank[current]) {
        map.set(license.employeeId, normalized as 'vencida' | 'por_vencer' | 'vigente');
      }
    });
    return map;
  }, [licenses]);

  // Fetch employees on mount, when debounced search/status changes, or when
  // navigating back. The status filter is applied server-side; the client-side
  // pass below keeps the UI instant while the request resolves.
  useEffect(() => {
    dispatch(
      fetchEmployees({
        search: debouncedSearch || undefined,
        isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
      }),
    );
  }, [dispatch, debouncedSearch, statusFilter, location.pathname]);

  // Plantilla completa (sin filtros) para los indicadores globales del KPI band.
  useEffect(() => {
    void dispatch(fetchAllEmployees());
  }, [dispatch, location.pathname]);

  // Filter employees by status + search input (client-side as instant feedback)
  useEffect(() => {
    const byStatus = employees.filter((employee) => {
      if (statusFilter === 'all') return true;
      const isActive = employee.isActive !== false;
      return statusFilter === 'active' ? isActive : !isActive;
    });

    if (!search) {
      setFilteredEmployees(byStatus);
      return;
    }

    const normalizeString = (str: string) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const normalizedSearch = normalizeString(search).toLowerCase();

    setFilteredEmployees(
      byStatus.filter((employee) =>
        normalizeString(`${employee.firstName} ${employee.lastName} ${employee.email || ''}`)
          .toLowerCase()
          .includes(normalizedSearch)
      )
    );
  }, [search, employees, statusFilter]);

  // Handle search bar input change
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  // Handle creation of a new employee
  const handleCreate = async (newEmployee: {
    firstName: string;
    lastName: string;
    email?: string;
  }) => {
    try {
      setIsSubmitting(true);
      await dispatch(createEmployee(newEmployee)).unwrap();
      setOpenAddModal(false);
      showNotification(NOTIFICATIONS.EMPLOYEE_CREATE_SUCCESS, {
        severity: 'success',
        duration: 3000,
      });

    } catch (error) {
      showNotification(NOTIFICATIONS.EMPLOYEE_CREATE_ERROR, {
        severity: 'error',
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open/close add employee modal
  const handleOpenAddModal = () => {
    setOpenAddModal(true);
  };

  const handleCloseAddModal = () => {
    setOpenAddModal(false);
  };

  // Get the avatar URL for the employee in the picker dialog
  const getDialogAvatarUrl = () => {
    if (!avatarDialogEmployee?.avatar) return null;
    return getAvatarSrc(avatarDialogEmployee.avatar) ?? null;
  };

  // Reset the broken-image fallback whenever the dialog target changes
  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [avatarDialogEmployee?.avatar]);

  const handleOpenAvatarDialog = (employee: Employee) => {
    setAvatarDialogEmployee(employee);
    setSelectedFile(null);
    setAvatarPreview(null);
    setAvatarLoadFailed(false);
  };

  // Resets the dialog state (no guard) — used by the guarded close handler
  // and by the success paths, which must close even while uploading.
  const resetAvatarDialog = () => {
    setAvatarDialogEmployee(null);
    setSelectedFile(null);
    setAvatarPreview(null);
    if (avatarFileInputRef.current) {
      avatarFileInputRef.current.value = '';
    }
  };

  const handleCloseAvatarDialog = () => {
    if (isUploadingAvatar) return;
    resetAvatarDialog();
  };

  // Validate + downscale the selected image and show a preview
  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
      showNotification('Solo se permiten imágenes (JPEG, PNG, GIF, WebP)', { severity: 'error' });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      showNotification('La imagen no debe superar los 5MB', { severity: 'error' });
      return;
    }

    try {
      const resized = await resizeAvatarFile(file);
      setSelectedFile(resized);
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarPreview(event.target?.result as string);
      };
      reader.readAsDataURL(resized);
    } catch (error) {
      showNotification('No se pudo procesar la imagen', { severity: 'error' });
    }
  };

  // Upload the selected avatar for the employee in the dialog
  const handleUploadAvatar = async () => {
    if (!selectedFile || !avatarDialogEmployee) return;

    setIsUploadingAvatar(true);
    try {
      await dispatch(
        updateEmployeeAvatar({ id: avatarDialogEmployee.id, file: selectedFile })
      ).unwrap();
      showNotification('Avatar actualizado exitosamente', { severity: 'success', duration: 3000 });
      // Close directly (bypasses the isUploadingAvatar guard) so the dialog
      // doesn't stay stuck open after a successful upload.
      setIsUploadingAvatar(false);
      resetAvatarDialog();
    } catch (error) {
      showNotification('Error al actualizar el avatar', { severity: 'error', duration: 5000 });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Delete the avatar of the employee in the dialog
  const handleAvatarDelete = async () => {
    if (!avatarDialogEmployee) return;

    setIsUploadingAvatar(true);
    try {
      await dispatch(removeEmployeeAvatar(avatarDialogEmployee.id)).unwrap();
      showNotification('Avatar eliminado exitosamente', { severity: 'success', duration: 3000 });
      setIsUploadingAvatar(false);
      resetAvatarDialog();
    } catch (error) {
      showNotification('Error al eliminar el avatar', { severity: 'error', duration: 5000 });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Memoize export data so the DataGrid columns stay stable and exportOptions
  // only recomputes when the filtered list actually changes
  const exportData = useMemo(
    () =>
      filteredEmployees.map((e) => ({
        Cédula: maskNationalId(e.nationalId ?? ''),
        'Nombre completo': `${e.firstName} ${e.lastName}`.trim(),
        Puesto: e.position || '',
        Email: e.email || '',
        Teléfono: maskPhone(e.primaryPhone ?? '') || maskPhone(e.secondaryPhone ?? ''),
      })),
    [filteredEmployees]
  );

  // Memoize export options based on permissions.
  // Excel y PDF comparten las mismas columnas.
  const exportOptions = useMemo(() => {
    const exportHeaders = [
      'Cédula',
      'Nombre completo',
      'Puesto',
      'Email',
      'Teléfono',
    ];
    return createExportOptions({
      excelIcon: <ExcelIcon size={20} />,
      pdfIcon: <PdfIcon size={20} />,
      data: exportData,
      fileName: `empleados-${exportFileFormattedDate(new Date())}`,
      customHeaders: exportHeaders,
      title: 'Reporte de Planilla',
    });
  }, [exportData]);

  // Summary metrics for the KPI band. Las métricas de tamaño (empleados, horas
  // de la quincena y vacaciones) siguen las filas visibles para que coincidan con
  // la tabla; las alertas de licencias se calculan sobre la plantilla completa
  // para que no se escondan detrás de la búsqueda o el filtro de estado.
  const kpiStats = useMemo(() => {
    const activeCount = filteredEmployees.filter(
      (employee) => employee.isActive !== false,
    ).length;

    // Tarifa promedio por hora: promedio simple sobre los empleados visibles que
    // ya tienen tarifa registrada. Quienes no la tienen no entran en la base,
    // para que el indicador no se vea inflado por ceros.
    const rates = filteredEmployees
      .filter(
        (employee) => employee.hourlyRate !== null && employee.hourlyRate !== undefined,
      )
      .map((employee) => Number(employee.hourlyRate))
      .filter((rate) => Number.isFinite(rate) && rate >= 0);
    const averageRate =
      rates.length > 0 ? rates.reduce((total, rate) => total + rate, 0) / rates.length : null;

    const totalVacationDays = filteredEmployees.reduce(
      (total, employee) => total + Number(employee.vacationDays ?? 0),
      0,
    );

    const roster = allEmployees.length > 0 ? allEmployees : filteredEmployees;
    let expiringLicenses = 0;
    let expiredLicenses = 0;
    roster.forEach((employee) => {
      const alert = licenseAlertByEmployee.get(employee.id);
      if (alert === 'por_vencer') expiringLicenses += 1;
      else if (alert === 'vencida') expiredLicenses += 1;
    });

    return {
      total: filteredEmployees.length,
      activeCount,
      averageRate,
      ratesCount: rates.length,
      totalVacationDays,
      expiringLicenses,
      expiredLicenses,
      licenseAlerts: expiringLicenses + expiredLicenses,
    };
  }, [filteredEmployees, allEmployees, licenseAlertByEmployee]);

  // Counts por estado (sobre la plantilla completa) para los filter tabs.
  const filterCounts = useMemo(
    () => ({
      all: allEmployees.length,
      active: allEmployees.filter((employee) => employee.isActive !== false).length,
      inactive: allEmployees.filter((employee) => employee.isActive === false).length,
    }),
    [allEmployees],
  );

  // El KPI band se muestra mientras haya empleados en la plantilla, incluso si
  // la búsqueda o el filtro de estado dejan la tabla vacía (los indicadores de
  // alerta son globales).
  const showKpiBand =
    !isLoadingEmployees && (allEmployees.length > 0 || filteredEmployees.length > 0);

  // Stable getRowId so the memoized StickyDataGrid doesn't re-render on every
  // parent render (inline arrows create a new reference each time)
  const getRowId = useCallback((row: Employee) => row.id, []);

  // Columnas del DataGrid (header sticky garantizado por arquitectura de MUI X Data Grid)
  const columns = useMemo<GridColDef<Employee>[]>(
    () => [
      {
        field: 'nombre',
        headerName: 'Nombre',
        flex: 1.6,
        // El field es propio de la vista: ordena por el nombre completo.
        valueGetter: (_value, row) =>
          `${(row as Employee).firstName} ${(row as Employee).lastName}`.trim(),
        // Avatar + badge take ~70px: keep room for a readable name on phones.
        minWidth: isSmallScreen ? 210 : 260,
        sortable: true,
        renderCell: (params) => {
          const rowId = Number(params.id);
          const rowData = params.row as Employee;
          const firstName = String(rowData.firstName || '');
          const lastName = String(rowData.lastName || '');
          const fullName = `${firstName} ${lastName}`.trim() || 'Nombre Completo';
          const canPickAvatar = hasEditPermissions;

          const missingProfileFields = getMissingProfileFields(rowData);

          return (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                width: '100%',
                minWidth: 0,
              }}
            >
              <Box
                onClick={(e) => {
                  if (!canPickAvatar) return;
                  e.stopPropagation();
                  handleOpenAvatarDialog(rowData);
                }}
                title={canPickAvatar ? 'Cambiar foto' : undefined}
                sx={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '50%',
                  flexShrink: 0,
                  cursor: canPickAvatar ? 'pointer' : 'default',
                  transition: 'transform 0.15s ease',
                  '&:hover': canPickAvatar ? { transform: 'scale(1.06)' } : undefined,
                }}
              >
                <EmployeeAvatar
                  employee={{ id: rowId, firstName, lastName, avatar: rowData.avatar }}
                  size={32}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    right: 0,
                    bottom: 0,
                    width: 11,
                    height: 11,
                    borderRadius: '50%',
                    border: `2px solid ${theme.palette.background.paper}`,
                    backgroundColor:
                      rowData.isActive === false
                        ? theme.palette.text.disabled
                        : theme.palette.success.main,
                    zIndex: 1,
                  }}
                />
              </Box>
              {/* Detail affordance lives in the first column: the whole name
                  behaves as a modern row-link (hover pill + chevron). */}
              <Box
                role="button"
                tabIndex={0}
                aria-label={`Ver detalle de ${fullName}`}
                onClick={(event) => {
                  event.stopPropagation();
                  navigate(`/employees/${rowId}`);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    navigate(`/employees/${rowId}`);
                  }
                }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  flex: 1,
                  minWidth: 0,
                  ml: -0.75,
                  px: 0.75,
                  py: 0.5,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'background-color 0.18s ease, box-shadow 0.18s ease',
                  '&:hover': {
                    backgroundColor:
                      theme.tokens.colors.hover,
                  },
                  '&:focus-visible': {
                    boxShadow: `0 0 0 2px ${theme.palette.primary.main}`,
                  },
                  '& .employee-detail-chevron': {
                    display: 'flex',
                    alignItems: 'center',
                    flexShrink: 0,
                    color: theme.palette.text.disabled,
                    opacity: 0,
                    transform: 'translateX(-4px)',
                    transition: 'opacity 0.18s ease, transform 0.18s ease',
                  },
                  '&:hover .employee-detail-chevron, &:focus-visible .employee-detail-chevron': {
                    opacity: 1,
                    transform: 'translateX(0)',
                    color: theme.palette.primary.main,
                  },
                }}
              >
                <PremiumTooltip title="Ver detalle del empleado">
                  <Typography
                    component="span"
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      minWidth: 0,
                      lineHeight: 1.4,
                    }}
                  >
                    {fullName}
                  </Typography>
                </PremiumTooltip>
                {missingProfileFields.length > 0 && (
                  <PremiumTooltip
                    title={`Perfil incompleto: falta ${missingProfileFields.join(' y ')}`}
                  >
                    <Box component="span" sx={incompleteBadgeStyles(theme)}>
                      <IconAlertTriangle size={12} stroke={2.4} />
                    </Box>
                  </PremiumTooltip>
                )}
                <Box component="span" className="employee-detail-chevron">
                  <IconChevronRight size={16} stroke={2.2} />
                </Box>
              </Box>
            </Box>
          );
        },
      },
      {
        field: 'puesto',
        headerName: 'Puesto',
        flex: 1.1,
        valueGetter: (_value, row) => (row as Employee).position ?? '',
        minWidth: isSmallScreen ? 120 : 150,
        sortable: true,
        renderCell: (params) => {
          const position = (params.row as Employee).position;
          if (!position) {
            return (
              <Typography
                component="span"
                sx={{ fontSize: '0.85rem', color: 'text.disabled', fontStyle: 'italic' }}
              >
                Sin puesto
              </Typography>
            );
          }
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', minWidth: 0 }}>
              <IconBriefcase size={14} stroke={1.5} style={{ opacity: 0.4, flexShrink: 0 }} />
              <Typography
                component="span"
                sx={{
                  fontSize: '0.85rem',
                  color: 'text.secondary',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  minWidth: 0,
                  lineHeight: 1.4,
                }}
              >
                {position}
              </Typography>
            </Box>
          );
        },
      },
      {
        field: 'email',
        headerName: 'Email',
        flex: 1.4,
        minWidth: isSmallScreen ? 140 : 220,
        sortable: true,
        renderCell: (params) => {
          const rowData = params.row as Employee;
          const email = String(rowData.email || '');

          if (email) {
            return (
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', minWidth: 0 }}
              >
                <IconMail size={14} stroke={1.5} style={{ opacity: 0.4, flexShrink: 0 }} />
                <Typography
                  component="a"
                  href={`mailto:${email}`}
                  sx={{
                    fontSize: '0.85rem',
                    color: 'text.secondary',
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    minWidth: 0,
                    lineHeight: 1.4,
                    '&:hover': {
                      color: 'primary.main',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  {email}
                </Typography>
              </Box>
            );
          }

          return (
            <Typography
              component="span"
              sx={{ fontSize: '0.85rem', color: 'text.disabled', fontStyle: 'italic' }}
            >
              Sin email
            </Typography>
          );
        },
      },
      {
        field: 'telefono',
        headerName: 'Teléfono',
        width: isSmallScreen ? 125 : 150,
        minWidth: 125,
        sortable: false,
        valueGetter: (value) => maskPhone((value as Employee)?.primaryPhone ?? ''),
        renderCell: (params) => {
          const rowData = params.row as Employee;
          const phone = maskPhone(rowData.primaryPhone ?? '');
          const secondary = maskPhone(rowData.secondaryPhone ?? '');
          if (!phone && !secondary) {
            return (
              <Typography
                component="span"
                sx={{ fontSize: '0.85rem', color: 'text.disabled', fontStyle: 'italic' }}
              >
                Sin teléfono
              </Typography>
            );
          }
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', minWidth: 0 }}>
              <IconPhone size={14} stroke={1.5} style={{ opacity: 0.4, flexShrink: 0 }} />
              <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                <Typography
                  component="span"
                  sx={{
                    fontSize: '0.85rem',
                    color: 'text.secondary',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    lineHeight: 1.3,
                  }}
                >
                  {phone || secondary}
                </Typography>
                {phone && secondary && (
                  <Typography
                    component="span"
                    sx={{ fontSize: '0.7rem', color: 'text.disabled', lineHeight: 1.3 }}
                  >
                    {secondary}
                  </Typography>
                )}
              </Box>
            </Box>
          );
        },
      },
      {
        field: 'horasQuincena',
        // Sin el período, un número suelto en la tabla no dice a qué quincena
        // pertenece.
        headerName:
          currentBiweekNumber && currentBiweekYear
            ? `Horas quincena (Q${currentBiweekNumber}·${currentBiweekYear})`
            : 'Horas quincena',
        width: isSmallScreen ? 120 : 140,
        minWidth: 120,
        sortable: false,
        renderCell: (params) => {
          const entry = hoursByEmployeeId.get((params.row as Employee).id);
          if (!entry) {
            return (
              <Typography
                component="span"
                sx={{ fontSize: '0.85rem', color: 'text.disabled', fontStyle: 'italic' }}
              >
                Sin registro
              </Typography>
            );
          }
          return (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                width: '100%',
                minWidth: 0,
              }}
            >
              <IconClockHour4 size={14} stroke={1.5} style={{ opacity: 0.4, flexShrink: 0 }} />
              <Typography
                component="span"
                sx={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap' }}
              >
                {formatHours(entry.totalHours)}
              </Typography>
            </Box>
          );
        },
      },
      {
        field: 'horasExtra',
        headerName: 'Horas extra',
        width: isSmallScreen ? 115 : 130,
        minWidth: 115,
        sortable: false,
        renderCell: (params) => {
          const entry = hoursByEmployeeId.get((params.row as Employee).id);
          const overtime = entry?.overtimeHours ?? 0;
          return (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                width: '100%',
                minWidth: 0,
              }}
            >
              <IconHourglassHigh
                size={14}
                stroke={1.5}
                style={{ opacity: overtime > 0 ? 0.6 : 0.25, flexShrink: 0 }}
              />
              <Typography
                component="span"
                sx={{
                  fontSize: '0.85rem',
                  fontWeight: overtime > 0 ? 600 : 400,
                  fontStyle: overtime > 0 ? 'normal' : 'italic',
                  color: overtime > 0 ? 'warning.main' : 'text.disabled',
                  whiteSpace: 'nowrap',
                }}
              >
                {entry ? formatHours(overtime) : '—'}
              </Typography>
            </Box>
          );
        },
      },
      {
        field: 'vacaciones',
        headerName: 'Vacaciones',
        width: isSmallScreen ? 125 : 145,
        minWidth: isSmallScreen ? 125 : 145,
        sortable: true,
        valueGetter: (_value, row) => (row as Employee).vacationDays ?? '',
        align: 'right',
        headerAlign: 'right',
        renderCell: (params) => {
          const days = (params.row as Employee).vacationDays;
          const hasDays = days !== null && days !== undefined;
          return (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 1,
                width: '100%',
                minWidth: 0,
              }}
            >
              <IconCalendarWeek size={14} stroke={1.5} style={{ opacity: 0.4, flexShrink: 0 }} />
              <Typography
                component="span"
                sx={{
                  fontSize: '0.85rem',
                  fontWeight: hasDays ? 600 : 400,
                  fontStyle: hasDays ? 'normal' : 'italic',
                  color: hasDays ? 'text.primary' : 'text.disabled',
                  whiteSpace: 'nowrap',
                }}
              >
                {hasDays ? `${days} días` : 'Sin asignar'}
              </Typography>
            </Box>
          );
        },
      },
      {
        field: 'antiguedad',
        headerName: 'Antigüedad',
        // Con flex, la última columna absorbe el ancho que dejó la columna de
        // acciones eliminada, así la tabla siempre llega al borde derecho y no
        // queda un hueco vacío al final.
        flex: 1,
        minWidth: isSmallScreen ? 130 : 160,
        sortable: false,
        valueGetter: (value, row) => formatTenure((row as Employee).contractStartDate),
        renderCell: (params) => {
          const rowData = params.row as Employee;
          const tenure = formatTenure(rowData.contractStartDate);
          if (!tenure) {
            return (
              <Typography
                component="span"
                sx={{ fontSize: '0.85rem', color: 'text.disabled', fontStyle: 'italic' }}
              >
                Sin ingreso
              </Typography>
            );
          }
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', minWidth: 0 }}>
              <IconUsers size={14} stroke={1.5} style={{ opacity: 0.4, flexShrink: 0 }} />
              <Typography
                component="span"
                sx={{
                  fontSize: '0.85rem',
                  color: 'text.secondary',
                  whiteSpace: 'nowrap',
                  lineHeight: 1.4,
                }}
              >
                {tenure}
              </Typography>
            </Box>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      isSmallScreen,
      theme,
      hasEditPermissions,
      handleOpenAvatarDialog,
      licenseAlertByEmployee,
      hoursByEmployeeId,
    ]
  );

  const canExport = userPermissions.includes(PERMISSION_CODES.EXPORT_EMPLOYEES);

  return (
    <PageContainer>
      <PageCard>
        <PageHeader
          icon={<NavIcon label={APPBAR_MENU.EMPLOYEES} />}
          title={PAGE_TITLE.EMPLOYEES}
          mobileTitle={PAGE_TITLE.EMPLOYEES_SIMPLIFIED}
          subtitle={`${filteredEmployees.length} empleados`}
          actions={
            canExport ? (
              <ExportMenu actions={exportOptions} disabled={filteredEmployees.length === 0} />
            ) : undefined
          }
          toolbar={
            <>
              <Box sx={{ flex: 1, maxWidth: { sm: 320 }, minWidth: { xs: '100%', sm: 200 } }}>
                <SearchBarComponent
                  placeholder={MANAGEMENT.EMPLOYEES_PAGE.SEARCH_PLACEHOLDER}
                  value={search}
                  onChange={handleFilterChange}
                  fullWidth
                  isSearching={isLoadingEmployees && search !== ''}
                />
              </Box>
              <SegmentedToggle
                size="medium"
                ariaLabel="Filtrar empleados por estado"
                options={[
                  { value: 'all', label: 'Todos', count: filterCounts.all },
                  { value: 'active', label: 'Activos', count: filterCounts.active },
                  { value: 'inactive', label: 'Inactivos', count: filterCounts.inactive },
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
              />
            </>
          }
          toolbarEnd={
            userPermissions.includes(PERMISSION_CODES.CREATE_EMPLOYEES) ? (
              <Button
                variant="contained"
                startIcon={<IconPlus size={18} />}
                onClick={handleOpenAddModal}
              >
                {MANAGEMENT.EMPLOYEES_PAGE.ADD}
              </Button>
            ) : undefined
          }
        />

        {/* Summary metrics */}
        {showKpiBand && (
          <StatGrid sx={{ px: { xs: 2, sm: 2.5 }, py: { xs: 1.5, sm: 2 }, borderBottom: theme.tokens.borders.hairline }}>
            {/* Sin la fila de detalle: las tarjetas quedan más bajas y limpias. */}
            <StatCard
              icon={<IconUsers />}
              label="Empleados"
              value={kpiStats.total}
              tone="accent"
            />
            <StatCard
              icon={<IconCash />}
              label="Tarifa promedio"
              value={
                kpiStats.averageRate != null
                  ? `${formatMoney(kpiStats.averageRate, 'CRC')}/h`
                  : '—'
              }
            />
            <StatCard
              icon={<IconCalendarWeek />}
              label="Vacaciones"
              value={`${kpiStats.totalVacationDays} días`}
            />
            <StatCard
              icon={<IconShieldExclamation />}
              label="Licencias"
              value={kpiStats.licenseAlerts}
              tone={kpiStats.licenseAlerts > 0 ? 'danger' : 'default'}
            />
          </StatGrid>
        )}

        <PageBody>
          {isLoadingEmployees && filteredEmployees.length === 0 ? (
            <LoadingState label="Cargando empleados…" />
          ) : filteredEmployees.length > 0 ? (
            <StickyDataGridComponent<Employee>
              rows={filteredEmployees}
              columns={columns}
              getRowId={getRowId}
            />
          ) : (
            <EmptyState
              icon={<IconUsers />}
              title={MANAGEMENT.EMPLOYEES_PAGE.NO_EMPLOYEES}
              description={
                search || statusFilter !== 'all'
                  ? 'Prueba con otro término de búsqueda o cambia el filtro.'
                  : undefined
              }
            />
          )}
        </PageBody>
      </PageCard>
      <DialogComponent
        open={openAddModal}
        onClose={handleCloseAddModal}
        title={MANAGEMENT.EMPLOYEES_PAGE.DIALOG_ADD_TITLE}
        hideActions
        paperSx={addDialogPaperSx ?? {}}
        icon={<IconCirclePlus size={24} color="blue" />}
      >
        <AddEmployeeForm
          onSubmit={handleCreate}
          onCancel={handleCloseAddModal}
          isLoading={isSubmitting}
        />
      </DialogComponent>

      {/* Avatar Picker Modal — same UX as the user avatar modal */}
      <Dialog
        open={avatarDialogEmployee !== null}
        onClose={handleCloseAvatarDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            p: 0,
            overflow: 'hidden',
            boxShadow: '0 25px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.06)',
          },
        }}
      >
        {/* Header with icon box */}
        <Box sx={{ px: { xs: 2.5, sm: 4 }, pt: { xs: 2.5, sm: 3.5 }, pb: 0 }}>
          <Box display="flex" alignItems="center" gap={1.5} mb={0.75}>
            <Box
              sx={{
                backgroundColor: theme.palette.primary.main,
                borderRadius: '12px',
                p: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              }}
            >
              <IconCamera size={18} color={theme.palette.primary.contrastText} />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: '1.15rem',
                color: theme.palette.text.primary,
                letterSpacing: '-0.02em',
              }}
            >
              Foto del empleado
            </Typography>
          </Box>
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{ fontSize: '0.85rem', lineHeight: 1.5, pl: 6 }}
          >
            Sube una foto para personalizar el perfil de{' '}
            {avatarDialogEmployee
              ? `${avatarDialogEmployee.firstName} ${avatarDialogEmployee.lastName}`
              : 'el empleado'}
            .
          </Typography>
        </Box>

        <DialogContent sx={{ pb: 1, pt: 3, px: { xs: 2.5, sm: 4 } }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            {/* Avatar Preview Circle */}
            <Box
              sx={{
                width: 180,
                height: 180,
                borderRadius: '50%',
                overflow: 'hidden',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor:
                  theme.tokens.colors.hoverSoft,
                border: `3px solid ${theme.tokens.colors.border}`,
                transition: 'all 0.3s ease',
                boxShadow:
                  avatarPreview || getDialogAvatarUrl()
                    ? '0 8px 32px rgba(0,0,0,0.15)'
                    : '0 4px 16px rgba(0,0,0,0.06)',
              }}
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Preview"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : getDialogAvatarUrl() && !avatarLoadFailed ? (
                <img
                  src={getDialogAvatarUrl()!}
                  alt="Avatar del empleado"
                  onError={() => setAvatarLoadFailed(true)}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : avatarDialogEmployee ? (
                <EmployeeAvatar
                  employee={avatarDialogEmployee}
                  size={180}
                  sx={{ fontSize: '3.5rem' }}
                />
              ) : (
                <Box />
              )}
              {isUploadingAvatar && (
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    borderRadius: '50%',
                    backdropFilter: 'blur(2px)',
                  }}
                >
                  <CircularProgress size={44} sx={{ color: '#fff' }} />
                </Box>
              )}
            </Box>

            {/* Drop zone / Select area */}
            <Box
              onClick={() => avatarFileInputRef.current?.click()}
              sx={{
                width: '100%',
                border: `2px dashed ${theme.tokens.colors.border}`,
                borderRadius: '14px',
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1.5,
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                backgroundColor: selectedFile
                  ? theme.tokens.colors.hover
                  : 'transparent',
                borderColor: selectedFile
                  ? theme.palette.primary.main
                  : theme.tokens.colors.hoverStrong,
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  backgroundColor:
                    theme.tokens.colors.hover,
                },
              }}
            >
              <Box
                sx={{
                  backgroundColor:
                    theme.tokens.colors.hover,
                  borderRadius: '10px',
                  p: 1.25,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}
              >
                <IconCamera size={22} color={theme.palette.text.secondary} />
              </Box>
              {selectedFile ? (
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    fontSize: '0.875rem',
                    textAlign: 'center',
                    wordBreak: 'break-all',
                    maxWidth: '100%',
                  }}
                >
                  {selectedFile.name}
                </Typography>
              ) : (
                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: theme.palette.text.primary,
                      fontSize: '0.875rem',
                    }}
                  >
                    Haz clic para seleccionar una imagen
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.text.secondary,
                      fontSize: '0.75rem',
                      mt: 0.25,
                      display: 'block',
                    }}
                  >
                    JPEG, PNG, GIF o WebP · Máx 5MB
                  </Typography>
                </Box>
              )}
            </Box>

            {/* File Input */}
            <input
              ref={avatarFileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleAvatarFileSelect}
              style={{ display: 'none' }}
            />
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            px: { xs: 2.5, sm: 4 },
            pb: { xs: 2.5, sm: 3.5 },
            pt: 1.5,
            gap: 1,
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
          }}
        >
          {getDialogAvatarUrl() && !selectedFile ? (
            <Button
              variant="text"
              color="error"
              onClick={handleAvatarDelete}
              disabled={isUploadingAvatar}
              startIcon={
                isUploadingAvatar ? <IconLoader2 size={16} className="animate-spin" /> : <IconX size={16} />
              }
              sx={{
                order: { xs: 2, sm: 1 },
                '&:hover': {
                  backgroundColor:
                    theme.palette.mode === 'dark' ? 'rgba(244,67,54,0.1)' : 'rgba(244,67,54,0.06)',
                },
              }}
            >
              Eliminar
            </Button>
          ) : (
            <Box /> /* Spacer */
          )}
          <Box sx={{ display: 'flex', gap: 1, order: { xs: 1, sm: 2 } }}>
            <Button
              variant="outlined"
              onClick={handleCloseAvatarDialog}
              disabled={isUploadingAvatar}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={
                selectedFile ? handleUploadAvatar : () => avatarFileInputRef.current?.click()
              }
              disabled={isUploadingAvatar}
              sx={{ minWidth: 120 }}
              startIcon={
                isUploadingAvatar ? (
                  <IconLoader2 size={16} className="animate-spin" />
                ) : selectedFile ? (
                  <IconCamera size={16} />
                ) : undefined
              }
            >
              {isUploadingAvatar ? 'Subiendo...' : selectedFile ? 'Subir foto' : 'Seleccionar'}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default EmployeesPage;
