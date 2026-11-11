-- 006: novo vínculo "Egresso e parceiro de pesquisa".
-- Quem se formou e continua colaborando com o LABIC aparece tanto entre os egressos
-- quanto entre os parceiros de pesquisa, sem perder a informação de que é egresso.

do $$
declare r record;
begin
  for r in
    select conname from pg_constraint
    where conrelid = 'public.pessoas'::regclass and contype = 'c' and pg_get_constraintdef(oid) ilike '%vinculo%'
  loop
    execute format('alter table public.pessoas drop constraint %I', r.conname);
  end loop;
end $$;

alter table public.pessoas add constraint pessoas_vinculo_check
  check (vinculo in ('COORDENACAO', 'PESQUISADOR', 'ESTUDANTE', 'EGRESSO', 'PARCEIRO', 'EGRESSO_PARCEIRO'));
