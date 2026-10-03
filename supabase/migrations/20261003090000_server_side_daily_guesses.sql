create table if not exists public.daily_game_states (
    user_id uuid not null references auth.users(id) on delete cascade,
    word_date date not null,
    guesses text[] not null default '{}',
    status text not null default 'active'
        check (status in ('active', 'won', 'lost')),
    hint_used boolean not null default false,
    updated_at timestamptz not null default now(),
    primary key (user_id, word_date)
);

alter table public.daily_game_states enable row level security;
revoke all on table public.daily_game_states from public, anon, authenticated;

revoke execute on function public.get_daily_word() from public, anon, authenticated;
revoke insert, update, delete on table public.daily_results from public, anon, authenticated;

create or replace function public._daily_guess_feedback(
    p_guess text,
    p_secret text
)
returns text[]
language plpgsql
immutable
security definer
set search_path = pg_catalog, public
as $function$
declare
    guess_letters text[] := array[
        substring(p_guess from 1 for 1),
        substring(p_guess from 2 for 1),
        substring(p_guess from 3 for 1),
        substring(p_guess from 4 for 1),
        substring(p_guess from 5 for 1)
    ];
    remaining_letters text[] := array[
        substring(p_secret from 1 for 1),
        substring(p_secret from 2 for 1),
        substring(p_secret from 3 for 1),
        substring(p_secret from 4 for 1),
        substring(p_secret from 5 for 1)
    ];
    feedback text[] := array['incorrect', 'incorrect', 'incorrect', 'incorrect', 'incorrect'];
    letter_index integer;
    position integer;
begin
    for position in 1..5 loop
        if guess_letters[position] = remaining_letters[position] then
            feedback[position] := 'correct';
            remaining_letters[position] := null;
        end if;
    end loop;

    for position in 1..5 loop
        if feedback[position] <> 'correct' then
            letter_index := array_position(remaining_letters, guess_letters[position]);
            if letter_index is not null then
                feedback[position] := 'present';
                remaining_letters[letter_index] := null;
            end if;
        end if;
    end loop;

    return feedback;
end;
$function$;

revoke all on function public._daily_guess_feedback(text, text) from public, anon, authenticated;

create or replace function public.get_daily_game_state()
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
declare
    player_id uuid := auth.uid();
    puzzle_date date := (pg_catalog.now() at time zone 'UTC')::date;
    puzzle_word text;
    guesses_for_day text[] := '{}';
    game_status text := 'active';
    attempts integer := 0;
    used_hint boolean := false;
    previous_result record;
    guess_history jsonb;
begin
    if player_id is null then
        raise exception 'Authentication required.';
    end if;

    puzzle_word := public.get_daily_word();

    select result.won, result.attempts
    into previous_result
    from public.daily_results as result
    where result.user_id = player_id
      and result.word_date = puzzle_date;

    if found then
        game_status := case when previous_result.won then 'won' else 'lost' end;
        attempts := previous_result.attempts;

        select state.guesses, state.hint_used
        into guesses_for_day, used_hint
        from public.daily_game_states as state
        where state.user_id = player_id
          and state.word_date = puzzle_date;

        guesses_for_day := coalesce(guesses_for_day, '{}');
    else
        insert into public.daily_game_states (user_id, word_date)
        values (player_id, puzzle_date)
        on conflict (user_id, word_date) do nothing;

        select state.guesses, state.status, state.hint_used
        into guesses_for_day, game_status, used_hint
        from public.daily_game_states as state
        where state.user_id = player_id
          and state.word_date = puzzle_date;

        guesses_for_day := coalesce(guesses_for_day, '{}');
        game_status := coalesce(game_status, 'active');
        attempts := cardinality(guesses_for_day);
    end if;

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
    from unnest(guesses_for_day) with ordinality as submitted(guess, ordinality);

    return jsonb_build_object(
        'wordDate', puzzle_date,
        'guesses', guess_history,
        'status', game_status,
        'attempts', attempts,
        'hintUsed', coalesce(used_hint, false),
        'answer', case when game_status <> 'active' then puzzle_word else null end
    );
end;
$function$;

create or replace function public.submit_daily_guess(p_guess text)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
declare
    player_id uuid := auth.uid();
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
    if player_id is null then
        raise exception 'Authentication required.';
    end if;

    if normalized_guess !~ '^[A-Z]{5}$'
       or not exists (
            select 1
            from public.daily_word_pool as candidate
            where candidate.word = normalized_guess
       ) then
        return jsonb_build_object('accepted', false, 'reason', 'invalid_word');
    end if;

    puzzle_word := public.get_daily_word();

    if exists (
        select 1
        from public.daily_results as result
        where result.user_id = player_id
          and result.word_date = puzzle_date
    ) then
        return jsonb_build_object('accepted', false, 'reason', 'completed');
    end if;

    insert into public.daily_game_states (user_id, word_date)
    values (player_id, puzzle_date)
    on conflict (user_id, word_date) do nothing;

    select state.guesses, state.status
    into saved_guesses, saved_status
    from public.daily_game_states as state
    where state.user_id = player_id
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

    update public.daily_game_states
    set guesses = saved_guesses,
        status = next_status,
        updated_at = pg_catalog.now()
    where user_id = player_id
      and word_date = puzzle_date;

    if next_status <> 'active' then
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

        insert into public.daily_results (user_id, word_date, score, attempts, won)
        values (player_id, puzzle_date, score, attempt_number, won)
        on conflict (user_id, word_date) do nothing;
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

create or replace function public.use_daily_hint()
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
declare
    player_id uuid := auth.uid();
    puzzle_date date := (pg_catalog.now() at time zone 'UTC')::date;
    puzzle_word text;
    saved_hint_used boolean;
    vowel_hint text;
    consonant_hint text;
begin
    if player_id is null then
        raise exception 'Authentication required.';
    end if;

    if exists (
        select 1
        from public.daily_results as result
        where result.user_id = player_id
          and result.word_date = puzzle_date
    ) then
        return jsonb_build_object('used', true, 'reason', 'completed');
    end if;

    puzzle_word := public.get_daily_word();

    insert into public.daily_game_states (user_id, word_date)
    values (player_id, puzzle_date)
    on conflict (user_id, word_date) do nothing;

    select state.hint_used
    into saved_hint_used
    from public.daily_game_states as state
    where state.user_id = player_id
      and state.word_date = puzzle_date
    for update;

    if saved_hint_used then
        return jsonb_build_object('used', true, 'reason', 'already_used');
    end if;

    select letters.letter
    into vowel_hint
    from unnest(string_to_array(puzzle_word, null)) as letters(letter)
    where letters.letter in ('A', 'E', 'I', 'O', 'U')
    limit 1;

    select letters.letter
    into consonant_hint
    from unnest(string_to_array(puzzle_word, null)) as letters(letter)
    where letters.letter not in ('A', 'E', 'I', 'O', 'U')
    limit 1;

    update public.daily_game_states
    set hint_used = true,
        updated_at = pg_catalog.now()
    where user_id = player_id
      and word_date = puzzle_date;

    return jsonb_build_object(
        'used', true,
        'vowel', vowel_hint,
        'consonant', consonant_hint
    );
end;
$function$;

revoke all on function public.get_daily_game_state() from public, anon;
revoke all on function public.submit_daily_guess(text) from public, anon;
revoke all on function public.use_daily_hint() from public, anon;
grant execute on function public.get_daily_game_state() to authenticated;
grant execute on function public.submit_daily_guess(text) to authenticated;
grant execute on function public.use_daily_hint() to authenticated;
