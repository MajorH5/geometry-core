import { Body as PhysicsBody } from "../../physics/body";
import { Constants } from "../../utils/constants";
import { Vector2 } from "../../utils/vector2";
import type { World } from "../world";

type Vector2Type = InstanceType<typeof Vector2>;

export const GameObject = (function () {
    return class GameObject {
        body: InstanceType<typeof PhysicsBody>;
        isSpawned: boolean;
        world: InstanceType<typeof World> | null;
        elapsedTime: number;
        objectId: number;
        renderPriority: number;

        constructor(bodyConfig: any) {
            this.body = new PhysicsBody(bodyConfig);
            this.body.setTag('gameobject', this);

            this.isSpawned = false;
            this.world = null;
            this.elapsedTime = 0;
            this.objectId = -1;
            this.renderPriority = 0;
        }

        getScreenPosition(offset: Vector2Type, scale: number, center: boolean = false): Vector2Type {
            let position = center ? this.getCenter() : this.body.position;

            position = position.scale(scale);
            offset = offset.scale(scale);

            return position.add(offset);
        }

        isOnScreen(offset: Vector2Type, scale: number): boolean {
            if (!this.world) {
                return false;
            }

            const canvasSize = new Vector2(this.world.canvas.width, this.world.canvas.height);

            const screenSize = this.body.size.scale(scale);
            const screenPosition = this.getScreenPosition(offset, scale);

            const visible = (screenPosition.x + screenSize.x > 0 && screenPosition.x < canvasSize.x) &&
                (screenPosition.y + screenSize.y > 0 && screenPosition.y < canvasSize.y);

            return visible;
        }

        getElapsedTimeMs(): number {
            return this.elapsedTime;
        }

        getElapsedTimeSec(): number {
            return this.elapsedTime / 1000;
        }

        setPosition(position: Vector2Type, centerOn: boolean = false): void {
            if (centerOn) {
                position = position.subtract(this.body.size.div(2));
            }

            this.body.position = position;
        }

        getPosition(): Vector2Type {
            return this.body.position;
        }

        getCenter(): Vector2Type {
            return this.body.position.add(this.body.size.div(2));
        }

        getSize(): Vector2Type {
            return this.body.size;
        }

        onSpawn(world: InstanceType<typeof World>, objectId: number): void {
            this.isSpawned = true;
            this.world = world;
            this.objectId = objectId;
        }

        onDespawn(): void {
            this.isSpawned = false;
            this.world = null;
            this.objectId = -1;
        }

        despawn(): void {
            if (!this.isSpawned || this.world === null) {
                return;
            }

            this.isSpawned = false;
        }

        update(deltaTime: number): void {
            this.elapsedTime += deltaTime;
        }

        render(context: CanvasRenderingContext2D, offset: Vector2Type, scale: number): void {
            if (Constants.DEBUG_MODE) {
                this.body.render(context, offset, scale);
            }
        }
    };
})();