document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const alertBox = document.getElementById('alertBox');
  const btnRegister = document.getElementById('btnRegister');
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;

  alertBox.classList.add('d-none');
  btnRegister.disabled = true;
  btnRegister.innerText = 'Aguardando validação no dispositivo...';

  try {
    // 1. Solicita as opções de registro ao backend
    const optRes = await fetch('/api/register/options', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify({ name, email })
    });

    const options = await optRes.json();
    if (!optRes.ok) throw new Error(options.error || 'Erro na solicitação de registro.');

    // 2. Invoca o autenticador nativo da plataforma do S.O.
    const attestation = await SimpleWebAuthnBrowser.startRegistration(options);

    // 3. Envia o comprovante criptográfico para verificação no servidor
    const verifyRes = await fetch('/api/register/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify(attestation)
    });

    const verifyResult = await verifyRes.json();

    if (verifyRes.ok && verifyResult.verified) {
      alertBox.className = 'alert alert-success';
      alertBox.textContent = 'Dispositivo vinculado com sucesso! Redirecionando para o cofre...';
      alertBox.classList.remove('d-none');
      setTimeout(() => { window.location.href = '/dashboard.html'; }, 1500);
    } else {
      throw new Error(verifyResult.error || 'Falha na verificação da chave.');
    }
  } catch (error) {
    alertBox.className = 'alert alert-danger';
    alertBox.textContent = error.message;
    alertBox.classList.remove('d-none');
  } finally {
    btnRegister.disabled = false;
    btnRegister.innerText = 'Vincular Dispositivo & Cadastrar';
  }
});