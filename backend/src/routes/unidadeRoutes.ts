import { Router } from 'express';
import { UnidadeController } from '../controllers/UnidadeController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminMiddleware } from '../middlewares/adminMiddleware';

const router = Router();

// Apenas administradores podem gerenciar unidades, mas todos logados podem precisar listar.
router.get('/', authMiddleware, UnidadeController.listarTodas);
router.post('/', authMiddleware, adminMiddleware, UnidadeController.criar);
router.put('/:id', authMiddleware, adminMiddleware, UnidadeController.atualizar);

export default router;
