import * as React from "react";
import { 
  Button, 
  IconButton,
  Tooltip, 
  Typography,
  Box,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { SxProps } from "@mui/system";
import CloseIcon from "@mui/icons-material/Close";
import { useCallback } from "react";

interface ModalComponentProps {
  buttonType?: "text" | "button" | "icon" | "none";
  buttonLabel?: string;
  buttonIcon?: React.ReactNode;
  variant?: "contained" | "outlined" | "text";
  buttonStyle?: SxProps;
  modalStyle?: SxProps;
  disabled?: boolean;
  modalTooltip?: string;
  modalTitle: string;
  modalDescription?: JSX.Element | string;
  children?: ((props: { handleClose: () => void }) => React.ReactNode) | React.ReactNode;
  onCloseModal?: () => void;
  open?: boolean;
  onOpen?: () => void;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  showActions?: boolean;
  saveButtonText?: string;
  cancelButtonText?: string;
  onSave?: () => void;
  onCancel?: () => void;
  showSaveButton?: boolean;
  showCancelButton?: boolean;
  disableEscapeKeyDown?: boolean;
}

const ModalComponent: React.FC<ModalComponentProps> = ({
  buttonType = "button",
  buttonLabel,
  buttonIcon,
  variant = "contained",
  buttonStyle,
  modalStyle,
  disabled,
  modalTooltip,
  modalTitle,
  modalDescription,
  children,
  onCloseModal,
  open: externalOpen,
  onOpen,
  maxWidth = 'md',
  fullWidth = true,
  showActions = false,
  saveButtonText = 'Guardar',
  cancelButtonText = 'Cancelar',
  onSave,
  onCancel,
  showSaveButton = true,
  showCancelButton = true,
  disableEscapeKeyDown = false,
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = externalOpen !== undefined;
  const open = isControlled ? externalOpen : internalOpen;

  const handleOpen = useCallback(() => {
    if (!isControlled) {
      setInternalOpen(true);
    }
    if (onOpen) {
      onOpen();
    }
  }, [isControlled, onOpen]);

  const handleClose = useCallback(() => {
    if (!isControlled) {
      setInternalOpen(false);
    }
    if (onCloseModal) {
      onCloseModal();
    }
    if (onCancel) {
      onCancel();
    }
  }, [isControlled, onCloseModal, onCancel]);

  const handleSave = useCallback(() => {
    if (onSave) {
      onSave();
    }
  }, [onSave]);

  const renderButton = () => {
    if (buttonType === "none") return null;

    const buttonProps = {
      onClick: handleOpen,
      sx: buttonStyle,
      disabled,
    };

    const tooltipWrapper = (button: React.ReactElement) => 
      modalTooltip ? (
        <Tooltip title={modalTooltip} arrow>
          {button}
        </Tooltip>
      ) : button;

    if (buttonType === "text") {
      return tooltipWrapper(
        <Button {...buttonProps}>
          {buttonLabel}
        </Button>
      );
    } else if (buttonType === "icon") {
      return tooltipWrapper(
        <IconButton {...buttonProps}>
          {buttonIcon}
        </IconButton>
      );
    } else {
      return tooltipWrapper(
        <Button variant={variant} {...buttonProps}>
          {buttonIcon}
          {buttonLabel}
        </Button>
      );
    }
  };

  return (
    <div>
      {renderButton()}

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth={maxWidth}
        fullWidth={fullWidth}
        fullScreen={isSmallScreen}
        disableEscapeKeyDown={disableEscapeKeyDown}
        PaperProps={{
          sx: {
            borderRadius: isSmallScreen ? 0 : 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            border: '1px solid',
            borderColor: 'divider',
            ...modalStyle,
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 3,
            py: 2,
            marginBottom: '25px'
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {modalTitle}
          </Typography>
          <IconButton
            onClick={handleClose}
            sx={{
              color: theme.palette.primary.contrastText,
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            p: 4,
            pt: '25px',
            pb: 3,
            backgroundColor: theme.palette.background.paper,
          }}
        >
          {modalDescription && (
            <Typography sx={{ mb: 2, color: theme.palette.text.secondary }}>
              {modalDescription}
            </Typography>
          )}
          <Box>
            {children && typeof children === "function"
              ? children({ handleClose })
              : children}
          </Box>
        </DialogContent>

        {showActions && (showSaveButton || showCancelButton) && (
          <DialogActions
            sx={{
              p: 4,
              pt: 2,
              backgroundColor: theme.palette.background.paper,
              borderTop: '1px solid',
              borderColor: theme.palette.divider,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                width: '100%',
                justifyContent: 'flex-end',
                flexDirection: { xs: 'column', sm: 'row' },
              }}
            >
              {showCancelButton && (
                <Button
                  variant="outlined"
                  onClick={handleClose}
                  fullWidth={isSmallScreen}
                  sx={{
                    minWidth: { xs: '100%', sm: 120 },
                  }}
                >
                  {cancelButtonText}
                </Button>
              )}
              {showSaveButton && (
                <Button
                  variant="contained"
                  onClick={handleSave}
                  fullWidth={isSmallScreen}
                  sx={{
                    minWidth: { xs: '100%', sm: 120 },
                  }}
                >
                  {saveButtonText}
                </Button>
              )}
            </Box>
          </DialogActions>
        )}
      </Dialog>
    </div>
  );
};

export default ModalComponent;
