-- Five unique positions enforce the limit even under concurrent writes.
-- The public selection token changes on edit, so a stale tab cannot silently use a new prompt.
create table private.funny_tastes (
 slot smallint primary key check (slot between 1 and 5),
 version uuid unique not null default gen_random_uuid(),
 emoji text unique not null check (length(emoji) between 1 and 32),
 label text not null check (length(btrim(label)) between 1 and 24),
 prompt text not null check (length(btrim(prompt)) between 1 and 600)
);
create unique index funny_taste_label on private.funny_tastes(lower(btrim(label)));
alter table private.funny_tastes enable row level security;
revoke all on private.funny_tastes from public, anon, authenticated;

insert into private.funny_tastes(slot, emoji, label, prompt) values
 (1,'😊','Sweet','Take the side of the underdog. Give a tiny kindness an absurdly grand consequence, or let an object be ridiculously proud of a small achievement. A houseplant might call a new leaf its first direct report. The laugh should feel affectionate.'),
 (2,'😏','Sarcastic','Let the image contradict a perfectly composed speaker. Try deadpan praise for a questionable decision, an understatement, or a suspiciously precise excuse. Make the contradiction legible without announcing sarcasm.'),
 (3,'🥵','Innuendo','Write playful PG-13 double entendres. Pick a physical detail of an ordinary object. Give the same words both a literal reading and the rhythm of a flirtatious remark. For a printer, “Buy me dinner before you open that tray” demonstrates the move; invent fresh wording. Make the wink audible in every take. Keep it non-explicit and aim it at objects, never a depicted person.'),
 (4,'😈','Dark roast','Make the conclusion mercilessly logical. Let a petty rule deliver a bleak consequence, or let a broken system congratulate itself for the damage. An office might list burnout under renewable resources. Invent fresh wording. Roast choices and power; spare identities, bodies, victims and real suffering. Keep it non-graphic.');

create function private.funny_taste_menu() returns jsonb
language sql stable security definer set search_path='' as $$
 select coalesce(jsonb_agg(jsonb_build_object('version',version,'emoji',emoji,'label',label) order by slot),'[]')
 from private.funny_tastes
$$;
create function public.funny_taste_menu() returns jsonb language sql security invoker set search_path=''
as $$ select private.funny_taste_menu() $$;
revoke all on function private.funny_taste_menu(), public.funny_taste_menu() from public;
grant execute on function private.funny_taste_menu(), public.funny_taste_menu() to anon, authenticated;

create function private.funny_admin_tastes(p_action text,p_id uuid,p_data jsonb,p_key text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare position smallint; result uuid;
begin
 perform private.require_superadmin();
 if p_action='list' then
  return (select coalesce(jsonb_agg(t order by slot),'[]') from private.funny_tastes t);
 end if;
 -- Only the validated server action may write Unicode emoji and prompt fields.
 perform private.check_humor_writer(p_key);
 lock table private.funny_tastes in share row exclusive mode;
 if p_id is not null then
  select slot into position from private.funny_tastes where version=p_id;
  if not found then raise exception 'This taste changed or was removed. Refresh and try again.'; end if;
 end if;
 if p_action='taste_delete' and position is not null then
  delete from private.funny_tastes where slot=position returning version into result;
 elsif p_action='taste_save' then
  if position is null then
   select n into position from generate_series(1,5) n where not exists
    (select 1 from private.funny_tastes where slot=n) order by n limit 1;
   if position is null then raise exception 'The five-taste limit has been reached.'; end if;
  end if;
  insert into private.funny_tastes(slot,emoji,label,prompt)
  values(position,btrim(p_data->>'emoji'),btrim(p_data->>'label'),btrim(p_data->>'prompt'))
  on conflict(slot) do update set version=gen_random_uuid(),emoji=excluded.emoji,label=excluded.label,prompt=excluded.prompt
  returning version into result;
 else
  raise exception 'Invalid taste action.';
 end if;
 insert into private.admin_audit(actor,action,target) values(auth.uid(),'funny:'||p_action,result::text);
 return jsonb_build_object('id',result);
exception when unique_violation then raise exception 'Choose a distinct emoji and name for each taste.';
end $$;
create function public.funny_admin_tastes(p_action text,p_id uuid default null,p_data jsonb default '{}',p_key text default null) returns jsonb
language sql security invoker set search_path='' as $$ select private.funny_admin_tastes(p_action,p_id,p_data,p_key) $$;
revoke all on function private.funny_admin_tastes(text,uuid,jsonb,text), public.funny_admin_tastes(text,uuid,jsonb,text) from public, anon;
grant execute on function private.funny_admin_tastes(text,uuid,jsonb,text), public.funny_admin_tastes(text,uuid,jsonb,text) to authenticated;

-- Resolve the choice in the same transaction as the claim. Stale choices roll
-- back the reservation, and a replay returns its original completed snapshot.
create function private.cowriter_begin_with_taste(p_key text,p_request uuid,p_action text,p_fingerprint text,p_session uuid,p_revision integer,p_input jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare claim jsonb; taste jsonb;
begin
 claim=private.cowriter_begin(p_key,p_request,p_action,p_fingerprint,p_session,p_revision,p_input);
 if p_action='draft' and p_input ? 'tasteVersion' and not coalesce((claim->>'cached')::boolean,false) then
  select to_jsonb(t)-'slot' into taste from private.funny_tastes t where version=(p_input->>'tasteVersion')::uuid;
  if taste is null then raise exception 'This joke taste changed. Choose a current taste and try again.' using errcode='40001'; end if;
  claim=jsonb_set(claim,'{state,runtime}',private.funny_runtime()||jsonb_build_object('taste',taste));
 end if;
 return claim;
end $$;
revoke all on function private.cowriter_begin_with_taste(text,uuid,text,text,uuid,integer,jsonb) from public, anon;
grant execute on function private.cowriter_begin_with_taste(text,uuid,text,text,uuid,integer,jsonb) to authenticated;
create or replace function public.cowriter_begin(p_key text,p_request uuid,p_action text,p_fingerprint text,p_session uuid,p_revision integer,p_input jsonb)
returns jsonb language sql security invoker set search_path='' as $$
 select private.cowriter_begin_with_taste(p_key,p_request,p_action,p_fingerprint,p_session,p_revision,p_input)
$$;
