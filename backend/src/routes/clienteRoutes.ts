import { Router } from 'express';
import { ClienteController } from '../controllers/clienteController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', ClienteController.listar);
router.get('/:id', ClienteController.obterPorId);
router.post('/', ClienteController.criar);
router.put('/:id', ClienteController.atualizar);
router.delete('/:id', ClienteController.excluir);

export default router;
