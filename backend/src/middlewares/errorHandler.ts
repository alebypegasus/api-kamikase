import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): any => {
  // Log do erro com contexto
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ERROR ${req.method} ${req.path}:`, err.message);
  
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  // Erros de validação Zod
  if (err instanceof ZodError) {
    return res.status(400).json({
      mensagem: 'Erro de validação nos dados enviados.',
      erros: err.issues.map((e) => ({ 
        campo: e.path.join('.'), 
        mensagem: e.message 
      }))
    });
  }

  // Erros de JWT (token inválido/expirado)
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ 
      mensagem: 'Token de autenticação inválido ou expirado.' 
    });
  }

  // Erros de MySQL (duplicata, FK, etc.)
  if ((err as any).code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ 
      mensagem: 'Registro duplicado. O recurso já existe.' 
    });
  }

  if ((err as any).code === 'ER_ROW_IS_REFERENCED_2' || (err as any).code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ 
      mensagem: 'Operação inválida. Existem dependências vinculadas a este registro.' 
    });
  }

  // Erro genérico
  const statusCode = (err as any).statusCode || 500;
  return res.status(statusCode).json({ 
    mensagem: process.env.NODE_ENV === 'production' 
      ? 'Erro interno do servidor.' 
      : err.message || 'Erro interno do servidor.'
  });
};
