import { Router } from 'express';
import {
  storeAbrirAula,
  storeFecharAula,
  storePausarAula,
  storeDespausarAula,
  indexAulaAberta,
  indexAulaAtual,
} from '../controller/aulaController.js';
import { authMiddlewareProfessor } from '../../middlewares/authProfessor.js';

const router = Router();

router.get('/aberta', indexAulaAberta);

/* applies to every route below. Keeps new routes protected by default,
instead of relying on remembering the middleware each time */
router.use(authMiddlewareProfessor);

router.post('/abrir', storeAbrirAula);

router.post('/fechar/:aulaId', storeFecharAula);

router.post('/pausar/:aulaId', storePausarAula);

router.post('/despausar/:aulaId', storeDespausarAula);

router.get('/atual', indexAulaAtual);

export default router;
