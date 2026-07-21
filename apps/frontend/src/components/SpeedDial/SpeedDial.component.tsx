import { SpeedDial, SpeedDialIcon, SpeedDialAction } from "@mui/material";
import { speedDialStyles, speedDialActionStyles } from "./SpeedDial.styles";

interface Action {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

interface SpeedDialComponentProps {
  actions: Action[];
  mainIcon?: React.ReactNode;
  openIcon?: React.ReactNode;
  position?: { bottom?: number; right?: number; left?: number; top?: number };
  direction?: "up" | "down" | "left" | "right";
}

// SpeedDialComponent renders a Material-UI SpeedDial with customizable actions and icons.
// Props:
// - actions: array of action objects with label, icon, and onClick handler
// - mainIcon: icon for the closed state
// - openIcon: icon for the open state
// - direction: direction in which actions open
const SpeedDialComponent: React.FC<SpeedDialComponentProps> = ({
  actions,
  mainIcon = <SpeedDialIcon />,
  openIcon,
  direction = "up",
}) => {
  return (
    <SpeedDial
      ariaLabel="SpeedDial"
      icon={mainIcon}
      openIcon={openIcon}
      direction={direction}
      sx={speedDialStyles}
    >
      {actions.map((action) => (
        <SpeedDialAction
          key={action.label}
          icon={action.icon}
          sx={speedDialActionStyles}
          tooltipTitle={action.label}
          onClick={action.onClick}
        />
      ))}
    </SpeedDial>
  );
};

export default SpeedDialComponent;
