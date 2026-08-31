import { Response, NextFunction } from "express";
import { AuthRequest } from "./authMiddleware";

export const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.isAdmin) {
        res.status(403).json({ erro: "Acesso restrito. Você não é um administrador." });
        return;
    }
    next();
};
