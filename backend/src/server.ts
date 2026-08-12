import express from 'express';
import cors from 'cors';
import { errorHandler } from './middlewares/errorHandler';
import usuarioRoutes from './routes/usuarioRoutes';
import categoriaRoutes from './routes/categoriaRoutes';
import produtoRoutes from './routes/produtoRoutes';
import vendaRoutes from './routes/vendaRoutes';
import adminRoutes from './routes/adminRoutes';

const app = express();

// CORS configuration
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/api/status', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    mensagem: 'API Kamikase operacional.',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/produtos', produtoRoutes);
app.use('/api/vendas', vendaRoutes);
app.use('/api/admin', adminRoutes);

// Error handler (must be last)
app.use(errorHandler);

const PORTA = Number(process.env.PORT) || 3000;
app.listen(PORTA, () => {
  console.log(`🚀 Servidor escutando na porta ${PORTA}...`);
});