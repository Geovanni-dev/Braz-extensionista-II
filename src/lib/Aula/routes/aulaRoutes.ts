import { Router } from 'express';
import {
  storeAbrirAula,
  storeFecharAula,
  storePausarAula,
  storeDespausarAula,
  indexAulaAberta,
  indexAulaAtual,
  indexAula,
  indexRelatorioAula,
} from '../controller/aulaController.js';
import { authMiddlewareProfessor } from '../../middlewares/professor/authProfessor.js';

const router = Router();

router.get('/aberta', indexAulaAberta);

/* applies to every route below. Keeps new routes protected by default,
instead of relying on remembering the middleware each time */
router.use(authMiddlewareProfessor);

router.post('/abrir', storeAbrirAula);

router.post('/fechar/:aulaId', storeFecharAula);

router.post('/pausar/:aulaId', storePausarAula);

router.post('/despausar/:aulaId', storeDespausarAula);

router.get('/relatorio/:aulaId', indexRelatorioAula);

router.get('/buscar-aula', indexAula);

router.get('/atual', indexAulaAtual);

export default router;
