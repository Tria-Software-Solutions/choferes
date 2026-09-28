<!-- markdownlint-disable MD024 -->
<!-- MD024 is disabled because Keep a Changelog intentionally repeats sub-headings (Added, Changed, Fixed) under each version. -->

# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
via git tags (once tagged).

---

## [Unreleased]

### Added

- Pay slips ("Comprobante de pago") reproduce the company's Word template in the email (Resend, logos as inline CID images), the attached PDF and the on-screen editor: both logos over a thick rule, "PERIODO: 30.SEPT. 2026", the concept table (Salario ordinario, Salario extraordinario, Kilometraje, Otros, Cargas Sociales, Rebajos, Total a pagar), "*Moneda: Colón CR" and the legal footer
- Pay slips fill themselves every quincena: a background job (every 30 min and at startup) creates the slip of each employee who worked in the running and the previous quincena and keeps pending ones up to date. Ordinary salary = up to 96 h × rate, overtime = extra hours × rate × 1.5, social charges = 10.83 % CCSS (tunable with `PAYROLL_REGULAR_HOURS_PER_BIWEEK`, `PAYROLL_OVERTIME_MULTIPLIER`, `PAYROLL_SOCIAL_CHARGES_RATE`); `POST /api/payments/generate` fills a given quincena on demand
- Every slip amount can be edited by hand; edited fields are remembered (`payments.manualFields`) so refreshes never overwrite them, and each one can be returned to automatic. Editing a slip that was already emailed sets it back to "Pendiente"
- "Tareas" page (`/tasks`): personal to-do lists with Hoy / Próximos / Importantes / Todas / Completadas views, custom colored lists, quick add with date / reminder / priority / list, steps, notes, recurrence (daily, weekdays, weekly, monthly, yearly), priorities, stars, drag-and-drop ordering, search and a detail panel (full-screen on phones)
- Task reminders: delivered as in-app notifications by a 30 s background job (also on every notifications fetch, so they arrive after the server wakes up), announced with a toast and, when the tab is in the background and permission was granted, a desktop notification that opens the task. New notification setting "Recordatorios de tareas"
- Notifications are polled every 30 s and when the tab regains focus
- `tasks:view|create|edit|delete` permissions, granted to every seeded role (migration `20261003000000-add-task-permissions`) and enforced by the API
- Shared `UserAvatar`: Configuración, the top bar, the account menu and the mobile drawer show the same avatar
- GitHub Actions CI pipeline (`.github/workflows/ci.yml`)
- `CONTRIBUTING.md` with development guidelines
- Badges in README (CI status, Node version, Turborepo, license)
- ESLint config overrides for `**/services/**`, `**/scripts/**`, `**/utils/pagination.ts`
- Script `cleanup:orphans` to remove orphaned FK records
- Server-side summary recalculation: `POST /api/hours-worked/recalculate` with optional `employeeId` and `date` scoping, recalculating weekly/biweekly/monthly summaries (`summaryRecalculationService.ts`)
- Optional `dateFrom`/`dateTo` range filter on `GET /api/hours-worked` (validated ISO dates), so the board fetches only the visible week
- Employee file: contract dates (hire date) and termination data (date, reason, notes) with a derived active/inactive status, plus `position` and `nationalId` (`PUT /api/employees/:id` whitelists the editable fields)
- Driver's licenses per employee: `GET/POST/PUT/DELETE /api/employee-licenses` with Costa Rica license categories and computed expiry status (`vigente` / `por_vencer` / `vencida`)
- Disciplinary actions (llamadas de atención / amonestaciones): `GET/POST/PUT/DELETE /api/disciplinary-actions` with type, severity and attachments stored as base64 data URLs (max 3 files, ~2MB each)
- Vacation accrual per Costa Rica labor law (art. 153, prorated): `GET /api/employees/:id/vacation-accrual` returns accrued/taken/available business days
- New permissions `licenses:*` and `disciplinary:*` (modules Licencias / Amonestaciones) and their role assignments
- Employees list: active/inactive status column, worst driver's-license status per employee, and a status filter (Todos / Activos / Inactivos)
- Hours board: shows only active employees by default, with a toggle to include terminated employees
- `GET /api/employees` accepts an optional `isActive=true|false` filter (validated); the employees list applies the status filter server-side
- KPI band: new "Licencias por vencer" metric counting employees with expired/expiring licenses
- Standard page layout (`components/Layout`): `PageContainer`, `PageCard`, `PageHeader`, `PageBody`, `EmptyState`, `LoadingState`. Every management page (Roles, Empleados, Vehículos, Horarios, Reportes, expediente de empleado) uses the same header, toolbar, gutters and loading/empty states
- Shared `DateNavigator` (‹ fecha › ↺) used by Roles and Vehículos in the same order
- Theme tokens exposed as `theme.tokens` (colors, borders, shadows per mode) and a theme-driven `CssBaseline` (body, selection, scrollbars, focus ring)
- `POST /api/auth/logout` expires the httpOnly session cookies; the client calls it on logout
- Migration `20260929000000-resync-serial-sequences` re-syncs every serial `id` sequence (seeded rows had left `users`/`roles` behind `MAX(id)`)
- Design system: zinc neutrals, a single indigo accent and soft status tints (`accent`, `accentSoft`, `successSoft`, `warningSoft`, `errorSoft`, `infoSoft`) in `theme/tokens.ts`; `createAppTheme` is the single source for buttons, fields, tables, dialogs, menus, chips and tabs; charts read `theme/chartPalette.ts`
- Top navigation bar (`AppBar/TopNav`) with the brand, section links, theme toggle, notifications and a user menu; the mobile drawer uses the same labels, icons and active state
- Shared building blocks: `StatCard`/`StatGrid`, `StatusBadge`, `PanelHeader` (Configuración panels and expediente cards) and `ExportMenu` (replaces the floating export SpeedDial on every list page)

### Changed

- Icons: the whole app uses Tabler (`@tabler/icons-react`) instead of lucide-react and MUI icons
- Translated all documentation from Spanish to English
- Monorepo restructured: apps moved to `apps/frontend` and `apps/backend`
- Huskylint-staged config: now runs `eslint --fix --max-warnings 100` instead of `npm run lint`
- Backend lint warnings reduced from 58 to 0
- Employees list and hours board: the status filter (and search) is now persisted between navigations alongside the other table preferences (`useTablePreferences` / `localStorage`)
- Employees KPIs: "Sin tarifa" and "Licencias por vencer" now count the full roster instead of only the rows matching the current search/status filter, so alerts are never hidden by a filter
- WeeklyBoard/RolesPage recalculate summaries via the server endpoint instead of client-side backfill; the board now loads hours only for the visible week
- `parseCalendarDate` shared by `hoursWorkedService` and `summaryRecalculationService` to avoid UTC-offset date shifts on `YYYY-MM-DD` inputs
- Dark mode: `palette.primary` is now a light foreground (icons, active states, spinners, tab indicators were near-invisible); primary buttons are light-on-dark. Inverse surfaces use the `inverseBg`/`onInverse` tokens
- Responsive: below `md` pages scroll as a whole instead of nesting scroll areas; data grids grow with their rows; the footer moves to the end of the content on phones
- `SegmentedToggle` is a keyboard-accessible radio group (arrow keys, `aria-checked`) with a readable active state in every mode
- Removed global `MuiPaper` bottom margin (leaked into menus, popovers and dialogs) and hover lift/scale on non-interactive cards and avatars
- Changing your own password requires the current one; the Settings form asks for it and shows the server error under that field
- Login errors are generic ("Credenciales incorrectas") and the disabled-account message is only shown after valid credentials
- 5xx responses no longer serialize raw error objects (SQL/schema details); they are logged server-side
- UI redesign on every page with one visual language: 1px hairlines instead of heavy shadows, the same page header (accent icon tile), tables (`EditableTable`, `StickyDataGrid`) with a shared header, row height, hover and pagination footer, and ghost row actions
- Dialogs share one layout (icon tile, title/subtitle, close, footer actions); delete confirmations are a compact centered dialog with a destructive button. The hours board's "Ajustar horas" and confirmation dialogs and the quick-assign popover now use it too
- Form fields have visible labels instead of placeholder-only inputs (employee, user, role, vehicle, courier, schedule, password and expediente forms)
- Toasts are surface cards with a status-colored icon; employee avatars use a tint of the employee color; notifications, the mobile menu and the hours board use theme tokens instead of hard-coded violet/sky/green
- Error pages and the `ErrorBoundary` fallback share the same card design; the login form keeps its photo background with radii, buttons and error states aligned to the rest of the app
- The quick-assign popover's Cancelar/Asignar are real buttons (they were clickable `div`s, unreachable by keyboard)

### Fixed

- ESLint `SIGKILL` on pre-commit hook (frontend was OOM due to all files being passed)
- Various ESLint errors: `no-unused-vars`, `import/no-duplicates`, `no-restricted-syntax`, `no-await-in-loop`
- `weeklySummaryService` queries used a non-existent `week` column instead of `weekNumber`
- Permission catalog migrations used unquoted `updatedAt` in raw SQL, which PostgreSQL folds to `updatedat` and rejects; the identifier is now quoted, so `migrate` succeeds and the `permissions.code` column used by authorization is created (previously every authenticated request returned 500 with `AUTH_ERROR`)
- Hours tab now reconciles the biweekly summaries with `hours_worked` (server recalculation), dedupes rows per (year, quincena), drops phantom/zero rows and derives the month from the biweek number, so totals match the hours board; the table now matches the Pagos/Vacaciones styling
- `GET /api/notifications` always failed with 500: the `$lt` operator was not a registered Sequelize alias (guarded now by an operator-alias test)
- A wrong password on the login form redirected to "Sesión caducada" instead of showing the error
- Create/update/delete actions (users, employees, vehicles, schedules, roles, password) showed a success message even when the request failed (thunks were not `unwrap()`ed); errors now surface the server message
- Logging out left the previous user's cached API responses and Redux state in the tab
- Schedule day chips, dialog icons and Settings navigation were unreadable in dark mode; select icons overlapped their placeholder; section descriptions wrapped out of alignment
- Dashboard cards clipped their charts on short screens (the vehicle-brand legend overlapped its title)
- Users were logged out about an hour into a session: once the access cookie expired the browser stopped sending it, the API answered `MISSING_TOKEN`, and the client only refreshed on `TOKEN_EXPIRED`
- Login fields turned white (icons invisible) when showing a validation error

### Removed

- Mensajería (courier) module, its routes, forms and `messaging:*` / `courier:*` permissions (migration `20260930000000-remove-courier-permissions`)
- Hours auto-generation dialog in Roles, logbook scanning ("Escanear", OCR / Gemini vision proxy and `GEMINI_API_KEY`), the high-contrast theme (stored preferences fall back to "Sistema"), Tailwind/Tremor setup and unused screens, services and dependencies (`@fortawesome/*`, `@mui/lab`, `@mui/styles`, `@mui/base`, `@mui/x-charts`, `@tremor/react`, `motion`, `ogl`, `lucide-react`, `@mui/icons-material`, `bcryptjs`, `sequelize-typescript`, among others)
- Unused UI and helpers: `Dock`, `MenuEditor`, `Menu`, `SpeedDial`, `SplitButton`, `AppModal`, `DateSelection`, `DotField`, `Typewriter`, the `SelectorTable` UI, the login `Orb` background, `AuthPageStyles`, unused hooks (`useFormValidation`, `useModal`, `useReduxData`, `useSpeechRecognition`, `useTableData`, `useTablePagination`) and style exports no component imported

### Security

- Privilege escalation: holders of `users:create`/`users:edit` could assign any role (including Gerencia) to anyone, themselves included, and `roles:edit` holders could add any permission to their own role. Granting now requires already holding every granted permission, and users cannot change their own role
- Stored XSS: disciplinary attachments accepted any string as `dataUrl` (e.g. `javascript:`), which ran on download; only base64 `data:` URLs are accepted and the client refuses anything else
- `POST /api/users/register` returned the new user's password hash
- Refresh tokens kept issuing new sessions for disabled or deleted users
- The temporary password stayed valid forever; it is revoked when the password changes. Passwords are no longer kept in Redux actions/state
- `markAsRead` returned other users' notifications by id; notification `actionUrl` must be an in-app path
- `GET` of disciplinary actions, licenses and vacation accrual now require their `view` permission; Gemini OCR requires `vehicles:create` and sends the API key in a header
- Employee names are HTML-escaped in payment-slip emails; users cannot disable or delete their own account
- Role permission replacement runs in a transaction (a failed insert used to leave the role with no permissions)

---

## [1.0.0] — 2026-07-21

### Added

- **Monorepo architecture** with Turborepo + npm workspaces
- **Shared package** (`packages/shared`) for shared TypeScript types, constants, and validations
- **OCR integration** via Gemini Vision API for vehicle ticket scanning
- **Notification system** with in-app notifications
- **AutoGenerateModal** for balanced hour distribution
- **Internal courier service management**
- **Responsive design** across all pages (mobile, tablet, desktop)
- **Three themes**: light, dark, and high-contrast (accessibility)
- **macOS-style Dock** navigation with hover animations
- **Bento-grid dashboard** layout
- **Hamburger menu** for mobile navigation
- **Rate limiting** middleware on the API
- **CORS** configuration for production deployments
- **Docker Compose** setup for local development (PostgreSQL + API + UI)

### Changed

- **Login page**: redesigned with Tailwind split-screen layout, animated background (Three.js/WebGL), and improved form validation
- **Dashboard charts**: updated to modern vibrant color palette with Recharts
- **SelectorTable**: major refactor for better maintainability and performance
- **EditableTable**: improved cell editing, header grouping, and empty state handling
- **AppBar**: refined with glassmorphism style, user menu, and notification bell
- **Date pickers**: consistent border styling across all pages
- **Vehicle forms**: added auto-complete from previous records
- **Summary cards**: responsive layout with proper text wrapping on small screens
- **Dependency updates**: React 18.3, MUI 6.4, Recharts 3.8, Redux Toolkit 2.6

### Fixed

- **Build optimization**: code splitting with `React.lazy()` and `Suspense`
- **Performance**: memoized components with `React.memo` and `useCallback`
- **Token handling**: secure cookie management for JWT refresh tokens
- **Table pagination**: now correctly handles last-page edge cases
- **Date formatting**: consistent locale-aware date rendering across the app
- **Empty states**: proper display when no data is available

### Security

- **Helmet** security headers configured
- **Rate limiting** on all API routes
- **JWT** with separate access and refresh tokens
- **Role-based access control** middleware on all protected routes

---

## [0.9.0] — 2025-07-27

### Added

- Notification system with real-time alerts
- AutoGenerateModal for automatic hour distribution
- Courier (mensajería) service management module
- Filter by status (active/inactive) in employee list
- Export to Excel with grouped column headers

### Changed

- Redesigned AppBar with glassmorphism effect
- Improved Dock component animations and responsiveness
- Refined theme system with dedicated light, dark, and high-contrast files

### Fixed

- Responsive table height calculation on mobile devices
- Date picker localization for Spanish locale
- Notification dot positioning in the Dock

---

## [0.8.0] — 2025-05-05

### Added

- Project rebranded to "Choferes de Alquiler"
- Deployment configuration for Vercel (frontend) and Render (backend)
- Graceful shutdown handling in the Express server
- CORS configuration for production domains

### Changed

- Environment variables reorganized for production/staging/development
- API base URL configurable via `REACT_APP_API_URL`
- Authentication flow improved with refresh token rotation

---

## [0.7.0] — 2025-04-19

### Added

- OCR scanning with Gemini Vision API for vehicle registration
- Image upload component with preview and crop
- Vehicle auto-complete from previous registrations
- Loading skeletons during OCR processing

### Changed

- Vehicle form layout improved for better UX
- Camera capture fallback for mobile devices

---

## [0.6.0] — 2025-03-23

### Added

- User management with role assignment
- Temporal password support for new users
- User activation/deactivation toggle
- Seed users with different roles (Gerencia, Administrativo, RH)

### Changed

- Authentication migration to dedicated auth tables
- Role-permission relationship redesigned for granular control

### Security

- Password hashing enforced for all users
- Inactive users cannot log in

---

## [0.5.0] — 2025-02-26

### Added

- Complete authentication system with JWT (access + refresh tokens)
- Login and registration pages
- Role-based middleware on all protected routes
- Permission-based UI rendering (show/hide elements by role)

### Changed

- Database schema migrated to separate auth tables
- Token storage moved from localStorage to httpOnly cookies (refresh token)

---

## [0.4.0] — 2025-01-05

### Added

- Weekly, biweekly, and monthly summary auto-calculation
- Summary history by employee with period navigation
- Dashboard with overview charts (Recharts)
- Top employees chart and overtime alerts

### Changed

- HoursWorked recording improved with batch operations
- Schedule assignment now supports multiple employees per schedule

---

## [0.3.0] — 2024-12-15

### Added

- EditableTable component for CRUD operations
- SelectorTable for employee-schedule assignment
- Date pickers with Spanish localization
- Modal system for forms and dialogs
- Search bar with debounce for employee lookup

### Changed

- Table component split into SelectorTable and EditableTable
- Responsive table layouts for mobile devices

---

## [0.2.0] — 2024-11-01

### Added

- Vehicle registration with ticket, plate, brand, color, parking
- Schedule management with day-of-week selectors
- Special schedule support (day off, holiday)
- Hours worked daily recording

### Changed

- Database migrations for all vehicle and schedule tables
- API routes organized by resource

---

## [0.1.0] — 2024-09-13

### Added

- Initial project scaffolding with Create React App
- Express API foundation with Sequelize ORM
- PostgreSQL database setup with initial migrations
- Employee CRUD (create, read, update, delete)
- Basic authentication (username/password)
- Docker Compose for local development

---

[Unreleased]: https://github.com/lmhq-94/choferes/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/lmhq-94/choferes/releases/tag/v1.0.0
[0.9.0]: https://github.com/lmhq-94/choferes/compare/v0.9.0...v1.0.0
[0.8.0]: https://github.com/lmhq-94/choferes/compare/v0.8.0...v0.9.0
[0.7.0]: https://github.com/lmhq-94/choferes/compare/v0.7.0...v0.8.0
[0.6.0]: https://github.com/lmhq-94/choferes/compare/v0.6.0...v0.7.0
[0.5.0]: https://github.com/lmhq-94/choferes/compare/v0.5.0...v0.6.0
[0.4.0]: https://github.com/lmhq-94/choferes/compare/v0.4.0...v0.5.0
[0.3.0]: https://github.com/lmhq-94/choferes/compare/v0.3.0...v0.4.0
[0.2.0]: https://github.com/lmhq-94/choferes/compare/v0.2.0...v0.3.0
[0.1.0]: https://github.com/lmhq-94/choferes/releases/tag/v0.1.0
