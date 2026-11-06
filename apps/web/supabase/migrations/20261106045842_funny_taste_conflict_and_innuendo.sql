-- A stale menu is an application conflict. A serialization failure invites transaction retries.
create or replace function private.cowriter_begin_with_taste(p_key text,p_request uuid,p_action text,p_fingerprint text,p_session uuid,p_revision integer,p_input jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare claim jsonb; taste jsonb;
begin
 claim=private.cowriter_begin(p_key,p_request,p_action,p_fingerprint,p_session,p_revision,p_input);
 if p_action='draft' and p_input ? 'tasteVersion' and not coalesce((claim->>'cached')::boolean,false) then
  select to_jsonb(t)-'slot' into taste from private.funny_tastes t where version=(p_input->>'tasteVersion')::uuid;
  if taste is null then raise exception 'This joke taste changed. Choose a current taste and try again.' using errcode='PT409'; end if;
  claim=jsonb_set(claim,'{state,runtime}',private.funny_runtime()||jsonb_build_object('taste',taste));
 end if;
 return claim;
end $$;

-- Update only the untouched seed. New versions invalidate stale menus and preserve draft snapshots.
update private.funny_tastes set version=gen_random_uuid(), prompt=$taste$Give an ordinary object a literal function that also sounds flirtatious. Build each wink from a concrete part, action or malfunction specific to the premise. When the catalog photo shows people instead of the object, make the object unmistakable in the caption; never cast a pictured person as the sexual speaker or target. Prefer an original double meaning over stock pickup lines. Keep it playful and non-explicit. For a child audience, use innocent wordplay.$taste$
where slot=3 and emoji='🥵' and label='Innuendo' and prompt=$taste$Write playful PG-13 double entendres. Pick a physical detail of an ordinary object. Give the same words both a literal reading and the rhythm of a flirtatious remark. For a printer, “Buy me dinner before you open that tray” demonstrates the move; invent fresh wording. Make the wink audible in every take. Keep it non-explicit and aim it at objects, never a depicted person.$taste$;
