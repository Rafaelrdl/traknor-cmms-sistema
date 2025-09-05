import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './users';

const apiRoutes = Router();

// Mount route modules
apiRoutes.use('/auth', authRoutes);
apiRoutes.use('/users', userRoutes);

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