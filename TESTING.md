# Guia de Testes

## Executar Testes

```bash
# Todos os testes
npm test

# Testes em modo watch
npm test -- --watch

# Testes com coverage
npm test -- --coverage

# Teste específico
npm test -- LoadingSpinner

# Testes de integração
npm test -- integration
```

## Estrutura de Testes

### Testes Unitários
- `__tests__/components/` - Componentes React
- `__tests__/lib/` - Funções utilitárias
- `__tests__/api/` - Endpoints da API

### Testes de Integração
- `__tests__/integration/` - Fluxos completos end-to-end

## Testes Implementados

### ✅ Componentes
- **LoadingSpinner**: Renderização com mensagens customizadas

### ✅ API Auth
- **POST /api/auth/register**
  - Criação de novo usuário
  - Validação de email duplicado
  - Validação de senha (min 6 chars, maiúscula, caractere especial)
  - Validação de role (BUSINESS_FOOD, BUSINESS_ACCOMMODATION, GUIDE)

### ✅ API Business
- **POST /api/business/upsert**
  - Criação de novo negócio (status PENDING)
  - Atualização de negócio existente (volta para PENDING)
  - Validação de autenticação
  - Gerenciamento de tags

### ✅ Fluxo de Integração
1. Registro de usuário BUSINESS_FOOD
2. Criação de negócio (PENDING)
3. Aprovação por admin (APPROVED)
4. Publicação (PUBLISHED)
5. Edição por usuário (volta para PENDING)
6. Edição por admin (mantém status)
7. Rejeição por admin (REJECTED)

## Próximos Testes a Implementar

### Prioridade Alta
- [ ] Login com credenciais válidas/inválidas
- [ ] Aprovação de negócio por admin
- [ ] Rejeição de negócio com motivo
- [ ] Publicação/despublicação

### Prioridade Média
- [ ] Busca de negócios por status
- [ ] Filtros de categoria
- [ ] Upload de imagens
- [ ] Gerenciamento de tags

### Prioridade Baixa
- [ ] Validação de CNPJ/CPF
- [ ] Validação de Cadastur
- [ ] Performance de listagens
- [ ] Cache de dados

## Executar Testes Manualmente

### 1. Registro e Login
```bash
# Acessar: http://localhost:3000/dash/auth
# 1. Clicar em "Criar conta"
# 2. Preencher dados
# 3. Selecionar tipo: Alimentação
# 4. Senha: Test@123
# ✅ Deve criar conta e fazer login automático
```

### 2. Criar Negócio
```bash
# Acessar: http://localhost:3000/dash/business/form
# 1. Preencher todos campos obrigatórios
# 2. Adicionar descrição com formatação
# 3. Selecionar tags
# 4. Salvar
# ✅ Deve criar negócio com status PENDING
```

### 3. Admin Aprovar
```bash
# Login como admin: turismoad.saosebastiao@gmail.com / vR7!xP@3mZ
# Acessar: http://localhost:3000/dash/businesses
# 1. Clicar em "Analisar" no negócio pendente
# 2. Clicar em "Aprovar"
# ✅ Status deve mudar para APPROVED
```

### 4. Admin Publicar
```bash
# Na página de detalhes do negócio
# 1. Clicar em "Publicar"
# ✅ Status deve mudar para PUBLISHED
```

### 5. Admin Editar
```bash
# Na página de detalhes
# 1. Clicar em "Editar"
# 2. Alterar qualquer campo
# 3. Salvar
# ✅ Deve salvar SEM mudar o status
```

### 6. Usuário Editar
```bash
# Login como business owner
# Acessar: http://localhost:3000/dash/business/form
# 1. Editar campos
# 2. Salvar
# ✅ Status deve voltar para PENDING
```

## Cobertura de Código

Meta de cobertura: **80%**

Rodar relatório:
```bash
npm test -- --coverage
```

Áreas críticas que devem ter 100% cobertura:
- Autenticação
- Validações de senha
- Fluxo de aprovação
- Mudança de status

## Troubleshooting

### Erro: Cannot find module
```bash
npm install
```

### Prisma Client desatualizado
```bash
npx prisma generate
```

### Banco de dados de teste
O teste usa o mesmo banco configurado em `.env`. Para testes isolados, configure `DATABASE_URL_TEST`.
