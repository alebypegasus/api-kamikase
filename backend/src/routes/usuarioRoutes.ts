import { Router } from 'express';
import { UsuarioController } from '../controllers/UsuarioController';
import { authMiddleware } from '../middlewares/authMiddleware';

const UserRouter = Router();

// Public routes
UserRouter.post('/cadastrar', UsuarioController.cadastrar);
UserRouter.post('/login', UsuarioController.login);

// Protected routes
UserRouter.get('/', authMiddleware, UsuarioController.listarTodos);
UserRouter.delete('/deletar', authMiddleware, UsuarioController.deletar);
UserRouter.put('/atualizar', authMiddleware, UsuarioController.atualizar);

export default UserRouter;