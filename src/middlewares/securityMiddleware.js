const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Rate limiting global para prevenção contra ataques de Força Bruta e DoS
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 429, error: 'Muitas requisições. Tente novamente em 15 minutos.' }
});

// Rate limiting estrito para endpoints de autenticação sensíveis
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 429, error: 'Muitas tentativas de autenticação. Aguarde 5 minutos.' }
});

// Middleware Personalizado Anti-CSRF via Custom Headers
const csrfCheck = (req, res, next) => {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const customHeader = req.headers['x-requested-with'];
    if (!customHeader || customHeader !== 'XMLHttpRequest') {
      return res.status(403).json({ error: 'Requisição inválida (Falta do Cabeçalho CSRF Customizado).' });
    }
  }
  next();
};

// Configuração Avançada do Helmet (Proteção HTTP Headers / CSP)
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'https://cdn.jsdelivr.net'],
      styleSrc: ["'self'", 'https://cdn.jsdelivr.net'],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  referrerPolicy: { policy: 'same-origin' },
  xssFilter: true,
  noSniff: true
});

module.exports = {
  globalLimiter,
  authLimiter,
  csrfCheck,
  helmetConfig
};