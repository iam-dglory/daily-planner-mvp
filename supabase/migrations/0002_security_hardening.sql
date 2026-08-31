-- Fix Supabase database-linter warnings on the trigger functions above.

-- Pin a stable search_path so the function can't be tricked by a session-level
-- search_path change (defense in depth for SECURITY DEFINER-adjacent code).
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- These two are trigger-only functions (fired by BEFORE/AFTER triggers on
-- auth.users / public.tasks). They were flagged because SECURITY DEFINER
-- functions are callable directly via PostgREST RPC (/rest/v1/rpc/<fn>) by
-- default. Direct RPC calls make no sense for these (they rely on trigger
-- context: NEW/OLD rows) and aren't part of the app's API surface, so revoke
-- that avenue explicitly rather than relying on it merely being useless.
revoke execute on function public.handle_new_user() from anon, authenticated;
revoke execute on function public.handle_task_recurrence() from anon, authenticated;
