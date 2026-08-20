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

router.post('/fechar/:aulaId', storeFecharAula);

router.post('/pausar/:aulaId', storePausarAula);

router.post('/despausar/:aulaId', storeDespausarAula);

export default router;
