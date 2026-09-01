import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminMiddleware } from '../middlewares/adminMiddleware';

const router = Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/dashboard', AdminController.obterDashboard);
router.get('/vendas', AdminController.listarTodasVendas);
router.get('/vendas/:id', AdminController.obterDetalhesVenda);
router.get('/produtos', AdminController.listarTodosProdutos);
router.post('/usuarios', AdminController.criarLojista);
router.put('/usuarios/:id/senha', AdminController.resetarSenhaLojista);
router.get('/usuarios/:id/detalhes', AdminController.obterDetalhesLojista);

export default router;
