# WordRush

## Daily puzzle setup

Daily puzzles are selected and stored by Supabase. Apply all migrations in
`supabase/migrations` in timestamp order before using Daily mode, including
`20261012120000_guest_daily_games.sql`. The first request each UTC day chooses
a random valid word and stores it, so signed-in players and guests get the same
puzzle. Guest guesses are checked and saved as temporary game progress by
Supabase; guest stats are never recorded.