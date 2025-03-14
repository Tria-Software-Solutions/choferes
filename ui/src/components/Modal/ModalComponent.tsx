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
  modalTitle: string;
  modalDescription?: string;
  children?: React.ReactNode;
}

const defaultModalStyle = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "60%",
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
  modalTitle,
  modalDescription,
  children,
}) => {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
      {buttonType === "text" ? (
        <Button onClick={handleOpen} sx={buttonStyle}>
          {buttonLabel}
        </Button>
      ) : buttonType === "icon" ? (
        <IconButton onClick={handleOpen} sx={buttonStyle}>
          {buttonIcon}
        </IconButton>
      ) : (
        <Button variant={variant} sx={buttonStyle} onClick={handleOpen}>
          {buttonIcon}
        </Button>
      )}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        sx={{ zIndex: 9999 }}
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
          <Box sx={{ mt: 2 }}>{children}</Box>
        </Box>
      </Modal>
    </div>
  );
};

export default ModalComponent;
