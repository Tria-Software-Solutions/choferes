// eslint-disable-next-line import/no-duplicates
import express, { Router } from "express";

/**
 * Creates a minimal Express app for integration testing.
 * Includes JSON body parser and mounts the given router at the given basePath.
 *
 * @param basePath - Base path to mount the router (e.g. "/api/employees")
 * @param router - An Express Router with the routes to test
 * @returns A configured Express app ready for supertest
 */
// eslint-disable-next-line import/prefer-default-export
export function createTestApp(basePath: string, router: Router): express.Application {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(basePath, router);

  // Global error handler (same pattern as the real server)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    return res.status(500).json({ error: error.message });
  });

  return app;
}
