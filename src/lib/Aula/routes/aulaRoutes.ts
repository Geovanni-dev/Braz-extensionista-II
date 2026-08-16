import { Router } from 'express';
import {
  storeAbrirAula,
  storeFecharAula,
} from '../controller/aulaController.js';

const router = Router();

router.post('/abrir', storeAbrirAula);

router.post('/fechar', storeFecharAula);

export default router;
