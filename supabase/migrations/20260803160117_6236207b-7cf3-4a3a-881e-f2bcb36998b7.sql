-- 1. Create Enums
create type public.profile_entity_type as enum ('associate', 'dependent');
create type public.correction_request_status as enum ('sent', 'analyzing', 'complement_requested', 'approved', 'rejected', 'waiting_sync', 'synced');
create type public.sync_status as enum ('updated', 'waiting_validation', 'waiting_sync', 'needs_revision', 'divergent', 'rejected');

-- 2. Profile Field Settings Table
create table public.profile_field_settings (
    id uuid primary key default gen_random_uuid(),
    field_key text not null,
    entity_type public.profile_entity_type not null,
    visible_admin boolean default true,
    visible_associate boolean default true,
    visible_dependent boolean default true,
    directly_editable boolean default false,
    correction_request_allowed boolean default true,
    document_required boolean default false,
    source_of_truth text default 'cams', -- External system
    sync_enabled boolean default true,
    display_order integer default 0,
    section text, -- 'personal', 'functional', 'contact', etc.
    active boolean default true,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique(field_key, entity_type)
);

grant select on public.profile_field_settings to authenticated;
grant all on public.profile_field_settings to service_role;

alter table public.profile_field_settings enable row level security;

create policy "Public settings are viewable by all authenticated"
on public.profile_field_settings for select
to authenticated
using (true);

-- 3. Data Correction Requests Table
create table public.data_correction_requests (
    id uuid primary key default gen_random_uuid(),
    protocol text unique not null,
    user_id uuid references auth.users(id) on delete cascade,
    associado_id uuid references public.associados(id),
    dependente_id uuid references public.dependentes(id),
    field_key text not null,
    current_value text,
    new_value text not null,
    justification text,
    status public.correction_request_status default 'sent',
    admin_notes text,
    requested_at timestamptz default now(),
    updated_at timestamptz default now(),
    processed_by uuid references auth.users(id),
    processed_at timestamptz,
    sync_status public.sync_status default 'waiting_validation'
);

grant select, insert on public.data_correction_requests to authenticated;
grant all on public.data_correction_requests to service_role;

alter table public.data_correction_requests enable row level security;

create policy "Users can view their own requests"
on public.data_correction_requests for select
to authenticated
using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));

create policy "Users can insert their own requests"
on public.data_correction_requests for insert
to authenticated
with check (auth.uid() = user_id);

-- 4. Correction Request Documents Table
create table public.correction_request_documents (
    id uuid primary key default gen_random_uuid(),
    request_id uuid references public.data_correction_requests(id) on delete cascade not null,
    file_path text not null,
    file_name text not null,
    content_type text,
    size_bytes bigint,
    created_at timestamptz default now()
);

grant select, insert on public.correction_request_documents to authenticated;
grant all on public.correction_request_documents to service_role;

alter table public.correction_request_documents enable row level security;

create policy "Users can view docs of their requests"
on public.correction_request_documents for select
to authenticated
using (exists (
    select 1 from public.data_correction_requests r
    where r.id = request_id and (r.user_id = auth.uid() or public.has_role(auth.uid(), 'admin'))
));

create policy "Users can insert docs for their requests"
on public.correction_request_documents for insert
to authenticated
with check (exists (
    select 1 from public.data_correction_requests r
    where r.id = request_id and r.user_id = auth.uid()
));

-- 5. Add meta columns to main tables (non-destructive)
alter table public.associados 
add column if not exists sync_status public.sync_status default 'updated',
add column if not exists last_sync_at timestamptz,
add column if not exists official_data jsonb; -- Stores the 'snapshot' from CAMS

alter table public.dependentes
add column if not exists sync_status public.sync_status default 'updated',
add column if not exists last_sync_at timestamptz,
add column if not exists official_data jsonb;

-- 6. Seed Profile Field Settings (Phase 1 mapping)
insert into public.profile_field_settings (field_key, entity_type, section, visible_associate, directly_editable, correction_request_allowed, document_required, display_order)
values
-- Associates
('matricula', 'associate', 'functional', true, false, true, true, 10),
('nome', 'associate', 'personal', true, false, true, true, 20),
('cpf', 'associate', 'personal', true, false, true, true, 30),
('rg_civil', 'associate', 'personal', true, false, true, true, 40),
('data_nascimento', 'associate', 'personal', true, false, true, true, 50),
('estado_civil', 'associate', 'personal', true, false, true, false, 60),
('situacao_funcional', 'associate', 'functional', true, false, true, true, 70),
('status', 'associate', 'functional', true, false, true, false, 80),
('posto_graduacao_id', 'associate', 'functional', true, false, true, true, 90),
('unidade_id', 'associate', 'functional', true, true, true, false, 100), -- Exception for active military
('email', 'associate', 'contact', true, true, false, false, 110),
('telefone', 'associate', 'contact', true, true, false, false, 120),
('cep_residencia', 'associate', 'contact', true, true, false, false, 130),
('endereco', 'associate', 'contact', true, true, false, false, 140),
('numero_residencia', 'associate', 'contact', true, true, false, false, 150),
('bairro_residencia', 'associate', 'contact', true, true, false, false, 160),
('cidade_residencia', 'associate', 'contact', true, true, false, false, 170),
('estado_residencia', 'associate', 'contact', true, true, false, false, 180),
('foto_url', 'associate', 'personal', true, true, false, false, 190),

-- Dependents
('nome', 'dependent', 'personal', true, false, true, true, 10),
('tipo', 'dependent', 'personal', true, false, true, true, 20),
('cpf', 'dependent', 'personal', true, false, true, true, 30),
('data_nascimento', 'dependent', 'personal', true, false, true, true, 40),
('email', 'dependent', 'contact', true, true, false, false, 50),
('telefone', 'dependent', 'contact', true, true, false, false, 60),
('foto_url', 'dependent', 'personal', true, true, false, false, 70);

-- 7. Protocol Generator Function
create or replace function public.generate_protocol()
returns text
language plpgsql
as $$
declare
    _proto text;
begin
    _proto := 'REQ' || to_char(now(), 'YYYYMMDD') || lpad(floor(random() * 100000)::text, 5, '0');
    return _proto;
end;
$$;
