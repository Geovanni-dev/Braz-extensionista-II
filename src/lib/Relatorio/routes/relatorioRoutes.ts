import { Router } from 'express';
import { storeRelatorio } from '../controller/relatorioController.js';

const router = Router();

router.post('/', storeRelatorio);

export default router;
