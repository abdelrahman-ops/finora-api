import { Express } from 'express';

import authRoutes from './auth/routes';
import walletRoutes from './wallets/routes';
import categoryRoutes from './categories/routes';
import healthRoutes from './health/routes';

/**
 * Register all API route modules under /api prefix.
 * Keeps app.ts clean and makes adding/removing modules trivial.
 */
export function registerRoutes(app: Express): void {
  const routes: [string, any][] = [
    ['/api/auth',          authRoutes],
    ['/api/wallets',       walletRoutes],
    ['/api/categories',    categoryRoutes],
    ['/api/health',        healthRoutes],
  ];

  for (const [path, router] of routes) {
    app.use(path, router);
  }
}
