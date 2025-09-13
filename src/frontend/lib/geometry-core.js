import { Replicator } from "./network/replicator.js";
import { Constants } from "./utils/constants.js";

import { Player } from "./logic/gameobjects/player.js";
import { World } from "./logic/world.js";
import { Vector2 } from "./utils/vector2.js";
import { TheCore } from "./logic/gameobjects/the-core.js";

export const GeometryCore = (function () {
    return class GeometryCore {
        constructor (canvas) {
            this.canvas = canvas;
            this.context = canvas.getContext("2d");

            this.localPlayer = new Player(true, canvas);
            this.replicator = new Replicator(Constants.SERVER_WS_URL);
            
            this.initialized = false;
            this.isRunning = false;
            this.lastFrameTime = null;
            
            this.world = null;
            
            this.world = new World(new Vector2(500, 500), this.replicator);
            
            const core = new TheCore();
            this.world.spawn(core);
            core.setPosition(this.world.worldSize.div(2), true);
            
            this.world.spawn(this.localPlayer);
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
            
            this.lastFrameTime = now;
            requestAnimationFrame(() => this.loop());
        }

        stop () {
            if (!this.isRunning) {
                return;
            }
            
            this.isRunning = false;
        }

        update (deltaTime) {
            if (this.world !== null) {
                this.world.update(deltaTime);
            }
        }

        render () {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            if (this.world !== null) {
                this.world.render(this.context);
            }
        }
    };
})();