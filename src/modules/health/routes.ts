import { Router } from 'express';
import { getHealth } from './controller';

const router = Router();

// GET /api/health -> Health status endpoint
router.get('/', getHealth);

export default router;
