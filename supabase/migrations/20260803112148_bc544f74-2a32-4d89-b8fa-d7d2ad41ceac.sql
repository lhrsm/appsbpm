-- 1. Create the new enum
DO $$ BEGIN
    CREATE TYPE public.associado_status AS ENUM ('regular', 'inativo', 'suspenso', 'em_analise', 'aguardando_reativacao', 'falecido');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Update associados table
ALTER TABLE public.associados ADD COLUMN status_novo public.associado_status;

UPDATE public.associados SET status_novo = 
    CASE 
        WHEN situacao_associativa = 'falecido' THEN 'falecido'::public.associado_status
        WHEN situacao_associativa = 'suspenso' THEN 'suspenso'::public.associado_status
        WHEN situacao_associativa = 'excluido' THEN 'inativo'::public.associado_status
        WHEN situacao_associativa = 'licenciado' THEN 'inativo'::public.associado_status
        WHEN ativo = false THEN 'inativo'::public.associado_status
        ELSE 'regular'::public.associado_status
    END;

ALTER TABLE public.associados ALTER COLUMN status_novo SET DEFAULT 'regular';
UPDATE public.associados SET status_novo = 'regular' WHERE status_novo IS NULL;
ALTER TABLE public.associados ALTER COLUMN status_novo SET NOT NULL;

ALTER TABLE public.associados DROP COLUMN situacao_associativa;
ALTER TABLE public.associados DROP COLUMN ativo;
ALTER TABLE public.associados RENAME COLUMN status_novo TO status;

-- 3. Update dependentes table
ALTER TABLE public.dependentes ADD COLUMN status_novo public.associado_status;

UPDATE public.dependentes SET status_novo = 
    CASE 
        WHEN status = 'falecido' THEN 'falecido'::public.associado_status
        WHEN status = 'suspenso' THEN 'suspenso'::public.associado_status
        WHEN ativo = false THEN 'inativo'::public.associado_status
        ELSE 'regular'::public.associado_status
    END;

ALTER TABLE public.dependentes ALTER COLUMN status_novo SET DEFAULT 'regular';
UPDATE public.dependentes SET status_novo = 'regular' WHERE status_novo IS NULL;
ALTER TABLE public.dependentes ALTER COLUMN status_novo SET NOT NULL;

ALTER TABLE public.dependentes DROP COLUMN status;
ALTER TABLE public.dependentes DROP COLUMN ativo;
ALTER TABLE public.dependentes RENAME COLUMN status_novo TO status;

-- 4. Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.associados TO authenticated;
GRANT ALL ON public.associados TO service_role;
GRANT SELECT ON public.associados TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.dependentes TO authenticated;
GRANT ALL ON public.dependentes TO service_role;
GRANT SELECT ON public.dependentes TO anon;
