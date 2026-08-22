import { Router } from 'express';
import { store } from '../controller/alunoController.js';

const router = Router();

router.post('/registro', store);

export default router;
