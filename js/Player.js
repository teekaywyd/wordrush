
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


        // Add the score earned
        // from this particular game

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


        // A loss gives 0 points.
        // Therefore totalScore does not change.


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

