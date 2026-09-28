// =========================================
// GAMESTORM LEGENDS — TEST DOM STUB
// =========================================
//
// The intro is plain browser JavaScript with
// no build step and no dependencies, so the
// tests run on Node with a small stub of the
// only browser APIs the intro touches:
//
//     document, window, requestAnimationFrame,
//     AudioContext, Audio, classList
//
// Nothing in the stub changes the intro code.
// =========================================


// =========================================
// CLASS LIST
// =========================================

class StubClassList {

    constructor() {

        this.items =
            new Set();

    }

    add(name) {

        this.items.add(
            name
        );

    }

    remove(name) {

        this.items.delete(
            name
        );

    }

    contains(name) {

        return this.items.has(
            name
        );

    }

    toggle(
        name,
        force
    ) {

        const active =
            force === undefined
                ? !this.contains(
                    name
                )
                : !!force;

        if (active) {
            this.add(
                name
            );
        } else {
            this.remove(
                name
            );
        }

        return active;

    }

}


// =========================================
// STUB ELEMENT
// =========================================

class StubElement {

    constructor(
        tagName,
        options = {}
    ) {

        this.tagName =
            tagName;

        this.id =
            options.id ||
            "";

        this.className =
            options.className ||
            "";

        this.classList =
            new StubClassList();

        for (
            const name of
            this.className.split(" ")
        ) {

            if (name) {
                this.classList.add(
                    name
                );
            }

        }

        this.dataset = {};

        this.listeners = {};

        this.attributes = {};

        this.naturalWidth = 0;

        this.naturalHeight = 0;

        this.complete = true;

        this.currentTime = 0;

        this.parentNode = null;

        this.children = [];

        const vars =
            new Map();

        this.style = {

            properties:
                vars,

            setProperty(
                name,
                value
            ) {

                vars.set(
                    name,
                    value
                );

            },

            getPropertyValue(
                name
            ) {

                return vars.get(
                    name
                );

            },

            removeProperty(
                name
            ) {

                vars.delete(
                    name
                );

            }

        };

    }

    addEventListener(
        type,
        handler,
        options
    ) {

        if (!this.listeners[type]) {
            this.listeners[type] = [];
        }

        this.listeners[type].push({
            handler,
            once:
                !!(
                    options &&
                    options.once
                )
        });

    }

    appendChild(child) {

        child.parentNode = this;

        this.children.push(
            child
        );

        return child;

    }

    hasClass(name) {

        return this.classList.contains(
            name
        );

    }

}


// =========================================
// STUB HTML AUDIO ELEMENT
// =========================================

class StubAudio
    extends StubElement {

    constructor(
        source
    ) {

        super(
            "audio"
        );

        this.src =
            source ||
            "";

        this.currentSrc =
            this.src;

        this.paused =
            true;

        this.ended =
            false;

        this.loop =
            false;

        this.muted =
            false;

        this.preload =
            "none";

        this.volume =
            1;

        this.duration =
            NaN;

        this.playCalls =
            0;

        this.playShouldFail =
            false;

    }

    async play() {

        this.playCalls++;

        if (
            this.playShouldFail
        ) {

            throw new Error(
                "play() failed"
            );

        }

        this.paused =
            false;

        this.ended =
            false;

    }

    pause() {

        this.paused =
            true;

    }

    addEventListener() {}

    removeEventListener() {}

}


// =========================================
// STUB AUDIO CONTEXT
// =========================================

class StubGainNode {

    constructor() {

        this.gain = {

            value: 1,

            setTargetAtTime(
                value
            ) {

                this.value =
                    value;

            }

        };

        this.connections =
            0;

    }

    connect() {

        this.connections++;

        return this;

    }

    disconnect() {}

}


class StubAudioContext {

    constructor() {

        this.state =
            "running";

        this.currentTime =
            0;

        this.destination =
            new StubGainNode();

        this.resumeCalls =
            0;

    }

    createGain() {

        return new StubGainNode();

    }

    createMediaElementSource(
        element
    ) {

        this.mediaElement =
            element;

        return new StubGainNode();

    }

    async resume() {

        this.resumeCalls++;

        this.state =
            "running";

    }

    async close() {

        this.state =
            "closed";

    }

}


// =========================================
// DOCUMENT STUB
// =========================================

function createDocument() {

    const documentListeners =
        {};

    const scenes =
        [];

    for (
        let i = 0;
        i < 7; i++
    ) {

        scenes.push(
            new StubElement(
                "section",
                {
                    className: "scene"
                }
            )
        );

    }

    const video =
        new StubElement(
            "div",
            {
                id: "video"
            }
        );

    const playIntroOverlay =
        new StubElement(
            "div",
            {
                id: "play-intro-overlay",
                className: "play-intro-overlay"
            }
        );

    const playIntroButton =
        new StubElement(
            "button",
            {
                id: "play-intro-button",
                className: "play-intro-button"
            }
        );

    playIntroOverlay.appendChild(
        playIntroButton
    );

    video.appendChild(
        playIntroOverlay
    );

    const body =
        new StubElement(
            "body"
        );

    const documentElement =
        new StubElement(
            "html"
        );
    const nodes = {

        video,

        "play-intro-overlay":
            playIntroOverlay,

        "play-intro-button":
            playIntroButton

    };
    const document = {

        body,

        documentElement,

        hidden:
            false,

        getElementById(
            id
        ) {

            return nodes[id] ||
                null;

        },

        querySelector(
            selector
        ) {

            if (
                selector ===
                ".youtube-logo-target"
            ) {

                // No logo in the stub, the
                // intro then skips the canvas
                // transparency pass.

                return null;

            }

            return null;

        },

        querySelectorAll(
            selector
        ) {

            if (
                selector ===
                ".scene"
            ) {

                return scenes;

            }

            return [];

        },

        createElement(
            tagName
        ) {

            return new StubElement(
                tagName
            );

        },

        listeners:
            documentListeners,

        addEventListener(
            type,
            handler,
            options
        ) {

            if (
                !documentListeners[type]
            ) {

                documentListeners[type] =
                    [];

            }

            documentListeners[type].push(
                {
                    handler,
                    once:
                        !!(
                            options &&
                            options.once
                        )
                }
            );

        }

    };


    // =================================
    // EVENT DISPATCH
    // =================================
    //
    // Real DOM order for a click on the
    // button: the button handler first,
    // then document, because the click
    // bubbles.

    const dispatch = (
        target,
        type,
        event = {}
    ) => {

        const base = {
            type,
            target,
            preventDefault() {},
            stopPropagation() {}
        };

        const payload =
            Object.assign(
                {},
                base,
                event
            );

        const run = (
            entry
        ) => {

            if (!entry) {
                return;
            }

            entry.handler(
                payload
            );

        };

        const targetEntries =
            [
                ...(
                    (
                        target &&
                        target
                            .listeners &&
                        target
                            .listeners[type]
                    ) ||
                    []
                )
            ];

        for (
            const entry of
            targetEntries
        ) {

            run(
                entry
            );

        }

        if (
            target !== document
        ) {

            for (
                const entry of
                documentListeners[type] ||
                []
            ) {

                run(
                    entry
                );

            }

        }

        return payload;

    };

    return {
        document,
        dispatch,
        scenes,
        video,
        playIntroOverlay,
        playIntroButton
    };

}


// =========================================
// ENVIRONMENT
// =========================================
//
// Installs the stub globals for one test.
// Returns a handle with the pieces the tests
// inspect, plus a restore() function.
// =========================================

export function installEnvironment(
    options = {}
) {

    const dom =
        createDocument();

    const audioContexts =
        [];

    const audioElements =
        [];

    const state = {

        rafCallbacks:
            new Map(),

        rafId:
            0,

        cancelledFrames:
            [],

        audioContexts,

        audioElements,

        gainNodes:
            [],

        logs: []

    };

    const previous = {

        window:
            globalThis.window,

        document:
            globalThis.document,

        Audio:
            globalThis.Audio,

        AudioContext:
            globalThis.AudioContext,

        requestAnimationFrame:
            globalThis.requestAnimationFrame,

        cancelAnimationFrame:
            globalThis.cancelAnimationFrame

    };


    // =================================
    // AUDIO CONTEXT
    // =================================

    class TrackedAudioContext
        extends StubAudioContext {

        constructor() {

            super();

            if (
                options
                    .resumeBlocked
            ) {

                this.state =
                    "suspended";

            }

            if (
                options
                    .resumeRejects
            ) {

                this.resume =
                    async () => {

                        this.resumeCalls++;

                        const error =
                            new Error(
                                "blocked"
                            );

                        error.name =
                            "NotAllowedError";

                        throw error;

                    };

            }

            audioContexts.push(
                this
            );

        }

        createGain() {

            const gain =
                super.createGain();

            state.gainNodes.push(
                gain
            );

            return gain;

        }

    }

    // =================================
    // AUDIO ELEMENT
    // =================================

    class TrackedAudio
        extends StubAudio {

        constructor(
            source
        ) {

            super(
                source
            );

            if (
                options.musicPlayFails
            ) {

                this.playShouldFail =
                    true;

            }

            audioElements.push(
                this
            );

        }

    }

    // =================================
    // FRAME LOOP
    // =================================
    //
    // Frames are recorded, never run, so a
    // test can assert the loop was started
    // without an endless rAF chain.

    const requestAnimationFrame =
        callback => {

            const id =
                ++state.rafId;

            state.rafCallbacks.set(
                id,
                callback
            );

            return id;

        };

    const cancelAnimationFrame =
        id => {

            state.cancelledFrames.push(
                id
            );

            state.rafCallbacks.delete(
                id
            );

        };

    const windowStub = {

        document:
            dom.document,

        addEventListener() {},

        removeEventListener() {},

        setTimeout,
        clearTimeout,

        AudioContext:
            TrackedAudioContext

    };

    if (
        options.renderMode
    ) {

        windowStub.__GAMESTORM_RENDER_MODE__ =
            true;

    }

    globalThis.window =
        windowStub;

    globalThis.document =
        dom.document;

    globalThis.Audio =
        TrackedAudio;

    globalThis.AudioContext =
        TrackedAudioContext;

    globalThis.requestAnimationFrame =
        requestAnimationFrame;

    globalThis.cancelAnimationFrame =
        cancelAnimationFrame;

    // Keep the test output readable, the
    // intro logs a lot on purpose, but keep
    // the lines so tests can assert them.

    const originalLog =
        console.log;

    const originalWarn =
        console.warn;

    const quiet =
        options.silent === false;

    console.log =
        (...args) => {

            state.logs.push(
                args
            );

            if (quiet) {
                originalLog(
                    ...args
                );
            }

        };

    console.warn =
        (...args) => {

            state.logs.push(
                args
            );

            if (quiet) {
                originalWarn(
                    ...args
                );
            }

        };

    return {

        ...dom,

        window:
            windowStub,

        state,

        runFrame() {

            const next =
                state.rafCallbacks.entries()
                    .next()
                    .value;

            if (!next) {
                return false;
            }

            const [
                id,
                callback
            ] = next;

            state.rafCallbacks.delete(
                id
            );

            callback(0);

            return true;

        },

        restore() {

            globalThis.window =
                previous.window;

            globalThis.document =
                previous.document;

            globalThis.Audio =
                previous.Audio;

            globalThis.AudioContext =
                previous.AudioContext;

            globalThis.requestAnimationFrame =
                previous.requestAnimationFrame;

            globalThis.cancelAnimationFrame =
                previous.cancelAnimationFrame;

            console.log =
                originalLog;

            console.warn =
                originalWarn;

        }

    };

}


export {
    StubElement,
    StubAudio,
    StubAudioContext
};
