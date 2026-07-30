import {
  actionsBox as sharedActionsBox,
  actionsInnerBox as sharedActionsInnerBox,
} from '../sharedStyles';

export const dialogTextFieldStyles = {
  mt: 2,
  mb: 1,
};

// Re-export premium shared styles
export { 
  infoBox,
  infoIconBox,
  infoTitle,
  infoDesc,
  iconStyle,
  formControl,
} from '../sharedStyles';

export const actionsBox = sharedActionsBox;
export const actionsInnerBox = sharedActionsInnerBox;

export const adjustDialogPaperSx = {
  minWidth: { xs: "90vw", sm: 400, md: 450 },
  maxWidth: { xs: "98vw", sm: 450 },
}; 