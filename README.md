# Mivo Feed API

## 📝 Sobre o Projeto

API RESTful para gerenciamento de comunidades com feed de posts. Este é um projeto de estudos focado em práticas modernas de desenvolvimento serverless na AWS.

**Objetivo:** Praticar e consolidar conhecimentos em arquitetura serverless, banco de dados NoSQL (DynamoDB), modelagem Single Table Design e serviços da AWS.

## 🚀 Tecnologias

- **[Serverless Framework](https://www.serverless.com/)** - Framework para deploy e gerenciamento de aplicações serverless
- **[AWS Lambda](https://aws.amazon.com/lambda/)** - Computação serverless
- **[Amazon DynamoDB](https://aws.amazon.com/dynamodb/)** - Banco de dados NoSQL
- **[Amazon S3](https://aws.amazon.com/s3/)** - Armazenamento de objetos
- **[API Gateway](https://aws.amazon.com/api-gateway/)** - Gerenciamento de APIs
- **[TypeScript](https://www.typescriptlang.org/)** - Linguagem de programação
- **[Zod](https://zod.dev/)** - Validação de schemas

## 🏗️ Arquitetura

```
┌─────────────┐
│  API Gateway │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Lambda     │
│  Functions   │
└──────┬──────┘
       │
       ├──────────────┐
       ▼              ▼
┌─────────────┐  ┌─────────────┐
│  DynamoDB   │  │     S3      │
│   (Dados)   │  │  (Arquivos) │
└─────────────┘  └─────────────┘
```

## 📦 Funcionalidades

### Accounts (Contas)

- ✅ Criar conta
- ✅ Listar contas
- ✅ Buscar conta por ID
- ✅ Atualizar conta
- ✅ Deletar conta

### Communities (Comunidades)

- 🚧 CRUD de comunidades

### Posts (Feed)

- 🚧 Criar posts
- 🚧 Listar feed
- 🚧 Interações (likes, comentários)

## 🗄️ Modelo de Dados (DynamoDB)

**GSI1:** Índice secundário global para queries otimizadas (listagens, buscas por atributos não-chave)

## 🛠️ Configuração

### Pré-requisitos

- Node.js 20.x
- AWS CLI configurado
- Serverless Framework instalado globalmente

```bash
npm install -g serverless
```

### Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
```

### Variáveis de Ambiente

```env
MIVO_TABLE=
AWS_REGION=
STAGE=
```

## 🚀 Deploy

### Deploy completo

```bash
serverless deploy --stage dev
```

### Deploy de função específica

```bash
serverless deploy function -f accountController --stage dev
```

## 🧪 Desenvolvimento Local

```bash
# Executar offline
serverless offline start
```

## 📚 Aprendizados

Este projeto foi desenvolvido para praticar:

- ✅ **Single Table Design** no DynamoDB
- ✅ **Global Secondary Indexes (GSI)** para queries otimizadas
- ✅ **Point-in-Time Recovery** e proteções contra exclusão acidental
- ✅ **Validação de schemas** com Zod
- ✅ **Arquitetura serverless** com Lambda + API Gateway
- ✅ **Infrastructure as Code** com Serverless Framework
- 🚧 **Upload de arquivos** para S3

## 🔒 Segurança

- **Deletion Protection** habilitado no DynamoDB
- **Point-in-Time Recovery** ativo para backups
- **IAM Roles** com princípio de menor privilégio

## 📖 Estrutura do Projeto

```
.
├── src/
│   ├── modules/
│   │   └── accounts/
│   │       ├── controllers/
│   │       └── handler.ts
│   ├── config/
│   ├── lib/
│   ├── utils/
│   └── interfaces/
├── sls/
│   ├── custom.yml
│   ├── provider.yml
│   ├── functions/
│   └── resources/
├── serverless.yml
└── package.json
```

## 📝 Licença

Este é um projeto de estudos pessoais.

---

**Desenvolvido com ☕ para praticar AWS e Serverless**
