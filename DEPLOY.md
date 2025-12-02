# 🚀 Guia de Deploy - Sistema de Agendamento

## ❗ CORREÇÃO DE TELA BRANCA

Se você está vendo tela branca após o deploy, siga estes passos:

### 1. Configure as Variáveis de Ambiente no Vercel/Netlify

No painel do seu serviço de hospedagem, adicione estas variáveis:

```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua-chave-publica-aqui
```

**Como obter as credenciais:**

1. Acesse https://app.supabase.com
2. Selecione seu projeto
3. Vá em: Settings → API
4. Copie:
     - `Project URL` → use em `VITE_SUPABASE_URL`
     - `anon public` key → use em `VITE_SUPABASE_PUBLISHABLE_KEY`

### 2. Execute a Migration no Supabase

1. Acesse https://app.supabase.com
2. Selecione seu projeto
3. Vá em: SQL Editor
4. Clique em "New Query"
5. Cole TODO o conteúdo do arquivo: `supabase/migrations/20251202000000_complete_booking_system.sql`
6. Clique em "Run" (ou pressione Ctrl+Enter)
7. Aguarde confirmação de sucesso

### 3. Redeployar o Projeto

Após configurar as variáveis de ambiente:

-    **Vercel**: Vá em Deployments → ⋯ → Redeploy
-    **Netlify**: Vá em Deploys → Trigger deploy → Deploy site

---

## 📋 Checklist Completo de Deploy

### ✅ Pré-requisitos

-    [ ] Conta no Supabase criada
-    [ ] Projeto no Supabase criado
-    [ ] Conta no Vercel/Netlify/outro host

### ✅ Configuração do Supabase

-    [ ] Migration SQL executada (passo 2 acima)
-    [ ] Tabelas criadas: `service_types`, `time_slots`, `bookings`
-    [ ] Políticas RLS ativas

### ✅ Configuração do Deploy

-    [ ] Variáveis de ambiente configuradas
-    [ ] `VITE_SUPABASE_URL` definida
-    [ ] `VITE_SUPABASE_PUBLISHABLE_KEY` definida
-    [ ] Deploy refeito após configuração

### ✅ Teste Final

-    [ ] Site carrega sem tela branca
-    [ ] Console do navegador sem erros (F12)
-    [ ] Consegue acessar `/dashboard`
-    [ ] Consegue criar tipos de serviço

---

## 🐛 Troubleshooting

### Tela branca persiste?

1. Abra o DevTools (F12)
2. Vá na aba "Console"
3. Procure por erros em vermelho
4. Mensagens comuns:

**"VITE_SUPABASE_URL is not defined"**
→ Faltou configurar variáveis de ambiente no host

**"Invalid API key"**
→ Chave do Supabase está incorreta

**"relation does not exist"**
→ Migration não foi executada no Supabase

### Como verificar se as tabelas existem?

1. Supabase Dashboard
2. Table Editor (no menu lateral)
3. Deve aparecer: `service_types`, `time_slots`, `bookings`

---

## 🎯 Ordem de Execução (Importante!)

1. ✅ Criar projeto no Supabase
2. ✅ Executar migration SQL
3. ✅ Configurar variáveis de ambiente no host
4. ✅ Fazer deploy/redeploy
5. ✅ Testar aplicação

---

## 📞 Suporte

Se ainda estiver com problemas, verifique:

-    Console do navegador (F12 → Console)
-    Logs do Supabase (Logs → SQL no dashboard)
-    Logs do deploy (Vercel/Netlify → Deployment → Logs)

**Mensagem de erro específica?** Cole no console e envie print.
