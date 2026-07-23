require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser'); // <-- Adicionado para não dar erro lá embaixo
const cookieSession = require('cookie-session');
const { globalLimiter, csrfCheck, helmetConfig } = require('./middlewares/securityMiddleware');
const authRoutes = require('./routes/authRoutes');

const app = express();

// AVISA O EXPRESS QUE ESTAMOS RODANDO ATRÁS DE UM PROXY (VERCEL)
app.set('trust proxy', 1);

// 1. Defesas de Cabeçalhos HTTP com Helmet
app.use(helmetConfig);

// 2. Proteção do Rate Limiting
app.use(globalLimiter);

// 3. Middlewares de parsing de Payload
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));
app.use(cookieParser());

// 4. Gerenciamento de Sessão (Otimizado para Vercel)
app.use(
  cookieSession({
    name: 'sid_chave_mestra',
    keys: [process.env.SESSION_SECRET || 'chave_mestra_secret_ultra_seguro_32bytes'],
    maxAge: 5 * 60 * 1000, // 5 minutos
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
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

// Inicialização condicional:
// Se NÃO estiver em produção (ou seja, está no seu PC), roda o servidor localmente.
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`[CHAVE MESTRA] Servidor inicializado na porta ${PORT} (Local)`);
  });
}

// Exportação obrigatória para o Vercel (Serverless Functions)
module.exports = app;