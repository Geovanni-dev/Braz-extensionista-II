import { Router } from 'express';
import {
  storeAbrirAula,
  storeFecharAula,
  storePausarAula,
  storeDespausarAula,
} from '../controller/aulaController.js';
import { authMiddlewareProfessor } from '../../middlewares/authProfessor.js';

const router = Router();

/* applies to every route below. Keeps new routes protected by default,
instead of relying on remembering the middleware each time */
router.use(authMiddlewareProfessor);

router.post('/abrir', storeAbrirAula);

router.post('/:aulaId/fechar', storeFecharAula);

router.post('/:aulaId/pausar', storePausarAula);

router.post('/:aulaId/despausar', storeDespausarAula);

export default router;
