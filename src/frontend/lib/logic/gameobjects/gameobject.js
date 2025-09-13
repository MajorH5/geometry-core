import { Body } from "../../physics/body.js";
import { Constants } from "../../utils/constants.js";

export const GameObject = (function () {
    return class GameObject {
        constructor(bodyConfig) {
            this.body = new Body(bodyConfig);
            this.body.setTag('gameobject', this);

            this.isSpawned = false;
            this.world = null;
            this.elapsedTime = 0;
            this.objectId = -1;
            this.renderPriority = 0;
        }

        getScreenPosition(offset, scale, center = false) {
            let position = center ? this.getCenter() : this.body.position;

            position = position.scale(scale);
            offset = offset.scale(scale);

            return position.add(offset);
        }

        isOnScreen(offset, scale) {
            if (!this.isSpawned) {
                return false;
            }

            const canvasSize = Constants.CANVAS_SIZE;

            const screenSize = this.body.size.scale(scale);
            const screenPosition = this.getScreenPosition(offset, scale);

            const visible = (screenPosition.x + screenSize.x > 0 && screenPosition.x < canvasSize.x) &&
                (screenPosition.y + screenSize.y > 0 && screenPosition.y < canvasSize.y);

            return visible;
        }

        getElapsedTimeMs() {
            return this.elapsedTime;
        }

        getElapsedTimeSec () {
            return this.elapsedTime / 1000;
        }

        setPosition(position, centerOn = false) {
            if (centerOn) {
                position = position.subtract(this.body.size.div(2));
            }

            this.body.position = position;
        }

        getPosition() {
            return this.position;
        }

        getCenter() {
            return this.body.position.add(this.body.size.div(2));
        }

        getSize() {
            return this.body.size;
        }

        onSpawn(world, objectId) {
            this.isSpawned = true;
            this.world = world;
            this.objectId = objectId;
        }

        onDespawn() {
            this.isSpawned = false;
            this.world = null;
        }

        despawn() {
            if (!this.isSpawned || this.world === null) {
                return;
            }

            this.isSpawned = false;
        }

        update(deltaTime) {
            this.elapsedTime += deltaTime;
        }

        render(context, offset, scale) {
            if (Constants.DEBUG_MODE) {
                this.body.render(context, offset, scale);
            }
        }
    };
})();