# Atualização do Sistema - Cadastro de Clientes

## Mudanças Implementadas

Este sistema agora exige que os clientes criem um cadastro antes de fazer agendamentos. As principais alterações incluem:

### 1. Nova Tabela de Clientes

-    Criada tabela `clients` no banco de dados
-    Campos: id, email (único), name, phone, created_at, updated_at
-    Relacionamento com a tabela `bookings` através de `client_id`

### 2. Fluxo de Agendamento Atualizado

-    **Antes**: Cliente preenchia nome, email e telefone a cada agendamento
-    **Agora**: Cliente faz cadastro uma única vez com nome e email
-    O sistema identifica o cliente pelo email automaticamente
-    Cliente pode reutilizar seus dados em futuros agendamentos

### 3. Nova Página: Meus Agendamentos

-    Clientes podem visualizar todos seus agendamentos
-    Opção de reagendar para outro horário disponível
-    Opção de cancelar agendamentos
-    Acesso via `/meus-agendamentos`

### 4. Autenticação Simples

-    Baseada em email e nome (sem senha)
-    Dados armazenados localmente no navegador
-    Cliente pode fazer logout e login novamente quando precisar

## Como Aplicar a Migration

### Opção 1: Via Supabase Dashboard (Recomendado)

1. Acesse o dashboard do Supabase em https://app.supabase.com
2. Selecione seu projeto
3. No menu lateral, clique em "SQL Editor"
4. Clique em "New query"
5. Copie todo o conteúdo do arquivo `supabase/migrations/20251222000000_add_clients_table.sql`
6. Cole no editor SQL
7. Clique em "Run" para executar

### Opção 2: Via Supabase CLI

Se você tem o Supabase CLI instalado:

```bash
# Executar a migration
supabase db push

# Ou executar manualmente
supabase db execute -f supabase/migrations/20251222000000_add_clients_table.sql
```

## Testando as Alterações

1. **Executar a aplicação**:

     ```bash
     npm run dev
     ```

2. **Acessar a página de agendamento**:

     - Navegue para `/agendar`
     - Você verá o formulário de cadastro/login do cliente

3. **Fazer um cadastro**:

     - Preencha nome e email
     - Clique em "Continuar"
     - Selecione um tipo de serviço e horário
     - Confirme o agendamento

4. **Visualizar agendamentos**:

     - Após fazer um agendamento, clique em "Meus Agendamentos"
     - Ou acesse diretamente `/meus-agendamentos`
     - Você verá todos os agendamentos do cliente

5. **Reagendar ou Cancelar**:
     - Na página "Meus Agendamentos", clique em "Reagendar" para mudar o horário
     - Ou clique em "Cancelar" para cancelar o agendamento

## Estrutura de Arquivos Criados/Modificados

### Novos Arquivos:

-    `supabase/migrations/20251222000000_add_clients_table.sql` - Migration do banco de dados
-    `src/hooks/useClientAuth.tsx` - Hook para gerenciar autenticação do cliente
-    `src/components/auth/ClientAuthForm.tsx` - Formulário de cadastro/login
-    `src/pages/MyBookings.tsx` - Página de gerenciamento de agendamentos do cliente

### Arquivos Modificados:

-    `src/integrations/supabase/scheduling.ts` - Adicionadas funções para gerenciar clientes
-    `src/pages/PublicBooking.tsx` - Atualizado para exigir autenticação do cliente
-    `src/App.tsx` - Adicionada rota `/meus-agendamentos`

## Funcionalidades Implementadas

### Para o Cliente:

-    ✅ Cadastro simples com nome e email
-    ✅ Login automático (identifica pelo email)
-    ✅ Visualização de todos os agendamentos
-    ✅ Reagendamento para outro horário disponível
-    ✅ Cancelamento de agendamentos
-    ✅ Dados do cliente salvos para futuros agendamentos

### Segurança:

-    ✅ Row Level Security (RLS) habilitado na tabela clients
-    ✅ Validação de email no frontend
-    ✅ Email único por cliente no banco de dados
-    ✅ Relacionamento adequado entre clients e bookings

## Notas Importantes

1. **Migração de Dados Existentes**: Agendamentos antigos (sem client_id) continuarão funcionando normalmente. O campo `client_id` é opcional (NULL) para manter compatibilidade.

2. **Autenticação Local**: A autenticação é armazenada no localStorage do navegador. Se o cliente limpar os dados do navegador, precisará fazer login novamente, mas seus agendamentos permanecerão no banco de dados.

3. **Identificação por Email**: O sistema usa o email como identificador único. Se um cliente usar o mesmo email, o sistema reconhecerá e atualizará seus dados se necessário.

4. **Notificações WhatsApp**: As notificações via WhatsApp para o profissional continuam funcionando normalmente.

## Próximos Passos (Melhorias Futuras)

-    [ ] Adicionar confirmação por email para validar o cadastro
-    [ ] Implementar lembretes automáticos por email/SMS
-    [ ] Adicionar histórico completo de agendamentos do cliente
-    [ ] Permitir cliente editar seus dados pessoais
-    [ ] Adicionar foto de perfil do cliente
-    [ ] Implementar sistema de avaliações pós-atendimento

## Suporte

Se encontrar algum problema ou tiver dúvidas sobre a implementação, verifique:

1. Se a migration foi executada corretamente no banco de dados
2. Se todas as dependências estão instaladas (`npm install`)
3. Se o servidor de desenvolvimento está rodando sem erros
4. Os logs do console do navegador para erros de JavaScript
