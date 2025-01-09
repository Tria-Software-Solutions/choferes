import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { SxProps } from "@mui/system";

interface ModalComponentProps {
  buttonType: "text" | "icon";
  buttonLabel?: string;
  buttonIcon?: React.ReactNode;
  modalTitle: string;
  modalDescription?: string;
  buttonStyle?: SxProps;
  modalStyle?: SxProps;
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
  modalTitle,
  modalDescription,
  buttonStyle,
  modalStyle,
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
      ) : (
        <IconButton onClick={handleOpen} sx={buttonStyle}>
          {buttonIcon}
        </IconButton>
      )}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="generic-modal-title"
        aria-describedby="generic-modal-description"
      >
        <Box sx={{ ...defaultModalStyle, ...modalStyle }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography id="generic-modal-title" variant="h6" component="h2">
              {modalTitle}
            </Typography>
            <IconButton onClick={handleClose} aria-label="close">
              <CloseIcon />
            </IconButton>
          </Box>
          {modalDescription && (
            <Typography id="generic-modal-description" sx={{ mt: 2 }}>
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
