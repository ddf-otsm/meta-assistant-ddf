import express from 'express';
import cors from 'cors';
import session from 'express-session';
import { routes } from './routes';
import { errorHandler } from './middleware/errorHandler';
import { db } from './config/database';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'default-secret',
  resave: false,
  saveUninitialized: false,
}));

// Routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

export { app }; 