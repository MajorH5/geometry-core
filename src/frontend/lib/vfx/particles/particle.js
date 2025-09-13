import { Vector2 } from "../../utils/vector2.js";

export const Particle = (function () {
    return class Particle {
        constructor () {
            this.position = new Vector2(0, 0);
        }
    }
})();