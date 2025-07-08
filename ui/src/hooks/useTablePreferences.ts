import { useState, useEffect } from 'react';
import { getTablePreferences, setTablePreferences, TablePreferences } from '../utils/tablePreferences';
import { useTheme, useMediaQuery } from '@mui/material';

function getDefaultRowsPerPage(isSmallScreen: boolean): number {
  return isSmallScreen ? 5 : 25;
}

export function useTablePreferences(
  tableKey: string,
  getInitialRowsPerPage?: () => number
) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // On first mount, check localStorage or set defaults
  const [prefs, setPrefs] = useState<TablePreferences>(() => {
    const stored = getTablePreferences(tableKey);
    if (stored) return stored;
    return {
      rowsPerPage: getInitialRowsPerPage
        ? getInitialRowsPerPage()
        : getDefaultRowsPerPage(isSmallScreen),
      search: '',
    };
  });

  // Persist changes to localStorage
  useEffect(() => {
    setTablePreferences(tableKey, prefs);
  }, [tableKey, prefs]);

  // If screen size changes and no stored prefs, update rowsPerPage only if needed
  useEffect(() => {
    const stored = getTablePreferences(tableKey);
    const defaultRows = getDefaultRowsPerPage(isSmallScreen);
    if (!stored && prefs.rowsPerPage !== defaultRows) {
      setPrefs((prev) => ({ ...prev, rowsPerPage: defaultRows }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSmallScreen]);

  const setRowsPerPage = (rows: number) => {
    setPrefs((prev) => ({ ...prev, rowsPerPage: rows }));
  };
  const setSearch = (search: string) => {
    setPrefs((prev) => ({ ...prev, search }));
  };

  return {
    rowsPerPage: prefs.rowsPerPage,
    setRowsPerPage,
    search: prefs.search,
    setSearch,
  };
} 