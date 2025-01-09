import * as React from "react";
import { ButtonGroup, Button, Popper, Grow, Paper, ClickAwayListener, MenuList, MenuItem } from "@mui/material";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

interface Option {
  label?: string;
  icon?: React.ReactNode;
  action?: () => void;
  disabled?: boolean;
}

interface SplitButtonProps {
  buttonText?: string;
  options: Option[];
  defaultIndex?: number;
  buttonIcon?: React.ReactNode;
}

const SplitButton: React.FC<SplitButtonProps> = ({
  buttonText,
  options,
  defaultIndex = 0,
  buttonIcon,
}) => {
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = React.useState(defaultIndex);

  const handleClick = () => {
    const action = options[selectedIndex]?.action;
    if (action) {
      action();
    }
  };

  const handleMenuItemClick = (index: number) => {
    setSelectedIndex(index);
    setOpen(false);
    const action = options[index]?.action;
    if (action) {
      action();
    }
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: Event) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }
    setOpen(false);
  };

  return (
    <React.Fragment>
      <ButtonGroup
        variant="contained"
        ref={anchorRef}
        sx={{ height: "56px" }}
      >
        <Button onClick={handleClick} startIcon={buttonIcon}>
          {buttonText}
        </Button>
        <Button
          size="small"
          aria-controls={open ? "split-button-menu" : undefined}
          aria-expanded={open ? "true" : undefined}
          aria-label="select merge strategy"
          aria-haspopup="menu"
          onClick={handleToggle}
        >
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>
      <Popper
        sx={{ zIndex: 2 }}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === "bottom" ? "center top" : "center bottom",
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id="split-button-menu" autoFocusItem>
                  {options.map((option, index) => (
                    <MenuItem
                      key={option.label}
                      disabled={option.disabled}
                      selected={index === selectedIndex}
                      onClick={() => handleMenuItemClick(index)}
                    >
                      {option.icon && (
                        <span style={{ marginRight: 8 }}>{option.icon}</span>
                      )}
                      {option.label}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </React.Fragment>
  );
};

export default SplitButton;
