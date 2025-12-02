-- =====================================================
-- MIGRATION: Sistema de Agendamento
-- Data: 02/12/2025
-- Descrição: Cria todas as tabelas e funções necessárias
-- =====================================================

-- 1. Criar tabela de tipos de serviço
CREATE TABLE IF NOT EXISTS public.service_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL,
  name TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Criar tabela de slots de horário
CREATE TABLE IF NOT EXISTS public.time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL,
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  service_type_id UUID REFERENCES public.service_types(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_time_slot CHECK (end_time > start_time)
);

-- 3. Criar tabela de agendamentos
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL,
  service_type_id UUID REFERENCES public.service_types(id) ON DELETE SET NULL,
  time_slot_id UUID REFERENCES public.time_slots(id) ON DELETE SET NULL,
  patient_name TEXT NOT NULL,
  patient_phone TEXT NOT NULL,
  patient_email TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Enable RLS (Row Level Security)
ALTER TABLE public.service_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- 5. Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Allow all on service_types" ON public.service_types;
DROP POLICY IF EXISTS "Allow all on time_slots" ON public.time_slots;
DROP POLICY IF EXISTS "Allow all on bookings" ON public.bookings;

-- 6. Políticas RLS - Permitir tudo por enquanto (desenvolvimento)
CREATE POLICY "Allow all on service_types" 
  ON public.service_types 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow all on time_slots" 
  ON public.time_slots 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow all on bookings" 
  ON public.bookings 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- 7. Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Remover triggers antigos se existirem
DROP TRIGGER IF EXISTS set_updated_at ON public.service_types;
DROP TRIGGER IF EXISTS set_updated_at ON public.time_slots;
DROP TRIGGER IF EXISTS set_updated_at ON public.bookings;

-- 9. Criar triggers para updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.service_types
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.time_slots
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 10. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_service_types_professional 
  ON public.service_types(professional_id);

CREATE INDEX IF NOT EXISTS idx_service_types_active 
  ON public.service_types(is_active);

CREATE INDEX IF NOT EXISTS idx_time_slots_professional 
  ON public.time_slots(professional_id);

CREATE INDEX IF NOT EXISTS idx_time_slots_date 
  ON public.time_slots(slot_date);

CREATE INDEX IF NOT EXISTS idx_time_slots_available 
  ON public.time_slots(is_available);

CREATE INDEX IF NOT EXISTS idx_time_slots_unique 
  ON public.time_slots(professional_id, slot_date, start_time, end_time);

CREATE INDEX IF NOT EXISTS idx_bookings_professional 
  ON public.bookings(professional_id);

CREATE INDEX IF NOT EXISTS idx_bookings_time_slot 
  ON public.bookings(time_slot_id);

CREATE INDEX IF NOT EXISTS idx_bookings_status 
  ON public.bookings(status);

-- 11. Função para gerar slots automaticamente
CREATE OR REPLACE FUNCTION public.generate_time_slots(
  p_professional_id UUID,
  p_slot_date DATE,
  p_start_time TIME,
  p_end_time TIME,
  p_slot_duration_minutes INTEGER,
  p_service_type_id UUID DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  v_current_time TIME;
  v_next_time TIME;
  v_slots_created INTEGER := 0;
BEGIN
  v_current_time := p_start_time;
  
  WHILE v_current_time < p_end_time LOOP
    v_next_time := v_current_time + (p_slot_duration_minutes || ' minutes')::INTERVAL;
    
    IF v_next_time <= p_end_time THEN
      -- Verifica se já existe um slot neste horário para evitar duplicatas
      IF NOT EXISTS (
        SELECT 1 FROM public.time_slots
        WHERE professional_id = p_professional_id
          AND slot_date = p_slot_date
          AND start_time = v_current_time
          AND end_time = v_next_time
      ) THEN
        INSERT INTO public.time_slots (
          professional_id,
          slot_date,
          start_time,
          end_time,
          service_type_id,
          is_available
        ) VALUES (
          p_professional_id,
          p_slot_date,
          v_current_time,
          v_next_time,
          p_service_type_id,
          true
        );
        
        v_slots_created := v_slots_created + 1;
      END IF;
    END IF;
    
    v_current_time := v_next_time;
  END LOOP;
  
  RETURN v_slots_created;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Comentários nas tabelas
COMMENT ON TABLE public.service_types IS 'Tipos de serviço oferecidos pelo profissional';
COMMENT ON TABLE public.time_slots IS 'Slots de horário disponíveis para agendamento';
COMMENT ON TABLE public.bookings IS 'Agendamentos realizados pelos clientes';
COMMENT ON FUNCTION public.generate_time_slots IS 'Gera múltiplos slots de horário automaticamente';

-- FIM DA MIGRATION
