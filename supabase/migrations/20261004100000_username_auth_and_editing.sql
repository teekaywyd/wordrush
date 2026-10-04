create unique index if not exists profiles_username_ci_unique
    on public.profiles (lower(username));

create or replace function public.change_my_username(new_username text)
returns text
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
declare
    cleaned text := btrim(new_username);
begin
    if auth.uid() is null then
        raise exception 'You must be signed in.' using errcode = '42501';
    end if;
    if cleaned !~ '^[A-Za-z0-9_]{3,15}$' then
        raise exception 'Use 3 to 15 letters, numbers, or underscores.' using errcode = '22023';
    end if;

    update public.profiles
       set username = cleaned
     where id = auth.uid();
    if not found then
        raise exception 'Profile not found.' using errcode = 'P0002';
    end if;
    return cleaned;
exception
    when unique_violation then
        raise exception 'That username is already taken.' using errcode = '23505';
end;
$function$;

revoke all on function public.change_my_username(text) from public, anon;
grant execute on function public.change_my_username(text) to authenticated;

create or replace function public.resolve_username_email(input_username text)
returns text
language sql
security definer
set search_path = pg_catalog, public, auth
as $function$
    select users.email
      from public.profiles as profile
      join auth.users as users on users.id = profile.id
     where lower(profile.username) = lower(btrim(input_username))
     limit 1;
$function$;

revoke all on function public.resolve_username_email(text) from public, anon, authenticated;
grant execute on function public.resolve_username_email(text) to service_role;
