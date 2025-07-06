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