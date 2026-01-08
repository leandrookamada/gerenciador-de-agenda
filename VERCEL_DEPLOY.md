# 🚀 Como Configurar o Deploy na Vercel

## Problema: ERR_NAME_NOT_RESOLVED

Esse erro acontece porque as **variáveis de ambiente não estão configuradas** na Vercel. O aplicativo não consegue encontrar o URL do Supabase.

## ✅ Solução: Configurar Variáveis de Ambiente na Vercel

### Passo 1: Acessar o Dashboard da Vercel

1. Vá para: https://vercel.com/dashboard
2. Selecione seu projeto: **agendamentoonline-mu**
3. Clique em **Settings** (Configurações)

### Passo 2: Adicionar Variáveis de Ambiente

1. No menu lateral, clique em **Environment Variables**
2. Adicione **cada uma** das seguintes variáveis:

#### Variável 1: VITE_SUPABASE_URL

```
Name: VITE_SUPABASE_URL
Value: https://mwortfgpocpqlcxuwjmy.supabase.co
```

-    ✅ Marque: Production, Preview, Development

#### Variável 2: VITE_SUPABASE_PUBLISHABLE_KEY

```
Name: VITE_SUPABASE_PUBLISHABLE_KEY
Value: sb_publishable_zBogMk6CD81slBwur0EpGw_pKgRcf18
```

-    ✅ Marque: Production, Preview, Development

#### Variável 3: VITE_SUPABASE_PROJECT_ID

```
Name: VITE_SUPABASE_PROJECT_ID
Value: mwortfgpocpqlcxuwjmy
```

-    ✅ Marque: Production, Preview, Development

### Passo 3: Fazer Redeploy

**IMPORTANTE:** Adicionar variáveis de ambiente NÃO atualiza o deploy automaticamente!

Você precisa fazer um **redeploy**:

#### Opção A - Via Vercel Dashboard:

1. Vá em **Deployments**
2. Clique nos **3 pontinhos (...)** no último deploy
3. Selecione **Redeploy**
4. Confirme com **Redeploy**

#### Opção B - Via Git (Mais fácil):

```bash
git commit --allow-empty -m "trigger redeploy"
git push
```

### Passo 4: Aguardar e Testar

1. Aguarde a build finalizar (~2 minutos)
2. Acesse: https://agendamentoonline-mu.vercel.app
3. Verifique se o erro sumiu

## 🔍 Como Verificar se Deu Certo

1. Abra o Console do navegador (F12)
2. Vá na aba **Console**
3. Se não aparecer erros do tipo "Failed to fetch", está funcionando! ✅

## ⚠️ Erros Comuns

### 1. Esqueceu de marcar os ambientes

-    Certifique-se de marcar **Production, Preview, Development** para cada variável

### 2. Esqueceu de fazer redeploy

-    Variáveis só são aplicadas em **novos** deploys
-    Use `git push` ou redeploy manual

### 3. Digitou o nome da variável errado

-    O nome PRECISA ser **EXATAMENTE**:
     -    `VITE_SUPABASE_URL` (não `SUPABASE_URL`)
     -    `VITE_SUPABASE_PUBLISHABLE_KEY` (não `SUPABASE_ANON_KEY`)
     -    `VITE_SUPABASE_PROJECT_ID`

### 4. Copiou o valor com aspas

-    ❌ Errado: `"https://mwortfgpocpqlcxuwjmy.supabase.co"`
-    ✅ Certo: `https://mwortfgpocpqlcxuwjmy.supabase.co`
-    **Não use aspas** nos valores na Vercel!

## 📸 Captura de Tela da Configuração

Suas variáveis devem aparecer assim na Vercel:

```
VITE_SUPABASE_URL
  Production | Preview | Development
  https://mwortfgpocpqlcxuwjmy.supabase.co

VITE_SUPABASE_PUBLISHABLE_KEY
  Production | Preview | Development
  sb_publishable_zBogMk6CD81slBwur0EpGw_pKgRcf18

VITE_SUPABASE_PROJECT_ID
  Production | Preview | Development
  mwortfgpocpqlcxuwjmy
```

## 🎯 Checklist Final

Antes de testar, confirme que você:

-    [ ] Adicionou as 3 variáveis de ambiente na Vercel
-    [ ] Marcou Production, Preview e Development em todas
-    [ ] NÃO incluiu aspas nos valores
-    [ ] Fez redeploy (git push ou redeploy manual)
-    [ ] Aguardou a build finalizar

## 🆘 Ainda com Problemas?

Se após seguir todos os passos o erro persistir, verifique:

1. **No Console da Vercel** (durante a build):

     - Procure por warnings sobre variáveis de ambiente
     - Verifique se não há erros de build

2. **No Supabase Dashboard**:

     - Vá em Settings > API
     - Confirme que a URL e a chave estão corretas
     - Verifique se o projeto está ativo (não pausado)

3. **No Browser**:
     - Limpe o cache (Ctrl + Shift + Delete)
     - Teste em uma aba anônima
     - Verifique a aba Network (F12) para ver qual requisição está falhan do
