alter table public.cams_unidades 
add column if not exists instituicao text,
add column if not exists active boolean default true,
add column if not exists display_order integer default 0;

insert into public.cams_unidades (nome, sigla, instituicao)
values 
('1º Grupamento de Bombeiros Militar', '1º GBM', 'CBMBA'),
('2º Grupamento de Bombeiros Militar', '2º GBM', 'CBMBA'),
('3º Grupamento de Bombeiros Militar', '3º GBM', 'CBMBA'),
('Comando de Policiamento Especializado', 'CPE', 'PMBA'),
('Batalhão de Polícia de Choque', 'BPCHQ', 'PMBA');
