import { Router } from 'express';
import { UsuarioController } from '../controllers/UsuarioController';
import { authMiddleware } from '../middlewares/authMiddleware';

import { adminMiddleware } from '../middlewares/adminMiddleware';

const UserRouter = Router();

// Public route: Login only
UserRouter.post('/login', UsuarioController.login);

// Protected routes (Admin only for registration)
UserRouter.post('/cadastrar', authMiddleware, adminMiddleware, UsuarioController.cadastrar);

// Protected routes
UserRouter.get('/', authMiddleware, UsuarioController.listarTodos);
UserRouter.delete('/deletar', authMiddleware, UsuarioController.deletar);
UserRouter.put('/atualizar', authMiddleware, UsuarioController.atualizar);

export default UserRouter;