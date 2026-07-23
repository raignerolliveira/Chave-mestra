require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const cookieParser = require('cookie-parser');

const { initDb } = require('./config/database'); // Importação do initDb
const { globalLimiter, csrfCheck, helmetConfig } = require('./middlewares/securityMiddleware');
const authRoutes = require('./routes/authRoutes');

const app = express();

// 1. Defesas de Cabeçalhos HTTP com Helmet
app.use(helmetConfig);

// 2. Proteção do Rate Limiting
app.use(globalLimiter);

// 3. Middlewares de parsing de Payload
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));
app.use(cookieParser());

// 4. Gerenciamento de Sessão
app.use(
  session({
    name: 'sid_chave_mestra',
    secret: process.env.SESSION_SECRET || 'chave_mestra_secret_ultra_seguro_32bytes',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 5 * 60 * 1000
    }
  })
);

// 5. Validação CSRF
app.use('/api', csrfCheck);

// 6. Arquivos estáticos
app.use(express.static(path.join(__dirname, '../public')));

// 7. Rotas
app.use('/api', authRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Recurso não encontrado.' });
});

const PORT = process.env.PORT || 3000;

// Inicializa o banco de dados primeiro, depois sobe o servidor HTTP
initDb().then(() => {
  console.log('[CHAVE MESTRA] Banco de Dados SQLite conectado.');
  app.listen(PORT, () => {
    console.log(`[CHAVE MESTRA] Servidor inicializado na porta ${PORT}`);
  });
}).catch((err) => {
  console.error('Erro ao conectar ao Banco de Dados:', err);
});