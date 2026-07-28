import { Router } from 'express';
import { ProdutoController } from '../controllers/ProdutoController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Todas as rotas de produtos requerem autenticação
router.use(authMiddleware);

router.post('/', ProdutoController.criar);
router.get('/', ProdutoController.listarPorUsuario);
router.get('/todos', ProdutoController.listarTodos);
router.get('/total', ProdutoController.contarPorUsuario);
router.get('/categorias', ProdutoController.listarCategoriasPorUsuario);
router.get('/categorias/total', ProdutoController.contarCategoriasPorUsuario);
router.put('/:id', ProdutoController.atualizar);
router.delete('/:id', ProdutoController.deletar);

export default router;
