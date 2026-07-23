📂 Estrutura de Diretórios e Arquivos: Chave Mestra
A arquitetura do projeto foi dividida em duas grandes áreas: o Frontend (pasta public, que roda no navegador do usuário) e o Backend (pasta src, que processa a lógica de negócios e segurança no servidor/Vercel).

1. Arquivos de Configuração (Raiz do Projeto)
Estes são os arquivos que ditam as regras do seu ambiente, dependências e hospedagem.

package.json: O "coração" do projeto Node.js. Ele lista o nome do projeto, a versão, os scripts de atalho (como npm start) e todas as dependências (bibliotecas) necessárias para o código rodar (como express, cookie-session, @supabase/supabase-js, etc.).

package-lock.json: Um arquivo gerado automaticamente. Ele trava as versões exatas das bibliotecas instaladas no package.json para garantir que o projeto funcione da mesma forma no seu computador e nos servidores da Vercel.

.env: O cofre das chaves secretas. Guarda variáveis de ambiente sensíveis que nunca devem ir para o GitHub, como a SUPABASE_KEY e o SESSION_SECRET.

.gitignore: Uma lista de regras para o Git. Ele avisa quais pastas e arquivos (como node_modules e .env) o Git deve ignorar e não enviar para o repositório público.

vercel.json: O manual de instruções para o deploy. Ele diz à Vercel como tratar o seu projeto (ex: exportar a pasta public como arquivos estáticos e redirecionar rotas /api para o backend app.js).

readme.md: A documentação principal (apresentação do projeto, tecnologias, como instalar e rodar).

2. Pasta node_modules/
O que é: Onde o Node.js baixa e guarda fisicamente o código de terceiros (as bibliotecas listadas no package.json).

Como usar: Você nunca mexe aqui dentro. Quando precisar instalar algo novo, usa o terminal (npm install pacote).

3. Pasta public/ (Frontend)
Contém os arquivos que são enviados diretamente para o navegador do advogado. É a interface e o visual do produto digital.

index.html: A página inicial. Geralmente contém o formulário de login onde o usuário insere o e-mail para ativar a biometria.

register.html: A página de cadastro para vincular o novo dispositivo (computador/celular) do advogado ao banco de dados pela primeira vez.

dashboard.html: A área segura (Cofre). Onde as informações sigilosas e chaves PGP são exibidas após o sucesso da autenticação biométrica.

css/custom.css: O arquivo de estilização (cores, fontes, margens) que dá vida ao design do seu produto.

js/ (Scripts do Cliente): Contém arquivos como login.js e register.js. Eles capturam os cliques dos botões no HTML, comunicam-se com a sua API (backend) e ativam a caixinha de biometria nativa do navegador utilizando a API do WebAuthn.

4. Pasta src/ (Backend / Serverless)
É aqui que a estratégia de produto ganha vida através da lógica de negócios, segurança e conexão com o banco de dados.

app.js: O arquivo principal (Entry Point) do backend. Ele constrói o servidor Express, aplica as camadas de segurança (Helmet, Rate Limiter), configura o gerenciamento de sessão (cookie-session) e aponta onde estão as rotas. Ele é exportado no final para ser consumido pelas Serverless Functions da Vercel.

Subpasta: src/config/
Centraliza a conexão com serviços externos.

supabase.js: Inicializa a conexão com o banco de dados PostgreSQL na nuvem usando as chaves do .env. Ele exporta a "instância" do Supabase para que outros arquivos possam salvar ou ler dados.

database.js: (Aviso: Como migramos para o Supabase, este arquivo provavelmente contém a configuração antiga do SQLite. Se você não o está importando em nenhum lugar, ele pode ser deletado para manter o projeto limpo).

Subpasta: src/controllers/
O cérebro da operação. Recebe as requisições, processa a lógica e devolve as respostas.

authController.js: Contém todas as funções cruciais de segurança.

generateRegisterOptions / verifyRegistration: Cria o desafio biométrico e salva a chave pública do novo usuário no Supabase.

generateLoginOptions / verifyLogin: Confere a assinatura criptográfica para permitir o acesso.

getDashboardData: Busca os dados sigilosos no banco apenas se o usuário tiver uma sessão válida e ativa.

Subpasta: src/middlewares/
Os "seguranças da porta" do servidor. Funções que rodam antes de chegar no Controller.

(Exemplo: securityMiddleware.js): Verifica se a requisição está vindo da origem certa (CSRF), bloqueia IPs que estão tentando fazer requisições em massa (DDoS/Força bruta) e limpa cabeçalhos HTTP inseguros.

Subpasta: src/routes/
As placas de sinalização do seu servidor.

(Exemplo: authRoutes.js): Mapeia as URLs. Ele diz: "Quando o frontend enviar um POST para /api/register/options, chame a função correspondente lá no authController.js".

Subpasta: src/utils/
A caixa de ferramentas.

Onde você guarda pequenas funções utilitárias que podem ser reaproveitadas em várias partes do código (ex: formatadores de data, validadores de e-mail ou geradores de string aleatória), mantendo os controllers enxutos.