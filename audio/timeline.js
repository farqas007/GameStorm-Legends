// =========================================
// GAMESTORM LEGENDS — AUDIO TIMELINE V3 FINAL
// CINEMATIC / GAMING / HACKER / LOGO
// 92.447 SECOND SYNCHRONIZED AUDIO
// =========================================
import { MUSIC_MAP } from "../musicMap.js";

export class AudioTimeline {

    constructor(audio, music, sfx) {

        this.audio = audio;
        this.music = music;
        this.sfx = sfx;

        this.events = [];

        this.started = false;

        this.timer = null;

        this.lastTime = -1;

        // Exact intro duration
        this.duration = MUSIC_MAP.duration;

    }


    // =========================================
    // SAFE SFX CALL
    // =========================================

    play(effect, ...args) {

        if (
            !this.sfx ||
            typeof this.sfx[effect] !== "function"
        ) {

            console.warn(
                `⚠️ SFX method not found: ${effect}`
            );

            return;

        }

        try {

            this.sfx[effect](...args);

        } catch (error) {

            console.error(
                `❌ SFX Error: ${effect}`,
                error
            );

        }

    }


    // =========================================
    // SAFE MUSIC CALL
    // =========================================

    musicMode(mode) {

        if (
            !this.music ||
            typeof this.music[mode] !== "function"
        ) {

            console.warn(
                `⚠️ Music method not found: ${mode}`
            );

            return;

        }

        try {

            this.music[mode]();

        } catch (error) {

            console.error(
                `❌ Music Error: ${mode}`,
                error
            );

        }

    }


    // =========================================
    // BUILD TIMELINE
    // =========================================

    build() {

        this.events = [

            // =====================================
            // SCENE 1 — INTRO / HACKER
            // 0s → 5s
            // =====================================

            {
                time: 0.05,

                action: () => {

                    this.musicMode("intro");

                    this.play(
                        "reverseWhoosh"
                    );

                }

            },

            {
                time: 0.30,

                action: () => {

                    this.play(
                        "hackerGlitch"
                    );

                }

            },

            {
                time: 0.80,

                action: () => {

                    this.play(
                        "digitalClick"
                    );

                }

            },

            {
                time: 1.00,

                action: () => {

                    this.play(
                        "cinematicHit"
                    );

                }

            },

            {
                time: 1.45,

                action: () => {

                    this.play(
                        "dataSweep"
                    );

                }

            },

            {
                time: 2.15,

                action: () => {

                    this.play(
                        "lightning"
                    );

                }

            },

            {
                time: 2.65,

                action: () => {

                    this.play(
                        "electricCrackle"
                    );

                }

            },

            {
                time: 3.00,

                action: () => {

                    this.play(
                        "lightning"
                    );

                }

            },

            {
                time: 3.40,

                action: () => {

                    this.play(
                        "hackerGlitch"
                    );

                }

            },

            {
                time: 4.00,

                action: () => {

                    this.musicMode("tension");

                    this.play(
                        "riser"
                    );

                }

            },

            {
                time: 4.65,

                action: () => {

                    this.play(
                        "shortRiser"
                    );

                }

            },


            // =====================================
            // SCENE 2 — LIKE
            // 5s → 7s
            // =====================================

            {
                time: 5.00,

                action: () => {

                    this.play(
                        "transitionHit"
                    );

                }

            },

            {
                time: 5.35,

                action: () => {

                    this.play(
                        "digitalClick"
                    );

                }

            },

            {
                time: 5.75,

                action: () => {

                    this.play(
                        "pop"
                    );

                }

            },

            {
                time: 6.30,

                action: () => {

                    this.play(
                        "fastWhoosh"
                    );

                }

            },

            {
                time: 6.70,

                action: () => {

                    this.play(
                        "airBurst"
                    );

                }

            },


            // =====================================
            // SCENE 3 — SHARE
            // 7s → 9s
            // =====================================

            {
                time: 7.00,

                action: () => {

                    this.play(
                        "fastWhoosh"
                    );

                    this.play(
                        "gamingImpact"
                    );

                }

            },

            {
                time: 7.40,

                action: () => {

                    this.play(
                        "digitalClick"
                    );

                }

            },

            {
                time: 7.80,

                action: () => {

                    this.play(
                        "dataSweep"
                    );

                }

            },

            {
                time: 8.20,

                action: () => {

                    this.play(
                        "energyPulse"
                    );

                }

            },

            {
                time: 8.60,

                action: () => {

                    this.play(
                        "fastWhoosh"
                    );

                }

            },


            // =====================================
            // SCENE 4 — YOUTUBE
            // 9s → 15s
            // =====================================

            {
                time: 9.00,

                action: () => {

                    this.play(
                        "youtubeHit"
                    );

                }

            },

            {
                time: 9.40,

                action: () => {

                    this.play(
                        "notification"
                    );

                }

            },

            {
                time: 10.00,

                action: () => {

                    this.play(
                        "keyboardTyping",
                        5
                    );

                }

            },

            {
                time: 10.80,

                action: () => {

                    this.play(
                        "whoosh"
                    );

                }

            },

            {
                time: 11.30,

                action: () => {

                    this.play(
                        "digitalRise"
                    );

                }

            },

            {
                time: 12.00,

                action: () => {

                    this.musicMode("tension");

                    this.play(
                        "riser"
                    );

                }

            },

            {
                time: 12.80,

                action: () => {

                    this.play(
                        "electricZap"
                    );

                }

            },

            {
                time: 13.30,

                action: () => {

                    this.play(
                        "glitch"
                    );

                }

            },

            {
                time: 14.20,

                action: () => {

                    this.play(
                        "bigImpact"
                    );

                }

            },

            {
                time: 14.70,

                action: () => {

                    this.play(
                        "fastWhoosh"
                    );

                }

            },


            // =====================================
            // SCENE 5 — TARGET / MOUSE
            // 15s → 19s
            // =====================================

            {
                time: 15.00,

                action: () => {

                    this.play(
                        "scannerBeep"
                    );

                }

            },

            {
                time: 15.35,

                action: () => {

                    this.play(
                        "scan"
                    );

                }

            },

            {
                time: 15.75,

                action: () => {

                    this.play(
                        "targetBeep"
                    );

                }

            },

            {
                time: 16.15,

                action: () => {

                    this.play(
                        "digitalClick"
                    );

                }

            },

            {
                time: 16.50,

                action: () => {

                    this.play(
                        "targetBeep"
                    );

                }

            },

            {
                time: 16.90,

                action: () => {

                    this.play(
                        "scannerBeep"
                    );

                }

            },

            {
                time: 17.20,

                action: () => {

                    this.play(
                        "targetBeep"
                    );

                }

            },

            {
                time: 17.50,

                action: () => {

                    this.play(
                        "targetLock"
                    );

                }

            },

            {
                time: 17.90,

                action: () => {

                    this.play(
                        "mouseDoubleClick"
                    );

                }

            },

            {
                time: 18.20,

                action: () => {

                    this.musicMode("drop");

                    this.play(
                        "riser"
                    );

                }

            },

            {
                time: 18.72,

                action: () => {

                    this.play(
                        "shortRiser"
                    );

                }

            },


            // =====================================
            // SCENE 6 — GAMING ROOM
            // 19s → 22s
            // =====================================

            {
                time: 19.00,

                action: () => {

                    this.musicMode("drop");

                    this.play(
                        "gamingImpact"
                    );

                }

            },

            {
                time: 19.25,

                action: () => {

                    this.play(
                        "electricCrackle"
                    );

                }

            },

            {
                time: 19.65,

                action: () => {

                    this.play(
                        "glitch"
                    );

                }

            },

            {
                time: 20.00,

                action: () => {

                    this.play(
                        "bigImpact"
                    );

                }

            },

            {
                time: 20.35,

                action: () => {

                    this.play(
                        "electricZap"
                    );

                }

            },

            {
                time: 20.65,

                action: () => {

                    this.play(
                        "hackerGlitch"
                    );

                }

            },

            {
                time: 21.00,

                action: () => {

                    this.play(
                        "bigImpact"
                    );

                }

            },

            {
                time: 21.40,

                action: () => {

                    this.play(
                        "fastWhoosh"
                    );

                }

            },

            {
                time: 21.72,

                action: () => {

                    this.musicMode("finalBuild");

                    this.play(
                        "shortRiser"
                    );

                }

            },


            // =====================================
           // FINAL — GAMESTORM LEGENDS
// 22s → 92.447s
            // =====================================

            {
                time: 22.00,

                action: () => {

                    this.musicMode("finalBuild");

                    this.play(
                        "logoImpact"
                    );

                }

            },

            {
                time: 22.55,

                action: () => {

                    this.play(
                        "energyPulse"
                    );

                }

            },

            {
                time: 23.10,

                action: () => {

                    this.play(
                        "dataSweep"
                    );

                }

            },

            {
                time: 23.65,

                action: () => {

                    this.play(
                        "electricCrackle"
                    );

                }

            },

            {
                time: 24.00,

                action: () => {

                    this.play(
                        "lightning"
                    );

                }

            },

            {
                time: 24.55,

                action: () => {

                    this.play(
                        "lowRumble",
                        0.8
                    );

                }

            },

            {
                time: 25.15,

                action: () => {

                    this.play(
                        "hackerGlitch"
                    );

                }

            },

            {
                time: 25.65,

                action: () => {

                    this.play(
                        "digitalRise"
                    );

                }

            },

            {
                time: 26.00,

                action: () => {

                    this.play(
                        "riser"
                    );

                }

            },

            {
                time: 26.70,

                action: () => {

                    this.play(
                        "electricZap"
                    );

                }

            },

            {
                time: 27.20,

                action: () => {

                    this.play(
                        "fastWhoosh"
                    );

                }

            },

            {
                time: 27.70,

                action: () => {

                    this.play(
                        "shortRiser"
                    );

                }

            },

            {
                time: 28.10,

                action: () => {

                    this.play(
                        "lightning"
                    );

                }

            },

            {
                time: 28.45,

                action: () => {

                    this.play(
                        "finalExplosion"
                    );

                }

            },

            {
                time: 28.88,

                action: () => {

                    this.play(
                        "finalImpact"
                    );

                }

            }

        ];


        // =========================================
        // SORT EVENTS
        // =========================================

        this.events.sort(
            (a, b) =>
                a.time - b.time
        );

    }


    // =========================================
    // START
    // =========================================

    start() {

        if (this.started) {
            return;
        }

        if (
            !this.audio ||
            !this.audio.started
        ) {

            console.warn(
                "⚠️ Audio must be started first."
            );

            return;

        }

        this.build();

        this.started = true;

        this.lastTime = -1;

        this.timer = null;

        this.tick();

        console.log(
            "🎬 GameStorm Audio Timeline V3 FINAL Started"
        );

    }


    // =========================================
    // TIMELINE TICK
    // =========================================

    tick() {

        if (!this.started) {
            return;
        }

        if (
            !this.audio ||
            !this.audio.started
        ) {

            this.timer = null;

            return;

        }


        // =========================================
        // CURRENT AUDIO TIME
        // =========================================

        const time =
            Number(
                this.audio.getTime()
            ) || 0;


        // =========================================
        // FINAL STOP
        // =========================================

        if (
            time >= this.duration
        ) {

            this.stop();

            console.log(
                "🏁 GameStorm Legends Audio Timeline Finished"
            );

            return;

        }


        // =========================================
        // FIRE EVENTS
        // =========================================

        for (
            const event of this.events
        ) {

            const shouldFire =
                event.time > this.lastTime &&
                event.time <= time;

            if (!shouldFire) {
                continue;
            }

            console.log(
                `🎬 Audio Event: ${event.time.toFixed(2)}s`
            );

            try {

                event.action();

            } catch (error) {

                console.error(
                    "❌ Audio Event Error:",
                    error
                );

            }

        }


        // =========================================
        // UPDATE TIME
        // =========================================

        this.lastTime =
            time;


        // =========================================
        // NEXT FRAME
        // =========================================

        this.timer =
            requestAnimationFrame(
                () => this.tick()
            );

    }


    // =========================================
    // STOP
    // =========================================

    stop() {

        this.started = false;


        // Cancel timeline frame
        if (
            this.timer !== null
        ) {

            cancelAnimationFrame(
                this.timer
            );

        }

        this.timer = null;


        // Reset event position
        this.lastTime = -1;


        // Stop SFX
        if (
            this.sfx &&
            typeof this.sfx.stop === "function"
        ) {

            this.sfx.stop();

        }


        // Stop coded music
        if (
            this.music &&
            typeof this.music.stop === "function"
        ) {

            this.music.stop();

        }


        console.log(
            "⏹️ GameStorm Audio Timeline Stopped"
        );

    }


    // =========================================
    // RESET
    // =========================================

    reset() {

        this.lastTime = -1;

        this.timer = null;

        console.log(
            "🔄 GameStorm Audio Timeline Reset"
        );

    }


    // =========================================
    // GET CURRENT TIME
    // =========================================

    getTime() {

        if (
            !this.audio ||
            !this.audio.started
        ) {

            return 0;

        }

        const time =
            Number(
                this.audio.getTime()
            ) || 0;

        return Math.min(
            Math.max(time, 0),
            this.duration
        );

    }

}