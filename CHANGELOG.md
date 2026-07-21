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

- GitHub Actions CI pipeline (`.github/workflows/ci.yml`)
- `CONTRIBUTING.md` with development guidelines
- Badges in README (CI status, Node version, Turborepo, license)
- ESLint config overrides for `**/services/**`, `**/scripts/**`, `**/utils/pagination.ts`
- Script `cleanup:orphans` to remove orphaned FK records

### Changed

- Translated all documentation from Spanish to English
- Monorepo restructured: apps moved to `apps/frontend` and `apps/backend`
- Huskylint-staged config: now runs `eslint --fix --max-warnings 100` instead of `npm run lint`
- Backend lint warnings reduced from 58 to 0

### Fixed

- ESLint `SIGKILL` on pre-commit hook (frontend was OOM due to all files being passed)
- Various ESLint errors: `no-unused-vars`, `import/no-duplicates`, `no-restricted-syntax`, `no-await-in-loop`

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
