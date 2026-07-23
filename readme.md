# 🔐 Chave Mestra

> Plataforma de autenticação biométrica para advogados utilizando **WebAuthn (Passkeys)**, **Node.js**, **Express** e **Supabase**, desenvolvida com foco em segurança, escalabilidade e arquitetura organizada.

---

# 📋 Visão Geral

O **Chave Mestra** é uma plataforma que utiliza autenticação biométrica nativa dos dispositivos (Face ID, Touch ID, Windows Hello, Android Biometrics e chaves de segurança FIDO2) para proteger o acesso de advogados às informações sensíveis da aplicação.

O projeto foi desenvolvido seguindo uma arquitetura organizada, separando claramente a interface do usuário (Frontend) das regras de negócio (Backend), facilitando manutenção, escalabilidade e evolução futura.

---

# 🚀 Tecnologias

## Frontend

* HTML5
* CSS3
* JavaScript (ES6)
* WebAuthn API
* Responsive Design

## Backend

* Node.js
* Express.js
* Supabase
* cookie-session
* Helmet
* Rate Limit
* CSRF Protection

## Infraestrutura

* Vercel
* GitHub
* Variáveis de Ambiente (.env)

---

# 📁 Arquitetura do Projeto

```text
CHAVE-MESTRA/
│
├── node_modules/
│
├── public/
│   ├── css/
│   ├── js/
│   ├── dashboard.html
│   ├── index.html
│   └── register.html
│
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── routes/
│   ├── utils/
│   └── app.js
│
├── .env
├── .gitignore
├── package.json
├── package-lock.json
├── readme.md
└── vercel.json
```

---

# ⚙️ Estrutura da Aplicação

## 📂 Raiz do Projeto

Arquivos responsáveis pela configuração geral da aplicação.

### package.json

É o manifesto do projeto.

Responsável por:

* listar dependências
* scripts de execução
* informações da aplicação

---

### package-lock.json

Armazena exatamente quais versões das bibliotecas foram instaladas.

Evita incompatibilidades entre ambientes.

---

### .env

Arquivo de configuração contendo informações sigilosas.

Exemplo:

```env
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
SESSION_SECRET=
```

**Nunca envie este arquivo ao GitHub.**

---

### .gitignore

Define quais arquivos não serão enviados ao repositório.

Normalmente:

```text
node_modules
.env
```

---

### vercel.json

Arquivo utilizado pela Vercel para definir como o projeto será publicado em ambiente de produção.

---

# 🌐 Frontend (public)

Toda a interface utilizada pelo usuário.

## index.html

Tela inicial.

Responsável por:

* solicitar o e-mail
* iniciar o processo de login biométrico

---

## register.html

Tela de cadastro.

Responsável por:

* cadastro do advogado
* registro da credencial WebAuthn
* criação da Passkey

---

## dashboard.html

Área protegida.

Disponível apenas após autenticação biométrica.

Exibe informações sigilosas do sistema.

---

## css/

Contém os estilos da aplicação.

Exemplo:

```text
custom.css
```

Responsável por:

* layout
* responsividade
* identidade visual

---

## js/

Scripts responsáveis pela comunicação com o backend.

Exemplos:

```text
login.js
register.js
dashboard.js
```

Funções:

* capturar eventos
* iniciar WebAuthn
* enviar dados para API
* atualizar interface

---

# 🧠 Backend (src)

Onde ficam todas as regras de negócio.

---

## app.js

Arquivo principal da aplicação.

Responsável por:

* iniciar o Express
* configurar middlewares
* iniciar sessões
* registrar rotas
* iniciar API

---

# 📂 config

Responsável pelas conexões externas.

## supabase.js

Inicializa a conexão com o banco de dados.

Utiliza a Service Role Key armazenada no arquivo `.env`.

---

# 📂 controllers

Onde ficam as regras de negócio.

## authController.js

Responsável por:

* cadastro do usuário
* geração do desafio WebAuthn
* validação das assinaturas
* autenticação biométrica
* login
* logout
* gravação dos dados no banco

É considerado o coração do sistema.

---

# 📂 middlewares

Camada responsável por interceptar todas as requisições antes que cheguem aos controladores.

Exemplos:

* Helmet
* Rate Limit
* CSRF
* autenticação
* validações

Objetivo:

proteger a aplicação.

---

# 📂 routes

Responsável pelo mapeamento das URLs.

Exemplo:

```text
/api/register
/api/login
/api/logout
/api/dashboard
```

As rotas apenas encaminham as requisições para os respectivos controladores.

---

# 📂 utils

Contém funções auxiliares reutilizáveis.

Exemplos:

* validação de e-mail
* geração de tokens
* formatação de datas
* funções criptográficas
* utilidades gerais

---

# 🔐 Fluxo da Autenticação

```text
Usuário
      │
      ▼
index.html
      │
      ▼
login.js
      │
      ▼
API (/login)
      │
      ▼
authController
      │
      ▼
Gera Challenge
      │
      ▼
WebAuthn
(Face ID / Digital / Windows Hello)
      │
      ▼
Validação da Assinatura
      │
      ▼
Supabase
      │
      ▼
Sessão criada
      │
      ▼
Dashboard
```

---

# 🛡️ Camadas de Segurança

O projeto utiliza diversas medidas para proteção da aplicação:

* Autenticação WebAuthn (Passkeys)
* Sessões seguras
* Cookies HTTP Only
* Helmet
* Rate Limit
* CSRF Protection
* Variáveis protegidas no `.env`
* Banco de dados Supabase
* API isolada do Frontend

---

# ▶️ Como Executar

## 1. Clone o projeto

```bash
git clone https://github.com/seu-usuario/chave-mestra.git
```

---

## 2. Entre na pasta

```bash
cd chave-mestra
```

---

## 3. Instale as dependências

```bash
npm install
```

---

## 4. Configure o arquivo .env

```env
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
SESSION_SECRET=
```

---

## 5. Execute

```bash
npm start
```

ou

```bash
npm run dev
```

---

# ☁️ Deploy

A aplicação foi estruturada para publicação na **Vercel**, utilizando funções Serverless para o backend e hospedagem estática para o frontend.

---

# 📚 Estrutura Arquitetural

A aplicação segue uma separação em camadas:

```text
Frontend
    │
    ▼
Rotas
    │
    ▼
Controllers
    │
    ▼
Config
    │
    ▼
Supabase
```

Essa organização facilita:

* manutenção
* testes
* escalabilidade
* reutilização de código
* segurança

---

# 🎯 Objetivos do Projeto

* autenticação sem senha
* segurança elevada
* biometria nativa
* arquitetura limpa
* fácil manutenção
* escalabilidade
* deploy simplificado
* código organizado

---

# 👨‍💻 Autor

**Projeto Chave Mestra**

Plataforma desenvolvida com foco em autenticação biométrica moderna utilizando WebAuthn, Node.js, Express e Supabase.
