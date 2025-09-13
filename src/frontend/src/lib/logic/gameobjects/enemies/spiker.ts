import { Vector2 } from "../../../utils/vector2";
import { Entity } from "../entity.ts";

type Vector2Type = InstanceType<typeof Vector2>;

const SPIKER_HEALTH = 100;

export const Spiker = (function () {
    return class Spiker extends Entity {
        constructor () {
            super(SPIKER_HEALTH, {
                size: new Vector2(50, 50)
            });
        }
    }
})();