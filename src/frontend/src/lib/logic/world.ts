import { ParticleManager } from "../vfx/particles/particleManager.ts";
import { Physics } from "../physics/physics.ts";
import { Grid } from "../vfx/grid.ts";
import { Camera } from "./camera.ts";
import { Constants } from "../utils/constants.ts";
import type { Replicator } from "../network/replicator.ts";
import type { GameObject } from "./gameobjects/gameobject.ts";
import type { Vector2 } from "../utils/vector2.ts";
import { Player } from "./gameobjects/player.ts";
import { Entity } from "./gameobjects/entity.ts";

type InstanceVector2 = InstanceType<typeof Vector2>;
type InstanceReplicator = InstanceType<typeof Replicator>;
type InstanceGameObject = InstanceType<typeof GameObject>;
type InstancePhysics = InstanceType<typeof Physics>;
type InstanceCamera = InstanceType<typeof Camera>;

export const World = (function () {
    return class World {
        worldSize: InstanceVector2;
        gameObjects: InstanceGameObject[];
        physics: InstancePhysics;
        particleManager: ParticleManager;
        camera: InstanceCamera;
        replicator: InstanceReplicator;
        visualEffects: any[];
        playerLookup: Map<number, InstanceGameObject>;
        entityLookup: Map<number, InstanceGameObject>;
        canvas: HTMLCanvasElement;

        constructor(worldSize: InstanceVector2, replicator: InstanceReplicator, canvas: HTMLCanvasElement) {
            this.canvas = canvas;
            this.worldSize = worldSize;
            this.gameObjects = [];
            this.physics = new Physics(worldSize);
            this.particleManager = new ParticleManager();
            this.camera = new Camera(this);
            this.playerLookup = new Map();
            this.entityLookup = new Map();
            this.replicator = replicator;

            this.visualEffects = [
                // new Grid(worldSize.x, worldSize.y),
                new Grid(this.canvas),
            ];
        }

        getReplicator () {
            return this.replicator;
        }

        spawn(gameObject: any, objectId: number = -1): void {
            if (gameObject.isSpawned) {
                return;
            }

            this.gameObjects.push(gameObject);
            this.physics.add(gameObject.body);
            this.gameObjects.sort((a, z) => a.renderPriority - z.renderPriority);

            if (gameObject instanceof Player) {
                this.playerLookup.set(objectId, gameObject);
            } else if (gameObject instanceof Entity) {
                this.entityLookup.set(objectId, gameObject);
            }

            gameObject.onSpawn(this, objectId);
        }

        despawn(gameObject: InstanceGameObject): void {
            const index = this.gameObjects.indexOf(gameObject);

            if (index === -1) {
                // not found
                return;
            }

            this.gameObjects.splice(index, 1);
            this.physics.remove(gameObject.body);

            if (gameObject instanceof Player) {
                this.playerLookup.delete(gameObject.objectId);
            } else if (gameObject instanceof Entity) {
                this.entityLookup.delete(gameObject.objectId);
            }

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