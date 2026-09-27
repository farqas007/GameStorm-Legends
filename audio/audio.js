// =========================================
// GAMESTORM LEGENDS — AUDIO ENGINE
// =========================================

export class AudioEngine {

    constructor() {

        this.ctx = null;

        this.master = null;

        this.musicGain = null;

        this.sfxGain = null;

        this.music = null;

        this.musicSource = null;

        this.started = false;

        this.musicStarting = false;

        this.startTime = 0;

        this.timelineStartTime = 0;

        this.volume = 0.7;

    }


    // =========================================
    // INITIALIZE
    // =========================================

    init() {

        if (this.ctx) {
            return;
        }


        this.ctx = new (
            window.AudioContext ||
            window.webkitAudioContext
        )();


        // =====================================
        // MASTER BUS
        // =====================================

        this.master =
            this.ctx.createGain();

        this.master.gain.value =
            this.volume;


        // =====================================
        // MUSIC BUS
        // =====================================

        this.musicGain =
            this.ctx.createGain();

        this.musicGain.gain.value =
            0.75;


        // =====================================
        // SFX BUS
        // =====================================

        this.sfxGain =
            this.ctx.createGain();

        this.sfxGain.gain.value =
            0.8;


        // =====================================
        // ROUTING
        // =====================================

        this.musicGain.connect(
            this.master
        );

        this.sfxGain.connect(
            this.master
        );

        this.master.connect(
            this.ctx.destination
        );


        console.log(
            "🎧 GameStorm Audio Engine Ready"
        );

    }


    // =========================================
    // START
    // =========================================

    async start() {

        this.init();


        // =====================================
        // RESUME AUDIO CONTEXT
        // =====================================

        if (
            this.ctx.state === "suspended"
        ) {

            try {

                await this.ctx.resume();

            } catch (error) {

                console.error(
                    "❌ AudioContext Resume Error:",
                    error
                );

                return false;

            }

        }


        this.started = true;


        this.startTime =
            this.ctx.currentTime;

        this.timelineStartTime =
            this.ctx.currentTime;


        console.log(
            "🎵 GameStorm Audio Started"
        );

        console.log(
            "🔊 AudioContext:",
            this.ctx.state
        );


        return true;

    }


    // =========================================
    // CREATE MUSIC ELEMENT
    // =========================================

    createMusic() {

        // -------------------------------------
        // Already created
        // -------------------------------------

        if (this.music) {
            return true;
        }


        // -------------------------------------
        // Create HTML Audio element
        // -------------------------------------

        this.music =
    new Audio(
        "./assets/music/gamestorm-legends-main.mp3"
    );

console.log(
    "🎵 REAL MUSIC SOURCE:",
    this.music.src
);

console.log(
    "🎵 Music URL:",
    this.music.currentSrc || this.music.src
);

console.log(
    "🎵 Music Duration:",
    this.music.duration
);


        this.music.preload =
            "auto";

        this.music.loop =
            false;

        this.music.volume =
            1;


        // -------------------------------------
        // Create MediaElementSource
        // -------------------------------------

        try {

            this.musicSource =
                this.ctx.createMediaElementSource(
                    this.music
                );


            this.musicSource.connect(
                this.musicGain
            );


        } catch (error) {

            console.error(
                "❌ MediaElementSource Error:",
                error
            );


            this.music = null;

            this.musicSource = null;


            return false;

        }


        console.log(
            "🎵 GameStorm Theme Audio Element Created"
        );


        return true;

    }


    // =========================================
    // PLAY MUSIC
    // =========================================

    async playMusic() {

        // -------------------------------------
        // Audio must be started first
        // -------------------------------------

        if (!this.started) {

            console.warn(
                "⚠️ Audio must be started first."
            );

            return false;

        }


        // -------------------------------------
        // Prevent duplicate play() calls
        // -------------------------------------

        if (this.musicStarting) {

            console.log(
                "🎵 Music start already in progress"
            );

            return true;

            console.log(
    "🎵 Music URL:",
    this.music.currentSrc || this.music.src
);

console.log(
    "🎵 Music Duration:",
    this.music.duration
);

        }


        // -------------------------------------
        // Already playing
        // -------------------------------------

        if (
            this.music &&
            !this.music.paused &&
            !this.music.ended
        ) {

            console.log(
                "🎵 Music already playing"
            );

            return true;

        }


        // -------------------------------------
        // Create music once
        // -------------------------------------

        if (!this.createMusic()) {
            return false;
        }


        this.musicStarting = true;


        try {

            // ---------------------------------
            // Make sure audio is at beginning
            // ---------------------------------

            if (this.music.ended) {

                this.music.currentTime = 0;

            }


            // ---------------------------------
            // PLAY
            // ---------------------------------

            await this.music.play();


            // ---------------------------------
            // Music is now the master clock
            // ---------------------------------

            this.timelineStartTime =
                this.ctx.currentTime;


            console.log(
                "🎵 GameStorm Theme Playing"
            );

            console.log(
                "🎵 Music currentTime:",
                this.music.currentTime
            );

            console.log(
    "🎵 Music URL:",
    this.music.currentSrc || this.music.src
);

console.log(
    "🎵 Music Duration:",
    this.music.duration
);


            return true;

        } catch (error) {

            // ---------------------------------
            // AbortError can happen when
            // stopMusic() interrupts play()
            // ---------------------------------

            if (
                error &&
                error.name === "AbortError"
            ) {

                console.warn(
                    "⚠️ Music play was interrupted safely."
                );

                return false;

            }


            console.error(
                "❌ Music Play Error:",
                error
            );


            return false;

        } finally {

            this.musicStarting =
                false;

        }

    }


    // =========================================
    // STOP MUSIC
    // =========================================

    stopMusic() {

        if (!this.music) {
            return;
        }


        // -------------------------------------
        // Cancel pending start
        // -------------------------------------

        this.musicStarting =
            false;


        try {

            if (!this.music.paused) {

                this.music.pause();

            }


            // ---------------------------------
            // Reset music position
            // ---------------------------------

            this.music.currentTime =
                0;


        } catch (error) {

            console.warn(
                "⚠️ Music Stop Warning:",
                error
            );

        }


        console.log(
            "⏹️ GameStorm Theme Stopped"
        );

    }


    // =========================================
    // MUSIC VOLUME
    // =========================================

    setMusicVolume(value) {

        if (
            !this.musicGain ||
            !this.ctx
        ) {
            return;
        }


        const safeValue =
            Math.max(
                0,
                Math.min(
                    1,
                    value
                )
            );


        this.musicGain.gain.setTargetAtTime(
            safeValue,
            this.ctx.currentTime,
            0.02
        );

    }


    // =========================================
    // SFX VOLUME
    // =========================================

    setSFXVolume(value) {

        if (
            !this.sfxGain ||
            !this.ctx
        ) {
            return;
        }


        const safeValue =
            Math.max(
                0,
                Math.min(
                    1,
                    value
                )
            );


        this.sfxGain.gain.setTargetAtTime(
            safeValue,
            this.ctx.currentTime,
            0.02
        );

    }


    // =========================================
    // MASTER VOLUME
    // =========================================

    setVolume(value) {

        if (
            !this.master ||
            !this.ctx
        ) {
            return;
        }


        this.volume =
            Math.max(
                0,
                Math.min(
                    1,
                    value
                )
            );


        this.master.gain.setTargetAtTime(
            this.volume,
            this.ctx.currentTime,
            0.02
        );

    }


       // =========================================
    // CURRENT AUDIO TIME
    // =========================================

    getTime() {

        // =====================================
        // DETERMINISTIC OFFLINE RENDER CLOCK
        // =====================================

        if (
            typeof window !== "undefined" &&
            window.__GAMESTORM_RENDER_MODE__ === true &&
            Number.isFinite(
                window.__GAMESTORM_RENDER_TIME__
            )
        ) {

            return Math.max(
                0,
                window.__GAMESTORM_RENDER_TIME__
            );

        }


        // =====================================
        // AUDIO NOT STARTED
        // =====================================

        if (
            !this.ctx ||
            !this.started
        ) {

            return 0;

        }


        // =====================================
        // REAL MP3 = MASTER CLOCK
        // =====================================

        if (this.music) {

            return Math.max(
                0,
                this.music.currentTime
            );

        }


        // =====================================
        // FALLBACK CLOCK
        // =====================================

        return Math.max(
            0,
            this.ctx.currentTime -
            this.timelineStartTime
        );

    }

    // =========================================
    // IS MUSIC PLAYING?
    // =========================================

    isMusicPlaying() {

        return !!(
            this.music &&
            !this.music.paused &&
            !this.music.ended
        );

    }


    // =========================================
    // STOP EVERYTHING
    // =========================================

    stop() {

        this.stopMusic();


        this.started =
            false;


        console.log(
            "⏹️ GameStorm Audio Stopped"
        );

    }

}