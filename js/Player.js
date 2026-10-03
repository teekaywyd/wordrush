import { supabase } from "./supabase.js";


export class Player {

    constructor() {

        this.username = "PLAYER";

        this.gamesPlayed = 0;

        this.wins = 0;

        this.losses = 0;

        this.currentStreak = 0;

        this.bestStreak = 0;

        this.totalScore = 0;


        // ========================================
        // DAILY STATS
        // ========================================

        this.dailyCurrentStreak = 0;

        this.dailyBestStreak = 0;

    }


    // ========================================
    // LOAD ONLINE PROFILE
    // ========================================

    async loadOnline() {

        try {

            const {
                data: {
                    user
                }
            } =
                await supabase.auth.getUser();


            if (!user) {

                return false;

            }


            const {
                data,
                error
            } =
                await supabase
                    .from("profiles")
                    .select("*")
                    .eq(
                        "id",
                        user.id
                    )
                    .single();


            if (error) {

                console.error(
                    "PROFILE LOAD ERROR:",
                    error.message
                );

                return false;

            }


            if (!data) {

                return false;

            }


            this.username =
                data.username;

            this.gamesPlayed =
                data.games_played;

            this.wins =
                data.wins;

            this.losses =
                data.losses;

            this.currentStreak =
                data.current_streak;

            this.bestStreak =
                data.best_streak;

            this.totalScore =
                data.total_score;


            await this.loadDailyStats();


            return true;

        }

        catch (error) {

            console.error(
                "ONLINE LOAD ERROR:",
                error
            );

            return false;

        }

    }


    // ========================================
    // ADD WIN
    // ========================================

    async addWin(score) {

        this.gamesPlayed++;

        this.wins++;

        this.currentStreak++;


        if (
            this.currentStreak >
            this.bestStreak
        ) {

            this.bestStreak =
                this.currentStreak;

        }


        this.totalScore += score;


        await this.saveOnline();

    }


    // ========================================
    // ADD LOSS
    // ========================================

    async addLoss() {

        this.gamesPlayed++;

        this.losses++;

        this.currentStreak = 0;


        await this.saveOnline();

    }


    // ========================================
    // SAVE ONLINE
    // ========================================

    async saveOnline() {

        try {

            const {
                data: {
                    user
                }
            } =
                await supabase.auth.getUser();


            if (!user) {

                console.error(
                    "NO LOGGED-IN USER."
                );

                return false;

            }


            const {
                error
            } =
                await supabase
                    .from("profiles")
                    .update({

                        games_played:
                            this.gamesPlayed,

                        wins:
                            this.wins,

                        losses:
                            this.losses,

                        current_streak:
                            this.currentStreak,

                        best_streak:
                            this.bestStreak,

                        total_score:
                            this.totalScore

                    })
                    .eq(
                        "id",
                        user.id
                    );


            if (error) {

                console.error(
                    "ONLINE SAVE ERROR:",
                    error.message
                );

                return false;

            }


            console.log(
                "WORDRUSH STATS SAVED"
            );


            return true;

        }

        catch (error) {

            console.error(
                "SUPABASE SAVE ERROR:",
                error
            );

            return false;

        }

    }


    // ========================================
    // LOAD DAILY STATS
    // ========================================

    async loadDailyStats() {

        try {

            const {
                data: {
                    user
                }
            } =
                await supabase.auth.getUser();


            if (!user) {

                return false;

            }


            const {
                data,
                error
            } =
                await supabase
                    .from("daily_results")
                    .select(
                        "word_date, completed_at"
                    )
                    .eq(
                        "user_id",
                        user.id
                    )
                    .order(
                        "word_date",
                        {
                            ascending: false
                        }
                    );


            if (error) {

                console.error(
                    "DAILY STATS LOAD ERROR:",
                    error.message
                );

                return false;

            }


            if (
                !data ||
                data.length === 0
            ) {

                this.dailyCurrentStreak = 0;

                this.dailyBestStreak = 0;

                return true;

            }


            // ========================================
            // GET UNIQUE DATES
            // ========================================

            const dates =
                [
                    ...new Set(
                        data.map(
                            function(result) {

                                return result.word_date;

                            }
                        )
                    )
                ];


            // ========================================
            // SORT NEWEST TO OLDEST
            // ========================================

            dates.sort(
                function(a, b) {

                    return b.localeCompare(a);

                }
            );


            // ========================================
            // DATE DIFFERENCE
            // ========================================

            function dateDifference(
                newerDate,
                olderDate
            ) {

                const newer =
                    new Date(
                        `${newerDate}T00:00:00Z`
                    );


                const older =
                    new Date(
                        `${olderDate}T00:00:00Z`
                    );


                return (
                    newer.getTime() -
                    older.getTime()
                ) /
                (
                    1000 *
                    60 *
                    60 *
                    24
                );

            }


            // ========================================
            // BEST STREAK
            // ========================================

            let bestStreak = 1;

            let streak = 1;


            for (
                let i = 1;
                i < dates.length;
                i++
            ) {

                const difference =
                    dateDifference(
                        dates[i - 1],
                        dates[i]
                    );


                if (
                    difference === 1
                ) {

                    streak++;

                } else {

                    if (
                        streak >
                        bestStreak
                    ) {

                        bestStreak =
                            streak;

                    }


                    streak = 1;

                }

            }


            if (
                streak >
                bestStreak
            ) {

                bestStreak =
                    streak;

            }


            // ========================================
            // CURRENT STREAK
            // ========================================

            const todayDate =
                new Date().toISOString().slice(0, 10);


            const latestDate =
                dates[0];


            const daysSinceLatest =
                dateDifference(
                    todayDate,
                    latestDate
                );


            let currentStreak = 0;


            if (
                daysSinceLatest === 0 ||
                daysSinceLatest === 1
            ) {

                currentStreak = 1;


                for (
                    let i = 1;
                    i < dates.length;
                    i++
                ) {

                    const difference =
                        dateDifference(
                            dates[i - 1],
                            dates[i]
                        );


                    if (
                        difference === 1
                    ) {

                        currentStreak++;

                    } else {

                        break;

                    }

                }

            }


            this.dailyCurrentStreak =
                currentStreak;


            this.dailyBestStreak =
                bestStreak;


            return true;

        }

        catch (error) {

            console.error(
                "DAILY STATS ERROR:",
                error
            );

            return false;

        }

    }


    // ========================================
    // SAVE DAILY RESULT
    // ========================================

    async saveDailyResult(
        wordDate,
        score,
        attempts,
        won
    ) {

        try {

            const {
                data: {
                    user
                }
            } =
                await supabase.auth.getUser();


            if (!user) {

                console.error(
                    "NO LOGGED-IN USER."
                );

                return false;

            }


            const {
                error
            } =
                await supabase
                    .from("daily_results")
                    .insert({

                        user_id:
                            user.id,

                        word_date:
                            wordDate,

                        score:
                            score,

                        attempts:
                            attempts,

                        won:
                            won

                    });


            if (error) {

                console.error(
                    "DAILY RESULT SAVE ERROR:",
                    error.message
                );

                return false;

            }


            await this.loadDailyStats();


            console.log(
                "WORDRUSH DAILY RESULT SAVED"
            );


            return true;

        }

        catch (error) {

            console.error(
                "DAILY RESULT ERROR:",
                error
            );

            return false;

        }

    }


    // ========================================
    // CHECK IF DAILY WORD IS COMPLETED
    // ========================================

    async hasCompletedDailyWord(
        wordDate
    ) {

        try {

            const {
                data: {
                    user
                }
            } =
                await supabase.auth.getUser();


            if (!user) {

                return false;

            }


            const {
                data,
                error
            } =
                await supabase
                    .from("daily_results")
                    .select("id")
                    .eq(
                        "user_id",
                        user.id
                    )
                    .eq(
                        "word_date",
                        wordDate
                    )
                    .maybeSingle();


            if (error) {

                console.error(
                    "DAILY CHECK ERROR:",
                    error.message
                );

                return false;

            }


            return !!data;

        }

        catch (error) {

            console.error(
                "DAILY CHECK ERROR:",
                error
            );

            return false;

        }

    }


    // ========================================
    // WIN PERCENTAGE
    // ========================================

    getWinPercentage() {

        if (
            this.gamesPlayed === 0
        ) {

            return 0;

        }


        return Math.round(

            (
                this.wins /
                this.gamesPlayed
            ) * 100

        );

    }

}
