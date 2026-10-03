create or replace function public.get_daily_streak_leaderboard()
returns table (
    id uuid,
    username text,
    current_streak integer,
    best_streak integer
)
language sql
stable
security definer
set search_path = pg_catalog, public
as $function$
    with completed_dates as (
        select distinct result.user_id, result.word_date
        from public.daily_results as result
    ),
    ranked_dates as (
        select
            completed.user_id,
            completed.word_date,
            row_number() over (
                partition by completed.user_id
                order by completed.word_date desc
            ) as day_number
        from completed_dates as completed
    ),
    streak_runs as (
        select
            ranked.user_id,
            ranked.word_date + (ranked.day_number - 1)::integer as run_anchor,
            count(*)::integer as run_length
        from ranked_dates as ranked
        group by
            ranked.user_id,
            ranked.word_date + (ranked.day_number - 1)::integer
    ),
    latest_dates as (
        select completed.user_id, max(completed.word_date) as latest_date
        from completed_dates as completed
        group by completed.user_id
    ),
    best_runs as (
        select run.user_id, max(run.run_length)::integer as best_streak
        from streak_runs as run
        group by run.user_id
    ),
    active_streaks as (
        select
            latest.user_id,
            case
                when latest.latest_date >= ((pg_catalog.now() at time zone 'UTC')::date - 1)
                    then coalesce(current_run.run_length, 0)
                else 0
            end as current_streak,
            coalesce(best.best_streak, 0) as best_streak
        from latest_dates as latest
        left join streak_runs as current_run
            on current_run.user_id = latest.user_id
           and current_run.run_anchor = latest.latest_date
        left join best_runs as best
            on best.user_id = latest.user_id
    )
    select
        profile.id,
        profile.username,
        active.current_streak,
        active.best_streak
    from active_streaks as active
    join public.profiles as profile on profile.id = active.user_id
    where active.current_streak > 0
    order by active.current_streak desc, active.best_streak desc, profile.username asc
    limit 10;
$function$;

revoke all on function public.get_daily_streak_leaderboard() from public, anon;
grant execute on function public.get_daily_streak_leaderboard() to authenticated;
