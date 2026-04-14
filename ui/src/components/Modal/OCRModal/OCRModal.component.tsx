import React from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  useTheme,
  IconButton,
  Divider,
  Fade,
  Slide,
} from "@mui/material";
import { X, ImageOff, RefreshCw, Image } from "lucide-react";
import { OCRResult, VehicleEntry } from "../../../services/ocrService";
import PaginationComponent from "../../Table/Pagination/Pagination.component";
import TABLE from "../../../constants/table.constants";
import { maskLicensePlate } from "../../../utils/mask";
import { capitalizeFirstLetter } from "../../../utils/string";
import { TextField } from "@mui/material";
import {
  dialogPaperStyles,
  headerBoxStyles,
  iconBoxStyles,
  titleBoxStyles,
  titleStyles,
  subtitleStyles,
  closeButtonStyles,
  dialogContentStyles,
  loadingBoxStyles,
  loadingTextStyles,
  errorContainerStyles,
  errorTitleStyles,
  errorSubtitleStyles,
  errorDescriptionStyles,
  errorActionsBoxStyles,
  errorButtonStyles,
  tablePaperStyles,
  tableContainerStyles,
  ocrModalTextFieldStyles,
  tableStyles,
  tableHeadCellStyles,
  editableCellStyles,
  colorIndicatorStyles,
  dialogActionsStyles,
  cancelButtonStyles,
  importButtonStyles,
} from "./OCRModal.styles";

interface OCRResultModalProps {
  open: boolean;
  onClose: () => void;
  result: OCRResult | null;
  isLoading: boolean;
  error: string | null;
  onImportData: (entries: VehicleEntry[]) => void;
}

const OCRResultModal: React.FC<OCRResultModalProps> = ({
  open,
  onClose,
  result,
  isLoading,
  error,
  onImportData,
}) => {
  const theme = useTheme();

  // Pagination states
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(6);

  // Editing states
  const [editingCell, setEditingCell] = React.useState<{
    rowIndex: number;
    field: keyof VehicleEntry;
  } | null>(null);
  const [editedEntries, setEditedEntries] = React.useState<VehicleEntry[]>([]);

  const handleImport = () => {
    if (result?.entries) {
      // Use edited entries if available, otherwise use original entries
      const entriesToImport = editedEntries.length > 0 ? editedEntries : result.entries;
      onImportData(entriesToImport);
      onClose();
    }
  };

  // Initialize edited entries when result changes
  React.useEffect(() => {
    if (result?.entries) {
      setEditedEntries([...result.entries]);
    }
  }, [result]);

  const handleCellEdit = (rowIndex: number, field: keyof VehicleEntry, value: string) => {
    const newEditedEntries = [...editedEntries];
    const actualRowIndex = page * rowsPerPage + rowIndex;
    
    if (newEditedEntries[actualRowIndex]) {
      newEditedEntries[actualRowIndex] = {
        ...newEditedEntries[actualRowIndex],
        [field]: value,
      };
      setEditedEntries(newEditedEntries);
    }
  };

  const handleCellClick = (rowIndex: number, field: keyof VehicleEntry) => {
    setEditingCell({ rowIndex, field });
  };

  const handleCellBlur = () => {
    setEditingCell(null);
  };

  const handleCellKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      setEditingCell(null);
    }
  };

  const handlePageChange = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  // Reset pagination when result changes
  React.useEffect(() => {
    setPage(0);
  }, [result]);

  // Get paginated entries
  const paginatedEntries =
    result?.entries.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    ) || [];

  // Check if the image format is valid (has expected structure)
  const isImageFormatValid =
    result &&
    result.entries.length > 0 &&
    result.entries.every(
      (entry: VehicleEntry) => entry.ticket && entry.licensePlate && entry.parkingSpace
    );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: dialogPaperStyles,
      }}
    >
      {/* Header with theme styling */}
      <Box sx={headerBoxStyles(theme)}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={iconBoxStyles(theme)}>
            <Image size={24} color={theme.palette.primary.main} />
          </Box>
          <Box sx={titleBoxStyles}>
            <Typography
              variant="h6"
              fontWeight={700}
              color="inherit"
              sx={titleStyles}
            >
              Resultados De Datos Extraídos
            </Typography>
            {!process.env.REACT_APP_OCR_API_KEY && (
              <Typography
                variant="caption"
                sx={{
                  color: "warning.main",
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  mt: 0.5,
                }}
              >
                ⚠️ Modo simulación
              </Typography>
            )}
            {result && (
              <Typography variant="body2" color="inherit" sx={subtitleStyles}>
                {result.date} • {result.entries.length} entradas extraídas
              </Typography>
            )}
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={closeButtonStyles}>
          <X size={20} />
        </IconButton>
      </Box>

      <DialogContent
        sx={dialogContentStyles(result, isLoading, isImageFormatValid)}
      >
        {isLoading && (
          <Box sx={loadingBoxStyles}>
            <CircularProgress
              size={80}
              thickness={4}
              sx={{
                color: (theme) => theme.palette.primary.main,
                "& .MuiCircularProgress-circle": {
                  strokeLinecap: "round",
                },
              }}
            />
            <Typography sx={loadingTextStyles}>Procesando imagen...</Typography>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                textAlign: "center",
                fontSize: "0.9rem",
                opacity: 0.8,
              }}
            >
              {process.env.REACT_APP_OCR_API_KEY
                ? "Esto puede tomar unos segundos..."
                : "Modo simulación - Configura API key para OCR real"}
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {result && !isLoading && !isImageFormatValid && (
          <Fade in timeout={800}>
            <Slide direction="up" in timeout={1000}>
              <Box sx={errorContainerStyles}>
                <ImageOff
                  size={64}
                  color={theme.palette.error.main}
                  aria-label="Formato de imagen no válido"
                />
                <Typography
                  variant="h4"
                  component="h2"
                  sx={errorTitleStyles(theme)}
                >
                  Formato de Imagen No Válido
                </Typography>
                <Typography
                  variant="h6"
                  color="text.primary"
                  sx={errorSubtitleStyles}
                >
                  La imagen no contiene datos de vehículos
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={errorDescriptionStyles}
                >
                  Por favor, asegúrate de cargar una imagen de un libro de
                  registro de vehículos que contenga columnas como Boleta,
                  Placa, Marca, Color, Espacio y Observaciones.
                </Typography>
                <Box sx={errorActionsBoxStyles}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<RefreshCw size={20} />}
                    onClick={onClose}
                    fullWidth={false}
                    sx={errorButtonStyles}
                  >
                    Intentar Otra Imagen
                  </Button>
                </Box>
              </Box>
            </Slide>
          </Fade>
        )}

        {result && !isLoading && isImageFormatValid && (
          <>
            {/* Processing Info */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
                p: 2,
                borderRadius: 1,
                bgcolor: "background.paper",
                border: (theme) => `1px solid ${theme.palette.divider}`,
              }}
            >
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontWeight={500}
                >
                  {process.env.REACT_APP_OCR_API_KEY
                    ? "OCR Real"
                    : "Simulación"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {result.entries.length} entradas procesadas
                </Typography>
              </Box>
              <Box sx={{ textAlign: "right" }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontWeight={500}
                >
                  {result.date}
                </Typography>
                {result.pageNumber && (
                  <Typography variant="caption" color="text.secondary">
                    Página {result.pageNumber}
                  </Typography>
                )}
              </Box>
            </Box>

            <Paper sx={tablePaperStyles(theme)}>
              <TableContainer sx={tableContainerStyles}>
                <Table stickyHeader size="small" sx={tableStyles}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={tableHeadCellStyles(theme)}>
                        Boleta
                      </TableCell>
                      <TableCell sx={tableHeadCellStyles(theme)}>
                        Placa
                      </TableCell>
                      <TableCell sx={tableHeadCellStyles(theme)}>
                        Marca
                      </TableCell>
                      <TableCell sx={tableHeadCellStyles(theme)}>
                        Color
                      </TableCell>
                      <TableCell sx={tableHeadCellStyles(theme)}>
                        Espacio
                      </TableCell>
                      <TableCell sx={tableHeadCellStyles(theme)}>
                        Observación
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedEntries.map(
                      (entry: VehicleEntry, index: number) => {
                        const actualRowIndex = page * rowsPerPage + index;
                        const currentEntry =
                          editedEntries[actualRowIndex] || entry;

                        return (
                          <TableRow key={index}>
                            <TableCell
                              sx={editableCellStyles}
                              onClick={() => handleCellClick(index, "ticket")}
                            >
                              {editingCell?.rowIndex === index &&
                              editingCell?.field === "ticket" ? (
                                <TextField
                                  value={currentEntry.ticket || ""}
                                  onChange={(e) =>
                                    handleCellEdit(
                                      index,
                                      "ticket",
                                      e.target.value
                                    )
                                  }
                                  onBlur={handleCellBlur}
                                  onKeyPress={handleCellKeyPress}
                                  size="small"
                                  fullWidth
                                  autoFocus
                                  variant="standard"
                                  sx={ocrModalTextFieldStyles}
                                />
                              ) : (
                                <Typography variant="body2" fontWeight="medium">
                                  {currentEntry.ticket}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell
                              sx={editableCellStyles}
                              onClick={() =>
                                handleCellClick(index, "licensePlate")
                              }
                            >
                              {editingCell?.rowIndex === index &&
                              editingCell?.field === "licensePlate" ? (
                                <TextField
                                  value={currentEntry.licensePlate || ""}
                                  onChange={(e) =>
                                    handleCellEdit(
                                      index,
                                      "licensePlate",
                                      e.target.value
                                    )
                                  }
                                  onBlur={handleCellBlur}
                                  onKeyPress={handleCellKeyPress}
                                  size="small"
                                  fullWidth
                                  autoFocus
                                  variant="standard"
                                  sx={ocrModalTextFieldStyles}
                                />
                              ) : (
                                <Typography variant="body2" fontWeight="medium">
                                  {maskLicensePlate(currentEntry.licensePlate)}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell
                              sx={editableCellStyles}
                              onClick={() => handleCellClick(index, "brand")}
                            >
                              {editingCell?.rowIndex === index &&
                              editingCell?.field === "brand" ? (
                                <TextField
                                  value={currentEntry.brand || ""}
                                  onChange={(e) =>
                                    handleCellEdit(
                                      index,
                                      "brand",
                                      e.target.value
                                    )
                                  }
                                  onBlur={handleCellBlur}
                                  onKeyPress={handleCellKeyPress}
                                  size="small"
                                  fullWidth
                                  autoFocus
                                  variant="standard"
                                  sx={ocrModalTextFieldStyles}
                                />
                              ) : (
                                <Typography variant="body2">
                                  {currentEntry.brand
                                    ? capitalizeFirstLetter(currentEntry.brand)
                                    : "-"}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell
                              sx={editableCellStyles}
                              onClick={() => handleCellClick(index, "color")}
                            >
                              {editingCell?.rowIndex === index &&
                              editingCell?.field === "color" ? (
                                <TextField
                                  value={currentEntry.color || ""}
                                  onChange={(e) =>
                                    handleCellEdit(
                                      index,
                                      "color",
                                      e.target.value
                                    )
                                  }
                                  onBlur={handleCellBlur}
                                  onKeyPress={handleCellKeyPress}
                                  size="small"
                                  fullWidth
                                  autoFocus
                                  variant="standard"
                                  sx={ocrModalTextFieldStyles}
                                />
                              ) : (
                                <Box
                                  sx={{ display: "flex", alignItems: "center" }}
                                >
                                  <Box
                                    sx={colorIndicatorStyles(
                                      currentEntry.color
                                    )}
                                  />
                                  <Typography variant="body2" component="span">
                                    {capitalizeFirstLetter(currentEntry.color)}
                                  </Typography>
                                </Box>
                              )}
                            </TableCell>
                            <TableCell
                              sx={editableCellStyles}
                              onClick={() =>
                                handleCellClick(index, "parkingSpace")
                              }
                            >
                              {editingCell?.rowIndex === index &&
                              editingCell?.field === "parkingSpace" ? (
                                <TextField
                                  value={currentEntry.parkingSpace || ""}
                                  onChange={(e) =>
                                    handleCellEdit(
                                      index,
                                      "parkingSpace",
                                      e.target.value
                                    )
                                  }
                                  onBlur={handleCellBlur}
                                  onKeyPress={handleCellKeyPress}
                                  size="small"
                                  fullWidth
                                  autoFocus
                                  variant="standard"
                                  sx={ocrModalTextFieldStyles}
                                />
                              ) : (
                                <Typography
                                  variant="body2"
                                  fontFamily="monospace"
                                >
                                  {currentEntry.parkingSpace}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell
                              sx={editableCellStyles}
                              onClick={() =>
                                handleCellClick(index, "observation")
                              }
                            >
                              {editingCell?.rowIndex === index &&
                              editingCell?.field === "observation" ? (
                                <TextField
                                  value={currentEntry.observation || ""}
                                  onChange={(e) =>
                                    handleCellEdit(
                                      index,
                                      "observation",
                                      e.target.value
                                    )
                                  }
                                  onBlur={handleCellBlur}
                                  onKeyPress={handleCellKeyPress}
                                  size="small"
                                  fullWidth
                                  autoFocus
                                  variant="standard"
                                  sx={ocrModalTextFieldStyles}
                                />
                              ) : (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {currentEntry.observation
                                    ? capitalizeFirstLetter(
                                        currentEntry.observation
                                      )
                                    : "-"}
                                </Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      }
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <Divider />
              <TablePagination
                className="pagination"
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={result.entries.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                labelRowsPerPage={
                  <Typography variant="body2" component="span" sx={{ fontSize: "0.75rem" }}>
                    {TABLE.ROWS_PER_PAGE}
                  </Typography>
                }
                labelDisplayedRows={() => ""}
                ActionsComponent={PaginationComponent}
                sx={{
                  flexShrink: 0,
                  borderRadius: 0,
                  margin: 0,
                  border: 'none',
                  '.MuiTablePagination-toolbar': {
                    minHeight: '32px',
                    paddingTop: '2px',
                    paddingBottom: '0px',
                    border: 'none',
                  },
                  '.MuiTablePagination-selectLabel, .MuiTablePagination-input, .MuiTablePagination-displayedRows': {
                    fontSize: '0.75rem',
                  },
                  '.MuiTablePagination-select': {
                    fontSize: '0.75rem',
                    border: 'none',
                  },
                  '.MuiTablePagination-selectIcon': {
                    fontSize: '1rem',
                  },
                  '.MuiIconButton-root': {
                    padding: '2px',
                  },
                  '.MuiInputBase-root': {
                    border: 'none',
                    '&:before, &:after': {
                      display: 'none',
                    },
                    fontSize: '0.75rem',
                  },
                  '.MuiTablePagination-input': {
                    fontSize: '0.75rem',
                  },
                }}
              />
            </Paper>
          </>
        )}
      </DialogContent>

      <DialogActions sx={dialogActionsStyles}>
        <Button onClick={onClose} variant="outlined" sx={cancelButtonStyles}>
          Cancelar
        </Button>
        {result && !isLoading && isImageFormatValid && (
          <Button
            onClick={handleImport}
            variant="contained"
            color="primary"
            disabled={result.entries.length === 0}
            sx={importButtonStyles}
          >
            Importar Datos
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default OCRResultModal;
