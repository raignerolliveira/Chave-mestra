🗺️ Mapa da Arquitetura: Chave MestraEste documento detalha a estrutura de pastas e arquivos do projeto, explicando a responsabilidade de cada camada para facilitar a manutenção e o desenvolvimento da plataforma.

🌳 Visão Geral da Árvore de DiretóriosPlaintextCHAVE-MESTRA/

├── 📁 node_modules/ # Bibliotecas de terceiros (gerado automaticamente)
├── 📁 public/ # Camada de Apresentação (Frontend / Interface)
├── 📁 src/ # Camada de Negócios e Servidor (Backend / API)
├── 📄 .env # Variáveis de ambiente (Segredos)
├── 📄 .gitignore # Regras de exclusão do Git
├── 📄 package.json # Manifesto do projeto e dependências
├── 📄 readme.md # Documentação principal
└── 📄 vercel.json # Regras de infraestrutura para o deploy na nuvem

⚙️ 1. Raiz do Projeto (Configurações e Infraestrutura)Estes arquivos não contêm código de regras de negócio, mas sim as instruções de como a aplicação deve rodar, quais pacotes precisa e como será hospedada.ArquivoO que faz e para que serveComo utilizarpackage.jsonÉ o "RG" do projeto Node.js. Lista o nome, scripts de atalho e todas as bibliotecas que o projeto usa.Edite apenas quando precisar alterar comandos de inicialização. As bibliotecas são adicionadas aqui automaticamente ao rodar npm install.package-lock.jsonTrava as versões exatas das bibliotecas do package.json. Evita que o projeto quebre se uma biblioteca atualizar.Não edite manualmente. Ele é atualizado pelo próprio npm..envO cofre de segredos. Guarda chaves de banco de dados e senhas criptográficas.Crie este arquivo no seu PC para rodar localmente. Nunca envie para o GitHub..gitignoreInstrui o Git sobre quais arquivos ignorar (como o .env e a pasta pesada node_modules).Adicione o nome de pastas ou arquivos que devem ficar apenas no seu PC.vercel.jsonManual de instruções para a Vercel. Ensina o servidor a separar os arquivos estáticos (HTML) do código Node.js.Altere apenas se mudar a estrutura de pastas do projeto ou o sistema de rotas.

🌐 2. Camada Frontend (Pasta public/)Onde o usuário interage. Tudo nesta pasta roda diretamente no navegador do advogado.index.html: Página de entrada (Login). Coleta o e-mail do usuário para iniciar o desafio de biometria.register.html: Página de cadastro. Responsável por capturar dados do novo advogado e acionar o WebAuthn para registrar a impressão digital/FaceID.dashboard.html: O "Cofre Seguro". Interface carregada apenas após o sucesso da biometria, exibindo dados sigilosos e processos.css/custom.css: Arquivo de estilos que define cores, botões, margens e o design responsivo da plataforma.js/ (Scripts): Os "motores" das páginas. Os arquivos aqui dentro (ex: login.js, register.js) escutam os cliques dos botões, chamam a biometria nativa do dispositivo e enviam os dados para o Backend.

🧠 3. Camada Backend (Pasta src/)Onde a mágica acontece. É o "cérebro" do sistema, rodando na nuvem (Serverless), totalmente isolado do usuário.O Ponto de Entradaapp.js: É o arquivo maestro. Ele inicia o servidor Express, aplica as travas de segurança (middlewares), inicializa a gestão de sessão (cookie-session) e aponta o caminho das rotas.As Subpastas (Padrão de Arquitetura)

📁 config/ (Conexões externas):supabase.js: Inicializa a conexão com o banco de dados na nuvem, usando a Service Key de forma segura.(Nota: O arquivo database.js continha o banco SQLite antigo. Recomenda-se excluí-lo para limpar o projeto).

📁 controllers/ (Regras de Negócio):authController.js: O coração da segurança. Recebe os pedidos do frontend, gera os desafios criptográficos da biometria, valida assinaturas, grava os usuários no banco de dados e gerencia o login/logout.

📁 middlewares/ (Segurança da Porta de Entrada):Funções que interceptam as requisições antes de chegarem aos controladores.Exemplos de uso: Bloquear tentativas de DDoS (Rate Limit), garantir que as requisições são autênticas (CSRF) e limpar cabeçalhos suspeitos (Helmet).

📁 routes/ (Mapeamento de URLs):Define as URLs da sua API (ex: /api/login, /api/register).Como funciona: Quando o frontend pede /api/login, este arquivo direciona esse pedido para a função correta dentro de authController.js.

📁 utils/ (Ferramentas de Apoio):Pasta reservada para pequenas funções repetitivas (como formatar datas, criar senhas aleatórias ou validar formatos de e-mail), mantendo os controladores principais limpos.
