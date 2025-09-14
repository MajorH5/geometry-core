import { Vector2 } from "../../../utils/vector2";

type Vector2Type = InstanceType<typeof Vector2>;

export const ProjectileInfo = (function () {
    return class ProjectileInfo {
        amount: number;
        speed: number;
        size: Vector2Type;
        damage: number;
        color: string;
        spread: number;
        rateOfFire: number;
        lifetime: number;

        constructor (config: any) {
            this.amount = config.amount || 0;
            this.speed = config.speed || 0;
            this.size = config.size || new Vector2(0, 0);
            this.damage = config.damage || 0;
            this.color = config.color || '#fffffff';
            this.spread = config.spread || 0;
            this.rateOfFire = config.rateOfFire || 1;
            this.lifetime = config.lifetime || 1;
        }
    }
})();