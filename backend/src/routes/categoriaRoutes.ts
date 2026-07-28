import { Router } from "express";
import { CategoriaController } from "../controllers/CategoriaController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/", authMiddleware, CategoriaController.criar);
router.get("/", authMiddleware, CategoriaController.listar);
router.put("/:id", authMiddleware, CategoriaController.atualizar);
router.delete("/:id", authMiddleware, CategoriaController.deletar);

export default router;