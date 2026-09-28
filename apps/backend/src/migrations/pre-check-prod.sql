-- Pre-migration check for production.
-- Run this BEFORE applying the pending migrations.
-- Every query should return 0 rows. If any returns rows, those records must
-- be fixed before running 20260928300000-add-enum-check-constraints.
-- All other migrations are safe to run regardless of data state.

-- ── employees.terminationReason ──────────────────────────────────────────────
SELECT id, "terminationReason"
FROM employees
WHERE "terminationReason" IS NOT NULL
  AND "terminationReason" NOT IN (
    'renuncia','despido','mutuo_acuerdo','fin_contrato',
    'jubilacion','fallecimiento','otro'
  );

-- ── employees.gender ─────────────────────────────────────────────────────────
SELECT id, gender
FROM employees
WHERE gender IS NOT NULL
  AND gender NOT IN ('Masculino','Femenino');

-- ── employees.scheduledTerminationReason ─────────────────────────────────────
SELECT id, "scheduledTerminationReason"
FROM employees
WHERE "scheduledTerminationReason" IS NOT NULL
  AND "scheduledTerminationReason" NOT IN (
    'renuncia','despido','mutuo_acuerdo','fin_contrato',
    'jubilacion','fallecimiento','otro'
  );

-- ── payments.status ───────────────────────────────────────────────────────────
SELECT id, status FROM payments
WHERE status NOT IN ('pending','sent','cancelled');

-- ── payments.payPeriod ────────────────────────────────────────────────────────
SELECT id, "payPeriod" FROM payments
WHERE "payPeriod" NOT IN ('biweekly');

-- ── vacations.status ──────────────────────────────────────────────────────────
SELECT id, status FROM vacations
WHERE status NOT IN ('pending','approved','rejected');

-- ── disciplinary_actions.type ─────────────────────────────────────────────────
SELECT id, type FROM disciplinary_actions
WHERE type NOT IN (
  'llamada_atencion','amonestacion_verbal','amonestacion_escrita',
  'suspension','otra'
);

-- ── disciplinary_actions.severity ────────────────────────────────────────────
SELECT id, severity FROM disciplinary_actions
WHERE severity NOT IN ('leve','grave','muy_grave');

-- ── employee_licenses.licenseType ────────────────────────────────────────────
SELECT id, "licenseType" FROM employee_licenses
WHERE "licenseType" NOT IN (
  'A1','A2','A3','B1','B2','B3','C1','C2','C3','D1','D2','D3','E'
);

-- ── notifications.type ───────────────────────────────────────────────────────
SELECT id, type FROM notifications
WHERE type NOT IN ('info','success','warning','error');

-- ── notifications.priority ───────────────────────────────────────────────────
SELECT id, priority FROM notifications
WHERE priority NOT IN ('low','medium','high');

-- ── hours_worked: verify unique index name (must match migration) ─────────────
SELECT indexname FROM pg_indexes
WHERE tablename = 'hours_worked'
  AND indexname = 'hours_worked_employeeId_date_unique';
-- Should return exactly 1 row. If 0 rows, the index was created with a
-- different name — check pg_indexes WHERE tablename = 'hours_worked' to find
-- the real name and update migration 20260928500000 before running.
