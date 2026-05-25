import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import './config/firebase'; // init Firebase Admin pas startup
import { startHiveMqSubscriber } from './mqtt/hiveMqSubscriber';
import orderRoutes from './routes/orderRoutes';
import { openApiSpec } from './openapi';

const app = express();

startHiveMqSubscriber();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'backend' });
});

app.get('/openapi.json', (_req, res) => {
  res.status(200).json(openApiSpec);
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

app.use('/api/orders', orderRoutes);

export default app;
