import { Vector2 } from "../utils/vector2.ts";
import { Body } from "./body.ts";

type Vector2Instance = InstanceType<typeof Vector2>;
type BodyInstance = InstanceType<typeof Body>;

export const Physics = (function () {
    return class Physics {
        private worldSize: Vector2Instance;
        private bodies: BodyInstance[];

        constructor(worldSize: Vector2Instance) {
            this.worldSize = worldSize;
            this.bodies = [];
        }

        add(body: BodyInstance): void {
            this.bodies.push(body);
        }

        remove(body: BodyInstance): void {
            const index = this.bodies.indexOf(body);

            if (index === -1) {
                return;
            }

            this.bodies.splice(index, 1);
        }
        
        checkCollision(body1: BodyInstance, body2: BodyInstance): boolean {
            return (
                body1.position.x < body2.position.x + body2.size.x &&
                body1.position.x + body1.size.x > body2.position.x &&
                body1.position.y < body2.position.y + body2.size.y &&
                body1.position.y + body1.size.y > body2.position.y
            );
        }

        update(deltaTime: number): void {
            for (let i = 0; i < this.bodies.length; i++) {
                const body = this.bodies[i];

                body.position = body.position.add(body.velocity);

                if (body.position.x < 0) {
                    body.position.x = 0;
                    body.boundaryCollision.trigger();
                } else if (body.position.x + body.size.x > this.worldSize.x) {
                    body.position.x = this.worldSize.x - body.size.x;
                    body.boundaryCollision.trigger();
                }
                
                if (body.position.y < 0) {
                    body.position.y = 0;
                    body.boundaryCollision.trigger();
                } else if (body.position.y + body.size.y > this.worldSize.y) {
                    body.position.y = this.worldSize.y - body.size.y;
                    body.boundaryCollision.trigger();
                }

                for (let j = 0; j < this.bodies.length; j++) {
                    if (i === j) {
                        // same object skip them
                        continue;
                    }

                    const otherBody = this.bodies[j];

                    const didCollide = this.checkCollision(body, otherBody);

                    if (!didCollide) {
                        continue;
                    }

                    body.collision.trigger(otherBody);
                    otherBody.collision.trigger(body);
                }

            }
        }
    }
})()