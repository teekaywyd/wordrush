create table if not exists public.guest_daily_game_states (
    guest_id uuid not null,
    word_date date not null,
    guesses text[] not null default '{}',
    status text not null default 'active'
        check (status in ('active', 'won', 'lost')),
    updated_at timestamptz not null default now(),
    primary key (guest_id, word_date)
);

alter table public.guest_daily_game_states enable row level security;
revoke all on table public.guest_daily_game_states from public, anon, authenticated;

create or replace function public.get_guest_daily_game_state(p_guest_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
declare
    puzzle_date date := (pg_catalog.now() at time zone 'UTC')::date;
    puzzle_word text;
    saved_guesses text[] := '{}';
    game_status text := 'active';
    guess_history jsonb;
begin
    if p_guest_id is null then
        raise exception 'Guest ID required.';
    end if;

    puzzle_word := public.get_daily_word();

    delete from public.guest_daily_game_states
    where word_date < puzzle_date - 30;

    select state.guesses, state.status
    into saved_guesses, game_status
    from public.guest_daily_game_states as state
    where state.guest_id = p_guest_id
      and state.word_date = puzzle_date;

    saved_guesses := coalesce(saved_guesses, '{}');
    game_status := coalesce(game_status, 'active');

    select coalesce(
        jsonb_agg(
            jsonb_build_object(
                'guess', submitted.guess,
                'result', public._daily_guess_feedback(submitted.guess, puzzle_word)
            ) order by submitted.ordinality
        ),
        '[]'::jsonb
    )
    into guess_history
    from unnest(saved_guesses) with ordinality as submitted(guess, ordinality);

    return jsonb_build_object(
        'wordDate', puzzle_date,
        'guesses', guess_history,
        'status', game_status,
        'attempts', cardinality(saved_guesses),
        'hintUsed', false,
        'answer', case when game_status <> 'active' then puzzle_word else null end
    );
end;
$function$;

create or replace function public.submit_guest_daily_guess(p_guest_id uuid, p_guess text)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
declare
    puzzle_date date := (pg_catalog.now() at time zone 'UTC')::date;
    puzzle_word text;
    normalized_guess text := upper(btrim(coalesce(p_guess, '')));
    saved_guesses text[];
    saved_status text;
    next_status text;
    attempt_number integer;
    won boolean;
    score integer := 0;
begin
    if p_guest_id is null then
        raise exception 'Guest ID required.';
    end if;

    if normalized_guess !~ '^[A-Z]{5}$'
       or not exists (
            select 1 from public.daily_word_pool as candidate
            where candidate.word = normalized_guess
       ) then
        return jsonb_build_object('accepted', false, 'reason', 'invalid_word');
    end if;

    puzzle_word := public.get_daily_word();
    insert into public.guest_daily_game_states (guest_id, word_date)
    values (p_guest_id, puzzle_date)
    on conflict (guest_id, word_date) do nothing;

    select state.guesses, state.status
    into saved_guesses, saved_status
    from public.guest_daily_game_states as state
    where state.guest_id = p_guest_id
      and state.word_date = puzzle_date
    for update;

    if saved_status <> 'active' or cardinality(saved_guesses) >= 6 then
        return jsonb_build_object('accepted', false, 'reason', 'completed');
    end if;

    saved_guesses := array_append(saved_guesses, normalized_guess);
    attempt_number := cardinality(saved_guesses);
    won := normalized_guess = puzzle_word;
    next_status := case
        when won then 'won'
        when attempt_number >= 6 then 'lost'
        else 'active'
    end;

    update public.guest_daily_game_states
    set guesses = saved_guesses,
        status = next_status,
        updated_at = pg_catalog.now()
    where guest_id = p_guest_id
      and word_date = puzzle_date;

    if won then
        score := case attempt_number
            when 1 then 500
            when 2 then 400
            when 3 then 300
            when 4 then 200
            when 5 then 150
            else 100
        end;
    end if;

    return jsonb_build_object(
        'accepted', true,
        'guess', normalized_guess,
        'result', public._daily_guess_feedback(normalized_guess, puzzle_word),
        'status', next_status,
        'attempts', attempt_number,
        'won', won,
        'score', score,
        'answer', case when next_status <> 'active' then puzzle_word else null end
    );
end;
$function$;

revoke all on function public.get_guest_daily_game_state(uuid) from public, anon, authenticated;
revoke all on function public.submit_guest_daily_guess(uuid, text) from public, anon, authenticated;
grant execute on function public.get_guest_daily_game_state(uuid) to anon, authenticated;
grant execute on function public.submit_guest_daily_guess(uuid, text) to anon, authenticated;
