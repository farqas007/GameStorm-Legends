// =========================================
// GAMESTORM LEGENDS — SFX ENGINE V3
// CINEMATIC / REALISTIC / GAMING / HACKER
// =========================================

export class SFXEngine {

    constructor(audio) {

        this.audio = audio;

        this.ctx = null;

        this.master = null;
        this.compressor = null;

        this.timers = [];

        this.noiseBuffer = null;

        this.defaultVolume = 1.0;

        this.enabled = true;

        this.initialized = false;

    }


    // =========================================
    // INITIALIZE
    // =========================================

    init() {

        if (this.initialized) {
            return;
        }

        if (!this.audio || !this.audio.ctx) {
            return;
        }

        this.ctx = this.audio.ctx;

        // -------------------------------------
        // MASTER
        // -------------------------------------

        this.master =
            this.ctx.createGain();

        this.master.gain.value =
            this.defaultVolume;


        // -------------------------------------
        // COMPRESSOR
        // -------------------------------------

        this.compressor =
            this.ctx.createDynamicsCompressor();

        this.compressor.threshold.value = -18;

        this.compressor.knee.value = 10;

        this.compressor.ratio.value = 5;

        this.compressor.attack.value = 0.003;

        this.compressor.release.value = 0.18;


        // -------------------------------------
        // OUTPUT
        // -------------------------------------

        this.master.connect(
            this.compressor
        );

        this.compressor.connect(
            this.audio.sfxGain
        );


        // -------------------------------------
        // NOISE
        // -------------------------------------

        this.createNoiseBuffer();

        this.initialized = true;

        console.log(
            "🔊 GameStorm Legends SFX V3 initialized"
        );

    }


    // =========================================
    // ENSURE
    // =========================================

    ensure() {

        this.init();

        if (!this.ctx) {
            return false;
        }

        if (!this.master) {
            return false;
        }

        if (!this.audio) {
            return false;
        }

        if (!this.audio.started) {
            return false;
        }

        if (!this.enabled) {
            return false;
        }

        const now =
            this.ctx.currentTime;

        this.master.gain.cancelScheduledValues(
            now
        );

        this.master.gain.setTargetAtTime(
            this.defaultVolume,
            now,
            0.015
        );

        return true;

    }


    // =========================================
    // NOISE BUFFER
    // =========================================

    createNoiseBuffer() {

        if (!this.ctx) {
            return;
        }

        if (this.noiseBuffer) {
            return;
        }

        const duration = 3;

        const buffer =
            this.ctx.createBuffer(
                1,
                Math.floor(
                    this.ctx.sampleRate *
                    duration
                ),
                this.ctx.sampleRate
            );

        const data =
            buffer.getChannelData(0);

        for (
            let i = 0;
            i < data.length;
            i++
        ) {

            data[i] =
                Math.random() * 2 - 1;

        }

        this.noiseBuffer =
            buffer;

    }


    // =========================================
    // NOISE SOURCE
    // =========================================

    noiseSource() {

        if (!this.ctx) {
            return null;
        }

        this.createNoiseBuffer();

        if (!this.noiseBuffer) {
            return null;
        }

        const source =
            this.ctx.createBufferSource();

        source.buffer =
            this.noiseBuffer;

        return source;

    }


    // =========================================
    // PAN NODE
    // =========================================

    panNode(value = 0) {

        if (!this.ctx) {
            return null;
        }

        const panner =
            this.ctx.createStereoPanner();

        panner.pan.value =
            Math.max(
                -1,
                Math.min(
                    1,
                    value
                )
            );

        return panner;

    }


    // =========================================
    // OSCILLATOR
    // =========================================

    osc(
        type,
        frequency,
        start,
        duration,
        volume = 0.2,
        endFrequency = null,
        pan = 0
    ) {

        if (!this.ctx || !this.master) {
            return;
        }

        const now =
            this.ctx.currentTime;

        const safeStart =
            Math.max(
                start,
                now
            );

        const safeDuration =
            Math.max(
                0.02,
                duration
            );

        const safeVolume =
            Math.max(
                0.0001,
                volume
            );

        const oscillator =
            this.ctx.createOscillator();

        const gain =
            this.ctx.createGain();

        const panner =
            this.panNode(pan);

        oscillator.type =
            type;

        oscillator.frequency.setValueAtTime(
            Math.max(
                1,
                frequency
            ),
            safeStart
        );

        if (
            endFrequency !== null &&
            endFrequency > 0
        ) {

            oscillator.frequency.exponentialRampToValueAtTime(
                Math.max(
                    1,
                    endFrequency
                ),
                safeStart +
                safeDuration
            );

        }

        gain.gain.setValueAtTime(
            0.0001,
            safeStart
        );

        gain.gain.exponentialRampToValueAtTime(
            safeVolume,
            safeStart + 0.008
        );

        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            safeStart +
            safeDuration
        );

        oscillator.connect(
            gain
        );

        if (panner) {

            gain.connect(
                panner
            );

            panner.connect(
                this.master
            );

        } else {

            gain.connect(
                this.master
            );

        }

        oscillator.start(
            safeStart
        );

        oscillator.stop(
            safeStart +
            safeDuration +
            0.05
        );

    }


    // =========================================
    // NOISE
    // =========================================

    noise(
        start,
        duration,
        volume = 0.2,
        filterType = "bandpass",
        frequency = 1000,
        endFrequency = null,
        pan = 0
    ) {

        if (!this.ctx || !this.master) {
            return;
        }

        const safeStart =
            Math.max(
                start,
                this.ctx.currentTime
            );

        const safeDuration =
            Math.max(
                0.02,
                duration
            );

        const source =
            this.noiseSource();

        if (!source) {
            return;
        }

        const filter =
            this.ctx.createBiquadFilter();

        const gain =
            this.ctx.createGain();

        const panner =
            this.panNode(pan);

        filter.type =
            filterType;

        filter.frequency.setValueAtTime(
            Math.max(
                10,
                frequency
            ),
            safeStart
        );

        filter.Q.value = 0.7;

        if (
            endFrequency !== null &&
            endFrequency > 0
        ) {

            filter.frequency.exponentialRampToValueAtTime(
                Math.max(
                    10,
                    endFrequency
                ),
                safeStart +
                safeDuration
            );

        }

        gain.gain.setValueAtTime(
            0.0001,
            safeStart
        );

        gain.gain.exponentialRampToValueAtTime(
            Math.max(
                0.0001,
                volume
            ),
            safeStart + 0.008
        );

        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            safeStart +
            safeDuration
        );

        source.connect(
            filter
        );

        filter.connect(
            gain
        );

        if (panner) {

            gain.connect(
                panner
            );

            panner.connect(
                this.master
            );

        } else {

            gain.connect(
                this.master
            );

        }

        source.start(
            safeStart
        );

        source.stop(
            safeStart +
            safeDuration +
            0.05
        );

    }


    // =========================================
    // BASS HIT
    // TIMELINE COMPATIBILITY
    // =========================================

    bassHit() {

        if (!this.ensure()) {
            return;
        }

        const now =
            this.ctx.currentTime;

        // Deep sub
        this.osc(
            "sine",
            95,
            now,
            0.45,
            0.72,
            38
        );

        // Punch
        this.osc(
            "triangle",
            180,
            now,
            0.18,
            0.22,
            70
        );

        // Transient
        this.noise(
            now,
            0.07,
            0.12,
            "lowpass",
            900,
            300
        );

    }


    // =========================================
    // DEEP BOOM
    // =========================================

    deepBoom() {

        if (!this.ensure()) {
            return;
        }

        const now =
            this.ctx.currentTime;

        this.osc(
            "sine",
            65,
            now,
            0.8,
            0.85,
            25
        );

        this.osc(
            "triangle",
            110,
            now,
            0.45,
            0.25,
            45
        );

        this.noise(
            now,
            0.12,
            0.20,
            "lowpass",
            600,
            100
        );

    }


    // =========================================
    // LOW RUMBLE
    // =========================================

    lowRumble(
        duration = 1
    ) {

        if (!this.ensure()) {
            return;
        }

        const now =
            this.ctx.currentTime;

        this.noise(
            now,
            duration,
            0.13,
            "lowpass",
            120,
            45
        );

        this.osc(
            "sine",
            42,
            now,
            duration,
            0.25,
            28
        );

    }


    // =========================================
    // IMPACT
    // TIMELINE COMPATIBILITY
    // =========================================

    impact() {

        if (!this.ensure()) {
            return;
        }

        const now =
            this.ctx.currentTime;

        this.osc(
            "sine",
            120,
            now,
            0.42,
            0.65,
            42
        );

        this.osc(
            "triangle",
            280,
            now,
            0.20,
            0.30,
            90
        );

        this.noise(
            now,
            0.055,
            0.20,
            "highpass",
            1800,
            700
        );

    }


    // =========================================
    // CINEMATIC HIT
    // =========================================

    cinematicHit() {

        if (!this.ensure()) {
            return;
        }

        const now =
            this.ctx.currentTime;

        this.deepBoom();

        this.osc(
            "triangle",
            320,
            now,
            0.22,
            0.28,
            90
        );

        this.noise(
            now,
            0.06,
            0.32,
            "highpass",
            2500,
            900
        );

    }


    // =========================================
    // BIG IMPACT
    // TIMELINE COMPATIBILITY
    // =========================================

    bigImpact() {

        if (!this.ensure()) {
            return;
        }

        const now =
            this.ctx.currentTime;

        this.osc(
            "sine",
            75,
            now,
            0.65,
            0.82,
            28
        );

        this.osc(
            "sawtooth",
            65,
            now,
            0.55,
            0.28,
            32
        );

        this.osc(
            "square",
            180,
            now,
            0.18,
            0.20,
            75
        );

        this.noise(
            now,
            0.07,
            0.25,
            "highpass",
            2200,
            800
        );

        this.noise(
            now + 0.03,
            0.45,
            0.08,
            "lowpass",
            500,
            100
        );

    }


    // =========================================
    // GAMING IMPACT
    // =========================================

    gamingImpact() {

        if (!this.ensure()) {
            return;
        }

        this.bigImpact();

        this.schedule(
            0.07,
            () => {

                if (this.audio.started) {
                    this.electricCrackle();
                }

            }
        );

    }


    // =========================================
    // METAL HIT
    // =========================================

    metalHit() {

        if (!this.ensure()) {
            return;
        }

        const now =
            this.ctx.currentTime;

        this.osc(
            "square",
            850,
            now,
            0.22,
            0.14,
            220
        );

        this.osc(
            "triangle",
            1450,
            now,
            0.28,
            0.10,
            300
        );

        this.noise(
            now,
            0.12,
            0.16,
            "highpass",
            3500,
            1000
        );

    }


    // =========================================
    // LIGHTNING
    // TIMELINE COMPATIBILITY
    // =========================================

    lightning() {

        if (!this.ensure()) {
            return;
        }

        const now =
            this.ctx.currentTime;

        this.electricCrackle();

        this.noise(
            now,
            0.10,
            0.30,
            "highpass",
            3200,
            700
        );

        this.osc(
            "sawtooth",
            1000,
            now,
            0.35,
            0.28,
            140
        );

        this.osc(
            "sine",
            85,
            now + 0.05,
            0.60,
            0.30,
            32
        );

        this.noise(
            now + 0.08,
            0.50,
            0.12,
            "lowpass",
            500,
            90
        );

    }


    // =========================================
    // ELECTRIC CRACKLE
    // =========================================

    electricCrackle() {

        if (!this.ensure()) {
            return;
        }

        const now =
            this.ctx.currentTime;

        for (
            let i = 0;
            i < 5;
            i++
        ) {

            this.noise(
                now + i * 0.045,
                0.035,
                0.14,
                "highpass",
                2500 +
                Math.random() * 2500,
                700,
                -0.5 + Math.random()
            );

        }

    }


    // =========================================
    // SPARK
    // =========================================

    spark() {

        if (!this.ensure()) {
            return;
        }

        const now =
            this.ctx.currentTime;

        this.osc(
            "square",
            1800,
            now,
            0.07,
            0.14,
            400
        );

        this.noise(
            now,
            0.045,
            0.12,
            "highpass",
            4500,
            1800
        );

    }


    // =========================================
    // ELECTRIC ZAP
    // =========================================

    electricZap() {

        if (!this.ensure()) {
            return;
        }

        const now =
            this.ctx.currentTime;

        this.osc(
            "square",
            950,
            now,
            0.18,
            0.20,
            160
        );

        this.noise(
            now,
            0.12,
            0.18,
            "highpass",
            2800,
            700
        );

    }


    // =========================================
    // ENERGY PULSE
    // =========================================

    energyPulse() {

        if (!this.ensure()) {
            return;
        }

        const now =
            this.ctx.currentTime;

        this.osc(
            "sine",
            70,
            now,
            0.45,
            0.45,
            35
        );

        this.osc(
            "sawtooth",
            240,
            now,
            0.25,
            0.12,
            900
        );

        this.noise(
            now,
            0.18,
            0.10,
            "bandpass",
            1200,
            3500
        );

    }


    // =========================================
    // WHOOSH
    // TIMELINE COMPATIBILITY
    // =========================================

    whoosh() {

        if (!this.ensure()) {
            return;
        }

        const now =
            this.ctx.currentTime;

        this.noise(
            now,
            0.55,
            0.24,
            "bandpass",
            160,
            3200
        );

        this.osc(
            "sawtooth",
            170,
            now,
            0.50,
            0.12,
            1900
        );

    }


    // =========================================
    // FAST WHOOSH
    // =========================================

    fastWhoosh() {

        if (!this.ensure()) {
            return;
        }

        const now =
            this.ctx.currentTime;

        this.noise(
            now,
            0.20,
            0.30,
            "bandpass",
            500,
            5000
        );

        this.osc(
            "sawtooth",
            300,
            now,
            0.20,
            0.12,
            2500
        );

    }


    // =========================================
    // AIR BURST
    // =========================================

    airBurst() {

        if (!this.ensure()) {
            return;
        }

        const now =
            this.ctx.currentTime;

        this.noise(
            now,
            0.16,
            0.30,
            "highpass",
            700,
            4200
        );

    }


    // =========================================
    // REVERSE WHOOSH
    // =========================================

    reverseWhoosh() {

        if (!this.ensure()) {
            return;
        }

        const now =
            this.ctx.currentTime;

        this.noise(
            now,
            0.65,
            0.20,
            "bandpass",
            5000,
            150
        );

        this.osc(
            "sawtooth",
            1800,
            now,
            0.65,
            0.08,
            100
        );

    }


    // =========================================
    // RISER
    // TIMELINE COMPATIBILITY
    // =========================================

    riser() {

        if (!this.ensure()) {
            return;
        }

        const now =
            this.ctx.currentTime;

        this.osc(
            "sawtooth",
            90,
            now,
            1.5,
            0.22,
            1500
        );

        this.noise(
            now,
            1.5,
            0.16,
            "lowpass",
            250,
            5500
        );

    }


    // =========================================
    // DIGITAL RISE
    // =========================================

    digitalRise() {

        if (!this.ensure()) {
            return;
        }

        const now =
            this.ctx.currentTime;

        this.osc(
            "square",
            100,
            now,
            0.8,
            0.12,
            1600
        );

        this.noise(
            now,
            0.8,
            0.10,
            "bandpass",
            700,
            4500
        );

    }


    // =========================================
    // SHORT RISER
    // =========================================

    shortRiser() {

        if (!this.ensure()) {
            return;
        }

        const now =
            this.ctx.currentTime;

        this.osc(
            "sawtooth",
            140,
            now,
            0.65,
            0.16,
            1200
        );

        this.noise(
            now,
            0.65,
            0.10,
            "bandpass",
            600,
            3500
        );

    }


    // =========================================
    // TARGET BEEP
    // TIMELINE COMPATIBILITY
    // =========================================

    targetBeep() {

        if (!this.ensure()) {
            return;
        }

        const now =
            this.ctx.currentTime;

        this.osc(
            "sine",
            880,
            now,
            0.12,
            0.25
        );

        this.osc(
            "sine",
            1320,
            now + 0.14,
            0.12,
            0.30
        );

    }


    // =========================================
    // TARGET LOCK
    // =========================================

    targetLock() {

        if (!this.ensure()) {
            return;
        }

        const now =
            this.ctx.currentTime;

        this.osc(
            "sine",
            600,
            now,
            0.08,
            0.20
        );

        this.osc(
            "sine",
            1000,
            now + 0.09,
            0.08,
            0.24
        );

        this.osc(
            "square",
            1600,
            now + 0.18,
            0.10,
            0.12
        );

        this.digitalClick();

    }


    // =========================================
    // SCAN
    // =========================================

    scan() {

        if (!this.ensure()) {
            return;
        }

        const now =
            this.ctx.currentTime;

        this.osc(
            "sine",
            300,
            now,
            0.35,
            0.12,
            1700
        );

        this.noise(
            now,
            0.35,
            0.08,
            "bandpass",
            1200,
            4000
        );

    }


    // =========================================
    // SCANNER BEEP
    // =========================================

    scannerBeep() {

        if (!this.ensure()) {
            return;
        }

        const now =
            this.ctx.currentTime;

        this.osc(
            "sine",
            740,
            now,
            0.07,
            0.15,
            1100
        );

        this.osc(
            "sine",
            1100,
            now + 0.07,
            0.07,
            0.12,
            1500
        );

    }


    // =========================================
    // DIGITAL CLICK
    // =========================================

    digitalClick() {

        if (!this.ensure()) {
            return;
        }

        const now =
            this.ctx.currentTime;

        this.osc(
            "square",
            1800,
            now,
            0.035,
            0.16,
            700
        );

        this.noise(
            now,
            0.025,
            0.10,
            "highpass",
            4000,
            1800
        );

    }


    // =========================================
    // MOUSE CLICK
    // =========================================

    mouseClick() {

        if (!this.ensure()) {
            return;
        }

        const now =
            this.ctx.currentTime;

        this.osc(
            "square",
            1200,
            now,
            0.045,
            0.18,
            500
        );

        this.noise(
            now,
            0.025,
            0.08,
            "highpass",
            3500
        );

    }


    // =========================================
    // MOUSE DOUBLE CLICK
    // =========================================

    mouseDoubleClick() {

        if (!this.ensure()) {
            return;
        }

        this.mouseClick();

        this.schedule(
            0.085,
            () => {

                if (this.audio.started) {
                    this.mouseClick();
                }

            }
        );

    }


    // =========================================
    // KEYBOARD CLICK
    // =========================================

    keyboardClick() {

        if (!this.ensure()) {
            return;
        }

        const now =
            this.ctx.currentTime;

        this.noise(
            now,
            0.035,
            0.12,
            "bandpass",
            1800,
            700
        );

        this.osc(
            "triangle",
            220,
            now,
            0.045,
            0.07,
            90
        );

    }


    // =========================================
    // KEYBOARD TYPING
    // =========================================

    keyboardTyping(
        count = 8
    ) {

        if (!this.ensure()) {
            return;
        }

        for (
            let i = 0;
            i < count;
            i++
        ) {

            this.schedule(
                i *
                (
                    0.055 +
                    Math.random() *
                    0.045
                ),
                () => {

                    if (
                        this.audio.started
                    ) {

                        this.keyboardClick();

                    }

                }
            );

        }

    }


    // =========================================
    // KEYBOARD BURST
    // =========================================

    keyboardBurst(
        count = 5
    ) {

        this.keyboardTyping(
            count
        );

    }


    // =========================================
    // HACKER GLITCH
    // =========================================

    hackerGlitch() {

        if (!this.ensure()) {
            return;
        }

        const now =
            this.ctx.currentTime;

        for (
            let i = 0;
            i < 6;
            i++
        ) {

            const delay =
                i *
                0.04;

            this.osc(
                "square",
                120 +
                Math.random() *
                1600,
                now + delay,
                0.035,
                0.08,
                100 +
                Math.random() *
                500,
                -0.5 +
                Math.random()
            );

        }

        this.noise(
            now,
            0.20,
            0.12,
            "highpass",
            2200,
            5000
        );

    }


    // =========================================
    // DIGITAL GLITCH
    // =========================================

    glitch() {

        if (!this.ensure()) {
            return;
        }

        const now =
            this.ctx.currentTime;

        this.noise(
            now,
            0.06,
            0.20,
            "highpass",
            2500,
            1000
        );

        this.osc(
            "square",
            140,
            now,
            0.08,
            0.12,
            900
        );

        this.osc(
            "square",
            1800,
            now + 0.04,
            0.05,
            0.10,
            300
        );

    }


    // =========================================
    // DATA SWEEP
    // =========================================

    dataSweep() {

        if (!this.ensure()) {
            return;
        }

        const now =
            this.ctx.currentTime;

        this.osc(
            "sine",
            180,
            now,
            0.45,
            0.12,
            2200
        );

        this.noise(
            now,
            0.45,
            0.08,
            "bandpass",
            800,
            4500
        );

    }


    // =========================================
    // DIGITAL BURST
    // =========================================

    digitalBurst() {

        if (!this.ensure()) {
            return;
        }

        const now =
            this.ctx.currentTime;

        this.glitch();

        this.osc(
            "square",
            400,
            now,
            0.20,
            0.12,
            1800
        );

        this.noise(
            now,
            0.20,
            0.10,
            "highpass",
            1800,
            5000
        );

    }


    // =========================================
    // POP
    // =========================================

    pop() {

        if (!this.ensure()) {
            return;
        }

        const now =
            this.ctx.currentTime;

        this.osc(
            "sine",
            240,
            now,
            0.15,
            0.25,
            90
        );

        this.noise(
            now,
            0.035,
            0.14,
            "highpass",
            2200
        );

    }


    // =========================================
    // POWER ON
    // =========================================

    powerOn() {

        if (!this.ensure()) {
            return;
        }

        const now =
            this.ctx.currentTime;

        this.osc(
            "sine",
            60,
            now,
            0.70,
            0.30,
            180
        );

        this.osc(
            "square",
            180,
            now + 0.10,
            0.15,
            0.12,
            900
        );

        this.osc(
            "square",
            900,
            now + 0.25,
            0.18,
            0.15,
            1800
        );

        this.noise(
            now,
            0.45,
            0.08,
            "bandpass",
            900,
            3000
        );

    }


    // =========================================
    // COMPUTER HUM
    // =========================================

    computerHum() {

        if (!this.ensure()) {
            return;
        }

        const now =
            this.ctx.currentTime;

        this.osc(
            "sine",
            60,
            now,
            1,
            0.045
        );

        this.osc(
            "sine",
            120,
            now,
            1,
            0.025
        );

    }


    // =========================================
    // POWER DOWN
    // =========================================

    powerDown() {

        if (!this.ensure()) {
            return;
        }

        const now =
            this.ctx.currentTime;

        this.osc(
            "sine",
            300,
            now,
            0.55,
            0.20,
            45
        );

        this.noise(
            now,
            0.35,
            0.08,
            "lowpass",
            1200,
            120
        );

    }


    // =========================================
    // NOTIFICATION
    // =========================================

    notification() {

        if (!this.ensure()) {
            return;
        }

        const now =
            this.ctx.currentTime;

        this.osc(
            "sine",
            660,
            now,
            0.10,
            0.20
        );

        this.osc(
            "sine",
            990,
            now + 0.10,
            0.14,
            0.22
        );

    }


    // =========================================
    // CONFIRMATION
    // =========================================

    confirmation() {

        if (!this.ensure()) {
            return;
        }

        const now =
            this.ctx.currentTime;

        this.osc(
            "sine",
            520,
            now,
            0.08,
            0.16
        );

        this.osc(
            "sine",
            780,
            now + 0.09,
            0.12,
            0.22
        );

    }


    // =========================================
    // YOUTUBE HIT
    // TIMELINE COMPATIBILITY
    // =========================================

    youtubeHit() {

        if (!this.ensure()) {
            return;
        }

        this.impact();

        this.schedule(
            0.09,
            () => {

                if (this.audio.started) {
                    this.notification();
                }

            }
        );

    }


    // =========================================
    // GAMING LOGO HIT
    // =========================================

    gamingLogoHit() {

        if (!this.ensure()) {
            return;
        }

        this.reverseWhoosh();

        this.schedule(
            0.24,
            () => {

                if (this.audio.started) {
                    this.gamingImpact();
                }

            }
        );

    }


    // =========================================
    // TRANSITION HIT
    // =========================================

    transitionHit() {

        if (!this.ensure()) {
            return;
        }

        this.fastWhoosh();

        this.schedule(
            0.11,
            () => {

                if (this.audio.started) {
                    this.impact();
                }

            }
        );

    }


    // =========================================
    // LOGO IMPACT
    // =========================================

    logoImpact() {

        if (!this.ensure()) {
            return;
        }

        this.reverseWhoosh();

        this.schedule(
            0.28,
            () => {

                if (this.audio.started) {
                    this.finalImpact();
                }

            }
        );

    }


    // =========================================
    // FINAL IMPACT
    // TIMELINE COMPATIBILITY
    // =========================================

    finalImpact() {

        if (!this.ensure()) {
            return;
        }

        const now =
            this.ctx.currentTime;

        this.osc(
            "sine",
            80,
            now,
            0.85,
            0.90,
            25
        );

        this.osc(
            "sawtooth",
            55,
            now,
            0.65,
            0.32,
            28
        );

        this.osc(
            "triangle",
            440,
            now,
            0.45,
            0.30,
            110
        );

        this.noise(
            now,
            0.09,
            0.32,
            "highpass",
            3000,
            700
        );

        this.noise(
            now + 0.04,
            0.75,
            0.10,
            "lowpass",
            700,
            160
        );

        this.osc(
            "sine",
            880,
            now + 0.02,
            0.65,
            0.12,
            330
        );

    }


    // =========================================
    // FINAL EXPLOSION
    // =========================================

    finalExplosion() {

        if (!this.ensure()) {
            return;
        }

        this.finalImpact();

        this.schedule(
            0.10,
            () => {

                if (this.audio.started) {
                    this.lowRumble(1.2);
                }

            }
        );

    }


    // =========================================
    // FINAL STINGER
    // =========================================

    finalStinger() {

        if (!this.ensure()) {
            return;
        }

        const now =
            this.ctx.currentTime;

        this.osc(
            "sine",
            110,
            now,
            0.60,
            0.45,
            35
        );

        this.osc(
            "triangle",
            440,
            now,
            0.40,
            0.20,
            110
        );

        this.noise(
            now,
            0.07,
            0.25,
            "highpass",
            3000,
            900
        );

    }


    // =========================================
    // ENERGY HIT
    // =========================================

    energyHit() {

        if (!this.ensure()) {
            return;
        }

        this.subBass();

        this.electricZap();

        const now =
            this.ctx.currentTime;

        this.noise(
            now,
            0.10,
            0.20,
            "highpass",
            2500,
            700
        );

    }


    // =========================================
    // SUB BASS
    // =========================================

    subBass(
        frequency = 45,
        duration = 0.6,
        volume = 0.65
    ) {

        if (!this.ensure()) {
            return;
        }

        const now =
            this.ctx.currentTime;

        this.osc(
            "sine",
            frequency,
            now,
            duration,
            volume,
            Math.max(
                20,
                frequency * 0.55
            )
        );

    }


    // =========================================
    // DROP
    // =========================================

    drop() {

        if (!this.ensure()) {
            return;
        }

        this.reverseWhoosh();

        this.schedule(
            0.18,
            () => {

                if (this.audio.started) {
                    this.bigImpact();
                }

            }
        );

    }


    // =========================================
    // SCHEDULE TIMER
    // =========================================

    schedule(
        seconds,
        callback
    ) {

        const timer =
            setTimeout(
                () => {

                    if (
                        !this.audio ||
                        !this.audio.started
                    ) {
                        return;
                    }

                    try {

                        callback();

                    } catch (error) {

                        console.error(
                            "❌ SFX scheduled event error:",
                            error
                        );

                    }

                },
                Math.max(
                    0,
                    seconds * 1000
                )
            );

        this.timers.push(
            timer
        );

        return timer;

    }


    // =========================================
    // STOP
    // =========================================

    stop() {

        for (
            const timer
            of this.timers
        ) {

            clearTimeout(
                timer
            );

        }

        this.timers = [];

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
                0.05
            );

        }

    }


    // =========================================
    // ENABLE / DISABLE
    // =========================================

    setEnabled(
        value
    ) {

        this.enabled =
            Boolean(value);

        if (
            !this.enabled &&
            this.master &&
            this.ctx
        ) {

            this.master.gain.setTargetAtTime(
                0,
                this.ctx.currentTime,
                0.02
            );

        }

    }


    // =========================================
    // VOLUME
    // =========================================

    setVolume(
        value
    ) {

        const safeValue =
            Math.max(
                0,
                Math.min(
                    1,
                    Number(value) || 0
                )
            );

        this.defaultVolume =
            safeValue;

        if (
            this.master &&
            this.ctx &&
            this.enabled
        ) {

            this.master.gain.setTargetAtTime(
                safeValue,
                this.ctx.currentTime,
                0.02
            );

        }

    }


    // =========================================
    // STARTED CHECK
    // =========================================

    started() {

        return !!(
            this.audio &&
            this.audio.started
        );

    }

}