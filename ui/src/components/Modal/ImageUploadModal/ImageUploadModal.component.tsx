import React, { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  useTheme,
  IconButton,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";
import { X, Upload, Image, FileImage, ZoomIn, ZoomOut, RotateCw, Download } from "lucide-react";
import { OCRService, OCRResult } from "../../../services/ocrService";

interface ImageUploadModalProps {
  open: boolean;
  onClose: () => void;
  onOCRComplete: (result: OCRResult) => void;
  selectedDate: Date;
}

const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  open,
  onClose,
  onOCRComplete,
  selectedDate,
}) => {
  const theme = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Consistent button styling
  const buttonSx = {
    borderRadius: '8px',
    textTransform: 'none',
    borderColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)",
    '&:hover': {
      borderColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.25)",
      backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
      color: theme.palette.text.secondary,
    },
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Por favor selecciona un archivo de imagen válido (JPG, PNG, etc.)');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('El archivo es demasiado grande. Por favor selecciona una imagen menor a 10MB');
        return;
      }

      setSelectedFile(file);
      setError(null);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);

    try {
      const result = await OCRService.processImage(selectedFile);
      onOCRComplete(result);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar la imagen');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const fakeEvent = {
        target: { files: [file] }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileSelect(fakeEvent);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3,
          py: 2.5,
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          borderBottom: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Box
            sx={{
              backgroundColor: theme.palette.primary.main,
              borderRadius: "10px",
              p: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Upload size={22} color={theme.palette.primary.contrastText} />
          </Box>
          <Box>
            <Typography
              variant="h6"
              fontWeight={700}
              color="inherit"
              sx={{ letterSpacing: "-0.02em" }}
            >
              Escanear Imagen de Vehículos
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Sube una imagen para extraer datos de vehículos automáticamente
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={handleClose}>
          <X size={20} />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3, minHeight: 400, display: 'flex', flexDirection: 'column', flex: 1 }}>
        {!selectedFile ? (
          <Paper
            sx={{
              border: `2px dashed ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)"}`,
              borderRadius: "12px",
              p: 4,
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.2s ease",
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 300,
              "&:hover": {
                borderColor: theme.palette.primary.main,
                backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
              },
            }}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <Box sx={{ mb: 2 }}>
              <Image size={48} color={theme.palette.text.secondary} />
            </Box>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Arrastra una imagen aquí
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              o haz clic en cualquier parte para seleccionar un archivo
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, justifyContent: "center" }}>
              <FileImage size={16} color={theme.palette.text.secondary} />
              <Typography variant="caption" color="text.secondary">
                Formatos admitidos: JPG, PNG, GIF (máx. 10MB)
              </Typography>
            </Box>
          </Paper>
        ) : (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Preview Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Vista Previa
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
                  disabled={isProcessing}
                  sx={{ minWidth: 'auto', p: 1 }}
                >
                  <ZoomOut size={16} />
                </Button>
                <Typography variant="body2" sx={{ minWidth: '40px', textAlign: 'center', py: 0.5 }}>
                  {Math.round(zoomLevel * 100)}%
                </Typography>
                <Button
                  size="small"
                  onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.25))}
                  disabled={isProcessing}
                  sx={{ minWidth: 'auto', p: 1 }}
                >
                  <ZoomIn size={16} />
                </Button>
                <Button
                  size="small"
                  onClick={() => setRotation((rotation + 90) % 360)}
                  disabled={isProcessing}
                  sx={{ minWidth: 'auto', p: 1 }}
                >
                  <RotateCw size={16} />
                </Button>
              </Box>
            </Box>

            {/* Enhanced Preview Container */}
            <Paper
              sx={{
                borderRadius: "16px",
                overflow: "hidden",
                mb: 2,
                position: "relative",
                backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
                border: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
              }}
            >
              {error && (
                <Alert 
                  severity="error" 
                  onClose={() => setError(null)}
                  action={
                    <IconButton 
                      onClick={() => setError(null)}
                      size="small"
                      sx={{ 
                        color: 'inherit',
                      }}
                    >
                      <X size={16} />
                    </IconButton>
                  }
                  sx={{ 
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    right: 16,
                    zIndex: 10,
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}
                >
                  {error}
                </Alert>
              )}
              {previewUrl && (
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    height: 400,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: theme.palette.mode === "dark" ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.05)",
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    component="img"
                    src={previewUrl}
                    alt="Preview"
                    sx={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                      transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                      transition: 'transform 0.3s ease',
                      cursor: zoomLevel > 1 ? 'move' : 'default',
                    }}
                  />
                </Box>
              )}
              {isProcessing && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.8)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  <CircularProgress size={60} sx={{ mb: 2, color: "white" }} />
                  <Typography variant="h6" fontWeight={600}>
                    Procesando imagen...
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
                    Extrayendo datos con Gemini Vision API
                  </Typography>
                </Box>
              )}
            </Paper>

            {/* File Info */}
            <Paper
              sx={{
                p: 2,
                borderRadius: "12px",
                backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
                border: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                mb: 2,
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                <Box display="flex" alignItems="center" gap={1}>
                  <FileImage size={16} color={theme.palette.text.secondary} />
                  <Typography variant="body2" fontWeight={500}>
                    {selectedFile.name}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="caption" color="text.secondary">
                  Tipo: {selectedFile.type}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Modificado: {new Date(selectedFile.lastModified).toLocaleDateString('es-ES')}
                </Typography>
              </Box>
            </Paper>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button
                variant="outlined"
                startIcon={<FileImage size={16} />}
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                sx={buttonSx}
              >
                Cambiar Imagen
              </Button>
              <Button
                variant="outlined"
                startIcon={<Download size={16} />}
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = previewUrl!;
                  link.download = selectedFile.name;
                  link.click();
                }}
                disabled={isProcessing}
                sx={buttonSx}
              >
                Descargar
              </Button>
              <Button
                variant="outlined"
                startIcon={<RotateCw size={14} />}
                onClick={() => {
                  setZoomLevel(1);
                  setRotation(0);
                }}
                disabled={isProcessing}
                sx={buttonSx}
              >
                Restablecer vista
              </Button>
            </Box>
          </Box>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />
      </DialogContent>

      <DialogActions sx={{ 
        p: 3, 
        pt: 0,
        gap: 2,
        borderTop: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
        backgroundColor: theme.palette.background.paper,
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
      }}>
        <Button 
          onClick={handleClose} 
          variant="outlined"
          sx={{
            borderRadius: "10px",
            px: 3,
            py: 1.5,
            fontWeight: 600,
            textTransform: "none",
            marginTop: 2,
            borderColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)",
            '&:hover': {
              borderColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.25)",
              backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
            },
          }}
        >
          Cancelar
        </Button>
        {selectedFile && !isProcessing && (
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={isProcessing}
            sx={{
              borderRadius: "10px",
              px: 3,
              py: 1.5,
              fontWeight: 600,
              textTransform: "none",
              marginTop: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              },
            }}
          >
            {isProcessing ? "Procesando..." : "Procesar Imagen"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ImageUploadModal;
