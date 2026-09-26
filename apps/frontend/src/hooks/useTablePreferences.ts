import { useState, useEffect, useRef } from 'react';
import { getTablePreferences, setTablePreferences, TablePreferences } from '../utils/tablePreferences';
import { useTheme, useMediaQuery } from '@mui/material';

function getDefaultRowsPerPage(isSmallScreen: boolean): number {
  return isSmallScreen ? 5 : 25;
}

export function useTablePreferences<TStatus extends string = string>(
  tableKey: string,
  getInitialRowsPerPage?: () => number,
  defaultStatusFilter?: TStatus
) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // On first mount, check localStorage or set defaults
  const [prefs, setPrefs] = useState<TablePreferences>(() => {
    const stored = getTablePreferences(tableKey);
    if (stored) {
      // Older entries may not have a status filter yet: fall back to the
      // default passed by the page.
      return { ...stored, statusFilter: stored.statusFilter ?? defaultStatusFilter };
    }
    return {
      rowsPerPage: getInitialRowsPerPage
        ? getInitialRowsPerPage()
        : getDefaultRowsPerPage(isSmallScreen),
      search: '',
      statusFilter: defaultStatusFilter,
    };
  });
  const [hasManualRowsChange, setHasManualRowsChange] = useState(false);

  // Use refs to track previous values and only persist when they actually change
  const prevPrefsRef = useRef(prefs);
  const prevTableKeyRef = useRef(tableKey);

  // Persist changes to localStorage
  useEffect(() => {
    const rowsPerPageChanged = prevPrefsRef.current.rowsPerPage !== prefs.rowsPerPage;
    const searchChanged = prevPrefsRef.current.search !== prefs.search;
    const statusFilterChanged = prevPrefsRef.current.statusFilter !== prefs.statusFilter;
    const tableKeyChanged = prevTableKeyRef.current !== tableKey;

    if (rowsPerPageChanged || searchChanged || statusFilterChanged || tableKeyChanged) {
      setTablePreferences(tableKey, prefs);
      prevPrefsRef.current = prefs;
      prevTableKeyRef.current = tableKey;
    }
  }, [tableKey, prefs]);

  // If screen size changes and no stored prefs, update rowsPerPage only if needed
  useEffect(() => {
    const stored = getTablePreferences(tableKey);
    const defaultRows = getDefaultRowsPerPage(isSmallScreen);
    if (!stored && prefs.rowsPerPage !== defaultRows && !hasManualRowsChange) {
      setPrefs((prev) => ({ ...prev, rowsPerPage: defaultRows }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSmallScreen]);

  // Recalculate rowsPerPage when the dynamic initial callback changes and user did not select rows manually.
  useEffect(() => {
    if (!getInitialRowsPerPage || hasManualRowsChange) return;

    const initialRows = getInitialRowsPerPage();
    if (prefs.rowsPerPage !== initialRows) {
      setPrefs((prev) => ({ ...prev, rowsPerPage: initialRows }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getInitialRowsPerPage, hasManualRowsChange, prefs.rowsPerPage]);

  const setRowsPerPage = (rows: number) => {
    setPrefs((prev) => ({ ...prev, rowsPerPage: rows }));
    setHasManualRowsChange(true);
  };
  const setSearch = (search: string) => {
    setPrefs((prev) => ({ ...prev, search }));
  };
  const setStatusFilter = (statusFilter: TStatus) => {
    setPrefs((prev) => ({ ...prev, statusFilter }));
  };

  return {
    rowsPerPage: prefs.rowsPerPage,
    setRowsPerPage,
    search: prefs.search,
    setSearch,
    statusFilter: (prefs.statusFilter ?? defaultStatusFilter) as TStatus,
    setStatusFilter,
  };
}
