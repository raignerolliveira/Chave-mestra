const SESSION_MAX_IDLE_TIME = 5 * 60 * 1000; // 5 Minutos de Inatividade

/**
 * Middleware para validar sessão ativa e estrita inatividade de 5 minutos
 */
function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Não autorizado. Faça login para continuar.' });
  }

  const now = Date.now();
  const lastActivity = req.session.lastActivity || now;

  if (now - lastActivity > SESSION_MAX_IDLE_TIME) {
    req.session.destroy((err) => {
      res.clearCookie('connect.sid');
      return res.status(401).json({ 
        error: 'Sessão expirada por inatividade (limite de 5 minutos excedido). Faça login novamente.' 
      });
    });
    return;
  }

  // Atualiza o registro de atividade da sessão
  req.session.lastActivity = now;
  next();
}

module.exports = {
  requireAuth
};