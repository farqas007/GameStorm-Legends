// =========================================
// GAMESTORM LEGENDS — MUSIC ENGINE
// =========================================

export class MusicEngine {

    constructor(audio) {

        this.audio = audio;

        this.ctx = null;
        this.master = null;

        this.started = false;

        this.beatTimer = null;
        this.ambientOsc = null;

        this.bpm = 110;
        this.beat = 60 / this.bpm;

        this.step = 0;

        this.mode = "intro";

    }


    // =========================================
    // INITIALIZE
    // =========================================

    init() {

    if (this.ctx) {
        return;
    }

    this.ctx = this.audio.ctx;

    this.master =
        this.ctx.createGain();

    this.master.gain.value = 1.0;

    // Directly to AudioEngine music bus
    this.master.connect(
        this.audio.musicGain
    );

    console.log(
        "🎵 Music output connected"
    );

}

    // =========================================
    // START
    // =========================================

    start() {

        this.init();

        if (!this.ctx) {
            console.warn(
                "⚠️ Music Engine: AudioContext unavailable"
            );
            return;
        }

        if (!this.audio.started) {
            console.warn(
                "⚠️ Music Engine: Audio must start first"
            );
            return;
        }

        if (this.started) {
            return;
        }

        this.started = true;

        this.mode = "intro";
        this.step = 0;

        const now =
            this.ctx.currentTime;

        this.master.gain.cancelScheduledValues(
            now
        );

        this.master.gain.setValueAtTime(
            0,
            now
        );

        this.master.gain.linearRampToValueAtTime(
            0.42,
            now + 0.8
        );


        this.createAmbient();

        this.startBeat();


        console.log(
            "🎵 Music Engine Started"
        );

    }


    // =========================================
    // AMBIENT
    // =========================================

    createAmbient() {

        if (!this.started) {
            return;
        }

        const osc =
            this.ctx.createOscillator();

        const gain =
            this.ctx.createGain();

        const filter =
            this.ctx.createBiquadFilter();


        osc.type =
            "sine";

        osc.frequency.value =
            55;


        filter.type =
            "lowpass";

        filter.frequency.value =
            220;


        gain.gain.value =
            0.08;


        osc.connect(filter);

        filter.connect(gain);

        gain.connect(
            this.master
        );


        osc.start();

        this.ambientOsc =
            osc;

    }


    // =========================================
    // BEAT LOOP
    // =========================================

    startBeat() {

        if (!this.started) {
            return;
        }

        this.playBeat();

        this.beatTimer =
            setTimeout(
                () => this.startBeat(),
                this.beat * 1000
            );

    }


    // =========================================
    // PLAY BEAT
    // =========================================

    playBeat() {

        if (!this.started) {
            return;
        }

        const now =
            this.ctx.currentTime;


        // =====================================
        // BASS
        // =====================================

        let bassFrequency = 55;

        if (this.mode === "tension") {
            bassFrequency = 65;
        }

        if (this.mode === "drop") {
            bassFrequency = 45;
        }

        if (this.mode === "final") {
            bassFrequency = 55;
        }


        const bass =
            this.ctx.createOscillator();

        const bassGain =
            this.ctx.createGain();


        bass.type =
            "sawtooth";

        bass.frequency.setValueAtTime(
            bassFrequency,
            now
        );


        bassGain.gain.setValueAtTime(
            0.0001,
            now
        );

        bassGain.gain.exponentialRampToValueAtTime(
            this.mode === "drop"
                ? 0.28
                : 0.18,
            now + 0.015
        );

        bassGain.gain.exponentialRampToValueAtTime(
            0.001,
            now + 0.30
        );


        bass.connect(
            bassGain
        );

        bassGain.connect(
            this.master
        );


        bass.start(now);

        bass.stop(
            now + 0.35
        );


        // =====================================
        // SYNTH NOTES
        // =====================================

        let notes;


        if (this.mode === "intro") {

            notes = [
                110,
                130.81,
                146.83,
                164.81
            ];

        } else if (this.mode === "tension") {

            notes = [
                146.83,
                155.56,
                164.81,
                174.61
            ];

        } else if (this.mode === "drop") {

            notes = [
                73.42,
                82.41,
                98.00,
                110
            ];

        } else {

            notes = [
                110,
                130.81,
                146.83,
                196.00,
                164.81,
                146.83
            ];

        }


        const note =
            notes[
                this.step %
                notes.length
            ];

        this.step++;


        const osc =
            this.ctx.createOscillator();

        const gain =
            this.ctx.createGain();

        const filter =
            this.ctx.createBiquadFilter();


        osc.type =
            this.mode === "drop"
                ? "sawtooth"
                : "square";


        osc.frequency.value =
            note;


        filter.type =
            "lowpass";

        filter.frequency.value =
            this.mode === "final"
                ? 1800
                : 1300;


        const noteVolume =
            this.mode === "drop"
                ? 0.12
                : this.mode === "final"
                    ? 0.10
                    : 0.07;


        gain.gain.setValueAtTime(
            0.0001,
            now
        );

        gain.gain.exponentialRampToValueAtTime(
            noteVolume,
            now + 0.01
        );

        gain.gain.exponentialRampToValueAtTime(
            0.001,
            now + 0.20
        );


        osc.connect(filter);

        filter.connect(gain);

        gain.connect(
            this.master
        );


        osc.start(now);

        osc.stop(
            now + 0.25
        );

    }


    // =========================================
    // INTRO
    // =========================================

    intro() {

        if (!this.started) {
            return;
        }

        this.mode =
            "intro";

        console.log(
            "🎬 Music Intro"
        );

    }


    // =========================================
    // TENSION
    // =========================================

    tension() {

        if (!this.started) {
            return;
        }

        this.mode =
            "tension";

        console.log(
            "⚡ Music Tension"
        );

        this.playRiser();

    }


    // =========================================
    // DROP
    // =========================================

    drop() {

        if (!this.started) {
            return;
        }

        this.mode =
            "drop";

        console.log(
            "💥 Music Drop"
        );

        this.playDrop();

    }


    // =========================================
    // FINAL BUILD
    // =========================================

    finalBuild() {

        if (!this.started) {
            return;
        }

        this.mode =
            "final";

        console.log(
            "🔥 Music Final Build"
        );

        this.playRiser();

    }


    // =========================================
    // RISER
    // =========================================

    playRiser() {

        if (!this.started) {
            return;
        }

        const now =
            this.ctx.currentTime;

        const osc =
            this.ctx.createOscillator();

        const gain =
            this.ctx.createGain();

        const filter =
            this.ctx.createBiquadFilter();


        osc.type =
            "sawtooth";


        osc.frequency.setValueAtTime(
            80,
            now
        );

        osc.frequency.exponentialRampToValueAtTime(
            1400,
            now + 1.5
        );


        filter.type =
            "lowpass";

        filter.frequency.setValueAtTime(
            250,
            now
        );

        filter.frequency.exponentialRampToValueAtTime(
            5000,
            now + 1.5
        );


        gain.gain.setValueAtTime(
            0.0001,
            now
        );

        gain.gain.exponentialRampToValueAtTime(
            0.20,
            now + 1.2
        );

        gain.gain.exponentialRampToValueAtTime(
            0.001,
            now + 1.5
        );


        osc.connect(filter);

        filter.connect(gain);

        gain.connect(
            this.master
        );


        osc.start(now);

        osc.stop(
            now + 1.6
        );

    }


    // =========================================
    // DROP SOUND
    // =========================================

    playDrop() {

        if (!this.started) {
            return;
        }

        const now =
            this.ctx.currentTime;


        const osc =
            this.ctx.createOscillator();

        const gain =
            this.ctx.createGain();


        osc.type =
            "sine";


        osc.frequency.setValueAtTime(
            110,
            now
        );

        osc.frequency.exponentialRampToValueAtTime(
            35,
            now + 0.5
        );


        gain.gain.setValueAtTime(
            0.0001,
            now
        );

        gain.gain.exponentialRampToValueAtTime(
            0.75,
            now + 0.015
        );

        gain.gain.exponentialRampToValueAtTime(
            0.001,
            now + 0.5
        );


        osc.connect(
            gain
        );

        gain.connect(
            this.master
        );


        osc.start(now);

        osc.stop(
            now + 0.55
        );

    }


    // =========================================
    // STOP
    // =========================================

    stop() {

        this.started =
            false;


        if (this.beatTimer !== null) {

            clearTimeout(
                this.beatTimer
            );

            this.beatTimer =
                null;

        }


        if (this.ambientOsc) {

            try {

                this.ambientOsc.stop();

            } catch {}

            this.ambientOsc =
                null;

        }


        if (
            this.master &&
            this.ctx
        ) {

            const now =
                this.ctx.currentTime;

            this.master.gain.cancelScheduledValues(
                now
            );

            this.master.gain.setTargetAtTime(
                0,
                now,
                0.08
            );

        }


        console.log(
            "⏹️ Music Engine Stopped"
        );

    }

}