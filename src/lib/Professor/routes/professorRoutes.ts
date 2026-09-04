import { Router } from 'express';
import {
  indexProfessor,
  storeLogin,
  updateProfessorNome,
  indexDisciplina,
} from '../controller/professorController.js';
import { loginLimiterProfessor } from '../../middlewares/rate-limit/rateLimit.js';
import { authMiddlewareProfessor } from '../../middlewares/professor/authProfessor.js';

const router = Router();

router.get('/', indexProfessor);

router.get('/disciplina', authMiddlewareProfessor, indexDisciplina);

router.post('/login', loginLimiterProfessor, storeLogin);

router.patch('/nome', authMiddlewareProfessor, updateProfessorNome);

export default router;
