import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import itemRoutes from './routes/item.routes';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/dummies', (req, res) => {
  res.status(200).json({ 
    message: 'Dummy API endpoint for CI testing',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Resource not found' });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

export default app;
