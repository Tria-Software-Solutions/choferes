import React, { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  TablePagination,
  InputLabel,
  TableSortLabel,
  Divider,
  Box,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Employee } from "../../../models/Employee";
import { Schedule } from "../../../models/Schedule";
import { HoursWorked } from "../../../models/HoursWorked";
import {
  formatHeaderDate,
  getCurrentWeekDates,
} from "../../../utils/dateUtils";
import { translateDayToAbrevSpanish } from "../../../utils/stringUtils";
import { EnglishDayOfWeek } from "../../../utils/englishDayOfWeek";
import { TABLE } from "../../../constants/constants";

interface SelectorTableProps {
  filteredEmployees: Employee[];
  schedules: Schedule[];
  hoursWorked: HoursWorked[];
  weekOffset: number;
}

const SelectorTable: React.FC<SelectorTableProps> = React.memo(
  ({ filteredEmployees, weekOffset }) => {
    const [selectedPeriod, setSelectedPeriod] = useState<
      "weekly" | "biweekly" | "monthly"
    >("weekly");
    const [orderDirection, setOrderDirection] = useState<"asc" | "desc">("asc");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    
    const currentWeek = useMemo(
      () => getCurrentWeekDates(weekOffset),
      [weekOffset]
    );

    const sortedEmployees = useMemo(() => {
      return [...filteredEmployees].sort((a, b) => {
        const nameA = `${a.firstName} ${a.lastName}`;
        const nameB = `${b.firstName} ${b.lastName}`;
        return orderDirection === "asc"
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      });
    }, [filteredEmployees, orderDirection]);

    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedEmployees = sortedEmployees.slice(startIndex, endIndex);

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

    return (
      <Paper sx={{ width: "100%" }}>
        <TableContainer className="table-container">
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell
                  className="employee-column"
                  sx={{ position: "sticky", left: 0, zIndex: 3 }}
                >
                  <TableSortLabel
                    direction={orderDirection}
                    onClick={() =>
                      setOrderDirection((prev) =>
                        prev === "asc" ? "desc" : "asc"
                      )
                    }
                  >
                    Empleados
                  </TableSortLabel>
                </TableCell>
                {currentWeek.map(({ day, date }) => (
                  <TableCell key={day} align="center">
                    {`${translateDayToAbrevSpanish(
                      day as EnglishDayOfWeek
                    )} ${formatHeaderDate(date)}`}
                  </TableCell>
                ))}
                <TableCell
                  align="center"
                  sx={{
                    position: isSmallScreen ? "static" : "sticky",
                    right: 0,
                    zIndex: 2,
                  }}
                  colSpan={2}
                >
                  <FormControl>
                    <InputLabel>Total</InputLabel>
                    <Select
                      value={selectedPeriod}
                      onChange={(e) =>
                        setSelectedPeriod(
                          e.target.value as "weekly" | "biweekly" | "monthly"
                        )
                      }
                      autoWidth
                      label="Total"
                    >
                      <MenuItem value="weekly">Semanal</MenuItem>
                      <MenuItem value="biweekly">Quincenal</MenuItem>
                      <MenuItem value="monthly">Mensual</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody></TableBody>
          </Table>
        </TableContainer>
        <Divider />
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <TablePagination
            className="pagination"
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={sortedEmployees.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage={TABLE.ROWS_PER_PAGE}
          />
        </Box>
      </Paper>
    );
  }
);

export default SelectorTable;
