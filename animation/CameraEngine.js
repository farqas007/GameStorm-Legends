// =========================================
// GAMESTORM LEGENDS
// CAMERA ENGINE V2
// SMOOTH MUSIC DRIVEN CINEMATIC CAMERA
// =========================================

export class CameraEngine {

    constructor(element) {

        this.element =
            element;

        this.shake =
            0;

        this.zoom =
            0;

        this.x =
            0;

        this.y =
            0;

        // Smooth camera state
        this.targetX =
            0;

        this.targetY =
            0;

        this.targetZoom =
            0;

    }


    // =====================================
    // UPDATE
    // =====================================

    update(data) {

        if (
            !this.element ||
            !data
        ) {

            return;

        }


        // =================================
        // MUSIC DATA
        // =================================

        const energy =
            Math.min(
                Math.max(
                    Number(data.energy) || 0,
                    0
                ),
                1
            );


        const shake =
            Math.min(
                Math.max(
                    Number(data.cameraShake) || 0,
                    0
                ),
                1
            );


        const zoom =
            Math.min(
                Math.max(
                    Number(data.cameraZoom) || 0,
                    0
                ),
                0.12
            );


        const majorHit =
            !!data.majorHit;


        const strongHit =
            !!data.strongHit;


        // =================================
        // TARGET ZOOM
        // =================================

        this.targetZoom =
            zoom;


        // Extra cinematic punch
        if (majorHit) {

            this.targetZoom =
                Math.min(
                    zoom + 0.025,
                    0.12
                );

        }

        else if (strongHit) {

            this.targetZoom =
                Math.min(
                    zoom + 0.010,
                    0.12
                );

        }


        // =================================
        // TARGET CAMERA SHAKE
        // =================================

        const shakeAmount =
            shake *
            (
                majorHit
                    ? 11
                    : strongHit
                        ? 6
                        : 3
            );


        // =================================
        // SMOOTH RANDOM MOVEMENT
        // =================================

        if (
            shakeAmount > 0
        ) {

            this.targetX =
                (
                    Math.random() -
                    0.5
                ) *
                shakeAmount;


            this.targetY =
                (
                    Math.random() -
                    0.5
                ) *
                shakeAmount;

        }

        else {

            this.targetX =
                0;

            this.targetY =
                0;

        }


        // =================================
        // SMOOTH CAMERA
        // =================================

        this.x +=
            (
                this.targetX -
                this.x
            ) *
            0.18;


        this.y +=
            (
                this.targetY -
                this.y
            ) *
            0.18;


        this.zoom +=
            (
                this.targetZoom -
                this.zoom
            ) *
            0.16;


        // =================================
        // APPLY
        // =================================

        this.element.style.setProperty(
            "--camera-x",
            `${this.x}px`
        );


        this.element.style.setProperty(
            "--camera-y",
            `${this.y}px`
        );


        this.element.style.setProperty(
            "--camera-zoom",
            1 + this.zoom
        );


        // =================================
        // DEBUG
        // =================================

        if (
            majorHit
        ) {

            console.log(
                "🎥 CAMERA MAJOR HIT",
                {
                    energy:
                        energy.toFixed(3),

                    shake:
                        shake.toFixed(3),

                    zoom:
                        this.zoom.toFixed(3),

                    x:
                        this.x.toFixed(2),

                    y:
                        this.y.toFixed(2)
                }
            );

        }

    }


    // =====================================
    // RESET
    // =====================================

    reset() {

        if (
            !this.element
        ) {

            return;

        }


        this.shake =
            0;

        this.zoom =
            0;

        this.x =
            0;

        this.y =
            0;

        this.targetX =
            0;

        this.targetY =
            0;

        this.targetZoom =
            0;


        this.element.style.setProperty(
            "--camera-x",
            "0px"
        );


        this.element.style.setProperty(
            "--camera-y",
            "0px"
        );


        this.element.style.setProperty(
            "--camera-zoom",
            "1"
        );

    }

}
