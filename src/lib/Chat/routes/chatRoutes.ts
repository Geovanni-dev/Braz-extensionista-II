import { Router } from 'express';
import { indexChat, storeChat } from '../controller/chatController.js';
import { authMiddlewareAluno } from '../../middlewares/aluno/authAluno.js';

const router = Router();

router.use(authMiddlewareAluno);

router.post('/', storeChat);

router.get('/chat-aberto', indexChat);
export default router;
