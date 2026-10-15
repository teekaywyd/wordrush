create or replace function public.get_daily_points_leaderboard()
returns table (
    id uuid,
    username text,
    daily_points bigint
)
language sql
stable
security definer
set search_path = pg_catalog, public
as $function$
    select
        profile.id,
        profile.username,
        sum(case when result.won then result.score else 0 end)::bigint as daily_points
    from public.daily_results as result
    join public.profiles as profile on profile.id = result.user_id
    group by profile.id, profile.username
    order by sum(case when result.won then result.score else 0 end) desc, profile.username asc
    limit 10;
$function$;

revoke all on function public.get_daily_points_leaderboard() from public, anon;
grant execute on function public.get_daily_points_leaderboard() to authenticated;
