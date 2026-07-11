import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import healthRoutes from './modules/health/routes';
import { connectDatabase } from './common/config/database';
import { env } from './common/config/env';

// Load environment variables
dotenv.config();

// Connect to DB for serverless environments (like Vercel) where app.ts is the entry point
connectDatabase().catch(err => console.error('Initial DB connection error:', err));

const app: Application = express();

// Ensure DB is connected before processing any request
app.use(async (_req: Request, _res: Response, next: NextFunction) => {
  try {
    await connectDatabase();
    next();
  } catch (err) {
    next(err);
  }
});

// Standard Middlewares
app.use(helmet());
app.use(cors({
  origin: env.ALLOWED_ORIGINS,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Core API Routes
app.use('/api/health', healthRoutes);

// Catch-all route handler for 404s
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`
  });
});

// Global Error Handler Middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
  });
});

export default app;
