import * as React from "react";
import { Button, IconButton, Modal, Typography } from "@mui/material";
import { Box, SxProps } from "@mui/system";
import CloseIcon from "@mui/icons-material/Close";

interface ModalComponentProps {
  buttonType: "text" | "button" | "icon";
  buttonLabel?: string;
  buttonIcon?: React.ReactNode;
  variant?: "contained" | "outlined" | "text";
  buttonStyle?: SxProps;
  modalStyle?: SxProps;
  disabled?: boolean;
  modalTitle: string;
  modalDescription?: JSX.Element | string;
  children?: (props: { handleClose: () => void }) => React.ReactNode;
  onCloseModal?: () => void;
}

const defaultModalStyle = {
  position: "absolute" as "absolute",
  zIndex: 9999,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  borderRadius: "8px",
  boxShadow: 24,
  p: 4,
};

const ModalComponent: React.FC<ModalComponentProps> = ({
  buttonType,
  buttonLabel = "Open Modal",
  buttonIcon,
  variant,
  buttonStyle,
  modalStyle,
  disabled,
  modalTitle,
  modalDescription,
  children,
  onCloseModal,
}) => {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    if (onCloseModal) {
      onCloseModal();
    }
  };

  return (
    <div>
      {buttonType === "text" ? (
        <Button onClick={handleOpen} sx={buttonStyle} disabled={disabled}>
          {buttonLabel}
        </Button>
      ) : buttonType === "icon" ? (
        <IconButton onClick={handleOpen} sx={buttonStyle} disabled={disabled}>
          {buttonIcon}
        </IconButton>
      ) : (
        <Button
          variant={variant}
          sx={buttonStyle}
          disabled={disabled}
          onClick={handleOpen}
        >
          {buttonIcon}
        </Button>
      )}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box sx={{ ...defaultModalStyle, ...modalStyle }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography id="modal-title" variant="h6" component="h2">
              {modalTitle}
            </Typography>
            <IconButton onClick={handleClose} aria-label="close">
              <CloseIcon />
            </IconButton>
          </Box>
          {modalDescription && (
            <Typography id="modal-description" sx={{ mt: 2 }}>
              {modalDescription}
            </Typography>
          )}
          <Box sx={{ mt: 2 }}>
            {children && typeof children === "function"
              ? children({ handleClose })
              : children}
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default ModalComponent;
