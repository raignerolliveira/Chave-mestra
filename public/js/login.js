document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const alertBox = document.getElementById('alertBox');
  const btnLogin = document.getElementById('btnLogin');
  const email = document.getElementById('email').value;

  alertBox.classList.add('d-none');
  btnLogin.disabled = true;
  btnLogin.innerText = 'Aguardando confirmação de identidade...';

  try {
    // 1. Busca os parâmetros de desafio de Login
    const optRes = await fetch('/api/login/options', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify({ email })
    });

    const options = await optRes.json();
    if (!optRes.ok) throw new Error(options.error || 'Falha ao buscar desafio.');

    // 2. Dispara o modal nativo de autenticação do SO (Windows Hello/TouchID)
    const assertion = await SimpleWebAuthnBrowser.startAuthentication(options);

    // 3. Submete a assinatura criptográfica para validação
    const verifyRes = await fetch('/api/login/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify(assertion)
    });

    const verifyResult = await verifyRes.json();

    if (verifyRes.ok && verifyResult.verified) {
      window.location.href = '/dashboard.html';
    } else {
      throw new Error(verifyResult.error || 'Acesso negado.');
    }
  } catch (error) {
    alertBox.className = 'alert alert-danger';
    alertBox.textContent = error.message;
    alertBox.classList.remove('d-none');
  } finally {
    btnLogin.disabled = false;
    btnLogin.innerText = 'Autenticar com Biometria / PIN';
  }
});