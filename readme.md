# 🗝️ Chave Mestra - Cofre Digital de Segurança Jurídica

O **Chave Mestra** é uma plataforma focada na proteção de informações críticas e sigilosas para escritórios de advocacia. Desenvolvido com uma arquitetura moderna e escalável, o sistema elimina a vulnerabilidade das senhas tradicionais utilizando o protocolo **WebAuthn** (Passwordless) para autenticação via biometria nativa (TouchID, FaceID, Windows Hello).

## 🚀 Arquitetura e Tecnologias

O projeto foi estruturado para ser 100% *Cloud-Native* e Serverless, garantindo alta disponibilidade e segurança:

*   **Backend:** Node.js com Express.js
*   **Banco de Dados:** Supabase (PostgreSQL) - *Migrado de SQLite para suportar escala na nuvem.*
*   **Autenticação:** `@simplewebauthn/server` (Protocolo FIDO2 / WebAuthn)
*   **Gerenciamento de Sessão:** `cookie-session` (Otimizado para ambientes Serverless)
*   **Segurança:** `helmet`, proteção CSRF e Rate Limiting global.
*   **Deploy / Hospedagem:** Vercel (Serverless Functions)

---

## ⚙️ Variáveis de Ambiente (.env)

Para rodar este projeto, você precisará configurar as seguintes variáveis de ambiente na raiz do projeto (para desenvolvimento local) ou no painel da Vercel (para produção):

```env
# Banco de Dados (Supabase)
SUPABASE_URL="[https://seu-projeto.supabase.co](https://seu-projeto.supabase.co)"
SUPABASE_KEY="sua_chave_service_role" # Obrigatório usar a Service Role para operações backend

# Configurações WebAuthn (Biometria)
# Local: 'localhost' | Produção: 'seu-projeto.vercel.app' (Sem https://)
RP_ID="localhost" 
# Local: 'http://localhost:3000' | Produção: '[https://seu-projeto.vercel.app](https://seu-projeto.vercel.app)'
ORIGIN="http://localhost:3000"
RP_NAME="Chave Mestra"

# Segurança
SESSION_SECRET="sua_chave_criptografica_segura_de_32_caracteres"