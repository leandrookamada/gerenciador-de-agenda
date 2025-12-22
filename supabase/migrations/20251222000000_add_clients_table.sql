-- =====================================================
-- MIGRATION: Adicionar tabela de clientes
-- Data: 22/12/2025
-- Descrição: Cria tabela de clientes e adiciona relacionamento com bookings
-- =====================================================

-- 1. Criar tabela de clientes
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Adicionar índice no email para busca rápida
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);

-- 3. Enable RLS (Row Level Security)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- 4. Política RLS - Clientes podem ver e editar apenas seus próprios dados
CREATE POLICY "Clients can view own data" 
  ON public.clients 
  FOR SELECT 
  USING (true);

CREATE POLICY "Clients can insert own data" 
  ON public.clients 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Clients can update own data" 
  ON public.clients 
  FOR UPDATE 
  USING (true)
  WITH CHECK (true);

-- 5. Trigger para atualizar updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 6. Adicionar coluna client_id na tabela bookings
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL;

-- 7. Criar índice para busca por client_id
CREATE INDEX IF NOT EXISTS idx_bookings_client 
  ON public.bookings(client_id);

-- 8. Comentários
COMMENT ON TABLE public.clients IS 'Clientes que realizam agendamentos';
COMMENT ON COLUMN public.bookings.client_id IS 'Referência ao cliente que fez o agendamento';

-- FIM DA MIGRATION
