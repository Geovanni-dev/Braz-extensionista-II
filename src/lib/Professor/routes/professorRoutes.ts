import { Router } from 'express';
import {
  indexProfessor,
  storeLogin,
  updateProfessorNome,
} from '../controller/professorController.js';
import { loginLimiter } from '../../middlewares/rateLimit.js';
import { authMiddlewareProfessor } from '../../middlewares/authProfessor.js';

const router = Router();

router.get('/', indexProfessor);

router.post('/login', loginLimiter, storeLogin);

router.patch('/nome', authMiddlewareProfessor, updateProfessorNome);

export default router;
