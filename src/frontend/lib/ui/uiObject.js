import { Vector2 } from "../utils/vector2.js";

export const UIObject = (function () {
    return class UIObject {
        constructor (config) {
            this.position = config.position || new Vector2(0, 0);
            this.visible = config.visible || true;
        }

        update (deltaTime) {
            
        }

        render (context) {
            
        }
    }
})();