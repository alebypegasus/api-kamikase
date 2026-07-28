import { Router } from 'express';
import { UsuarioController } from '../controllers/UsuarioController';

const UserRouter = Router();

UserRouter.post('/cadastrar', UsuarioController.cadastrar);
UserRouter.post('/login', UsuarioController.login);
UserRouter.get('/', UsuarioController.listarTodos);
UserRouter.delete('/deletar', UsuarioController.deletar);
UserRouter.put('/atualizar', UsuarioController.atualizar);



export default UserRouter;