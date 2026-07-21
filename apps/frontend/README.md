# @choferes/frontend — Choferes de Alquiler

Frontend SPA for the Choferes de Alquiler management system.
Built with React 18, TypeScript, and Material UI 6.

## Stack

| Technology | Version | Purpose |
| --- | --- | --- |
| React | 18.3 | UI Library |
| TypeScript | 4.9 | Static typing |
| Material UI | 6.4 | Component system + themes |
| Redux Toolkit | 2.6 | Global state |
| React Router | 7.1 | Routing |
| Recharts | 3.8 | Dashboard charts |
| Motion | 12.40 | Animations (Dock, transitions) |
| date-fns | 2.30 | Date manipulation |
| Lucide React | 1.8 | Icons |
| Axios | 1.7 | HTTP client |

## Project Structure

```text
src/
├── components/          # Reusable components
│   ├── AppBar/          # Top bar: logo, user, notifications
│   ├── Dock/            # macOS-style navigation dock (animated)
│   ├── Table/           # Table system (SelectorTable + EditableTable)
│   │   ├── SelectorTable/   # Employee-to-schedule assignment grid
│   │   └── EditableTable/   # Generic CRUD table
│   ├── Modal/           # Modals (OCR, AutoGenerate, ImageUpload)
│   ├── SearchBar/       # Search with debounce
│   ├── Menu/            # Responsive hamburger menu
│   └── ...              # 20+ additional components
│
├── pages/               # Domain-based pages
│   ├── Auth/            # Login, Register, Profile
│   ├── Dashboard/       # Main dashboard + ManageUsers/Roles/Permissions
│   ├── Management/      # EmployeesPage, RolesPage, SchedulesPage, VehiclesPage
│   ├── Forms/           # Forms (AddEmployee, AddVehicle, AddSchedule, etc.)
│   └── ErrorPages/      # 404, Forbidden, SessionExpired, Error
│
├── constants/           # Constants (permissions, routes, labels)
├── context/             # AuthContext, NotificationContext
├── hooks/               # Custom hooks (useAuth, useTable*, use*Summary)
├── models/              # TypeScript interfaces
├── services/            # API clients (one axios service per resource)
├── store/               # Redux store + slices
├── theme/               # Light, dark, high-contrast themes
└── utils/               # Utilities (dates, export, validation)
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Dev server (port 3000) |
| `npm run build` | Production build → `build/` |
| `npm run test` | Tests with React Testing Library |
| `npm run lint` | ESLint |
| `npm run lint:fix` | ESLint with auto-fix |
| `npm run format` | Prettier |

## Themes

The system supports 3 toggleable themes:

- **Light** — White background, dark text
- **Dark** — Dark background, light text (default)
- **High Contrast** — Maximum contrast for accessibility

Themes are defined in `src/theme/` and applied via MUI's `ThemeProvider`.

## Responsive Design

- **Mobile** (< 600px): Hamburger menu navigation, scrollable tables
- **Tablet** (600-900px): Adaptive layout, compact dock
- **Desktop** (900px+): Full navigation with macOS-style Dock

## Tests

Tests use **React Testing Library** + **Jest**:

```bash
npm test                 # Interactive mode
npm test -- --coverage   # Coverage report
```

## Main Pages

### /login

Splash screen with animated background (WebGL / Three.js).
Includes form validation and error handling.

### /dashboard

Dashboard with bento-grid cards:

- Period summary (employees, hours, average, overtime)
- Top employees by hours
- Overtime alerts
- Daily attendance average (line chart)
- Schedule distribution (bar chart)
- Vehicle brand distribution (pie chart)

### /roles

Main employee ↔ schedule assignment grid with:

- Weekly date picker
- View by employee or by schedule
- Editable cells with schedule dropdowns
- Automatic summary calculation (weekly, biweekly, monthly)
- Excel / PDF export
- Auto-generation with balanced hour distribution

### /employees

Employee CRUD with search, inline editing, and export.

### /schedules

Schedule (shift) management with day selector.

### /vehicles

Vehicle registration with OCR and auto-complete.

## Deployment

Frontend is deployed on **Vercel**.
Build command: `npm run build`
Output directory: `build/`
