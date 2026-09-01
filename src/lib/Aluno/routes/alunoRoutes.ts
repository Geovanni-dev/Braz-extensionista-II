import { Router } from 'express';
import {
  storeRegistro,
  storeLogin,
  storeVerificarCodigo,
} from '../controller/alunoController.js';
import { loginLimiterAluno } from '../../middlewares/rate-limit/rateLimit.js';

const router = Router();

router.post('/registro', loginLimiterAluno, storeRegistro);

router.post('/verificar', loginLimiterAluno, storeVerificarCodigo);

router.post('/login', loginLimiterAluno, storeLogin);

export default router;
