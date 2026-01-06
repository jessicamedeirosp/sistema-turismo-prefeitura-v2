# Guia de Upload de Imagens - Vercel Blob Storage

## 🎯 Funcionalidades Implementadas

### 1. **Upload de Banners da Empresa**
- Os usuários podem adicionar múltiplos banners para suas empresas
- Imagens armazenadas no Vercel Blob Storage
- Preview das imagens com botão para remover
- Limite de 5MB por imagem
- Apenas imagens são aceitas (jpg, png, gif, webp, etc.)

### 2. **Upload de Imagens no Editor (ReactQuill)**
- Botão de imagem na toolbar do editor funciona com upload automático
- Imagens são enviadas para o Vercel Blob Storage
- Imagens inseridas diretamente no conteúdo da descrição
- Detecção automática de imagens removidas do editor
- Cleanup automático: imagens deletadas do editor são removidas do Blob

### 3. **Gerenciamento Automático**
- **Upload**: Imagens enviadas via `/api/upload` (POST)
- **Deleção**: Remoção automática do Blob quando:
  - Banner é removido pelo usuário
  - Imagem é removida do editor de texto
- **Persistência**: URLs das imagens salvas no banco (campo `images[]`)

## 🔧 Como Usar

### Para Empresas (Adicionar Banners)

1. Acesse o formulário de cadastro/edição da empresa
2. Role até a seção "Banners da Empresa"
3. Clique no botão "Clique para adicionar banner"
4. Selecione a imagem (máx. 5MB)
5. Aguarde o upload completar
6. Para remover: passe o mouse sobre a imagem e clique no ❌

### Para Adicionar Imagens na Descrição

1. No editor de texto "Descrição da Empresa"
2. Clique no ícone de imagem 🖼️ na toolbar
3. Selecione a imagem do seu computador
4. A imagem será inserida automaticamente no texto
5. Para remover: basta deletar a imagem do editor (será removida do Blob automaticamente)

## 📁 Estrutura de Arquivos

```
/app
  /api
    /upload
      route.ts          # Endpoint de upload/delete
/components
  BusinessForm.tsx      # Formulário com upload de banners e editor
/prisma
  schema.prisma         # Campo images[] no modelo Business
```

## 🔑 Variáveis de Ambiente

Certifique-se de ter no `.env`:

```env
BLOB_READ_WRITE_TOKEN="seu_token_vercel_blob"
```

## 🚀 API Endpoints

### POST `/api/upload`
Upload de imagem para Vercel Blob

**Body**: FormData com campo `file`

**Response**:
```json
{
  "url": "https://vercel-storage.com/..."
}
```

### DELETE `/api/upload`
Remove imagem do Vercel Blob

**Body**:
```json
{
  "url": "https://vercel-storage.com/..."
}
```

## ⚠️ Limitações e Validações

- **Tamanho máximo**: 5MB por imagem
- **Tipos aceitos**: Apenas arquivos de imagem (image/*)
- **Storage**: Vercel Blob com token de read/write
- **Acesso**: Imagens públicas (access: 'public')

## 🧹 Limpeza Automática

O sistema detecta e remove automaticamente:

1. **Banners deletados**: Quando o usuário clica no botão remover
2. **Imagens do editor**: Quando removidas do conteúdo HTML
3. **Comparação**: Detecta diferenças entre versão antiga e nova do conteúdo

## 📝 Schema do Banco

```prisma
model Business {
  // ... outros campos
  images String[] @default([]) // URLs dos banners + imagens do editor
}
```

## 🎨 UI/UX

- **Grid responsivo**: 2 colunas mobile, 3 desktop
- **Preview de imagens**: Aspect ratio 16:9
- **Hover effects**: Botão de remover aparece ao passar o mouse
- **Loading states**: Indicador durante upload
- **Toast notifications**: Feedback visual de sucesso/erro

## 🔒 Segurança

- ✅ Validação de tipo de arquivo no servidor
- ✅ Validação de tamanho (5MB)
- ✅ Token de acesso do Blob via variável de ambiente
- ✅ Autenticação via NextAuth para upload
- ✅ URLs públicas mas sem listagem de arquivos

## 🐛 Troubleshooting

**Erro "Nenhum arquivo enviado"**
- Certifique-se que o input aceita apenas images (`accept="image/*"`)

**Erro "Imagem muito grande"**
- Comprima a imagem ou escolha uma menor que 5MB

**Imagens não aparecem**
- Verifique se `BLOB_READ_WRITE_TOKEN` está configurado
- Confirme que o token tem permissão de read/write

**Imagens não são deletadas do Blob**
- Verifique logs do servidor no endpoint DELETE
- Confirme que a URL é válida do Vercel Blob
