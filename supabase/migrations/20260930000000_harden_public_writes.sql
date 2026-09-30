-- Browser requests now use same-origin Next.js routes, which call these
-- functions with the service role. Keep the SECURITY DEFINER functions for
-- their controlled access to the RLS-protected table, but remove every public
-- RPC grant so they cannot be called through Supabase's exposed REST endpoint.
revoke all on function public.get_course_plan(text) from public, anon, authenticated;
revoke all on function public.upsert_course_plan(text, text, text[], jsonb) from public, anon, authenticated;
grant execute on function public.get_course_plan(text) to service_role;
grant execute on function public.upsert_course_plan(text, text, text[], jsonb) to service_role;

-- Feedback is accepted by the same-origin route above, which validates the
-- payload before inserting with the service role. Direct browser writes no
-- longer need a permissive RLS policy.
drop policy if exists "Anyone can submit website error feedback" on public.website_error_feedback;
revoke all on public.website_error_feedback from anon, authenticated;
