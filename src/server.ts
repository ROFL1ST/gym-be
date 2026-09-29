import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes';
import { errorHandler } from './middlewares/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root welcome route
app.get('/', (_req, res) => {
  res.json({
    message: 'Welcome to Smart Gym Backend API 🏋️‍♂️',
    health: '/api/health',
    endpoints: {
      auth: '/api/auth',
      profile: '/api/profile',
      dashboard: '/api/dashboard',
      streaks: '/api/streaks',
      schedules: '/api/schedules',
      workouts: '/api/workouts',
      meals: '/api/meals',
      foods: '/api/foods',
      ai: '/api/ai',
    },
  });
});

// Central API Router
app.use('/api', apiRouter);

// Global Error Handling
app.use(errorHandler);

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🩺 Health check available at http://localhost:${PORT}/api/health`);
  });
}

export default app;
