# Sistema de Gerenciamento de Agenda

Aplicação web para gerenciamento de agendas e serviços de atendimento, construída com React, TypeScript, Vite e Supabase.

## 🚀 Tecnologias

-    **Frontend**: React 18 + TypeScript
-    **Build Tool**: Vite
-    **UI Components**: shadcn/ui + Radix UI
-    **Styling**: Tailwind CSS
-    **Backend**: Supabase (PostgreSQL + Auth + Storage)
-    **Routing**: React Router v6
-    **State Management**: React Query (TanStack Query)
-    **Form Handling**: React Hook Form + Zod

## 📋 Pré-requisitos

-    Node.js 18+ ou Bun
-    Conta no [Supabase](https://supabase.com)
-    Git

## 🔧 Instalação

1. **Clone o repositório**

```bash
git clone <YOUR_GIT_URL>
cd "Gerencialmento de agenda "
```

2. **Instale as dependências**

```bash
npm install
# ou
bun install
```

3. **Configure as variáveis de ambiente**

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

Você pode encontrar essas credenciais no painel do Supabase:

-    Acesse: https://app.supabase.com
-    Selecione seu projeto
-    Vá em: Settings → API
-    Copie a "Project URL" e a "anon public" key

## 🗄️ Configuração do Banco de Dados

### Opção 1: Usando o SQL Editor do Supabase (Recomendado)

1. Acesse o painel do Supabase
2. Vá em **SQL Editor**
3. Crie uma nova query
4. Copie e execute o conteúdo dos arquivos de migration na ordem:
     - `supabase/migrations/20251201222440_cad59469-8592-4182-9c36-d936fc70e9e1.sql`
     - `supabase/migrations/20251201222505_5cd7ead6-d8ab-4b61-aafc-8ed8b9777cf2.sql`
     - `supabase/migrations/20251201223000_add_services_table.sql`

### Opção 2: Usando Supabase CLI

Se você tem o [Supabase CLI](https://supabase.com/docs/guides/cli) instalado:

```bash
# Inicializar o projeto (se ainda não foi feito)
supabase init

# Vincular ao projeto remoto
supabase link --project-ref your-project-ref

# Aplicar as migrations
supabase db push
```

## 🏃 Executando o Projeto

### Modo Desenvolvimento

```bash
npm run dev
# ou
bun dev
```

A aplicação estará disponível em: http://localhost:8080

### Build para Produção

```bash
npm run build
# ou
bun run build
```

### Preview do Build

```bash
npm run preview
# ou
bun preview
```

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes React reutilizáveis
│   ├── auth/           # Componentes de autenticação
│   ├── layout/         # Layouts (DashboardLayout)
│   ├── schedule/       # Componentes de agenda (ServiceForm)
│   └── ui/             # Componentes UI shadcn/ui
├── hooks/              # Custom React Hooks
│   └── useAuth.tsx     # Hook de autenticação
├── integrations/       # Integrações externas
│   └── supabase/       # Cliente e tipos do Supabase
│       ├── client.ts   # Cliente configurado
│       ├── types.ts    # Tipos gerados do banco
│       └── services.ts # Helpers para serviços
├── lib/                # Utilitários
│   └── utils.ts        # Funções helper
├── pages/              # Páginas da aplicação
│   ├── Auth.tsx        # Página de login/cadastro
│   ├── Dashboard.tsx   # Dashboard principal
│   ├── Index.tsx       # Página inicial
│   ├── NotFound.tsx    # Página 404
│   └── Schedules.tsx   # Gerenciamento de agendas
├── App.tsx             # Componente raiz com rotas
└── main.tsx            # Entry point

supabase/
└── migrations/         # Migrations SQL do banco de dados
```

## 🎯 Funcionalidades

### ✅ Implementado

-    **Gerenciamento de Agendas**

     -    Criar novas agendas com nome, duração padrão e descrição
     -    Visualizar lista de agendas cadastradas
     -    Estado vazio com call-to-action para criar primeira agenda

-    **Gerenciamento de Serviços**

     -    Criar serviços vinculados a agendas específicas
     -    Definir duração personalizada por serviço (sobrescreve duração padrão)
     -    Definir preço para cada serviço
     -    Excluir serviços com confirmação
     -    Carregar serviços sob demanda

-    **Interface e UX**
     -    Dashboard com estatísticas de agendamentos
     -    Navegação fluida entre páginas
     -    UI responsiva com Tailwind CSS
     -    Componentes shadcn/ui (Card, Button, Input, Label)
     -    Notificações toast em tempo real (Sonner)
     -    Estados de loading e feedback visual

### 🚧 Próximas Implementações

-    Sistema de autenticação completo (Sign Up / Login)
-    Definição de horários de funcionamento por dia da semana (schedule_rules)
-    Exceções de calendário (feriados, folgas, bloqueios)
-    Sistema de agendamentos públicos (appointments)
-    Notificações automáticas via WhatsApp
-    Painel de configurações do profissional

## 🔒 Segurança (RLS)

O banco de dados implementa Row Level Security (RLS) do Supabase:

-    Profissionais só podem gerenciar suas próprias agendas
-    Profissionais só podem gerenciar serviços vinculados às suas agendas
-    Agendamentos públicos podem ser criados (para sistema de booking)
-    Políticas customizadas por tabela garantem isolamento de dados

## 📝 Notas de Desenvolvimento

### Autenticação Temporariamente Desabilitada

Para facilitar o desenvolvimento rápido das funcionalidades principais, a autenticação está temporariamente desabilitada. O sistema usa um ID de profissional fixo:

```typescript
professional_id: "00000000-0000-0000-0000-000000000000";
```

**Para reativar a autenticação:**

1. Em `src/App.tsx`: adicionar `<ProtectedRoute>` nas rotas `/dashboard` e `/schedules`
2. Em `src/pages/Schedules.tsx`: substituir o ID fixo por `user.id` do hook `useAuth`
3. Criar usuário de teste no Supabase Authentication
4. Atualizar a migration inicial para criar o perfil do profissional

### Regeneração de Tipos TypeScript

Após aplicar novas migrations no Supabase, regenere os tipos TypeScript:

```bash
# Para projeto local
supabase gen types typescript --local > src/integrations/supabase/types.ts

# Para projeto remoto
supabase gen types typescript --project-id <your-project-ref> > src/integrations/supabase/types.ts
```

**Importante:** A tabela `services` atualmente usa cast `as any` em `src/integrations/supabase/services.ts` porque não está nos tipos gerados. Após regenerar os tipos, remova esses casts para ter type-safety completo.

## 🐛 Troubleshooting

### Build falha com erros de tipo

Verifique que:

1. As migrations foram aplicadas no Supabase
2. Os tipos foram regenerados após as migrations
3. As variáveis de ambiente em `.env` estão corretas

### Página de agendas não carrega dados

1. Verifique se as migrations foram aplicadas corretamente
2. Confira as credenciais do Supabase no `.env`
3. Abra o console do navegador e veja se há erros de RLS
4. Se necessário, ajuste temporariamente as políticas RLS no Supabase

### Erro ao criar agenda/serviço

Se você vê erro "new row violates row-level security policy":

-    Desabilite temporariamente RLS na tabela (para desenvolvimento)
-    Ou crie um usuário de teste e use o `user.id` real

## 📄 Licença

MIT License - sinta-se livre para usar em projetos pessoais ou comerciais.

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

Certifique-se de ter o `.env` apontando para o Supabase correto antes de subir o servidor de desenvolvimento.
