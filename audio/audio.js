// =========================================
// GAMESTORM LEGENDS — AUDIO ENGINE
// =========================================

// =====================================
// AUTOPLAY SUPPORT
// =====================================
//
// Browsers block unmuted autoplay until
// the user interacts with the page.
// ctx.resume() is then never resolved nor
// rejected, so the wait has to be bounded
// or the intro could never start.
// =====================================

const AUTOPLAY_RESUME_TIMEOUT = 500;


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

        this.muted = false;

        this.resumeBlocked = false;

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
            this.getMasterGain();


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
        //
        // Without a user gesture the autoplay
        // policy can keep the context suspended.
        // The wait is bounded so the intro can
        // still start, because the master clock
        // is the MP3 element, not the context.
        // =====================================

        if (
            this.ctx.state === "suspended"
        ) {

            const resumed =
                await this.resumeContext();


            if (!resumed) {

                return false;

            }


            if (
                this.ctx.state !== "running"
            ) {

                console.warn(
                    "⚠️ AudioContext suspended by autoplay policy. Sound starts on first user interaction."
                );

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
    // RESUME CONTEXT — BOUNDED WAIT
    // =========================================
    //
    // Resolves / rejects like the original
    // ctx.resume() call, except that a resume
    // that never settles (autoplay policy) is
    // reported as a soft success instead of
    // hanging the whole intro start.
    // =========================================

    async resumeContext() {

        if (!this.ctx) {

            return true;

        }


        if (
            this.ctx.state === "running"
        ) {

            this.resumeBlocked =
                false;

            return true;

        }


        // =====================================
        // ALREADY KNOWN TO BE BLOCKED
        // =====================================
        //
        // Waiting again would only delay the
        // intro. unlock() retries on the first
        // real user interaction.

        if (this.resumeBlocked) {

            return true;

        }


        // =====================================
        // RESUME, BOUNDED BY A TIMER
        // =====================================
        //
        // A blocked ctx.resume() never settles,
        // so it never rejects either. The
        // rejection handler below also keeps a
        // late rejection from surfacing as an
        // unhandled rejection after the timeout.

        const resume =
            Promise.resolve()
                .then(
                    () => this.ctx.resume()
                )
                .then(
                    () => ({ blocked: false }),
                    error => ({ error })
                );


        let timer =
            null;

        const timeout =
            new Promise(
                resolve => {

                    timer =
                        setTimeout(
                            () => resolve(
                                { blocked: true }
                            ),
                            AUTOPLAY_RESUME_TIMEOUT
                        );

                }
            );


        const result =
            await Promise.race([
                resume,
                timeout
            ]);


        if (timer !== null) {

            clearTimeout(timer);

        }


        if (result.error) {

            const error =
                result.error;


            // =================================
            // BLOCKED BY AUTOPLAY POLICY
            // =================================
            //
            // Not a real failure. The intro can
            // still run and the sound is turned
            // on by unlock() on first interaction.
            // =================================

            if (
                error.name === "NotAllowedError"
            ) {

                this.resumeBlocked =
                    true;

                console.warn(
                    "⚠️ AudioContext blocked by autoplay policy. Sound starts on first user interaction."
                );

                return true;

            }


            console.error(
                "❌ AudioContext Resume Error:",
                error
            );

            return false;

        }


        if (result.blocked) {

            this.resumeBlocked =
                true;

        }


        return true;

    }


    // =========================================
    // MASTER GAIN VALUE
    // =========================================

    getMasterGain() {

        if (this.muted) {

            return 0;

        }


        return this.volume;

    }


    // =========================================
    // MUTE / UNMUTE
    // =========================================
    //
    // The Web Audio master gain does the real
    // muting, because an element routed into
    // createMediaElementSource() is played
    // through the graph, not through the
    // element output.
    //
    // The element "muted" flag is mirrored
    // because browsers only allow autoplay
    // for a muted element.
    // =========================================

    setMuted(value) {

        this.muted =
            !!value;


        if (
            this.master &&
            this.ctx
        ) {

            this.master.gain.setTargetAtTime(
                this.getMasterGain(),
                this.ctx.currentTime,
                0.02
            );

        }


        if (this.music) {

            this.music.muted =
                this.muted;

        }


        return this.muted;

    }


    // =========================================
    // UNLOCK — FIRST USER GESTURE
    // =========================================
    //
    // Brings back the sound after a muted
    // autoplay. No timing is touched, so the
    // visuals stay in sync with the MP3.
    // =========================================

    async unlock() {

        if (!this.ctx) {

            return false;

        }


        // =====================================
        // SOUND FIRST
        // =====================================
        //
        // Unmuting does not depend on the
        // context running, so the sound is
        // released immediately. If the context
        // is still suspended the master gain
        // event is queued and applied as soon
        // as it resumes.

        if (this.muted) {

            this.setMuted(false);

            console.log(
                "🔊 GameStorm Sound Unlocked"
            );

        }


        // =====================================
        // THEN THE CONTEXT
        // =====================================

        this.resumeBlocked =
            false;

        await this.resumeContext();


        return this.ctx.state === "running";

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

        this.music.muted =
            this.muted;


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
            this.getMasterGain(),
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