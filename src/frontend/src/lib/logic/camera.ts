import { Constants } from "../utils/constants";
import { Vector2 } from "../utils/vector2";
import { GameObject } from "./gameobjects/gameobject.ts";

type Vector2Type = InstanceType<typeof Vector2>;

export const Camera = (function () {
    return class Camera {
        subject: any;
        offset: Vector2Type;
        smoothness: number;
        scale: number;
        anchorPoint: Vector2Type;

        constructor() {
            this.subject = null;
            this.offset = new Vector2(0, 0);
            this.smoothness = 0.10;
            this.scale = 1;
            this.anchorPoint = new Vector2(0.5, 0.5);
        }

        getOffset(): Vector2Type {
            // Round offset to nearest pixel for crisp rendering
            const offset = this.offset.scale(-1);
            return new Vector2(
                Math.round(offset.x),
                Math.round(offset.y)
            );
        }

        getScale(): number {
            return this.scale;
        }

        setSubject(subject: any): void {
            this.subject = subject;
            this.offset = this.calculateGoalPosition(subject);
        }

        calculateGoalPosition(subject: any, deltaTime?: number): Vector2Type {
            let target: Vector2Type | null = null;

            if (subject instanceof Vector2) {
                target = subject;
            } else if (subject instanceof GameObject) {
                target = subject.getCenter();
            }

            if (target === null) {
                return new Vector2(0, 0);
            }

            const offset = Constants.CANVAS_SIZE.multiply(this.anchorPoint).scale(-1).div(this.scale);
            return target.add(offset);
        }

        update(deltaTime: number): void {
            if (this.subject === null) {
                return;
            }

            const goal = this.calculateGoalPosition(this.subject, deltaTime);
            const lerpedPosition = this.offset.lerp(goal, this.smoothness);

            this.offset = lerpedPosition;
        }
    }
})();