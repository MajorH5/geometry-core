import { Constants } from "./utils/constants.js";

export const GeometryCore = (function () {
    return class GeometryCore {
        constructor (canvas) {
            this.canvas = canvas;
            this.context = canvas.getContext("2d");

            this.initialized = false;
            this.isRunning = false;
            this.lastFrameTime = null;
        }


        initialize () {
            if (this.initialized) {
                return;
            }

            this.initialized = true;
            this.canvas.width = Constants.CANVAS_SIZE.x;
            this.canvas.height = Constants.CANVAS_SIZE.y;
        }

        start () {
            if (this.isRunning) {
                return;
            }

            this.isRunning = true;
            this.loop(1 / 60);
        }

        loop () {
            if (!this.isRunning) {
                return;
            }

            const now = Date.now();
            const deltaTime = this.lastFrameTime !== null ? now - this.lastFrameTime : 1 / 60;

            this.update(deltaTime);
            this.render();
            
            requestAnimationFrame(() => this.loop());
            this.lastFrameTime = now;
        }

        stop () {
            if (!this.isRunning) {
                return;
            }
            
            this.isRunning = false;
        }

        update (deltaTime) {

        }

        render () {
            this.context.clearRect(0, 0, Constants.CANVAS_SIZE.x, Constants.CANVAS_SIZE.y);
        }
    };
})();