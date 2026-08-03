import { Router } from 'express';
import { VendaController } from '../controllers/VendaController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.post('/', VendaController.criar);
router.get('/', VendaController.listarPorUsuario);
router.get('/:id', VendaController.listarDetalhesVenda);

export default router;
