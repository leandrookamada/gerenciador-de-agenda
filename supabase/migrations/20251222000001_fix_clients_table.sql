-- =====================================================
-- MIGRATION: Fix clients table e políticas RLS
-- Data: 22/12/2025
-- Descrição: Corrige tabela de clientes com políticas permissivas
-- =====================================================

-- 1. Verificar e criar extensão uuid se não existir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Criar tabela de clientes se não existir
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Adicionar índice no email para busca rápida
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);

-- 4. Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Clients can view own data" ON public.clients;
DROP POLICY IF EXISTS "Clients can insert own data" ON public.clients;
DROP POLICY IF EXISTS "Clients can update own data" ON public.clients;
DROP POLICY IF EXISTS "Permitir leitura pública" ON public.clients;
DROP POLICY IF EXISTS "Permitir inserção pública" ON public.clients;
DROP POLICY IF EXISTS "Permitir atualização pública" ON public.clients;
DROP POLICY IF EXISTS "Allow public read" ON public.clients;
DROP POLICY IF EXISTS "Allow public insert" ON public.clients;
DROP POLICY IF EXISTS "Allow public update" ON public.clients;

-- 5. Desabilitar RLS temporariamente para testes (ou usar políticas permissivas)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- 6. Criar políticas permissivas (permitir tudo para desenvolvimento)
CREATE POLICY "Allow public read"
  ON public.clients
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert"
  ON public.clients
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update"
  ON public.clients
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- 7. Trigger para atualizar updated_at (se a função handle_updated_at existir)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_updated_at') THEN
    DROP TRIGGER IF EXISTS set_updated_at ON public.clients;
    CREATE TRIGGER set_updated_at
      BEFORE UPDATE ON public.clients
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;

-- 8. Adicionar coluna client_id na tabela bookings se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'bookings' 
    AND column_name = 'client_id'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 9. Criar índice para busca por client_id
CREATE INDEX IF NOT EXISTS idx_bookings_client 
  ON public.bookings(client_id);

-- 10. Comentários
COMMENT ON TABLE public.clients IS 'Clientes que realizam agendamentos - com RLS permissivo para desenvolvimento';
COMMENT ON COLUMN public.bookings.client_id IS 'Referência ao cliente que fez o agendamento';

-- 11. Verificar se há dados de teste (opcional - remover em produção)
DO $$ 
BEGIN
  RAISE NOTICE 'Migration concluída com sucesso!';
  RAISE NOTICE 'Tabela clients criada/atualizada com políticas RLS permissivas';
END $$;

-- FIM DA MIGRATION
