import { Response, NextFunction } from "express";
import { AuthRequest } from "./authMiddleware";

export const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.isAdmin) {
        return res.status(403).json({ erro: "Acesso restrito. Você não é um administrador." });
    }
    next();
};
