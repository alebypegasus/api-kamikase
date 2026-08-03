import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    usuarioId?: number;
    isAdmin?: boolean;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ erro: "Acesso Negado. Crachá (Token) não fornecido." });
    }

    const [, token] = authHeader.split(' ');

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: number, is_admin?: boolean };
        req.usuarioId = decoded.id;
        req.isAdmin = decoded.is_admin || false;
        next();
    }
    catch (error) {
        return res.status(401).json({ erro: "Crachá (Token) Inválido ou Expirado." });
    }

}
