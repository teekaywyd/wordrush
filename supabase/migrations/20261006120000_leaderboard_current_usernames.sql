create or replace function public.get_profile_usernames(profile_ids uuid[])
returns table (id uuid, username text)
language sql
stable
security definer
set search_path = pg_catalog, public
as $function$
    select profile.id, profile.username
      from public.profiles as profile
     where profile.id = any(profile_ids);
$function$;

revoke all on function public.get_profile_usernames(uuid[]) from public, anon;
grant execute on function public.get_profile_usernames(uuid[]) to authenticated;
