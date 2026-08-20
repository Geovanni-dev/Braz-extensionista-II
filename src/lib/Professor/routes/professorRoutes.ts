import { Router } from 'express';
import { indexProfessor } from '../controller/professorController.js';

const router = Router();

router.get('/', indexProfessor);

export default router;
