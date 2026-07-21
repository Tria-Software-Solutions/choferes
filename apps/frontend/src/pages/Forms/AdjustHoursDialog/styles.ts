import { Theme } from '@mui/material/styles';

export const infoBox = (theme: Theme) => ({
  display: 'flex',
  alignItems: 'flex-start',
  background: theme.palette.grey[100],
  borderRadius: 8,
  padding: theme.spacing(2),
  mt: 2,
});

export const infoIconBox = (theme: Theme) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: theme.palette.primary.light,
  color: theme.palette.primary.main,
  borderRadius: '50%',
  width: 36,
  height: 36,
  mr: 2,
});

export const infoTitle = (theme: Theme) => ({
  fontWeight: 700,
  fontSize: '1rem',
  color: theme.palette.text.primary,
  mb: 0.5,
});

export const infoDesc = (theme: Theme) => ({
  fontSize: '0.95rem',
  color: theme.palette.text.secondary,
});

export const dialogTextFieldStyles = {
  mt: 2,
  mb: 1,
};

export const actionsBox = (theme: Theme) => ({
  display: "flex",
  flexDirection: { xs: "column", sm: "row" },
  justifyContent: "space-between",
  gap: { xs: 1, sm: 2 },
  pt: 2,
  borderTop: "1px solid",
  borderColor: theme.palette.divider,
});

export const actionsInnerBox = {
  display: "flex",
  flexDirection: { xs: "column", sm: "row" },
  gap: { xs: 1, sm: 2 },
  width: { xs: "100%", sm: "auto" },
  order: { xs: 1, sm: 2 },
};

export const adjustDialogPaperSx = {
  minWidth: { xs: "90vw", sm: 400, md: 450 },
  maxWidth: { xs: "98vw", sm: 450 },
}; 