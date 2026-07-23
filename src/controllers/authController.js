const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require('@simplewebauthn/server');
const supabase = require('../config/supabase'); // Instância do Supabase
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
    const name = sanitizeInput(req.body.name);
    const email = sanitizeInput(req.body.email);

    if (!name || !email) {
      return res.status(400).json({ error: 'Nome e E-mail são obrigatórios.' });
    }

    // Busca o usuário no Supabase
    let { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (userError) throw userError;

    let userId;

    if (!user) {
      userId = crypto.randomUUID();
      // Insere novo usuário
      const { error: insertError } = await supabase
        .from('users')
        .insert([{ id: userId, name: name, email: email }]);
      
      if (insertError) throw insertError;
    } else {
      userId = user.id;
    }

    // Busca autenticadores vinculados
    const { data: userAuthenticators, error: authError } = await supabase
      .from('authenticators')
      .select('id')
      .eq('user_id', userId);

    if (authError) throw authError;

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
        userVerification: 'preferred',
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

      // Insere o autenticador no Supabase
      const { error: insertError } = await supabase
        .from('authenticators')
        .insert([{
          id: credential.id,
          user_id: userId,
          public_key: Buffer.from(credential.publicKey).toString('base64'),
          counter: credential.counter,
          transports: JSON.stringify(body.response.transports || []),
          device_type: credentialDeviceType,
          backed_up: credentialBackedUp ? 1 : 0
        }]);

      if (insertError) throw insertError;

      // Atualiza a sessão para o usuário logado
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
    const email = sanitizeInput(req.body.email);
    if (!email) {
      return res.status(400).json({ error: 'Informe o E-mail de acesso.' });
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (userError) throw userError;
    if (!user) {
      return res.status(404).json({ error: 'Advogado/Usuário não cadastrado.' });
    }

    const { data: userAuthenticators, error: authError } = await supabase
      .from('authenticators')
      .select('id')
      .eq('user_id', user.id);

    if (authError) throw authError;
    if (!userAuthenticators || userAuthenticators.length === 0) {
      return res.status(400).json({ error: 'Nenhum autenticador registrado.' });
    }

    const options = await generateAuthenticationOptions({
      rpID: RP_ID,
      allowCredentials: userAuthenticators.map(auth => ({
        id: auth.id,
        type: 'public-key',
      })),
      userVerification: 'preferred',
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
    const { body } = req;
    const expectedChallenge = req.session.currentChallenge;
    const userId = req.session.loginUserId;

    if (!expectedChallenge || !userId) {
      return res.status(400).json({ error: 'Desafio expirado.' });
    }

    const { data: dbAuthenticator, error: authError } = await supabase
      .from('authenticators')
      .select('*')
      .eq('id', body.id)
      .eq('user_id', userId)
      .maybeSingle();

    if (authError) throw authError;
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
        credentialPublicKey: Buffer.from(dbAuthenticator.public_key, 'base64'),
        counter: dbAuthenticator.counter,
      },
      requireUserVerification: true,
    });

    const { verified, authenticationInfo } = verification;

    if (verified) {
      // Atualiza o contador no Supabase
      const { error: updateError } = await supabase
        .from('authenticators')
        .update({ counter: authenticationInfo.newCounter })
        .eq('id', dbAuthenticator.id);

      if (updateError) throw updateError;

      // Consolida a sessão com o cookie-session (Substitui o .regenerate)
      req.session = {
        userId: userId,
        lastActivity: Date.now()
      };
      
      return res.json({ verified: true });
    }

    return res.status(400).json({ verified: false, error: 'Assinatura inválida.' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro na autenticação: ' + error.message });
  }
};

exports.getDashboardData = async (req, res) => {
  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, name, email, created_at')
      .eq('id', req.session.userId)
      .maybeSingle();

    if (userError) throw userError;

    return res.json({
      user,
      vaultItems: [
        { id: 1, processNumber: '5001234-88.2026.8.13.0001', client: 'Empresa Alfa S.A.', secretData: 'Estratégia de Acordo: Teto Mágico R$ 2.500.000,00 - Confidencial', level: 'Máximo' },
        { id: 2, processNumber: '1004321-12.2025.8.26.0100', client: 'Dra. Helena Viana', secretData: 'Chaves PGP de Evidências Digitais e Anexos Sigilosos', level: 'Máximo' }
      ]
    });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao carregar dashboard: ' + error.message });
  }
};

exports.logout = (req, res) => {
  req.session = null; // Zera a sessão de forma compatível com o cookie-session
  res.clearCookie('sid_chave_mestra');
  res.json({ status: 'logged_out' });
};