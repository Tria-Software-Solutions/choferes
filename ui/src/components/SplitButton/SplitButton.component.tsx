import * as React from "react";
import {
  ButtonGroup,
  Button,
  Popper,
  Grow,
  Paper,
  ClickAwayListener,
  MenuList,
  MenuItem,
} from "@mui/material";
import { ChevronDown } from "lucide-react";
import {
  buttonGroupStyles,
  popperStyles,
  growStyles,
  menuIconSpanStyles,
} from "./SplitButton.styles";

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

// SplitButton component provides a button with a dropdown menu for multiple actions.
// Props:
// - buttonText: main button text
// - options: array of option objects (label, icon, action, disabled)
// - defaultIndex: default selected option
// - buttonIcon: icon for the main button
const SplitButtonComponent: React.FC<SplitButtonProps> = ({
  buttonText,
  options,
  defaultIndex = 0,
  buttonIcon,
}) => {
  const [open, setOpen] = React.useState(false); // Controls menu open state
  const anchorRef = React.useRef<HTMLDivElement>(null); // Reference for the button group
  const [selectedIndex, setSelectedIndex] = React.useState(defaultIndex); // Tracks selected option

  const handleClick = () => {
    // Executes the action of the currently selected option
    const action = options[selectedIndex]?.action;
    if (action) {
      action();
    }
  };

  const handleMenuItemClick = (index: number) => {
    // Selects a menu item and executes its action
    setSelectedIndex(index);
    setOpen(false);
    const action = options[index]?.action;
    if (action) {
      action();
    }
  };

  const handleToggle = () => {
    // Toggles the menu open/close state
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: Event) => {
    // Closes the menu if the click is outside the button group
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
      <ButtonGroup variant="contained" ref={anchorRef} sx={buttonGroupStyles}>
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
          <ChevronDown size={20} />
        </Button>
      </ButtonGroup>
      <Popper
        sx={popperStyles}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow {...TransitionProps} style={growStyles(placement)}>
            <Paper
              sx={{
                border: 'none',
                boxShadow: 'none',
              }}
            >
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
                        <span style={menuIconSpanStyles}>{option.icon}</span>
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

export default SplitButtonComponent;
