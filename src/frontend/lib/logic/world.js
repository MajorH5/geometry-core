import { ParticleManager } from "../vfx/particles/particleManager.js";
import { Physics } from "../physics/physics.js";
import { Grid } from "../vfx/grid.js";
import { Camera } from "./camera.js";
import { Constants } from "../utils/constants.js";

export const World = (function () {
    return class World {
        constructor(worldSize, replicator) {
            this.worldSize = worldSize;
            this.gameObjects = [];
            this.physics = new Physics(worldSize);
            this.particleManager = new ParticleManager();
            this.camera = new Camera();
            this.replicator = replicator;

            this.visualEffects = [
                // new Grid(worldSize.x, worldSize.y),
                new Grid(Constants.CANVAS_SIZE.x, Constants.CANVAS_SIZE.y),
            ];
        }

        spawn(gameObject, objectId = -1) {
            if (gameObject.isSpawned) {
                return;
            }

            this.gameObjects.push(gameObject);
            this.physics.add(gameObject.body);
            this.gameObjects.sort((a, z) => a.renderPriority - z.renderPriority);

            gameObject.onSpawn(this, objectId);
        }

        despawn(gameObject) {
            const index = this.gameObjects.indexOf(gameObject);

            if (index === -1) {
                // not found
                return;
            }

            this.gameObjects.splice(index, 1);
            this.physics.remove(gameObject.body);
            gameObject.onDespawn();
        }

        update(deltaTime) {
            this.physics.update(deltaTime);

            const toDespawn = [];

            for (let i = 0; i < this.gameObjects.length; i++) {
                const gameObject = this.gameObjects[i];
                gameObject.update(deltaTime);

                if (!gameObject.isSpawned) {
                    toDespawn.push(gameObject);
                }
            }

            if (toDespawn.length > 0) {
                for (let i = 0; i < toDespawn.length; i++) {
                    this.despawn(toDespawn[i]);
                }
            }

            this.camera.update(deltaTime);
            this.particleManager.update(deltaTime);
        }

        render(context) {
            const cameraOffset = this.camera.getOffset();
            const cameraScale = this.camera.getScale();

            for (let i = 0; i < this.visualEffects.length; i++) {
                const vfx = this.visualEffects[i];
                vfx.render(context, cameraOffset, cameraScale);
            }

            for (let i = 0; i < this.gameObjects.length; i++) {
                const gameObject = this.gameObjects[i];

                if (!gameObject.isOnScreen(cameraOffset, cameraScale)) {
                    continue;
                }

                gameObject.render(context, cameraOffset, cameraScale);
            }

            this.particleManager.render(context, cameraOffset, cameraScale);
        }
    }
})();