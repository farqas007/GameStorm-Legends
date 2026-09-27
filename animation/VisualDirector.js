// =========================================
// GAMESTORM LEGENDS
// VISUAL DIRECTOR V2
// REAL MUSIC -> CINEMATIC VISUAL SYSTEM
// =========================================

export class VisualDirector {

    constructor() {

        this.lastSection =
            null;

        this.hitTimer =
            0;

        this.majorHitTimer =
            0;

        this.sectionTimer =
            0;

    }


    // =====================================
    // UPDATE
    // =====================================

    update(data) {

        if (!data) {
            return;
        }


        // =================================
        // SECTION CHANGE
        // =================================

        if (
            data.section &&
            data.section !== this.lastSection
        ) {

            this.onSectionChange(
                data.section
            );

            this.lastSection =
                data.section;

            this.sectionTimer =
                1;

        }


        // =================================
        // MUSIC HIT
        // =================================

        if (
            data.strongHit
        ) {

            this.hitTimer =
                1;

        }


        // =================================
        // MAJOR HIT
        // =================================

        if (
            data.majorHit
        ) {

            this.majorHitTimer =
                1;

        }


        // =================================
        // DECAY
        // =================================

        this.hitTimer *=
            0.82;

        this.majorHitTimer *=
            0.72;

        this.sectionTimer *=
            0.94;


        // =================================
        // MUSIC CORE
        // =================================

        this.setVariable(
            "--music-energy",
            data.energy || 0
        );

        this.setVariable(
            "--music-intensity",
            data.intensity || 0
        );

        this.setVariable(
            "--music-density",
            data.density || 0
        );

        this.setVariable(
            "--music-momentum",
            data.momentum || 0
        );

        this.setVariable(
            "--music-build",
            data.build || 0
        );

        this.setVariable(
            "--music-impact",
            data.impact || 0
        );


        // =================================
        // TRANSIENT EFFECTS
        // =================================

        this.setVariable(
            "--music-pulse",
            data.pulse || 0
        );

        this.setVariable(
            "--music-glitch",
            data.glitch || 0
        );

        this.setVariable(
            "--music-particles",
            data.particles || 0
        );

        this.setVariable(
            "--music-flash",
            data.flash || 0
        );

        this.setVariable(
            "--music-hit",
            this.hitTimer
        );

        this.setVariable(
            "--music-major-hit",
            this.majorHitTimer
        );

        this.setVariable(
            "--music-section-change",
            this.sectionTimer
        );


        // =================================
        // BODY CLASSES
        // =================================

        document.body.classList.toggle(
            "music-hit",
            !!data.strongHit
        );

        document.body.classList.toggle(
            "music-major-hit",
            !!data.majorHit
        );


        // =================================
        // EMOTION
        // =================================

        this.applyEmotion(
            data.emotion
        );

    }


    // =====================================
    // SECTION CHANGE
    // =====================================

    onSectionChange(section) {

        document.body.dataset.musicSection =
            section;

        console.log(
            "🎬 VISUAL SECTION:",
            section
        );

    }


    // =====================================
    // EMOTION
    // =====================================

    applyEmotion(emotion) {

        document.body.dataset.musicEmotion =
            emotion || "dark";

    }


    // =====================================
    // CSS VARIABLE
    // =====================================

    setVariable(
        name,
        value
    ) {

        document.documentElement.style
            .setProperty(
                name,
                value
            );

    }


    // =====================================
    // RESET
    // =====================================

    reset() {

        const variables = [

            "--music-energy",
            "--music-intensity",
            "--music-density",
            "--music-momentum",
            "--music-build",
            "--music-impact",
            "--music-pulse",
            "--music-glitch",
            "--music-particles",
            "--music-flash",
            "--music-hit",
            "--music-major-hit",
            "--music-section-change"

        ];


        for (
            const variable of variables
        ) {

            this.setVariable(
                variable,
                0
            );

        }


        document.body.classList.remove(
            "music-hit",
            "music-major-hit"
        );

    }

}