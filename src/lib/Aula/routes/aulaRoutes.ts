import { Router } from 'express';
import {
  storeAbrirAula,
  storeFecharAula,
} from '../controller/aulaController.js';

const router = Router();

router.post('/abrir', storeAbrirAula);

router.post('/:aulaId/fechar', storeFecharAula);

export default router;
