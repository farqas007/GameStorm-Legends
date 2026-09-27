// =========================================
// GAMESTORM LEGENDS
// CAMERA ENGINE V1
// MUSIC DRIVEN CAMERA
// =========================================


export class CameraEngine {


    constructor(element){

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

    }



    update(data){


        if(
            !this.element ||
            !data
        ){

            return;

        }



        // =============================
        // MUSIC ZOOM
        // =============================

        this.zoom =
            data.cameraZoom || 0;



        // =============================
        // CAMERA SHAKE
        // =============================

        this.shake =
            data.cameraShake || 0;



        if(
            this.shake > 0
        ){

            this.x =
                (Math.random()-0.5)
                *
                this.shake
                *
                20;


            this.y =
                (Math.random()-0.5)
                *
                this.shake
                *
                20;


        }
        else{


            this.x =
                0;

            this.y =
                0;

        }



        // =============================
        // APPLY CAMERA
        // =============================


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



    }



    reset(){


        if(
            !this.element
        ){

            return;

        }


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
