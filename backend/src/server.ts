import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middlewares/errorHandler';
import { closeDatabase } from './config/database';
import usuarioRoutes from './routes/usuarioRoutes';
import categoriaRoutes from './routes/categoriaRoutes';
import produtoRoutes from './routes/produtoRoutes';
import vendaRoutes from './routes/vendaRoutes';
import adminRoutes from './routes/adminRoutes';
import unidadeRoutes from './routes/unidadeRoutes';

const app = express();

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false, // Disable CSP for API
}));

// Compression
app.use(compression());

// CORS configuration
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting — authentication routes (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20, // Max 20 attempts per window
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { erro: 'Muitas tentativas. Tente novamente em 15 minutos.' },
});

// Rate limiting — general API (lenient)
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  limit: 200, // Max 200 requests per minute
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { erro: 'Limite de requisições excedido. Aguarde um momento.' },
});

app.use('/api', apiLimiter);
app.use('/api/usuarios/login', authLimiter);
app.use('/api/usuarios/cadastrar', authLimiter);

// Request logging (lightweight)
app.use((req, _res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/api/status', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    mensagem: 'API Kamikase operacional.',
    versao: '1.0.0',
    ambiente: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/produtos', produtoRoutes);
app.use('/api/vendas', vendaRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/unidades', unidadeRoutes);

// 404 handler for unknown routes
app.use((_req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada.' });
});

// Error handler (must be last)
app.use(errorHandler);

const PORTA = Number(process.env.PORT) || 3000;
const server = app.listen(PORTA, () => {
  console.log(`🚀 Servidor Kamikase v1.0.0 rodando na porta ${PORTA}`);
  console.log(`📍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS: ${allowedOrigins.join(', ')}`);
});

// Graceful Shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`\n⚠️ Sinal ${signal} recebido. Iniciando encerramento suave...`);
  server.close(async () => {
    console.log('🚪 Servidor HTTP fechado.');
    await closeDatabase();
    console.log('✅ Encerramento completo com sucesso.');
    process.exit(0);
  });

  // Força saída após 10 segundos caso conexões fiquem presas
  setTimeout(() => {
    console.error('❌ Encerramento forçado por timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));