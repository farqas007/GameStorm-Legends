// =========================================
// GAMESTORM LEGENDS — MAIN SCRIPT V5
// MUSIC ONLY
// REAL MP3 = MASTER CLOCK
// NO SFX
// NO AUDIO TIMELINE
// MUSIC-DRIVEN VISUAL SYNC
// EXACT MUSIC LENGTH INTRO
// =========================================

import { AudioEngine } from "./audio/audio.js";
import { MusicEngine } from "./audio/music.js";
import { MUSIC_MAP } from "./musicMap.js";
import { MUSIC_TIMELINE } from "./musicTimeline.js";
import { MusicDirector } from "./animation/MusicDirector.js";
import { CameraEngine } from "./animation/CameraEngine.js";
import { VisualDirector } from "./animation/VisualDirector.js";

// =========================================
// AUDIO ENGINE
// =========================================

const audio =
    new AudioEngine();


// =========================================
// MUSIC ENGINE
// =========================================

const music =
    new MusicEngine(
        audio
    );

const director =
    new MusicDirector();

const visualDirector =
    new VisualDirector();

// =========================================
// VIDEO ELEMENT
// =========================================

const video =
    document.getElementById(
        "video"
    );

    const camera =
    new CameraEngine(
        video
    );


// =========================================
// SCENES
// =========================================

const scenes =
    document.querySelectorAll(
        ".scene"
    );


    // =========================================
// YOUTUBE LOGO — REMOVE BLACK BACKGROUND
// =========================================

function makeYoutubeLogoTransparent() {

    const img =
        document.querySelector(
            ".youtube-logo-target"
        );

    if (!img) {
        return;
    }

    const canvas =
        document.createElement("canvas");

    const ctx =
        canvas.getContext("2d");

    const process =
        () => {

            canvas.width =
                img.naturalWidth;

            canvas.height =
                img.naturalHeight;

            ctx.clearRect(
                0,
                0,
                canvas.width,
                canvas.height
            );

            ctx.drawImage(
                img,
                0,
                0
            );

            const imageData =
                ctx.getImageData(
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );

            const pixels =
                imageData.data;

            for (
                let i = 0;
                i < pixels.length;
                i += 4
            ) {

                const r =
                    pixels[i];

                const g =
                    pixels[i + 1];

                const b =
                    pixels[i + 2];

                const brightness =
                    (r + g + b) / 3;

                if (
                    brightness < 45
                ) {

                    pixels[i + 3] =
                        0;

                }

                else if (
                    brightness < 75
                ) {

                    pixels[i + 3] =
                        Math.round(
                            (
                                (brightness - 45) /
                                30
                            ) * 255
                        );

                }

            }

            ctx.putImageData(
                imageData,
                0,
                0
            );

            img.src =
                canvas.toDataURL(
                    "image/png"
                );

        };


    if (
        img.complete &&
        img.naturalWidth > 0
    ) {

        process();

    } else {

        img.addEventListener(
            "load",
            process,
            {
                once: true
            }
        );

    }

}

// =========================================
// MASTER DURATION
// REAL MP3 = MASTER CLOCK
// =========================================

const INTRO_DURATION =
    MUSIC_MAP.duration;

const VIDEO_DURATION =
    MUSIC_MAP.duration;


// =========================================
// VISUAL TIMELINE
// MUSIC MAP SECTIONS
// =========================================

const timeline = [

    // =====================================
    // SCENE 1 — DARK HACKER INTRO
    // 0.000 → 10.844
    // =====================================

    {
        scene: 0,
        start: 0.000,
        end: 10.844
    },


    // =====================================
    // SCENE 2 — BUILD / LIKE
    // 10.844 → 23.011
    // =====================================

    {
        scene: 1,
        start: 10.844,
        end: 23.011
    },


    // =====================================
    // SCENE 3 — FIRST PEAK / SHARE
    // 23.011 → 32.450
    // =====================================

    {
        scene: 2,
        start: 23.011,
        end: 32.450
    },


    // =====================================
    // SCENE 4 — CYBER TRANSITION / YOUTUBE
    // 32.450 → 42.040
    // =====================================

    {
        scene: 3,
        start: 32.450,
        end: 42.040
    },


    // =====================================
    // SCENE 5 — MAIN PEAK / TARGET
    // 42.040 → 58.248
    // =====================================

    {
        scene: 4,
        start: 42.040,
        end: 58.248
    },


    // =====================================
    // SCENE 6 — SECOND BUILD / GAMING
    // 58.248 → 68.441
    // =====================================

    {
        scene: 5,
        start: 58.248,
        end: 68.441
    },


    // =====================================
    // SCENE 6 — SECOND PEAK / GAMING
    // 68.441 → 80.000
    // =====================================

    {
        scene: 5,
        start: 68.441,
        end: 80.000
    },


    // =====================================
    // SCENE 7 — FINAL / CINEMATIC
    // 80.000 → 92.447
    // =====================================

    {
        scene: 6,
        start: 80.000,
        end: 92.447
    }

];


// =========================================
// STATE
// =========================================

let videoStarted =
    false;

let videoFinished =
    false;

let animationFrame =
    null;

let finishing =
    false;

let currentScene =
    0;

let startInProgress =
    false;


// =========================================
// MUSIC VISUAL EVENT STATE
// =========================================

let lastMusicEventIndex =
    -1;

let musicPulse =
    0;

let musicEnergy =
    0;

let musicOnset =
    false;

let musicBeat =
    false;


// =========================================
// CLEAR SCENES
// =========================================

function clearScenes() {

    scenes.forEach(
        scene => {

            scene.classList.remove(
                "active"
            );

        }
    );

}


// =========================================
// GET ACTIVE SCENE
// =========================================

function getActiveScene(
    time
) {

    for (
        const item of timeline
    ) {

        if (
            time >= item.start &&
            time < item.end
        ) {

            return item.scene;

        }

    }

    return -1;

}


// =========================================
// UPDATE SCENES
// =========================================

function updateScenes(
    activeScene
) {

    scenes.forEach(
        (scene, index) => {

            if (
                index === activeScene
            ) {

                scene.classList.add(
                    "active"
                );

            } else {

                scene.classList.remove(
                    "active"
                );

            }

        }
    );

}


// =========================================
// GET MASTER MUSIC TIME
// =========================================
// REAL MP3 / AUDIO CLOCK = MASTER
// =========================================
function getMasterTime() {

    // =====================================
    // DETERMINISTIC OFFLINE RENDER CLOCK
    // =====================================

    if (
        typeof window !== "undefined" &&
        window.__GAMESTORM_RENDER_MODE__ === true &&
        Number.isFinite(
            Number(
                window.__GAMESTORM_RENDER_TIME__
            )
        )
    ) {

        return Math.min(
            Math.max(
                Number(
                    window.__GAMESTORM_RENDER_TIME__
                ),
                0
            ),
            VIDEO_DURATION
        );

    }


    // =====================================
    // NORMAL REAL AUDIO CLOCK
    // =====================================

    if (
        !audio ||
        !audio.started ||
        typeof audio.getTime !== "function"
    ) {

        return 0;

    }


    const time =
        Number(
            audio.getTime()
        );


    if (
        !Number.isFinite(time)
    ) {

        return 0;

    }


    return Math.min(
        Math.max(
            time,
            0
        ),
        VIDEO_DURATION
    );

}

// =========================================
// MUSIC EVENT PROCESSOR
// =========================================

function updateMusicEvents(
    currentTime
) {

    if (
        !Array.isArray(
            MUSIC_TIMELINE
        ) ||
        MUSIC_TIMELINE.length === 0
    ) {

        return;

    }


    // =====================================
    // FIND CURRENT MUSIC EVENT
    // =====================================

    let eventIndex =
        -1;


    for (
        let i = 0;
        i < MUSIC_TIMELINE.length;
        i++
    ) {

        if (
            MUSIC_TIMELINE[i].time <=
            currentTime
        ) {

            eventIndex =
                i;

        } else {

            break;

        }

    }


    // =====================================
    // NO EVENT YET
    // =====================================

    if (
        eventIndex < 0
    ) {

        musicEnergy =
            0;

        musicOnset =
            false;

        musicBeat =
            false;

        return;

    }


    // =====================================
    // CURRENT EVENT
    // =====================================

    const event =
        MUSIC_TIMELINE[
            eventIndex
        ];


    // =====================================
    // CONTINUOUS MUSIC DATA
    // =====================================

    musicEnergy =
        Number(
            event.energy
        ) || 0;

    musicBeat =
        Number(
            event.beat
        ) === 1;


    // =====================================
    // NEW MUSIC EVENT
    // =====================================

    if (
        eventIndex !==
        lastMusicEventIndex
    ) {

        lastMusicEventIndex =
            eventIndex;


        musicOnset =
            Number(
                event.onset
            ) === 1;


        // =================================
        // VISUAL PULSE
        // =================================

        musicPulse =
            Math.min(
                musicEnergy * 1.35,
                1
            );


        // =================================
        // DEBUG
        // =================================

        if (
            musicOnset
        ) {

            console.log(
                "🎵 MUSIC EVENT",
                event.time.toFixed(3),
                "energy:",
                event.energy.toFixed(3),
                "beat:",
                event.beat
            );

        }

    } else {

        musicOnset =
            false;

    }

}


// =========================================
// MUSIC → VISUAL IMPACT
// =========================================

function applyMusicImpact() {

    // =====================================
    // MUSIC DIRECTOR VISUAL STATE
    // =====================================

    const visual =
        director.state;


    if (
        !visual ||
        !video
    ) {

        return;

    }


    // =====================================
    // MUSIC PULSE
    // =====================================

    musicPulse =
        Math.max(
            musicPulse,
            visual.pulse || 0
        );


    musicPulse *=
        0.92;


    // =====================================
    // MASTER MUSIC SCALE
    // =====================================

    const scale =
        1 +
        musicPulse * 0.035 +
        (visual.energy || 0) * 0.008;


    video.style.setProperty(
        "--music-scale",
        scale
    );


    // =====================================
    // CAMERA DATA
    // =====================================

    video.style.setProperty(
        "--camera-energy",
        visual.energy || 0
    );


    // =====================================
    // GLITCH DATA
    // =====================================

    video.style.setProperty(
        "--music-glitch",
        visual.glitch || 0
    );


    // =====================================
    // PARTICLE DATA
    // =====================================

    video.style.setProperty(
        "--music-particles",
        visual.particles || 0
    );


    // =====================================
    // FLASH DATA
    // =====================================

    video.style.setProperty(
        "--music-flash",
        visual.flash || 0
    );


    // =====================================
    // NO NEW HIT
    // =====================================

    if (
        !visual.onset
    ) {

        return;

    }


    // =====================================
    // CURRENT ENERGY
    // =====================================

    const intensity =
        Math.min(
            Math.max(
                Number(visual.energy) || 0,
                0
            ),
            1
        );


    // =====================================
    // MAJOR HIT
    // =====================================

    if (
        visual.majorHit
    ) {

        document.body.classList.add(
            "music-major-hit"
        );


        setTimeout(
            () => {

                document.body.classList.remove(
                    "music-major-hit"
                );

            },
            120
        );


        console.log(
            "💥 MUSIC VISUAL MAJOR HIT",
            "energy:",
            intensity.toFixed(3),
            "shake:",
            Number(
                visual.cameraShake || 0
            ).toFixed(3),
            "zoom:",
            Number(
                visual.cameraZoom || 0
            ).toFixed(3),
            "glitch:",
            Number(
                visual.glitch || 0
            ).toFixed(3)
        );

    }


    // =====================================
    // STRONG HIT
    // =====================================

    else if (
        visual.strongHit
    ) {

        document.body.classList.add(
            "music-hit"
        );


        setTimeout(
            () => {

                document.body.classList.remove(
                    "music-hit"
                );

            },
            80
        );

    }

}

// =========================================
// STOP EVERYTHING
// =========================================

function stopGameStorm() {

    if (
        finishing
    ) {

        return;

    }


    finishing =
        true;


    // =====================================
    // STOP VISUAL LOOP
    // =====================================

    if (
        animationFrame !== null
    ) {

        cancelAnimationFrame(
            animationFrame
        );

    }


    animationFrame =
        null;


    // =====================================
    // STOP AUDIO
    // =====================================

    if (
        audio &&
        typeof audio.stop === "function"
    ) {

        audio.stop();

    }


    // =====================================
    // VISUAL CLEANUP
    // =====================================

    clearScenes();


    if (
        video
    ) {

        video.classList.remove(
            "video-started"
        );

        video.style.setProperty(
            "--music-scale",
            "1"
        );

    }


    // =====================================
    // RESET MUSIC VISUAL STATE
    // =====================================

    musicPulse =
        0;

    musicEnergy =
        0;

    musicOnset =
        false;

    musicBeat =
        false;

    lastMusicEventIndex =
        -1;


    // =====================================
    // FINAL STATE
    // =====================================

    videoStarted =
        false;

    videoFinished =
        true;


    console.log(
        "🏁 GAMESTORM LEGENDS — INTRO FINISHED"
    );

    console.log(
        "⏱️ FINAL TIME:",
        VIDEO_DURATION,
        "SECONDS"
    );

}


// =========================================
// VISUAL MASTER LOOP
// =========================================

function animate() {

    if (
        !videoStarted ||
        videoFinished ||
        finishing
    ) {

        return;

    }


    // =====================================
    // REAL MUSIC CLOCK
    // =====================================

    const currentTime =
        getMasterTime();


    // =====================================
// MUSIC ANALYSIS
// =====================================

updateMusicEvents(
    currentTime
);


// =====================================
// MUSIC DIRECTOR
// =====================================

const musicVisual =
    director.update(
        currentTime
    );


camera.update(
    musicVisual
);


visualDirector.update(
    musicVisual
);

    // =====================================
    // EXACT END CHECK
    // =====================================

    if (
        currentTime >=
        VIDEO_DURATION
    ) {

        stopGameStorm();

        return;

    }


    // =====================================
    // ACTIVE SCENE
    // =====================================

    const activeScene =
        getActiveScene(
            currentTime
        );


    currentScene =
        activeScene;


    // =====================================
    // UPDATE SCENES
    // =====================================

    updateScenes(
        activeScene
    );


    // =====================================
    // MUSIC VISUAL IMPACT
    // =====================================

    applyMusicImpact();


    // =====================================
    // NEXT FRAME
    // =====================================

    // =====================================
    // DETERMINISTIC OFFLINE RENDER MODE
    // =====================================

    if (
        typeof window !== "undefined" &&
        window.__GAMESTORM_RENDER_MODE__ === true
    ) {

        // Offline renderer controls
        // the frame progression.

        return;

    }


    // =====================================
    // NORMAL BROWSER MODE
    // =====================================

    animationFrame =
        requestAnimationFrame(
            animate
        );

}


// =========================================
// START GAMESTORM
// =========================================

async function startGameStorm() {

    // =====================================
    // PREVENT DOUBLE START
    // =====================================

    if (
        videoStarted ||
        videoFinished ||
        finishing ||
        startInProgress
    ) {

        return;

    }


    startInProgress =
        true;


    console.log(
        "🖱️ GAMESTORM START CLICK"
    );


    try {

        // =================================
        // START AUDIO ENGINE
        // =================================

        await audio.start();


        if (
            !audio.started
        ) {

            console.warn(
                "⚠️ Audio engine did not start."
            );

            startInProgress =
                false;

            return;

        }


        console.log(
            "🔊 AudioContext:",
            audio.ctx
                ? audio.ctx.state
                : "unknown"
        );


        // =================================
        // INITIALIZE MUSIC
        // =================================

        if (
            music &&
            typeof music.init === "function"
        ) {

            music.init();

        }


        // =================================
        // RESET STATE
        // =================================

        videoFinished =
            false;

        finishing =
            false;

        lastMusicEventIndex =
            -1;

        musicPulse =
            0;

        musicEnergy =
            0;

        musicOnset =
            false;

        musicBeat =
            false;


        // =================================
        // CLEAR OLD SCENES
        // =================================

        clearScenes();


        // =================================
        // START REAL MUSIC
        // =================================
        //
        // NORMAL BROWSER:
        //     Play the real MP3.
        //
        // OFFLINE RENDER:
        //     Do NOT start browser audio.
        //     The renderer controls the exact
        //     music time and FFmpeg adds the
        //     actual MP3 to the final video.
        // =================================

        let musicStarted =
            true;


        if (
            typeof window !== "undefined" &&
            window.__GAMESTORM_RENDER_MODE__ === true
        ) {

            console.log(
                "🎯 OFFLINE RENDER: REAL MP3 PLAYBACK BYPASSED"
            );

        } else {

            musicStarted =
                await audio.playMusic();


            if (
                !musicStarted
            ) {

                console.warn(
                    "⚠️ GameStorm music could not start."
                );

                startInProgress =
                    false;

                return;

            }


            console.log(
                "🎵 GAMESTORM REAL MUSIC STARTED"
            );

        }


        // =================================
        // START STATE
        // =================================

        videoStarted =
            true;

        startInProgress =
            false;


        // =================================
        // START CSS VIDEO STATE
        // =================================

        if (
            video
        ) {

            video.classList.add(
                "video-started"
            );

            video.style.setProperty(
                "--music-scale",
                "1"
            );

        }


        // =================================
        // START FIRST SCENE
        // =================================

        updateScenes(
            0
        );


        // =================================
        // START VISUAL LOOP
        // =================================

        // =================================
        // DETERMINISTIC OFFLINE RENDER MODE
        // =================================

        if (
            typeof window !== "undefined" &&
            window.__GAMESTORM_RENDER_MODE__ === true
        ) {

            // The offline exporter will call
            // __GAMESTORM_RENDER_FRAME__()
            // manually for every frame.

            console.log(
                "🎯 OFFLINE RENDER: MANUAL FRAME CONTROL"
            );

        } else {

            // =================================
            // NORMAL BROWSER MODE
            // =================================

            animationFrame =
                requestAnimationFrame(
                    animate
                );

        }


        // =================================
        // LOG
        // =================================

        console.log(
            "🎵 REAL MP3 MUSIC = MASTER CLOCK"
        );

        console.log(
            "🎬 MUSIC-DRIVEN VISUAL TIMELINE STARTED"
        );

        console.log(
            "🎯 AUDIO CLOCK = MASTER CLOCK"
        );

        console.log(
            "🔊 SFX = DISABLED"
        );

        console.log(
            "⏱️ MASTER DURATION:",
            VIDEO_DURATION,
            "SECONDS"
        );

    } catch (
        error
    ) {

        console.error(
            "❌ GAMESTORM START ERROR:",
            error
        );


        // =================================
        // CLEAN FAILED START
        // =================================

        if (
            audio &&
            typeof audio.stop === "function"
        ) {

            audio.stop();

        }


        videoStarted =
            false;

        videoFinished =
            false;

        finishing =
            false;

        startInProgress =
            false;


        clearScenes();


        if (
            video
        ) {

            video.classList.remove(
                "video-started"
            );

            video.style.setProperty(
                "--music-scale",
                "1"
            );

        }

    }

}


// =========================================
// AUTOPLAY UNLOCK
// =========================================
//
// The intro plays automatically. When the
// browser only allowed a muted start, the
// first real interaction turns the sound on.
// No extra player, no extra UI, and the MP3
// keeps running, so nothing desynchronises.
// =========================================

let unlockArmed =
    false;


function armAudioUnlock() {

    if (
        unlockArmed
    ) {

        return;

    }


    unlockArmed =
        true;


    const unlock =
        () => {

            unlockArmed =
                false;


            audio.unlock().then(
                unlocked => {

                    if (!unlocked) {

                        console.warn(
                            "⚠️ GameStorm sound could not be unlocked."
                        );

                    }

                }
            );

        };


    for (
        const eventName of [
            "pointerdown",
            "keydown",
            "touchstart"
        ]
    ) {

        document.addEventListener(
            eventName,
            unlock,
            {
                once: true,
                capture: true
            }
        );

    }


    console.log(
        "👆 First interaction unlocks sound"
    );

}


// =========================================
// AUTOPLAY
// =========================================
//
// 1. Normal autoplay with sound.
// 2. Muted autoplay, which browsers allow,
//    then sound on first interaction.
// 3. Nothing started, so the existing
//    click-to-start intro stays in charge.
// =========================================

async function autoplayGameStorm() {

    // =====================================
    // OFFLINE RENDER MODE
    // =====================================
    //
    // The renderer drives every frame itself.

    if (
        typeof window !== "undefined" &&
        window.__GAMESTORM_RENDER_MODE__ === true
    ) {

        return;

    }


    // =====================================
    // 1 — NORMAL AUTOPLAY
    // =====================================

    await startGameStorm();


    if (videoStarted) {

        armAudioUnlock();


        // =================================
        // PLAYING ELEMENT, BLOCKED CONTEXT
        // =================================
        //
        // A playing element does not prove the
        // AudioContext may run. If it is still
        // suspended the graph stays silent, so
        // mute now and let the first interaction
        // bring the sound in.
        // =================================

        if (
            audio.ctx &&
            audio.ctx.state !== "running"
        ) {

            audio.setMuted(true);

        }


        console.log(
            "▶️ GAMESTORM INTRO AUTOPLAYED"
        );

        return;

    }


    // =====================================
    // 2 — BLOCKED: MUTED AUTOPLAY
    // =====================================

    console.log(
        "🔇 Unmuted autoplay blocked. Trying muted autoplay."
    );


    audio.setMuted(true);

    await startGameStorm();


    if (videoStarted) {

        armAudioUnlock();


        console.log(
            "▶️ GAMESTORM INTRO AUTOPLAYED (MUTED)"
        );

        return;

    }


    // =====================================
    // 3 — STILL BLOCKED
    // =====================================
    //
    // Nothing is playing and no UI was added.
    // The existing click-to-start intro runs.

    audio.setMuted(false);


    console.log(
        "⏳ Autoplay unavailable. Click to start the intro."
    );

}


// =========================================
// RESET GAMESTORM
// =========================================

function resetGameStorm() {

    console.log(
        "🔄 GAMESTORM RESET"
    );


    // =====================================
    // STOP VISUAL LOOP
    // =====================================

    if (
        animationFrame !== null
    ) {

        cancelAnimationFrame(
            animationFrame
        );

    }


    animationFrame =
        null;


    // =====================================
    // STOP AUDIO
    // =====================================

    if (
        audio &&
        typeof audio.stop === "function"
    ) {

        audio.stop();

    }


    // =====================================
    // CLEAR VISUALS
    // =====================================

    clearScenes();


    if (
        video
    ) {

        video.classList.remove(
            "video-started"
        );

        video.style.setProperty(
            "--music-scale",
            "1"
        );

    }


    // =====================================
    // RESET STATE
    // =====================================

    videoStarted =
        false;

    videoFinished =
        false;

    finishing =
        false;

    startInProgress =
        false;

    currentScene =
        0;


    // =====================================
    // RESTORE SOUND
    // =====================================
    //
    // A manual start always follows a real
    // user gesture, so a muted autoplay must
    // not stay muted after a reset.

    if (
        typeof audio.setMuted === "function"
    ) {

        audio.setMuted(false);

    }


    // =====================================
    // RESET MUSIC VISUAL STATE
    // =====================================

    lastMusicEventIndex =
        -1;

    musicPulse =
        0;

    musicEnergy =
        0;

    musicOnset =
        false;

    musicBeat =
        false;


    console.log(
        "✅ GAMESTORM INTRO READY"
    );

}


// =========================================
// USER CLICK
// =========================================
// First click = START
// After finish = NOTHING
// Escape = RESET
// =========================================

document.addEventListener(
    "click",
    startGameStorm
);


// =========================================
// ESCAPE = RESET
// =========================================

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            resetGameStorm();

        }

    }
);


// =========================================
// VISIBILITY HANDLING
// =========================================

document.addEventListener(
    "visibilitychange",
    () => {

        if (
            document.hidden
        ) {

            console.log(
                "⏸️ GAMESTORM TAB HIDDEN"
            );

            return;

        }


        if (
            videoStarted &&
            !videoFinished &&
            !finishing
        ) {

            console.log(
                "▶️ GAMESTORM TAB VISIBLE"
            );

        }

    }
);


// =========================================
// INITIAL STATE
// =========================================

// YOUTUBE LOGO BLACK BACKGROUND REMOVE
makeYoutubeLogoTransparent();

clearScenes();

console.log(
    "🚀 GAMESTORM LEGENDS V5 MUSIC ONLY READY"
);

console.log(
    "🎯 REAL MP3 / AUDIO CLOCK = MASTER"
);

console.log(
    "🔊 SFX = DISABLED"
);

console.log(
    "⏱️ INTRO DURATION =",
    VIDEO_DURATION,
    "SECONDS"
);


// =========================================
// AUTOPLAY THE INTRO
// =========================================

autoplayGameStorm();


window.startGameStorm = startGameStorm;
window.resetGameStorm = resetGameStorm;


// =========================================
// DETERMINISTIC OFFLINE RENDER FRAME
// =========================================
//
// The offline exporter sets:
// window.__GAMESTORM_RENDER_TIME__
//
// Then it calls:
// window.__GAMESTORM_RENDER_FRAME__()
//
// This performs exactly one visual update
// without scheduling another animation frame.
// =========================================

window.__GAMESTORM_RENDER_FRAME__ =
    function () {

        if (
            !videoStarted ||
            videoFinished ||
            finishing
        ) {

            return;

        }


        const currentTime =
            getMasterTime();


        // =====================================
        // MUSIC ANALYSIS
        // =====================================

        updateMusicEvents(
            currentTime
        );


        // =====================================
        // MUSIC DIRECTOR
        // =====================================

        const musicVisual =
            director.update(
                currentTime
            );


        // =====================================
        // CAMERA
        // =====================================

        camera.update(
            musicVisual
        );


        // =====================================
        // VISUAL DIRECTOR
        // =====================================

        visualDirector.update(
            musicVisual
        );


        // =====================================
        // ACTIVE SCENE
        // =====================================

        const activeScene =
            getActiveScene(
                currentTime
            );


        currentScene =
            activeScene;


        updateScenes(
            activeScene
        );


        // =====================================
        // MUSIC VISUAL IMPACT
        // =====================================

        applyMusicImpact();

    };

