import { ParticleManager } from "../vfx/particles/particleManager.js";
import { Physics } from "../physics/physics.ts";
import { Grid } from "../vfx/grid.ts";
import { Camera } from "./camera.ts";
import { Constants } from "../utils/constants.ts";

export const World = (function () {
    return class World {
        worldSize: any;
        gameObjects: any[];
        physics: InstanceType<typeof Physics>;
        particleManager: ParticleManager;
        camera: Camera;
        replicator: any;
        visualEffects: any[];

        constructor(worldSize: any, replicator: any) {
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

        spawn(gameObject: any, objectId: number = -1): void {
            if (gameObject.isSpawned) {
                return;
            }

            this.gameObjects.push(gameObject);
            this.physics.add(gameObject.body);
            this.gameObjects.sort((a, z) => a.renderPriority - z.renderPriority);

            gameObject.onSpawn(this, objectId);
        }

        despawn(gameObject: any): void {
            const index = this.gameObjects.indexOf(gameObject);

            if (index === -1) {
                // not found
                return;
            }

            this.gameObjects.splice(index, 1);
            this.physics.remove(gameObject.body);
            gameObject.onDespawn();
        }

        update(deltaTime: number): void {
            this.physics.update(deltaTime);

            const toDespawn: any[] = [];

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

        render(context: any): void {
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