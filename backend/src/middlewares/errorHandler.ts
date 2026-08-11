import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): any => {
  console.error(err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      mensagem: 'Erro de validação nos dados enviados.',
      erros: err.issues.map((e: any) => ({ path: e.path.join('.'), message: e.message }))
    });
  }

  return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
};
