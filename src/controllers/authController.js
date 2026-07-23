const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require('@simplewebauthn/server');
const { initDb } = require('../config/database');
const crypto = require('crypto');

const RP_ID = process.env.RP_ID || 'localhost';
const RP_NAME = process.env.RP_NAME || 'Chave Mestra';
const ORIGIN = process.env.ORIGIN || 'http://localhost:3000';

function sanitizeInput(text) {
  if (typeof text !== 'string') return '';
  return text.trim().replace(/[<>]/g, '');
}

exports.generateRegisterOptions = async (req, res) => {
  try {
    const db = await initDb();
    const name = sanitizeInput(req.body.name);
    const email = sanitizeInput(req.body.email);

    if (!name || !email) {
      return res.status(400).json({ error: 'Nome e E-mail são obrigatórios.' });
    }

    let user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    let userId;

    if (!user) {
      userId = crypto.randomUUID();
      await db.run('INSERT INTO users (id, name, email) VALUES (?, ?, ?)', [userId, name, email]);
    } else {
      userId = user.id;
    }

    const userAuthenticators = await db.all('SELECT id FROM authenticators WHERE user_id = ?', [userId]);

    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID: RP_ID,
      userID: Buffer.from(userId),
      userName: email,
      userDisplayName: name,
      attestationType: 'none',
      excludeCredentials: userAuthenticators.map(auth => ({
        id: auth.id,
        type: 'public-key'
      })),
    authenticatorSelection: {
        // Remove a restrição rígida de apenas 'platform' para aceitar qualquer autenticador do SO/Navegador
        userVerification: 'preferred', // Altera de 'required' para 'preferred' para evitar travamento no Windows Hello
        residentKey: 'preferred',
      },
    });

    req.session.currentChallenge = options.challenge;
    req.session.registeringUserId = userId;

    return res.json(options);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao gerar parâmetros de registro WebAuthn: ' + error.message });
  }
};

exports.verifyRegistration = async (req, res) => {
  try {
    const db = await initDb();
    const { body } = req;
    const expectedChallenge = req.session.currentChallenge;
    const userId = req.session.registeringUserId;

    if (!expectedChallenge || !userId) {
      return res.status(400).json({ error: 'Desafio expirado ou inexistente.' });
    }

    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      requireUserVerification: true,
    });

    const { verified, registrationInfo } = verification;

    if (verified && registrationInfo) {
      const { credential, credentialDeviceType, credentialBackedUp } = registrationInfo;

      await db.run(`
        INSERT INTO authenticators (id, user_id, public_key, counter, transports, device_type, backed_up)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        credential.id,
        userId,
        Buffer.from(credential.publicKey),
        credential.counter,
        JSON.stringify(body.response.transports || []),
        credentialDeviceType,
        credentialBackedUp ? 1 : 0
      ]);

      req.session.currentChallenge = null;
      req.session.registeringUserId = null;
      req.session.userId = userId;
      req.session.lastActivity = Date.now();

      return res.json({ verified: true });
    }

    return res.status(400).json({ verified: false, error: 'Falha na validação criptográfica.' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro na verificação do registro: ' + error.message });
  }
};

exports.generateLoginOptions = async (req, res) => {
  try {
    const db = await initDb();
    const email = sanitizeInput(req.body.email);
    if (!email) {
      return res.status(400).json({ error: 'Informe o E-mail de acesso.' });
    }

    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(404).json({ error: 'Advogado/Usuário não cadastrado.' });
    }

    const userAuthenticators = await db.all('SELECT id FROM authenticators WHERE user_id = ?', [user.id]);
    if (userAuthenticators.length === 0) {
      return res.status(400).json({ error: 'Nenhum autenticador registrado.' });
    }

   const options = await generateAuthenticationOptions({
      rpID: RP_ID,
      allowCredentials: userAuthenticators.map(auth => ({
        id: auth.id,
        type: 'public-key',
      })),
      userVerification: 'preferred', // Altera de 'required' para 'preferred'
    });

    req.session.currentChallenge = options.challenge;
    req.session.loginUserId = user.id;

    return res.json(options);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao gerar opções de login: ' + error.message });
  }
};

exports.verifyLogin = async (req, res) => {
  try {
    const db = await initDb();
    const { body } = req;
    const expectedChallenge = req.session.currentChallenge;
    const userId = req.session.loginUserId;

    if (!expectedChallenge || !userId) {
      return res.status(400).json({ error: 'Desafio expirado.' });
    }

    const dbAuthenticator = await db.get('SELECT * FROM authenticators WHERE id = ? AND user_id = ?', [body.id, userId]);

    if (!dbAuthenticator) {
      return res.status(400).json({ error: 'Autenticador não reconhecido.' });
    }

    const verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      authenticator: {
        credentialID: dbAuthenticator.id,
        credentialPublicKey: dbAuthenticator.public_key,
        counter: dbAuthenticator.counter,
      },
      requireUserVerification: true,
    });

    const { verified, authenticationInfo } = verification;

    if (verified) {
      await db.run('UPDATE authenticators SET counter = ? WHERE id = ?', [authenticationInfo.newCounter, dbAuthenticator.id]);

      req.session.regenerate((err) => {
        if (err) return res.status(500).json({ error: 'Erro ao consolidar sessão.' });

        req.session.userId = userId;
        req.session.lastActivity = Date.now();
        return res.json({ verified: true });
      });
      return;
    }

    return res.status(400).json({ verified: false, error: 'Assinatura inválida.' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro na autenticação: ' + error.message });
  }
};

exports.getDashboardData = async (req, res) => {
  const db = await initDb();
  const user = await db.get('SELECT id, name, email, created_at FROM users WHERE id = ?', [req.session.userId]);
  return res.json({
    user,
    vaultItems: [
      { id: 1, processNumber: '5001234-88.2026.8.13.0001', client: 'Empresa Alfa S.A.', secretData: 'Estratégia de Acordo: Teto Mágico R$ 2.500.000,00 - Confidencial', level: 'Máximo' },
      { id: 2, processNumber: '1004321-12.2025.8.26.0100', client: 'Dra. Helena Viana', secretData: 'Chaves PGP de Evidências Digitais e Anexos Sigilosos', level: 'Máximo' }
    ]
  });
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('sid_chave_mestra');
    res.json({ status: 'logged_out' });
  });
};