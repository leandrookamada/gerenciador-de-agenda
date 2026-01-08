# 🔧 Correção do Erro de Login

## Problema

Ao tentar fazer login/cadastro na página de agendamento, aparece o erro: "Erro ao processar seus dados. Tente novamente."

## Causa

A tabela `clients` não existe no banco de dados ou as políticas RLS estão bloqueando as operações.

## Solução

### Passo 1: Aplicar a Migration

1. **Acesse o Supabase Dashboard**

     - Vá para: https://app.supabase.com
     - Selecione seu projeto

2. **Abra o SQL Editor**

     - No menu lateral, clique em "SQL Editor"
     - Clique em "+ New query"

3. **Execute a Migration**

     - Abra o arquivo: `supabase/migrations/20251222000001_fix_clients_table.sql`
     - Copie todo o conteúdo
     - Cole no SQL Editor do Supabase
     - Clique em "Run" (ou Ctrl+Enter)

4. **Verifique o Resultado**
     - Você deve ver a mensagem: "Success. No rows returned"
     - Verifique se a tabela foi criada em "Table Editor" > "clients"

### Passo 2: Verificar as Políticas RLS

1. No Supabase Dashboard, vá em "Authentication" > "Policies"
2. Procure pela tabela `clients`
3. Deve haver 3 políticas:
     - ✅ Allow public read
     - ✅ Allow public insert
     - ✅ Allow public update

### Passo 3: Testar o Login

1. Abra o aplicativo: http://localhost:5173/agendar
2. Tente fazer login com:
     - Nome: Seu Nome
     - Email: teste@exemplo.com
     - Telefone: (opcional)
3. Clique em "Continuar"

### Passo 4: Verificar os Logs

Se ainda der erro, abra o Console do navegador (F12) e:

1. Vá na aba "Console"
2. Tente fazer login novamente
3. Veja a mensagem de erro completa
4. Me envie o erro para análise

## Comandos Úteis

### Verificar se a tabela existe (SQL):

```sql
SELECT EXISTS (
   SELECT FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name = 'clients'
);
```

### Ver todas as colunas da tabela:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'clients';
```

### Contar clientes cadastrados:

```sql
SELECT COUNT(*) FROM clients;
```

### Ver últimos clientes cadastrados:

```sql
SELECT * FROM clients ORDER BY created_at DESC LIMIT 5;
```

## Melhorias Implementadas

1. ✅ **Tratamento de Erro Melhorado**

     - Mensagens de erro mais específicas
     - Logs detalhados no console
     - Validação de dados antes de enviar

2. ✅ **Migration Robusta**

     - Cria tabela se não existir
     - Políticas RLS permissivas
     - Índices para performance
     - Comentários explicativos

3. ✅ **Funções com Try-Catch**
     - `findClientByEmail` com tratamento de "not found"
     - `createClient` com validação
     - `createOrUpdateClient` com logs de erro

## Erros Comuns e Soluções

### Erro: "relation 'clients' does not exist"

**Solução**: Execute a migration (Passo 1)

### Erro: "duplicate key value violates unique constraint"

**Causa**: Email já cadastrado
**Solução**: Use outro email ou faça login com o email existente

### Erro: "permission denied for table clients"

**Causa**: Políticas RLS bloqueando acesso
**Solução**: Verifique as políticas (Passo 2)

### Erro: "new row violates row-level security policy"

**Causa**: RLS ativo sem políticas permissivas
**Solução**: Execute novamente a migration completa

## Suporte

Se o erro persistir:

1. Tire um print do erro no Console (F12)
2. Execute as queries de verificação acima
3. Me envie os resultados para análise
