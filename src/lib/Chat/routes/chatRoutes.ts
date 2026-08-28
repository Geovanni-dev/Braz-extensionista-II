import { Router } from 'express';
import { storeChat } from '../controller/chatController.js';
import { authMiddlewareAluno } from '../../middlewares/aluno/authAluno.js';

const router = Router();

router.use(authMiddlewareAluno);

router.post('/', storeChat);

export default router;
