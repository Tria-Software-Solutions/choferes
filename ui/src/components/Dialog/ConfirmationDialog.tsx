import React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
  Box,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

export type DialogType = 'delete' | 'warning' | 'info' | 'success';

interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: DialogType;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  type = 'info',
  confirmText,
  cancelText,
  loading = false,
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const getIcon = () => {
    switch (type) {
      case 'delete':
        return <DeleteIcon color="error" sx={{ fontSize: 32 }} />;
      case 'warning':
        return <WarningIcon color="warning" sx={{ fontSize: 32 }} />;
      case 'success':
        return <CheckCircleIcon color="success" sx={{ fontSize: 32 }} />;
      default:
        return <InfoIcon color="info" sx={{ fontSize: 32 }} />;
    }
  };

  const getConfirmButtonColor = () => {
    switch (type) {
      case 'delete':
        return 'error';
      case 'warning':
        return 'warning';
      case 'success':
        return 'success';
      default:
        return 'primary';
    }
  };

  const getDefaultConfirmText = () => {
    switch (type) {
      case 'delete':
        return 'Eliminar';
      case 'warning':
        return 'Continuar';
      case 'success':
        return 'Aceptar';
      default:
        return 'Confirmar';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isSmallScreen}
      PaperProps={{
        sx: {
          borderRadius: isSmallScreen ? 0 : 2,
          minWidth: isSmallScreen ? '100%' : 400,
          maxWidth: isSmallScreen ? '100%' : 500,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          {getIcon()}
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: theme.palette.grey[500],
            '&:hover': {
              color: theme.palette.grey[700],
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 4, pb: 2, marginTop: '10px' }}>
        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
          {message}
        </Typography>
      </DialogContent>
      
      <DialogActions
        sx={{
          px: 3,
          pb: 3,
          gap: 2,
          flexDirection: isSmallScreen ? 'column' : 'row',
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          fullWidth={isSmallScreen}
          sx={{
            minWidth: isSmallScreen ? '100%' : 120,
            py: 1.5,
            fontWeight: 600,
          }}
          disabled={loading}
        >
          {cancelText || 'Cancelar'}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={getConfirmButtonColor()}
          fullWidth={isSmallScreen}
          sx={{
            minWidth: isSmallScreen ? '100%' : 120,
            py: 1.5,
            fontWeight: 600,
            boxShadow: 2,
            '&:hover': {
              boxShadow: 4,
            },
          }}
          disabled={loading}
        >
          {loading ? 'Procesando...' : (confirmText || getDefaultConfirmText())}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
