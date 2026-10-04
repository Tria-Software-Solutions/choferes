import React from "react";
import { Box, Paper, Typography, useMediaQuery, useTheme } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { useMobileShell } from "../../hooks/useMobileShell";

// Standard page scaffolding shared by every screen of the app:
//
//   <PageContainer>
//     <PageCard>
//       <PageHeader icon={…} title="…" subtitle="…" actions={…} toolbar={…} toolbarEnd={…} />
//       <PageBody>…table / board / content…</PageBody>
//     </PageCard>
//   </PageContainer>
//
// On desktop (md+) a page fills the viewport and its body scrolls internally,
// which keeps table headers and toolbars in view. On smaller screens the page
// flows naturally and the whole view scrolls, avoiding cramped nested scroll
// areas on phones.

const mergeSx = (base: SxProps<Theme>, sx?: SxProps<Theme>): SxProps<Theme> =>
  (sx ? [base, ...(Array.isArray(sx) ? sx : [sx])] : base) as SxProps<Theme>;

interface PageContainerProps {
  children: React.ReactNode;
  /** Fill the viewport on md+ so the body can scroll internally (default). */
  fill?: boolean;
  sx?: SxProps<Theme>;
}

export const PageContainer: React.FC<PageContainerProps> = ({ children, fill = true, sx }) => {
  const isMobileShell = useMobileShell();
  return (
  <Box
    component="main"
    sx={mergeSx(
      {
        display: "flex",
        flexDirection: "column",
        // Móvil: las superficies llegan de borde a borde, como en una app.
        gap: isMobileShell ? 1 : { xs: 1.5, md: 2 },
        px: isMobileShell ? 0 : { xs: 1, sm: 1.5, md: 2 },
        py: isMobileShell ? 0 : { xs: 1, sm: 1.5, md: 2 },
        width: "100%",
        maxWidth: 1920,
        mx: "auto",
        minHeight: 0,
        ...(fill && { height: { md: "100%" } }),
      },
      sx,
    )}
  >
    {children}
  </Box>
  );
};

interface PageCardProps {
  children: React.ReactNode;
  /** Grow to the available height on md+ (the page's main card). */
  grow?: boolean;
  sx?: SxProps<Theme>;
}

// The raised surface that holds a page's header and content.
export const PageCard: React.FC<PageCardProps> = ({ children, grow = true, sx }) => {
  const theme = useTheme();
  const { borders, shadows } = theme.tokens;
  const isMobileShell = useMobileShell();
  return (
    <Paper
      elevation={0}
      sx={mergeSx(
        {
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          overflow: "hidden",
          borderRadius: isMobileShell ? 0 : "14px",
          border: isMobileShell ? "none" : borders.paper,
          boxShadow: isMobileShell ? "none" : `0 1px 2px ${shadows.card}`,
          ...(grow && { flex: { md: 1 } }),
        },
        sx,
      )}
    >
      {children}
    </Paper>
  );
};

interface PageHeaderProps {
  /** Page icon (rendered at 20px). */
  icon?: React.ReactNode;
  title: React.ReactNode;
  /** Shorter title for phones. */
  mobileTitle?: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Top-right actions (export, secondary buttons). */
  actions?: React.ReactNode;
  /** Filters row under the title: search, segmented toggles, date pickers. */
  toolbar?: React.ReactNode;
  /** Right side of the filters row: primary actions ("Nuevo …"). */
  toolbarEnd?: React.ReactNode;
  sx?: SxProps<Theme>;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  icon,
  title,
  mobileTitle,
  subtitle,
  actions,
  toolbar,
  toolbarEnd,
  sx,
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const { colors, borders } = theme.tokens;
  const hasToolbar = Boolean(toolbar || toolbarEnd);
  // En el shell móvil la barra superior ya muestra el título de la pantalla.
  const isMobileShell = useMobileShell();
  const showTitle = !isMobileShell;
  if (isMobileShell && !subtitle && !actions && !hasToolbar) return null;

  return (
    <Box
      component="header"
      sx={mergeSx(
        {
          flexShrink: 0,
          px: { xs: 2, sm: 2.5 },
          py: { xs: 1.5, sm: 2 },
          borderBottom: borders.hairline,
          backgroundColor: colors.surface,
        },
        sx,
      )}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
        {icon && showTitle && (
          <Box
            aria-hidden
            sx={{
              flexShrink: 0,
              width: 40,
              height: 40,
              borderRadius: "11px",
              display: "grid",
              placeItems: "center",
              color: colors.accent,
              backgroundColor: colors.accentSoft,
              "& svg": { width: 19, height: 19, strokeWidth: 1.85 },
            }}
          >
            {icon}
          </Box>
        )}
        <Box sx={{ minWidth: 0, flex: 1 }}>
          {showTitle && <Typography
            component="h1"
            sx={{
              fontWeight: 700,
              fontSize: { xs: "1.0625rem", sm: "1.1875rem" },
              letterSpacing: "-0.02em",
              lineHeight: 1.25,
              color: colors.text,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {isSmallScreen && mobileTitle ? mobileTitle : title}
          </Typography>}
          {subtitle && (
            <Typography
              component="div"
              sx={{
                mt: showTitle ? 0.25 : 0,
                fontSize: "0.8125rem",
                fontWeight: 500,
                lineHeight: 1.4,
                color: colors.textMuted,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
        {actions && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
            {actions}
          </Box>
        )}
      </Box>

      {hasToolbar && (
        <Box
          sx={{
            mt: { xs: 1.5, sm: 2 },
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "stretch", sm: "center" },
            flexWrap: { sm: "wrap" },
            gap: 1.5,
          }}
        >
          {toolbar && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1.5,
                flex: 1,
                minWidth: 0,
              }}
            >
              {toolbar}
            </Box>
          )}
          {toolbarEnd && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                justifyContent: { xs: "stretch", sm: "flex-end" },
                gap: 1,
                ml: { sm: "auto" },
                "& > .MuiButton-root": { flex: { xs: 1, sm: "none" } },
              }}
            >
              {toolbarEnd}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

interface PageBodyProps {
  children: React.ReactNode;
  /** Scroll inside the card on md+ (tables, boards). */
  scroll?: boolean;
  sx?: SxProps<Theme>;
}

// Content area under the header. Fills the card on md+.
export const PageBody: React.FC<PageBodyProps> = ({ children, scroll = false, sx }) => (
  <Box
    sx={mergeSx(
      {
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        flex: { md: 1 },
        overflow: { md: scroll ? "auto" : "hidden" },
      },
      sx,
    )}
  >
    {children}
  </Box>
);
