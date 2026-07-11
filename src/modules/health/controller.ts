import { Request, Response } from 'express';

/**
 * Health check handler returning status information, server timestamp, and process uptime.
 */
export const getHealth = (req: Request, res: Response): void => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: `${process.uptime().toFixed(2)}s`,
    env: process.env.NODE_ENV || 'development'
  });
};
