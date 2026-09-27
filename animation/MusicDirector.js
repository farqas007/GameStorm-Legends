// =========================================
// GAMESTORM LEGENDS
// MUSIC DIRECTOR V2
// REAL MUSIC -> CINEMATIC VISUAL CONTROL
// =========================================

import { MUSIC_MAP } from "../musicMap.js";
import { MUSIC_TIMELINE } from "../musicTimeline.js";


export class MusicDirector {

    constructor() {

        this.currentSection = null;
        this.previousSection = null;

        this.currentEventIndex = -1;
        this.lastProcessedEventIndex = -1;
        this.nextEventIndex = 0;

        this.previousTime = 0;

        this.onsetHistory = [];

        this.state = this.createInitialState();

    }


    // =====================================
    // INITIAL STATE
    // =====================================

    createInitialState() {

        return {

            time: 0,

            energy: 0,
            intensity: 0,

            emotion: "dark",
            section: "INTRO",

            beat: false,
            onset: false,

            strongHit: false,
            majorHit: false,

            pulse: 0,

            cameraShake: 0,
            cameraZoom: 0,

            glitch: 0,
            particles: 0,
            flash: 0,

            // NEW V2
            momentum: 0,
            density: 0,
            build: 0,
            impact: 0

        };

    }


    // =====================================
    // UPDATE
    // =====================================

    update(time) {

        const safeTime =
            Number.isFinite(time)
                ? time
                : 0;


        this.state.time =
            safeTime;


        // =================================
        // SECTION
        // =================================

        const section =
            this.getSection(
                safeTime
            );


        if (section) {

            if (
                this.currentSection &&
                this.currentSection.name !== section.name
            ) {

                this.previousSection =
                    this.currentSection;

            }

            this.currentSection =
                section;

            this.state.section =
                section.name;

            this.state.emotion =
                section.emotion;

        }


        // =================================
        // CURRENT MUSIC EVENT
        // =================================

        const event =
            this.getMusicEvent(
                safeTime
            );


        if (!event) {

            this.resetTransientState();

            this.previousTime =
                safeTime;

            return this.state;

        }


        // =================================
        // EVENT DATA
        // =================================

        const energy =
            this.clamp(
                Number(event.energy) || 0,
                0,
                1
            );


        const beat =
            Number(event.beat) === 1;


        const onset =
            Number(event.onset) === 1;


        const newEvent =
            event.index !==
            this.lastProcessedEventIndex;


        if (newEvent) {

            this.lastProcessedEventIndex =
                event.index;

        }


        // =================================
        // BASE MUSIC STATE
        // =================================

        this.state.energy =
            energy;


        this.state.intensity =
            this.getIntensity(
                energy
            );


        this.state.beat =
            beat;


        this.state.onset =
            newEvent &&
            onset;


        // =================================
        // ONSET DENSITY
        // =================================

        if (
            newEvent &&
            onset
        ) {

            this.onsetHistory.push(
                safeTime
            );

        }


        this.removeOldOnsets(
            safeTime
        );


        this.state.density =
            this.getDensity();


        // =================================
        // MOMENTUM
        // =================================

        this.state.momentum =
            this.getMomentum(
                energy,
                this.state.density
            );


        // =================================
        // BUILD
        // =================================

        this.state.build =
            this.getBuild(
                this.state.momentum,
                this.state.section
            );


        // =================================
        // HIT CLASSIFICATION
        // =================================

        this.state.strongHit =
            newEvent &&
            onset &&
            energy >= 0.30;


        this.state.majorHit =
            newEvent &&
            onset &&
            (
                energy >= 0.60 ||
                (
                    energy >= 0.45 &&
                    this.state.density >= 0.30
                )
            );


        // =================================
        // IMPACT
        // =================================

        if (
            this.state.majorHit
        ) {

            this.state.impact =
                this.clamp(
                    energy +
                    this.state.density * 0.35,
                    0,
                    1
                );

        }

        else if (
            this.state.strongHit
        ) {

            this.state.impact =
                this.clamp(
                    energy * 0.75,
                    0,
                    1
                );

        }

        else {

            this.state.impact *=
                0.88;

        }


        // =================================
        // PULSE
        // =================================

        if (
            newEvent &&
            onset
        ) {

            this.state.pulse =
                this.clamp(
                    energy * 1.45,
                    0,
                    1
                );

        }

        else {

            this.state.pulse *=
                0.90;

        }


        // =================================
        // CAMERA
        // =================================

        this.state.cameraZoom =
            this.getCameraZoom(
                energy,
                this.state.momentum,
                this.state.majorHit,
                this.state.section
            );


        this.state.cameraShake =
            this.getCameraShake(
                energy,
                this.state.density,
                this.state.majorHit,
                this.state.strongHit
            );


        // =================================
        // GLITCH
        // =================================

        this.state.glitch =
            this.getGlitch(
                energy,
                this.state.density,
                this.state.majorHit,
                this.state.section
            );


        // =================================
        // PARTICLES
        // =================================

        this.state.particles =
            this.getParticles(
                energy,
                this.state.density,
                this.state.section
            );


        // =================================
        // FLASH
        // =================================

        if (
            this.state.majorHit
        ) {

            this.state.flash =
                this.clamp(
                    energy * 0.95,
                    0,
                    1
                );

        }

        else if (
            this.state.strongHit
        ) {

            this.state.flash =
                this.clamp(
                    energy * 0.38,
                    0,
                    1
                );

        }

        else {

            this.state.flash *=
                0.82;

        }


        // =================================
        // DEBUG
        // =================================

        if (
            this.state.majorHit
        ) {

            console.log(
                "🎬 MUSIC DIRECTOR V2 — MAJOR HIT",
                {
                    time:
                        safeTime.toFixed(3),

                    section:
                        this.state.section,

                    energy:
                        energy.toFixed(3),

                    density:
                        this.state.density.toFixed(3),

                    momentum:
                        this.state.momentum.toFixed(3),

                    build:
                        this.state.build.toFixed(3),

                    impact:
                        this.state.impact.toFixed(3),

                    cameraShake:
                        this.state.cameraShake.toFixed(3),

                    cameraZoom:
                        this.state.cameraZoom.toFixed(3),

                    glitch:
                        this.state.glitch.toFixed(3),

                    particles:
                        this.state.particles.toFixed(3),

                    flash:
                        this.state.flash.toFixed(3)

                }
            );

        }


        this.previousTime =
            safeTime;


        return this.state;

    }


    // =====================================
    // SECTION
    // =====================================

    getSection(time) {

        for (
            const section of MUSIC_MAP.sections
        ) {

            if (
                time >= section.start &&
                time < section.end
            ) {

                return section;

            }

        }

        return null;

    }


    // =====================================
    // MUSIC EVENT
    // =====================================

    getMusicEvent(time) {

        const timeline =
            MUSIC_TIMELINE;


        const length =
            timeline.length;


        if (
            length === 0
        ) {

            return null;

        }


        // BEFORE FIRST EVENT

        if (
            time <
            timeline[0].time
        ) {

            this.nextEventIndex =
                0;

            this.currentEventIndex =
                -1;

            return null;

        }


        // FAST FORWARD

        while (
            this.nextEventIndex <
            length &&
            timeline[
                this.nextEventIndex
            ].time <= time
        ) {

            this.currentEventIndex =
                this.nextEventIndex;

            this.nextEventIndex++;

        }


        if (
            this.currentEventIndex <
            0
        ) {

            return null;

        }


        const event =
            timeline[
                this.currentEventIndex
            ];


        return {

            ...event,

            index:
                this.currentEventIndex

        };

    }


    // =====================================
    // INTENSITY
    // =====================================

    getIntensity(
        energy
    ) {

        return this.clamp(
            energy * 1.15,
            0,
            1
        );

    }


    // =====================================
    // DENSITY
    // =====================================

    getDensity() {

        const count =
            this.onsetHistory.length;


        // Tuned for the analyzed track.
        // 0 = almost empty
        // 1 = very dense

        return this.clamp(
            count / 12,
            0,
            1
        );

    }


    // =====================================
    // MOMENTUM
    // =====================================

    getMomentum(
        energy,
        density
    ) {

        return this.clamp(
            energy * 0.55 +
            density * 0.45,
            0,
            1
        );

    }


    // =====================================
    // BUILD
    // =====================================

    getBuild(
        momentum,
        section
    ) {

        if (
            section === "INTRO"
        ) {

            return momentum * 0.35;

        }


        if (
            section === "BUILD"
        ) {

            return this.clamp(
                momentum * 1.15,
                0,
                1
            );

        }


        if (
            section === "FIRST_PEAK" ||
            section === "MAIN_PEAK" ||
            section === "SECOND_PEAK"
        ) {

            return Math.max(
                momentum,
                0.65
            );

        }


        return momentum * 0.75;

    }


    // =====================================
    // CAMERA ZOOM
    // =====================================

    getCameraZoom(
        energy,
        momentum,
        majorHit,
        section
    ) {

        let zoom =
            energy * 0.055 +
            momentum * 0.025;


        if (
            section === "INTRO"
        ) {

            zoom *=
                0.55;

        }


        if (
            section === "BUILD"
        ) {

            zoom *=
                1.15;

        }


        if (
            section === "MAIN_PEAK" ||
            section === "SECOND_PEAK" ||
            section === "FINAL"
        ) {

            zoom *=
                1.25;

        }


        if (
            majorHit
        ) {

            zoom +=
                0.025;

        }


        return this.clamp(
            zoom,
            0,
            0.12
        );

    }


    // =====================================
    // CAMERA SHAKE
    // =====================================

    getCameraShake(
        energy,
        density,
        majorHit,
        strongHit
    ) {

        let value =
            energy * 0.20 +
            density * 0.18;


        if (
            strongHit
        ) {

            value +=
                energy * 0.25;

        }


        if (
            majorHit
        ) {

            value +=
                energy * 0.55;

        }


        return this.clamp(
            value,
            0,
            1
        );

    }


    // =====================================
    // GLITCH
    // =====================================

    getGlitch(
        energy,
        density,
        majorHit,
        section
    ) {

        let value =
            energy * 0.12 +
            density * 0.28;


        if (
            section === "TRANSITION"
        ) {

            value +=
                0.12;

        }


        if (
            section === "MAIN_PEAK"
        ) {

            value +=
                0.15;

        }


        if (
            majorHit
        ) {

            value +=
                0.45;

        }


        return this.clamp(
            value,
            0,
            1
        );

    }


    // =====================================
    // PARTICLES
    // =====================================

    getParticles(
        energy,
        density,
        section
    ) {

        let value =
            energy * 0.55 +
            density * 0.45;


        if (
            section === "INTRO"
        ) {

            value *=
                0.45;

        }


        if (
            section === "MAIN_PEAK" ||
            section === "SECOND_PEAK" ||
            section === "FINAL"
        ) {

            value *=
                1.15;

        }


        return this.clamp(
            value,
            0,
            1
        );

    }


    // =====================================
    // REMOVE OLD ONSETS
    // =====================================

    removeOldOnsets(
        currentTime
    ) {

        const window =
            2.5;


        while (
            this.onsetHistory.length &&
            this.onsetHistory[0] <
                currentTime - window
        ) {

            this.onsetHistory.shift();

        }

    }


    // =====================================
    // RESET
    // =====================================

    reset() {

        this.currentSection =
            null;

        this.previousSection =
            null;

        this.currentEventIndex =
            -1;

        this.lastProcessedEventIndex =
            -1;

        this.nextEventIndex =
            0;

        this.previousTime =
            0;

        this.onsetHistory = [];

        this.state =
            this.createInitialState();

    }


    // =====================================
    // TRANSIENT RESET
    // =====================================

    resetTransientState() {

        this.state.beat =
            false;

        this.state.onset =
            false;

        this.state.strongHit =
            false;

        this.state.majorHit =
            false;

        this.state.pulse *=
            0.90;

        this.state.cameraShake *=
            0.88;

        this.state.glitch *=
            0.92;

        this.state.flash *=
            0.85;

        this.state.impact *=
            0.90;

    }


    // =====================================
    // CLAMP
    // =====================================

    clamp(
        value,
        min,
        max
    ) {

        return Math.min(
            Math.max(
                value,
                min
            ),
            max
        );

    }

}
