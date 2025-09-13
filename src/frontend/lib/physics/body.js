import { Vector2 } from "../utils/vector2.js";
import { Event } from "../utils/event.js";

export const Body = (function () {
    return class Body {
        constructor(config) {
            this.position = config.position || new Vector2(0, 0);
            this.size = config.size || new Vector2(0, 0);
            this.velocity = config.velocity || new Vector2(0, 0);
            this.solid = config.solid || false;

            this.collision = new Event();
        }

        render(context, offset, scale) {
            context.strokeStyle = '#ff0000';
            context.lineWidth = 1 * scale;

            context.beginPath();
            context.rect(
                (this.position.x + offset.x) * scale,
                (this.position.y + offset.y) * scale,
                this.size.x * scale,
                this.size.y * scale
            );
            context.stroke();
            context.closePath();
        }
    };
})();