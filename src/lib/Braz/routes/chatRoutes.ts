import { Router } from 'express';
import { storeChat } from '../controller/chatController.js';

const router = Router();

router.post('/', storeChat);

export default router;
