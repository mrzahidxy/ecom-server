import { Router, Request, Response } from 'express';
import prisma from '../connect';

const healthRouter = Router();

healthRouter.get('/health', async (req: Request, res: Response) => {
    try {
        // Check database connectivity
        await prisma.$queryRaw`SELECT 1`;

        res.status(200).json({
            status: 'ok',
            message: 'System is healthy',
            timestamp: new Date().toISOString(),
            details: {
                database: 'connected',
            },
        });
    } catch (error) {
        console.error('Health check failed:', error);

        res.status(500).json({
            status: 'error',
            message: 'System is not healthy',
            timestamp: new Date().toISOString(),
            details: {
                database: 'disconnected',
                error: (error as Error).message,
            },
        });
    }
});

export default healthRouter;
