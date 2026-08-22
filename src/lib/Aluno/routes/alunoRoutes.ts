import { Router } from 'express';
import { store } from '../controller/alunoController.js';
import { loginLimiterAluno } from '../../middlewares/rate-limit/rateLimit.js';

const router = Router();

router.post('/registro', loginLimiterAluno, store);

export default router;
