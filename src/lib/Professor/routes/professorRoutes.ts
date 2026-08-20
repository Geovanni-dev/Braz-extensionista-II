import { Router } from 'express';
import {
  indexProfessor,
  storeLogin,
} from '../controller/professorController.js';
import { loginLimiter } from '../../middlewares/rateLimit.js';
//import { authMiddleware } from '../../middlewares/authProfessor.js';

const router = Router();

router.get('/', indexProfessor);

router.post('/login', loginLimiter, storeLogin);

export default router;
