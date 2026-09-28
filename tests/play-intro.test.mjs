// =========================================
// GAMESTORM LEGENDS — PLAY INTRO TESTS
// =========================================
//
// The intro does not autoplay any more.
// It waits for one explicit "Play Intro"
// click, which is the user gesture that lets
// the audio start with sound.
//
// These tests run the real script.js against
// the browser stub in dom-stub.mjs, so they
// cover the actual start, reset and finish
// flow, not a copy of it.
//
//     node --test tests/
// =========================================

import test from "node:test";
import assert from "node:assert/strict";

import {
    readFile
} from "node:fs/promises";

import {
    fileURLToPath
} from "node:url";

import {
    installEnvironment
} from "./dom-stub.mjs";


const INTRO_DURATION =
    92.447;

const SCRIPT_URL =
    new URL(
        "../script.js",
        import.meta.url
    ).href;

const INDEX_HTML =
    fileURLToPath(
        new URL(
            "../index.html",
            import.meta.url
        )
    );

const STYLE_CSS =
    fileURLToPath(
        new URL(
            "../style.css",
            import.meta.url
        )
    );

const SCRIPT_FILE =
    fileURLToPath(
        new URL(
            "../script.js",
            import.meta.url
        )
    );


// =========================================
// LOAD THE REAL INTRO SCRIPT
// =========================================
//
// Every test gets a fresh module instance and
// a fresh stub page, because script.js keeps
// its start state in module scope.

let loadCounter =
    0;

async function loadIntro(
    envOptions = {}
) {

    const env =
        installEnvironment(
            envOptions
        );

    const moduleUrl =
        `${SCRIPT_URL}?load=${++loadCounter}`;

    await import(
        moduleUrl
    );

    return env;

}


const flush =
    () => new Promise(
        resolve =>
            setTimeout(
                resolve,
                0
            )
    );


// =========================================
// MARKUP
// =========================================

test(
    "index.html ships one centered Play Intro button over the intro",
    async () => {

        const html =
            await readFile(
                INDEX_HTML,
                "utf8"
            );

        assert.match(
            html,
            /id="play-intro-overlay"/
        );

        assert.match(
            html,
            /id="play-intro-button"/
        );

        assert.match(
            html,
            /type="button"/
        );

        assert.match(
            html,
            /▶ Play Intro/
        );

        assert.match(
            html,
            /id="play-intro-button"[\s\S]{0,80}autofocus/,
            "the button is keyboard reachable"
        );


        // The overlay must sit inside #video,
        // after the scenes, so it is on top of
        // the intro screen.

        const videoAt =
            html.indexOf(
                'id="video"'
            );

        const overlayAt =
            html.indexOf(
                'id="play-intro-overlay"'
            );

        const buttonAt =
            html.indexOf(
                'id="play-intro-button"'
            );

        const videoEnd =
            html.indexOf(
                "</div>",
                overlayAt
            );

        assert.ok(
            overlayAt > videoAt,
            "overlay is inside #video"
        );

        assert.ok(
            buttonAt > overlayAt &&
            buttonAt < videoEnd,
            "button is inside the overlay"
        );

    }
);


// =========================================
// STYLES
// =========================================

test(
    "the Play Intro overlay is centered and can be hidden",
    async () => {

        const css =
            await readFile(
                STYLE_CSS,
                "utf8"
            );

        assert.match(
            css,
            /\.play-intro-overlay\s*\{[^}]*display:\s*flex/
        );

        assert.match(
            css,
            /\.play-intro-overlay\s*\{[^}]*align-items:\s*center/
        );

        assert.match(
            css,
            /\.play-intro-overlay\s*\{[^}]*justify-content:\s*center/
        );

        assert.match(
            css,
            /\.play-intro-overlay\.play-intro-hidden\s*\{\s*display:\s*none;/
        );

    }
);


// =========================================
// NO AUTOPLAY ON LOAD
// =========================================

test(
    "loading the page shows the button and starts nothing",
    async () => {

        const env =
            await loadIntro();

        try {

            // The button is on screen.

            assert.equal(
                env.playIntroOverlay.hasClass(
                    "play-intro-hidden"
                ),
                false
            );

            assert.equal(
                env.playIntroButton.tagName,
                "button"
            );

            assert.equal(
                env.window.__GAMESTORM_RENDER_FRAME__ ===
                undefined,
                false,
                "render frame hook still exposed"
            );


            // No audio context, no music, no
            // visual loop, no scene.

            assert.equal(
                env.state.audioContexts.length,
                0,
                "no AudioContext before the click"
            );

            assert.equal(
                env.state.audioElements.length,
                0,
                "no music element before the click"
            );

            assert.equal(
                env.state.rafCallbacks.size,
                0,
                "no animation frame before the click"
            );

            assert.equal(
                env.video.hasClass(
                    "video-started"
                ),
                false
            );

            assert.ok(
                env.scenes.every(
                    scene =>
                        !scene.hasClass(
                            "active"
                        )
                )
            );

        } finally {

            env.restore();

        }

    }
);


// =========================================
// THE CLICK STARTS THE INTRO WITH SOUND
// =========================================

test(
    "the Play Intro click starts the intro with sound",
    async () => {

        const env =
            await loadIntro();

        try {

            // A click on the button is a real
            // user gesture.

            assert.equal(
                (
                    env.playIntroButton
                        .listeners
                        .click || []
                ).length,
                1,
                "the button owns the start click"
            );

            env.dispatch(
                env.playIntroButton,
                "click"
            );

            await flush();


            // The existing startGameStorm() flow
            // ran: one context, one music
            // element, real play() call.

            assert.equal(
                env.state.audioContexts.length,
                1
            );

            assert.equal(
                env.state.audioElements.length,
                1,
                "no second player, one music element"
            );

            assert.equal(
                env.state.audioElements[0].playCalls,
                1
            );

            assert.equal(
                env.state.audioElements[0].paused,
                false
            );


            // Sound, not a muted workaround.

            assert.equal(
                env.state.audioContexts[0].state,
                "running"
            );

            assert.equal(
                env.state.gainNodes[0]
                    .gain
                    .value,
                0.7,
                "master gain is audible"
            );

            assert.equal(
                env.state.audioElements[0].muted,
                false
            );


            // The timeline started.

            assert.equal(
                env.video.hasClass(
                    "video-started"
                ),
                true
            );

            assert.equal(
                env.scenes[0].hasClass(
                    "active"
                ),
                true
            );

            assert.equal(
                env.state.rafCallbacks.size,
                1,
                "one visual loop running"
            );


            // And the button is gone.

            assert.equal(
                env.playIntroOverlay.hasClass(
                    "play-intro-hidden"
                ),
                true
            );

        } finally {

            env.restore();

        }

    }
);


test(
    "the click never mutes itself to dodge the autoplay policy",
    async () => {

        const env =
            await loadIntro();

        try {

            env.dispatch(
                env.playIntroButton,
                "click"
            );

            await flush();

            const warnings =
                env.state.logs.filter(
                    entry =>
                        entry[0] ===
                        "⚠️ GameStorm music could not start."
                );

            assert.equal(
                warnings.length,
                0
            );

            assert.equal(
                env.playIntroOverlay.hasClass(
                    "play-intro-hidden"
                ),
                true
            );

        } finally {

            env.restore();

        }

    }
);


// =========================================
// NO DOUBLE START
// =========================================

test(
    "extra clicks cannot start a second player",
    async () => {

        const env =
            await loadIntro();

        try {

            env.dispatch(
                env.playIntroButton,
                "click"
            );

            env.dispatch(
                env.playIntroButton,
                "click"
            );

            env.dispatch(
                env.document.body,
                "click"
            );

            await flush();

            assert.equal(
                env.state.audioContexts.length,
                1
            );

            assert.equal(
                env.state.audioElements[0].playCalls,
                1
            );

            assert.equal(
                env.state.rafCallbacks.size,
                1,
                "one visual loop only"
            );

        } finally {

            env.restore();

        }

    }
);


// =========================================
// ESCAPE / RESET
// =========================================

test(
    "Escape resets the intro and brings the button back",
    async () => {

        const env =
            await loadIntro();

        try {

            env.dispatch(
                env.playIntroButton,
                "click"
            );

            await flush();

            const frame =
                env.state.rafCallbacks.size;

            assert.equal(
                frame,
                1
            );

            assert.equal(
                env.playIntroOverlay.hasClass(
                    "play-intro-hidden"
                ),
                true
            );


            // Escape = reset.

            env.dispatch(
                env.document,
                "keydown",
                { key: "Escape" }
            );

            await flush();

            assert.equal(
                env.playIntroOverlay.hasClass(
                    "play-intro-hidden"
                ),
                false,
                "button offered again"
            );

            assert.equal(
                env.video.hasClass(
                    "video-started"
                ),
                false
            );

            assert.equal(
                env.state.rafCallbacks.size,
                0,
                "visual loop stopped"
            );

            assert.equal(
                env.state.cancelledFrames.length > 0,
                true
            );

            assert.equal(
                env.state.audioElements[0].paused,
                true
            );

            assert.equal(
                env.state.audioElements[0].currentTime,
                0
            );

            assert.ok(
                env.scenes.every(
                    scene =>
                        !scene.hasClass(
                            "active"
                        )
                )
            );


            // And the next click plays again.

            env.dispatch(
                env.playIntroButton,
                "click"
            );

            await flush();

            assert.equal(
                env.state.audioElements[0].playCalls,
                2
            );

            assert.equal(
                env.playIntroOverlay.hasClass(
                    "play-intro-hidden"
                ),
                true
            );

            assert.equal(
                env.state.rafCallbacks.size,
                1
            );

        } finally {

            env.restore();

        }

    }
);


// =========================================
// TIMELINE
// =========================================

test(
    "the 92.447 second timeline still ends the intro",
    async () => {

        const env =
            await loadIntro();

        try {

            env.dispatch(
                env.playIntroButton,
                "click"
            );

            await flush();


            // Mid intro: first scene.

            env.state.audioElements[0]
                .currentTime =
                0;

            env.runFrame();

            assert.equal(
                env.scenes[0].hasClass(
                    "active"
                ),
                true
            );


            // Past the end: the intro finishes.

            env.state.audioElements[0]
                .currentTime =
                INTRO_DURATION + 0.5;

            env.runFrame();

            assert.equal(
                env.state.rafCallbacks.size,
                0,
                "loop stopped at the end"
            );

            assert.ok(
                env.scenes.every(
                    scene =>
                        !scene.hasClass(
                            "active"
                        )
                )
            );

            const finished =
                env.state.logs.some(
                    entry =>
                        entry[1] ===
                        INTRO_DURATION
                );

            assert.equal(
                finished,
                true,
                "final time is still 92.447"
            );

        } finally {

            env.restore();

        }

    }
);


// =========================================
// FAILED START
// =========================================

test(
    "a failed start keeps the button on screen",
    async () => {

        const env =
            await loadIntro({
                musicPlayFails: true
            });

        try {

            env.dispatch(
                env.playIntroButton,
                "click"
            );

            await flush();

            assert.equal(
                env.playIntroOverlay.hasClass(
                    "play-intro-hidden"
                ),
                false,
                "button stays, the start failed"
            );

            assert.equal(
                env.video.hasClass(
                    "video-started"
                ),
                false
            );

            assert.equal(
                env.state.rafCallbacks.size,
                0
            );


            // A second click still works.

            env.state.audioElements[0]
                .playShouldFail =
                false;

            env.dispatch(
                env.playIntroButton,
                "click"
            );

            await flush();

            assert.equal(
                env.playIntroOverlay.hasClass(
                    "play-intro-hidden"
                ),
                true
            );

        } finally {

            env.restore();

        }

    }
);


// =========================================
// SUSPENDED CONTEXT
// =========================================

test(
    "a suspended AudioContext still starts the intro on the click",
    async () => {

        const env =
            await loadIntro({
                resumeBlocked: true
            });

        try {

            assert.equal(
                env.playIntroOverlay.hasClass(
                    "play-intro-hidden"
                ),
                false
            );

            env.dispatch(
                env.playIntroButton,
                "click"
            );

            await flush();

            const ctx =
                env.state
                    .audioContexts[0];

            assert.ok(
                ctx,
                "context created by the click"
            );

            assert.equal(
                ctx.resumeCalls,
                1,
                "resume called by the gesture"
            );

            assert.equal(
                ctx.state,
                "running"
            );

            assert.equal(
                env.state.audioElements[0].playCalls,
                1
            );

            assert.equal(
                env.playIntroOverlay.hasClass(
                    "play-intro-hidden"
                ),
                true
            );

        } finally {

            env.restore();

        }

    }
);


// =========================================
// OFFLINE RENDER MODE
// =========================================

test(
    "offline render mode hides the button and starts nothing",
    async () => {

        const env =
            await loadIntro({
                renderMode: true
            });

        try {

            assert.equal(
                env.playIntroOverlay.hasClass(
                    "play-intro-hidden"
                ),
                true
            );

            assert.equal(
                env.state.audioContexts.length,
                0
            );


            // The renderer drives the frames.

            await env.window.startGameStorm();

            assert.equal(
                env.video.hasClass(
                    "video-started"
                ),
                true
            );

            assert.equal(
                env.state.rafCallbacks.size,
                0,
                "no rAF loop in render mode"
            );

            assert.equal(
                env.state.audioElements.length,
                0,
                "no browser audio in render mode"
            );

        } finally {

            env.restore();

        }

    }
);


// =========================================
// DEAD AUTOPLAY CODE
// =========================================

test(
    "the old autoplay code is gone",
    async () => {

        const source =
            await readFile(
                SCRIPT_FILE,
                "utf8"
            );

        assert.equal(
            /autoplayGameStorm/.test(
                source
            ),
            false
        );

        assert.equal(
            /armAudioUnlock/.test(
                source
            ),
            false
        );

        assert.equal(
            /audio\.unlock\(/.test(
                source
            ),
            false
        );

        assert.match(
            source,
            /playIntroButton/
        );

    }
);
