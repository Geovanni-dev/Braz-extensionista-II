import { Router } from 'express';
import {
  storeAbrirAula,
  storeFecharAula,
  storePausarAula,
  storeDespausarAula,
} from '../controller/aulaController.js';

const router = Router();

router.post('/abrir', storeAbrirAula);

router.post('/:aulaId/fechar', storeFecharAula);

router.post('/:aulaId/pausar', storePausarAula);

router.post('/:aulaId/despausar', storeDespausarAula);

export default router;
