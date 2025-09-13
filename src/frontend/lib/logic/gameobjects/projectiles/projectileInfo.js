import { Vector2 } from "../../../utils/vector2.js";

export const ProjectileInfo = (function () {
    return class ProjectileInfo {
        constructor (config) {
            this.amount = config.amount || 0;
            this.speed = config.speed || 0;
            this.size = config.size || new Vector2(0, 0);
        }
    }
})();