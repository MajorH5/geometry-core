import { Vector2 } from "../utils/vector2.js";
import { Event } from "../utils/event.js";

export const Body = (function () {
    return class Body {
        constructor (config) {
            this.position = config.position || new Vector2(0, 0);
            this.size = config.size || new Vector2(0, 0);
            this.velocity = config.velocity || new Vector2(0, 0);
            this.solid = config.solid || false;

            this.collision = new Event();
        }

        render (context) {
            context.strokeStyle = '#ff0000';
            context.lineWidth = 1;

            context.beginPath();
            context.rect(this.position.x, this.position.y, this.size.x, this.size.y);
            context.stroke();
            context.closePath();
        }
    };
})();