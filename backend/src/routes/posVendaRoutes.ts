import { Router } from 'express';
import { PosVendaController } from '../controllers/posVendaController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', PosVendaController.listar);
router.get('/stats', PosVendaController.obterEstatisticas);
router.get('/:id', PosVendaController.obterPorId);
router.put('/:id', PosVendaController.atualizar);

export default router;
