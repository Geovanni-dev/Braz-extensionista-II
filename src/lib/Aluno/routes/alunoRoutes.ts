import { Router } from 'express';
import {
  storeRegistro,
  storeLogin,
  storeVerificarCodigo,
  storeReenviarCodigo,
  storeCodigoTrocaSenha,
  storeTrocarSenha,
} from '../controller/alunoController.js';
import {
  loginLimiterAluno,
  envioCodigoLimiter,
} from '../../middlewares/rate-limit/rateLimit.js';

const router = Router();

router.post('/registro', envioCodigoLimiter, loginLimiterAluno, storeRegistro);

router.post('/verificar-codigo', loginLimiterAluno, storeVerificarCodigo);

router.post('/login', loginLimiterAluno, storeLogin);

router.post(
  '/reenviar',
  envioCodigoLimiter,
  loginLimiterAluno,
  storeReenviarCodigo,
);

router.post('/codigo-troca-senha', envioCodigoLimiter, storeCodigoTrocaSenha);

router.post('/trocar-senha', loginLimiterAluno, storeTrocarSenha);

export default router;
