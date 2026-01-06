# 🏖️ Plataforma de Turismo

Sistema completo de gestão turística com site público e painel administrativo para gerenciar empresas (acomodação, alimentação e guias) com sistema de aprovação.

## 📋 Índice

- [Tecnologias](#-tecnologias)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Banco de Dados](#-banco-de-dados)
- [Testes](#-testes)
- [Fluxo de Aprovação](#-fluxo-de-aprovação)

## 🚀 Tecnologias

- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Banco de Dados**: PostgreSQL
- **ORM**: Prisma
- **Autenticação**: NextAuth.js
- **Estilização**: Tailwind CSS + Shadcn UI
- **Formulários**: React Hook Form + Zod
- **Testes**: Jest + Testing Library
- **Containerização**: Docker

## 📦 Pré-requisitos

- Node.js 18+ 
- Docker e Docker Compose
- npm ou yarn

## ⚙️ Instalação

### 1. Clone o repositório

```bash
git clone <seu-repositorio>
cd n
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` conforme necessário.

### 4. Setup completo (Docker + Banco + Seed)

```bash
npm run setup
```

Este comando irá:
- ✅ Subir o container PostgreSQL
- ✅ Criar as tabelas do banco
- ✅ Popular com dados iniciais (admin + tags)

## 🎯 Scripts Disponíveis

### Desenvolvimento

```bash
npm run dev              # Inicia o servidor de desenvolvimento (localhost:3000)
npm run build            # Build de produção
npm run start            # Inicia o servidor de produção
npm run lint             # Executa o linter
```

### Docker & Database

```bash
npm run docker:up        # Sobe o container PostgreSQL
npm run docker:down      # Para o container
npm run docker:reset     # Remove volumes e reinicia (CUIDADO: apaga dados)
```

### Prisma

```bash
npm run db:migrate       # Cria e aplica nova migration
npm run db:push          # Sincroniza schema sem criar migration (dev only)
npm run db:studio        # Abre Prisma Studio (GUI do banco)
npm run db:seed          # Popula banco com dados iniciais
npm run db:reset         # Reseta banco (apaga tudo e reaplica migrations)
npm run prisma:generate  # Gera Prisma Client
```

### Testes

```bash
npm test                 # Roda testes em modo watch
npm run test:ci          # Roda testes uma vez (CI/CD)
npm run test:coverage    # Gera relatório de cobertura
```

## 📁 Estrutura do Projeto

```
n/
├── app/                      # Next.js App Router
│   ├── (site)/              # Site público
│   ├── (painel)/            # Dashboard administrativo
│   ├── api/                 # API Routes
│   │   └── health/          # Health check endpoint
│   ├── globals.css          # Estilos globais
│   ├── layout.tsx           # Layout raiz
│   └── page.tsx             # Página inicial
├── prisma/
│   ├── schema.prisma        # Schema do banco de dados
│   └── seed.ts              # Dados iniciais
├── lib/
│   ├── prisma.ts            # Cliente Prisma singleton
│   └── utils.ts             # Funções utilitárias
├── __tests__/               # Testes unitários
│   ├── api/
│   └── lib/
├── docker-compose.yml       # Configuração Docker
├── .env                     # Variáveis de ambiente (não commitar)
├── .env.example             # Exemplo de variáveis
└── package.json             # Dependências e scripts
```

## 🗄️ Banco de Dados

### Modelos Principais

#### User
- Usuários do sistema (Admin, Moderador, Empresa, Guia)
- Autenticação via NextAuth

#### Business
- Empresas de alimentação e acomodação
- Campos: nome, endereço, contato, CNPJ, cadastur, etc
- Status: PENDING → APPROVED → PUBLISHED
- Suporta múltiplas imagens e tags

#### Tag
- Tags categorizadas (FOOD ou ACCOMMODATION)
- Criadas pela prefeitura
- Relacionamento N-N com Business

### Comandos Úteis

```bash
# Ver dados no navegador
npm run db:studio

# Criar nova migration
npm run db:migrate

# Resetar banco (cuidado!)
npm run db:reset
```

## 🧪 Testes

Os testes estão organizados em `__tests__/` e incluem:

- ✅ Testes de API routes
- ✅ Testes de utilidades
- ✅ Coverage configurado

```bash
# Rodar testes
npm test

# Ver coverage
npm run test:coverage
```

## 🔄 Fluxo de Aprovação

### 1. Cadastro de Empresa

```
Empresa → PENDING (rascunho sem aprovação)
```

### 2. Análise pela Prefeitura

```
Prefeitura → APPROVED (aprovado) ou REJECTED (rejeitado com justificativa)
```

### 3. Publicação

```
APPROVED → PUBLISHED (visível no site público)
```

### 4. Edição

```
Empresa edita → volta para PENDING → nova aprovação necessária
Versão antiga deletada quando nova é aprovada
```

## 👥 Usuários Padrão

Após rodar `npm run setup`, você terá:

**Admin**
- Email: `admin@prefeitura.gov.br`
- Senha: `admin123`
- Acesso total ao painel

## 🚧 Próximos Passos

- [ ] Implementar autenticação NextAuth
- [ ] Criar CRUD de empresas
- [ ] Sistema de upload de imagens
- [ ] Painel administrativo
- [ ] Site público
- [ ] Models de Guia e Passeio
- [ ] Sistema de páginas editáveis

## 📝 Notas de Desenvolvimento

### Ambiente de Desenvolvimento

O servidor roda em: `http://localhost:3000`

Health check: `http://localhost:3000/api/health`

### Produção

Antes do deploy:
1. Altere `NEXTAUTH_SECRET` no `.env`
2. Configure `DATABASE_URL` de produção
3. Execute `npm run build`
4. Execute migrations: `npm run db:migrate:deploy`

---

**Desenvolvido para gestão turística municipal** 🏖️
