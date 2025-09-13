import { GameObject } from "../gameobject.js";

export const Projectile = (function () {
    return class Projectile extends GameObject {
        constructor (origin, velocity, projectileInfo) {
            super({
                position: origin,
                velocity: velocity,
                size: projectileInfo.size
            });
        }

        update (deltaTime) {
            super.update(deltaTime);

            if (this.getElapsedTimeSec() > 0.3) {
                this.despawn();
            }
        }

        render (context, offset, scale) {
            super.render(context, offset, scale);
        }
    };
})();