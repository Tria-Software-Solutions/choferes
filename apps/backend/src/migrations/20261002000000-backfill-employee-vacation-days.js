'use strict';

/**
 * Rellena `Employees.vacationDays` de las cuentas que lo tenían en NULL.
 *
 * El saldo siempre se ha calculado "en vivo" desde `contractStartDate`
 * (`vacationAccrualService`), pero el campo guardado nunca se pobló para las
 * cuentas creadas antes de eso. Eso dejaba dos efectos que nobody quería:
 *
 *  1. `vacationService` solo valida y descuenta el saldo cuando el campo NO es
 *     null, así que las solicitudes de vacaciones aprobadas no descuentan nada.
 *  2. La ficha mostraba "Saldo: sin asignar" aunque la ley le reconociera días.
 *
 * El valor es el mismo que calcula la ley (art. 153: 2 semanas remuneradas por
 * cada 50 semanas trabajadas, prorrateado) menos las vacaciones ya aprobadas,
 * redondeado a días enteros como el botón "Sincronizar saldo" de la ficha.
 *
 * Solo toca filas con `vacationDays IS NULL`: si alguien ajustó el saldo a mano
 * (o ya se sincronizó), no se pisa. Los empleados sin `contractStartDate` tampoco
 * se tocan: sin fecha de ingreso no hay antigüedad que calcular.
 *
 * Es idempotente: se puede correr más de una vez sin alterar saldos ya escritos.
 */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      UPDATE "employees" AS e
      SET "vacationDays" = GREATEST(0, ROUND(
        -- Días hábiles acumulados por antigüedad (ciclo de 350 días → 10 días)
        -- menos lo que ya se disfruta como vacaciones aprobadas. La antigüedad
        -- se detiene en la fecha de salida, si la hay: después de eso no acumula.
        (LEAST(CURRENT_DATE, COALESCE(e."terminationDate", CURRENT_DATE))
          - e."contractStartDate" + 1)::numeric / 350 * 10
        - COALESCE((
            SELECT SUM(v."daysRequested")
            FROM vacations v
            WHERE v."employeeId" = e."id" AND v."status" = 'approved'
          ), 0)
      ))
      WHERE e."vacationDays" IS NULL
        AND e."contractStartDate" IS NOT NULL
        AND e."contractStartDate" <= LEAST(CURRENT_DATE, COALESCE(e."terminationDate", CURRENT_DATE))
    `);
  },

  // Backfill de datos: no hay forma sensata de "deshacerlo" sin volver a dejar
  // el saldo en NULL, que es justo el estado que se quiere eliminar.
  async down() {},
};
