import { SpeedDial, SpeedDialIcon, SpeedDialAction } from "@mui/material";
import PropTypes from "prop-types";

interface Action {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

interface CustomSpeedDialProps {
  actions: Action[];
  mainIcon?: React.ReactNode;
  openIcon?: React.ReactNode;
  position?: { bottom?: number; right?: number; left?: number; top?: number };
  direction?: "up" | "down" | "left" | "right";
}

const CustomSpeedDial: React.FC<CustomSpeedDialProps> = ({
  actions,
  mainIcon = <SpeedDialIcon />,
  openIcon,
  direction = "up",
}) => {
  return (
    <SpeedDial
      ariaLabel="SpeedDial"
      icon={<SpeedDialIcon icon={mainIcon} openIcon={openIcon} />}
      direction={direction}
      sx={{
        zIndex: 1500,
      }}
    >
      {actions.map((action) => (
        <SpeedDialAction
          key={action.label}
          icon={action.icon}
          sx={{
            zIndex: 2000,
          }}
          tooltipTitle={action.label}
          onClick={action.onClick}
        />
      ))}
    </SpeedDial>
  );
};

CustomSpeedDial.propTypes = {
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      icon: PropTypes.node.isRequired,
      onClick: PropTypes.func.isRequired,
    }),
  ).isRequired,
  mainIcon: PropTypes.node,
  openIcon: PropTypes.node,
  direction: PropTypes.oneOf(["up", "down", "left", "right"]),
};

export default CustomSpeedDial;
