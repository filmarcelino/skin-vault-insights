
-- Verificar se a coluna currency_code já existe na tabela inventory
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'inventory'
        AND column_name = 'currency_code'
    ) THEN
        ALTER TABLE inventory ADD COLUMN currency_code TEXT DEFAULT 'USD';
    END IF;
END$$;

-- Verificar se a tabela transactions tem um campo para armazenar a moeda
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'transactions'
        AND column_name = 'currency_code'
    ) THEN
        ALTER TABLE transactions ADD COLUMN currency_code TEXT DEFAULT 'USD';
    END IF;
END$$;

-- Note: Este script deve ser executado manualmente no banco de dados Supabase
-- caso seja necessário adicionar essas colunas.
