import { Vector2 } from "../../../utils/vector2";

type Vector2Type = InstanceType<typeof Vector2>;

export const ProjectileInfo = (function () {
    return class ProjectileInfo {
        amount: number;
        speed: number;
        size: Vector2Type;

        constructor (config: any) {
            this.amount = config.amount || 0;
            this.speed = config.speed || 0;
            this.size = config.size || new Vector2(0, 0);
        }
    }
})();