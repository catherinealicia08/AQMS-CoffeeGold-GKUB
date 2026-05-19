import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => {
  res.status(200).json({ message: 'Orders endpoint scaffold ready' });
});

export default router;
