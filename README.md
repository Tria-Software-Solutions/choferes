# Choferes de Alquiler

Sistema de gestión integral para una empresa de transporte y alquiler de vehículos con chofer en Costa Rica. Permite administrar empleados, horarios, horas trabajadas, vehículos registrados y servicios de mensajería, con autenticación por roles y permisos.

## Tecnologías

- **Frontend:** React 18, TypeScript, Material UI 6, Redux Toolkit, React Router 7
- **Backend:** Node.js, Express 4, TypeScript, Sequelize 6 (ORM), PostgreSQL
- **Autenticación:** JWT con access tokens y refresh tokens
- **Infraestructura:** Vercel (frontend), Render (backend)

## Arquitectura

```
api/             # Backend REST API (Express + TypeScript)
  src/
    config/      # Configuración de BD y entorno
    controllers/ # Manejadores de rutas HTTP
    services/    # Lógica de negocio
    models/      # Modelos Sequelize
    routes/      # Definiciones de rutas
    middleware/   # JWT y autorización por roles
    migrations/  # Migraciones de base de datos
    seeders/     # Datos semilla

ui/              # Frontend SPA (React + TypeScript)
  src/
    pages/       # Páginas por funcionalidad
    components/  # Componentes reutilizables
    services/    # Cliente API y servicios
    store/       # Redux slices
    constants/   # Constantes de la aplicación
    hooks/       # Custom hooks
    context/     # AuthContext y NotificationContext
    models/      # Interfaces TypeScript
```

## Funcionalidades

- **Autenticación:** Login con JWT, refresh tokens, roles y permisos granulares
- **Empleados:** CRUD completo con búsqueda, exportación a Excel/PDF
- **Horarios:** Definición de turnos (días, horas, etiquetas)
- **Horas Trabajadas:** Registro de horas por empleado y fecha
- **Resúmenes:** Vista semanal, quincenal y mensual de horas trabajadas
- **Vehículos:** Registro con ticket, placa, marca, color, parqueo; soporte para escaneo OCR con Gemini Vision API
- **Servicio de Mensajería:** Seguimiento de envíos y rutas
- **Dashboard:** Administración de usuarios, roles y permisos
- **Temas:** Modo claro, oscuro y alto contraste

## Instalación

```bash
# Clonar el repositorio
git clone <repo-url>
cd choferes

# Instalar dependencias del backend
cd api
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con las credenciales de PostgreSQL y JWT

# Ejecutar migraciones
npx sequelize db:migrate

# Sembrar datos iniciales
npx sequelize db:seed:all

# Iniciar servidor de desarrollo
npm run dev

# En otra terminal, instalar e iniciar el frontend
cd ../ui
npm install
npm start
```

## Scripts Disponibles

### Backend (`api/`)

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia servidor con nodemon |
| `npm run build` | Compila TypeScript a JavaScript |
| `npm start` | Inicia servidor en producción |
| `npm test` | Ejecuta tests |

### Frontend (`ui/`)

| Comando | Descripción |
|---|---|
| `npm start` | Inicia servidor de desarrollo |
| `npm run build` | Compila para producción |
| `npm test` | Ejecuta tests |
| `npm run lint` | Ejecuta ESLint |

## Variables de Entorno

### Backend (`.env`)

| Variable | Descripción |
|---|---|
| `DB_HOST` | Host de PostgreSQL |
| `DB_PORT` | Puerto de PostgreSQL |
| `DB_NAME` | Nombre de la base de datos |
| `DB_USER` | Usuario de PostgreSQL |
| `DB_PASSWORD` | Contraseña de PostgreSQL |
| `JWT_SECRET` | Secreto para firmar JWT |
| `JWT_REFRESH_SECRET` | Secreto para refresh tokens |
| `PORT` | Puerto del servidor |

## Licencia

Todos los derechos reservados.
