import { Game } from "./Game.js";
import { WordManager } from "./WordManager.js";
import { Board } from "./Board.js";
import { Keyboard } from "./Keyboard.js";
import { Player } from "./Player.js";
import { supabase } from "./supabase.js";


// ========================================
// PLAYER
// ========================================

const wordManager =
    new WordManager();

const board =
    new Board();

const player =
    new Player();


// ========================================
// AUTH ELEMENTS
// ========================================

const authModal =
    document.getElementById("authModal");

const authTitle =
    document.getElementById("authTitle");

const authSubmit =
    document.getElementById("authSubmit");

const authSwitch =
    document.getElementById("authSwitch");

const emailInput =
    document.getElementById("emailInput");

const passwordInput =
    document.getElementById("passwordInput");

const authUsernameInput =
    document.getElementById("authUsernameInput");

const authMessage =
    document.getElementById("authMessage");


// ========================================
// PROFILE ELEMENTS
// ========================================

const profileButton =
    document.getElementById("profileButton");

const profileModal =
    document.getElementById("profileModal");

const profileUsername =
    document.getElementById("profileUsername");

const gamesPlayed =
    document.getElementById("gamesPlayed");

const wins =
    document.getElementById("wins");

const losses =
    document.getElementById("losses");

const winPercentage =
    document.getElementById("winPercentage");

const currentStreak =
    document.getElementById("currentStreak");

const bestStreak =
    document.getElementById("bestStreak");

const totalScore =
    document.getElementById("totalScore");


// ========================================
// LEADERBOARD ELEMENTS
// ========================================

const leaderboardButton =
    document.getElementById(
        "leaderboardButton"
    );

const leaderboardModal =
    document.getElementById(
        "leaderboardModal"
    );

const leaderboardList =
    document.getElementById(
        "leaderboardList"
    );

const myLeaderboardRank =
    document.getElementById(
        "myLeaderboardRank"
    );


// ========================================
// GAME
// ========================================

const keyboard =
    new Keyboard(null);

const game =
    new Game(
        wordManager,
        board,
        keyboard,
        player
    );

keyboard.game =
    game;


// ========================================
// LOAD ONLINE PLAYER
// ========================================

async function loadOnlinePlayer() {

    await player.loadOnline();

}


// ========================================
// LOAD PROFILE
// ========================================

async function loadProfile() {

    const {
        data: {
            user
        }
    } =
        await supabase.auth.getUser();


    if (!user) {

        return null;

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
            "PROFILE ERROR:",
            error.message
        );

        return null;

    }


    return data;

}


// ========================================
// DISPLAY PROFILE
// ========================================

async function displayProfile() {

    const profile =
        await loadProfile();


    if (!profile) {

        profileUsername.textContent =
            "PLAYER";

        gamesPlayed.textContent =
            "0";

        wins.textContent =
            "0";

        losses.textContent =
            "0";

        winPercentage.textContent =
            "0%";

        currentStreak.textContent =
            "0";

        bestStreak.textContent =
            "0";

        totalScore.textContent =
            "0";

        return;

    }


    profileUsername.textContent =
        profile.username;

    gamesPlayed.textContent =
        profile.games_played;

    wins.textContent =
        profile.wins;

    losses.textContent =
        profile.losses;

    currentStreak.textContent =
        profile.current_streak;

    bestStreak.textContent =
        profile.best_streak;

    totalScore.textContent =
        profile.total_score;


    if (
        profile.games_played > 0
    ) {

        const percentage =
            Math.round(

                (
                    profile.wins /
                    profile.games_played
                ) * 100

            );


        winPercentage.textContent =
            percentage + "%";

    }

    else {

        winPercentage.textContent =
            "0%";

    }

}


// ========================================
// LOAD LEADERBOARD
// ========================================

async function loadLeaderboard() {

    leaderboardList.innerHTML =
        "<p>LOADING...</p>";

    myLeaderboardRank.textContent =
        "";


    // ====================================
    // GET CURRENT USER
    // ====================================

    const {
        data: {
            user
        }
    } =
        await supabase.auth.getUser();


    if (!user) {

        leaderboardList.innerHTML =
            "<p>PLEASE LOG IN.</p>";

        return;

    }


    // ====================================
    // GET LEADERBOARD
    // ====================================

    const {
        data,
        error
    } =
        await supabase
            .rpc(
                "get_leaderboard"
            );


    if (error) {

        console.error(
            "LEADERBOARD ERROR:",
            error.message
        );


        leaderboardList.innerHTML =
            "<p>COULD NOT LOAD LEADERBOARD.</p>";

        return;

    }


    if (
        !data ||
        data.length === 0
    ) {

        leaderboardList.innerHTML =
            "<p>NO PLAYERS YET.</p>";

        return;

    }


    // ====================================
    // FIND CURRENT PLAYER
    // ====================================

    const myIndex =
        data.findIndex(
            leaderboardPlayer =>
                leaderboardPlayer.id ===
                user.id
        );


    // ====================================
    // DISPLAY TOP 10
    // ====================================

    leaderboardList.innerHTML =
        "";


    const topPlayers =
        data.slice(0, 10);


    topPlayers.forEach(
        (leaderboardPlayer, index) => {

            const row =
                document.createElement(
                    "div"
                );


            row.classList.add(
                "leaderboard-row"
            );


            const isCurrentPlayer =
                leaderboardPlayer.id ===
                user.id;


            if (isCurrentPlayer) {

                row.classList.add(
                    "current-player"
                );

            }


            // =================================
            // RANK
            // =================================

            const rank =
                document.createElement(
                    "span"
                );


            rank.classList.add(
                "leaderboard-rank"
            );


            rank.textContent =
                index + 1;


            // =================================
            // USERNAME
            // =================================

            const usernameContainer =
                document.createElement(
                    "span"
                );


            usernameContainer.classList.add(
                "leaderboard-username"
            );


            usernameContainer.textContent =
                leaderboardPlayer.username;


            // =================================
            // YOU LABEL
            // =================================

            if (isCurrentPlayer) {

                const youLabel =
                    document.createElement(
                        "span"
                    );


                youLabel.classList.add(
                    "you-label"
                );


                youLabel.textContent =
                    "YOU";


                usernameContainer.appendChild(
                    youLabel
                );

            }


            // =================================
            // SCORE
            // =================================

            const score =
                document.createElement(
                    "span"
                );


            score.classList.add(
                "leaderboard-score"
            );


            score.textContent =
                leaderboardPlayer.total_score;


            // =================================
            // ADD ROW
            // =================================

            row.appendChild(
                rank
            );

            row.appendChild(
                usernameContainer
            );

            row.appendChild(
                score
            );


            leaderboardList.appendChild(
                row
            );

        }
    );


    // ====================================
    // DISPLAY CURRENT PLAYER RANK
    // ====================================

    if (
        myIndex !== -1
    ) {

        const myPlayer =
            data[myIndex];


        const myRank =
            myIndex + 1;


        if (
            myRank > 10
        ) {

            myLeaderboardRank.innerHTML =

                `
                <div class="my-rank-divider"></div>

                <div class="my-rank">

                    <span class="my-rank-number">
                        #${myRank}
                    </span>

                    <span class="my-rank-username">
                        ${myPlayer.username}
                    </span>

                    <span class="you-label">
                        YOU
                    </span>

                    <span class="my-rank-score">
                        ${myPlayer.total_score}
                    </span>

                </div>
                `;

        }

    }

}


// ========================================
// OPEN LEADERBOARD
// ========================================

leaderboardButton.addEventListener(
    "click",
    async function() {

        leaderboardModal.style.display =
            "flex";


        await loadLeaderboard();

    }
);


// ========================================
// CLOSE LEADERBOARD
// ========================================

document
    .getElementById(
        "closeLeaderboard"
    )
    .addEventListener(
        "click",
        function() {

            leaderboardModal.style.display =
                "none";

        }
    );


document
    .getElementById(
        "closeLeaderboardBottom"
    )
    .addEventListener(
        "click",
        function() {

            leaderboardModal.style.display =
                "none";

        }
    );


// ========================================
// MOBILE SYSTEM KEYBOARD
// ========================================

const mobileInput =
    document.getElementById(
        "mobileInput"
    );


mobileInput.addEventListener(
    "input",
    function() {

        const value =
            mobileInput.value.toUpperCase();


        if (
            value.length > 0
        ) {

            const lastLetter =
                value[
                    value.length - 1
                ];


            if (

                lastLetter >= "A" &&
                lastLetter <= "Z"

            ) {

                game.addLetter(
                    lastLetter
                );

            }

        }


        mobileInput.value =
            "";

    }
);


mobileInput.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Backspace"
        ) {

            event.preventDefault();

            game.removeLetter();

        }


        if (
            event.key === "Enter"
        ) {

            event.preventDefault();

            game.submitGuess();

            mobileInput.value =
                "";

        }

    }
);


// ========================================
// BOARD → MOBILE KEYBOARD
// ========================================

document
    .getElementById("board")
    .addEventListener(
        "click",
        function() {

            mobileInput.focus();

        }
    );


// ========================================
// PHYSICAL KEYBOARD
// ========================================

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.target === mobileInput
        ) {

            return;

        }


        const key =
            event.key.toUpperCase();


        if (
            key === "ENTER"
        ) {

            game.submitGuess();

        }

        else if (
            key === "BACKSPACE"
        ) {

            game.removeLetter();

        }

        else if (

            key.length === 1 &&
            key >= "A" &&
            key <= "Z"

        ) {

            game.addLetter(
                key
            );

        }

    }
);


// ========================================
// NEW GAME
// ========================================

document
    .getElementById("newGameButton")
    .addEventListener(
        "click",
        function() {

            game.startGame();

        }
    );


// ========================================
// HINT
// ========================================

document
    .getElementById("hintButton")
    .addEventListener(
        "click",
        function() {

            game.useHint();

        }
    );


// ========================================
// PROFILE BUTTON
// ========================================

profileButton.addEventListener(
    "click",
    async function() {

        await displayProfile();

        profileModal.style.display =
            "flex";

    }
);


// ========================================
// CLOSE PROFILE
// ========================================

document
    .getElementById("closeProfile")
    .addEventListener(
        "click",
        function() {

            profileModal.style.display =
                "none";

        }
    );


document
    .getElementById("closeProfileBottom")
    .addEventListener(
        "click",
        function() {

            profileModal.style.display =
                "none";

        }
    );


// ========================================
// LOGIN / SIGN UP SWITCH
// ========================================

let loginMode =
    false;


authSwitch.addEventListener(
    "click",
    function() {

        loginMode =
            !loginMode;


        authMessage.textContent =
            "";


        emailInput.value =
            "";

        passwordInput.value =
            "";

        authUsernameInput.value =
            "";


        if (loginMode) {

            authTitle.textContent =
                "WELCOME BACK";

            authSubmit.textContent =
                "LOG IN";

            authSwitch.textContent =
                "NEED AN ACCOUNT? SIGN UP";

            authUsernameInput.style.display =
                "none";

        }

        else {

            authTitle.textContent =
                "WELCOME TO WORDRUSH";

            authSubmit.textContent =
                "CREATE ACCOUNT";

            authSwitch.textContent =
                "ALREADY HAVE AN ACCOUNT? LOG IN";

            authUsernameInput.style.display =
                "block";

        }

    }
);


// ========================================
// AUTH SUBMIT
// ========================================

authSubmit.addEventListener(
    "click",
    async function() {

        const email =
            emailInput.value.trim();

        const password =
            passwordInput.value;

        const username =
            authUsernameInput.value.trim();


        if (
            email === ""
        ) {

            authMessage.textContent =
                "PLEASE ENTER YOUR EMAIL.";

            return;

        }


        // =================================
        // LOGIN
        // =================================

        if (loginMode) {

            if (
                password.length < 6
            ) {

                authMessage.textContent =
                    "PASSWORD MUST BE AT LEAST 6 CHARACTERS.";

                return;

            }


            authMessage.textContent =
                "LOGGING IN...";


            const {
                error
            } =
                await supabase.auth
                    .signInWithPassword({

                        email:
                            email,

                        password:
                            password

                    });


            if (error) {

                authMessage.textContent =
                    error.message;

                return;

            }


            authMessage.textContent =
                "LOGIN SUCCESSFUL!";


            authModal.style.display =
                "none";


            await loadOnlinePlayer();

            game.startGame();

            return;

        }


        // =================================
        // SIGN UP
        // =================================

        if (
            username.length < 3
        ) {

            authMessage.textContent =
                "USERNAME MUST BE AT LEAST 3 CHARACTERS.";

            return;

        }


        if (
            password.length < 6
        ) {

            authMessage.textContent =
                "PASSWORD MUST BE AT LEAST 6 CHARACTERS.";

            return;

        }


        authMessage.textContent =
            "CREATING ACCOUNT...";


        const {
            data,
            error
        } =
            await supabase.auth
                .signUp({

                    email:
                        email,

                    password:
                        password,

                    options: {

                        data: {

                            username:
                                username

                        }

                    }

                });


        if (error) {

            authMessage.textContent =
                error.message;

            return;

        }


        if (!data.user) {

            authMessage.textContent =
                "ACCOUNT COULD NOT BE CREATED.";

            return;

        }


        if (!data.session) {

            authMessage.textContent =
                "ACCOUNT CREATED! PLEASE CONFIRM YOUR EMAIL.";

            return;

        }


        authMessage.textContent =
            "ACCOUNT CREATED!";


        authModal.style.display =
            "none";


        await loadOnlinePlayer();

        game.startGame();

    }
);


// ========================================
// CHECK AUTHENTICATION
// ========================================

async function checkAuthentication() {

    const {
        data: {
            session
        }
    } =
        await supabase.auth.getSession();


    if (session) {

        authModal.style.display =
            "none";


        await loadOnlinePlayer();

        game.startGame();

    }

    else {

        authModal.style.display =
            "flex";

    }

}


// ========================================
// AUTH STATE CHANGES
// ========================================

supabase.auth.onAuthStateChange(
    function(event) {

        if (
            event === "SIGNED_OUT"
        ) {

            authModal.style.display =
                "flex";

        }

    }
);


// ========================================
// START
// ========================================

checkAuthentication();