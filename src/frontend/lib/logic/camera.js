import { Constants } from "../utils/constants.js";
import { Vector2 } from "../utils/vector2.js";
import { GameObject } from "./gameobjects/gameobject.js";

export const Camera = (function () {
    return class Camera {
        constructor() {
            this.subject = null;
            this.offset = new Vector2(0, 0);
            this.smoothness = 0.10;
            this.scale = 1;
            this.anchorPoint = new Vector2(0.5, 0.5);
        }

        getOffset() {
            // Round offset to nearest pixel for crisp rendering
            const offset = this.offset.scale(-1);
            return new Vector2(
                Math.round(offset.x),
                Math.round(offset.y)
            );
        }

        getScale() {
            return this.scale;
        }

        setSubject(subject) {
            this.subject = subject;
            this.offset = this.calculateGoalPosition(subject);
        }

        calculateGoalPosition(subject, deltaTime) {
            let target = null;

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

        update(deltaTime) {
            if (this.subject === null) {
                return;
            }

            const goal = this.calculateGoalPosition(this.subject, deltaTime);
            const lerpedPosition = this.offset.lerp(goal, this.smoothness);

            this.offset = lerpedPosition;
        }
    }
})();