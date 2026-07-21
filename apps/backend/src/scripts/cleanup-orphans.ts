// Cleanup script to remove orphaned records referencing deleted employees
// Run with: npm run cleanup:orphans
// For a dry run (preview without deleting): npm run cleanup:orphans -- --dry-run
import sequelize from "../config/database";

const TABLES_TO_CLEAN = [
  { table: "hours_worked", label: "Horas trabajadas" },
  { table: "weekly_summary", label: "Resúmenes semanales" },
  { table: "biweekly_summary", label: "Resúmenes quincenales" },
  { table: "monthly_summary", label: "Resúmenes mensuales" },
] as const;

async function cleanupOrphans() {
  const isDryRun = process.argv.includes("--dry-run");

  console.log("=== Limpieza de registros huérfanos ===\n");
  if (isDryRun) {
    console.log("🔍 Modo dry-run: Solo se mostrarán los registros a eliminar\n");
  }

  try {
    await sequelize.authenticate();
    console.log("✅ Conexión a BD establecida\n");
  } catch (err) {
    console.error("❌ Error conectando a la BD:", err);
    process.exit(1);
  }

  // Safety check: ensure employees table is not empty
  const [empCount] = await sequelize.query("SELECT COUNT(*) AS count FROM employees", {
    type: "SELECT" as any,
  });
  const employeeCount = Number((empCount as any).count);

  if (employeeCount === 0) {
    console.log(
      "❌ La tabla employees está vacía. Abortando para evitar eliminar todos los registros.",
    );
    console.log("   Si es intencional, deshabilita esta validación manualmente.");
    await sequelize.close();
    process.exit(1);
  }

  console.log(`📊 Empleados en BD: ${employeeCount}\n`);

  const results = await Promise.all(
    TABLES_TO_CLEAN.map(async ({ table, label }) => {
      try {
        // Count orphans
        const [countRows] = await sequelize.query(
          `SELECT COUNT(*) AS count FROM "${table}"
           WHERE "employeeId" NOT IN (SELECT id FROM employees)`,
          { type: "SELECT" as any },
        );
        const orphanCount = Number((countRows as any).count);

        if (orphanCount > 0) {
          console.log(`⚠️  ${label}: ${orphanCount} registro(s) huérfano(s) encontrado(s)`);

          if (!isDryRun) {
            const [, meta] = await sequelize.query(
              `DELETE FROM "${table}"
               WHERE "employeeId" NOT IN (SELECT id FROM employees)`,
              { type: "DELETE" as any },
            );
            const deletedCount = (meta as any).rowCount ?? orphanCount;
            console.log(`   🗑️  Eliminados: ${deletedCount}`);
          }

          return { table, label, count: orphanCount };
        }

        console.log(`✅ ${label}: Sin huérfanos`);
        return null;
      } catch (err) {
        console.error(`❌ Error procesando ${label}:`, err);
        return null;
      }
    }),
  );

  const orphansByTable = results.filter(Boolean) as {
    table: string;
    label: string;
    count: number;
  }[];

  const totalOrphans = orphansByTable.reduce((sum, o) => sum + o.count, 0);
  console.log(`\n=== Total: ${totalOrphans} registro(s) huérfano(s) ===`);

  if (totalOrphans > 0) {
    if (isDryRun) {
      console.log("\n💡 Ejecuta sin --dry-run para eliminarlos:");
      console.log("   npm run cleanup:orphans");
    } else {
      console.log("\n💡 Los resúmenes (weekly/biweekly/monthly) se regenerarán automáticamente");
      console.log("   al recargar la página de Roles.");
    }
  }

  await sequelize.close();
  process.exit(0);
}

cleanupOrphans();
