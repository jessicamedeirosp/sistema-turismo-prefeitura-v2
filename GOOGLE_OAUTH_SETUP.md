# 🔐 Como Configurar Login com Google

## 1. Criar Projeto no Google Cloud Console

1. Acesse: https://console.cloud.google.com/
2. Crie um novo projeto ou selecione um existente
3. No menu lateral, vá em **APIs & Services** → **Credentials**

## 2. Configurar OAuth Consent Screen

1. Clique em **OAuth consent screen**
2. Escolha **External** (para testes) ou **Internal** (para organização)
3. Preencha:
   - **App name**: Plataforma de Turismo
   - **User support email**: seu email
   - **Developer contact**: seu email
4. Clique em **Save and Continue**
5. Em **Scopes**, adicione:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
6. Clique em **Save and Continue**

## 3. Criar Credenciais OAuth

1. Vá em **Credentials** → **Create Credentials** → **OAuth client ID**
2. Escolha **Web application**
3. Configure:
   - **Name**: Tourism Platform Web
   - **Authorized JavaScript origins**:
     ```
     http://localhost:3000
     ```
   - **Authorized redirect URIs**:
     ```
     http://localhost:3000/api/auth/callback/google
     ```
4. Clique em **Create**
5. **Copie** o `Client ID` e `Client Secret`

## 4. Adicionar no .env

Edite o arquivo `.env`:

```env
GOOGLE_CLIENT_ID="seu-client-id-aqui.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="seu-client-secret-aqui"
```

## 5. Instalar Dependências e Rodar

```bash
npm install
npm run dev
```

Acesse: http://localhost:3000/dash/auth

## ✅ Pronto!

Agora você pode:
- Login com Google
- Login com Email/Senha
- Cadastro com Email/Senha

---

**Produção:**
Quando fizer deploy, adicione a URL de produção nas **Authorized URIs** do Google:
```
https://seudominio.com
https://seudominio.com/api/auth/callback/google
```
