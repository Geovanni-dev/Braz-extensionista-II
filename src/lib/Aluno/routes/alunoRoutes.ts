import { Router } from 'express';
import { storeRegistro, storeLogin } from '../controller/alunoController.js';
import { loginLimiterAluno } from '../../middlewares/rate-limit/rateLimit.js';

const router = Router();

router.post('/registro', loginLimiterAluno, storeRegistro);

router.post('/login', loginLimiterAluno, storeLogin);

export default router;
