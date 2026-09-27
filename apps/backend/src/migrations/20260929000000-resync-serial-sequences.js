"use strict";

// The auth seeder inserted roles/users/permissions/schedules with explicit ids,
// which leaves their serial sequences behind MAX(id). Creating a user or a role
// from the app then fails with "duplicate key value violates ..._pkey" until
// the sequence catches up. Re-sync every serial `id` sequence in the schema.
// Idempotent: only moves a sequence forward to MAX(id) + 1.

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query(`
      DO $$
      DECLARE
        rec RECORD;
      BEGIN
        -- Sequences owned by an "id" column (serial/identity), found through
        -- pg_depend so tables without an id column are never touched.
        FOR rec IN
          SELECT t.relname AS table_name, s.oid::regclass::text AS seq
          FROM pg_class s
          JOIN pg_depend d ON d.objid = s.oid AND d.deptype IN ('a', 'i')
          JOIN pg_class t ON t.oid = d.refobjid
          JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = d.refobjsubid
          WHERE s.relkind = 'S'
            AND a.attname = 'id'
            AND t.relnamespace = current_schema()::regnamespace
        LOOP
          EXECUTE format(
            'SELECT setval(%L, GREATEST(COALESCE((SELECT MAX(id) FROM %I), 0) + 1,
                                        (SELECT last_value FROM %s)), false)',
            rec.seq, rec.table_name, rec.seq
          );
        END LOOP;
      END $$;
    `);
  },

  down: async () => {
    // Nothing to undo: sequences only moved forward.
  },
};
