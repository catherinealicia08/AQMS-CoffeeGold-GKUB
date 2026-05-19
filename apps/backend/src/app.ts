import cors from 'cors';
import express from 'express';
import morgan from 'morgan';

import orderRoutes from './routes/orderRoutes';

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'backend' });
});

app.use('/api/orders', orderRoutes);

export default app;
