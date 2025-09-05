import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './users';
import planRoutes from './plans';
import workOrderRoutes from './work-orders';

const apiRoutes = Router();

// Mount route modules
apiRoutes.use('/auth', authRoutes);
apiRoutes.use('/users', userRoutes);
apiRoutes.use('/plans', planRoutes);
apiRoutes.use('/work-orders', workOrderRoutes);

// Health check endpoint
apiRoutes.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
  });
});

export default apiRoutes;