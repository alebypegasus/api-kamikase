import express from 'express';
import cors from 'cors';
import usuarioRoutes from './routes/usuarioRoutes';
import categoriaRoutes from './routes/categoriaRoutes';
import produtoRoutes from './routes/produtoRoutes';

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());
app.use('/api/categorias', categoriaRoutes);
app.use('/api/produtos', produtoRoutes);

app.get('/api/status', (req, res) => {
  res.status(200).json({
    status: "200 - Created",
    mensagem: "A requisição foi um sucesso. "
  });
});


app.get('/api/erro-400', (req, res) => {
  res.status(400).json({
    status: "400 - Bad Request",
    mensagem: " O Front-end mandou dados faltando"
  });
});

app.get('/api/erro-500', (req, res) => {
  res.status(500).json({
    status: "500 - Internal Server Error",
    mensagem: "  O Front-end mandou tudo certo, mas o nosso código Back-end quebrou"
  });
});

app.use('/api/usuarios', usuarioRoutes);

const PORTA = 3000;
app.listen(PORTA, () => {
  console.log(`Servidor escutando na porta ${PORTA}...`);
})