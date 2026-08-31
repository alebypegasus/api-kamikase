import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    usuarioId?: number;
    isAdmin?: boolean;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.status(401).json({ erro: "Acesso negado. Token não fornecido." });
        return;
    }

    const [, token] = authHeader.split(' ');

    if (!token) {
        res.status(401).json({ erro: "Acesso negado. Formato de token inválido." });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: number, is_admin?: boolean };
        req.usuarioId = decoded.id;
        req.isAdmin = decoded.is_admin || false;
        next();
    }
    catch (error) {
        res.status(401).json({ erro: "Token inválido ou expirado." });
        return;
    }
};
