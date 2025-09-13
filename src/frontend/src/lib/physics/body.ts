import { Vector2 } from "../utils/vector2.js";
import { Event as CustomEvent } from "../utils/event.js";

type Vector2Instance = InstanceType<typeof Vector2>;
type CustomEventInstance = InstanceType<typeof CustomEvent>;

interface BodyConfig {
    position?: Vector2Instance;
    size?: Vector2Instance;
    velocity?: Vector2Instance;
    solid?: boolean;
}

export const Body = (function () {
    return class Body {
        public position: Vector2Instance;
        public size: Vector2Instance;
        public velocity: Vector2Instance;
        public solid: boolean;
        public tags: { [key: string]: any };
        public collision: CustomEventInstance;
        public boundaryCollision: CustomEventInstance;

        constructor(config: BodyConfig) {
            this.position = config.position || new Vector2(0, 0);
            this.size = config.size || new Vector2(0, 0);
            this.velocity = config.velocity || new Vector2(0, 0);
            this.solid = config.solid || false;
            this.tags = {};

            this.collision = new CustomEvent();
            this.boundaryCollision = new CustomEvent();
        }

        getTag(tag: string): any {
            return this.tags[tag];
        }

        setTag(tag: string, value: any): void {
            this.tags[tag] = value;
        }

        render(context: CanvasRenderingContext2D, offset: Vector2Instance, scale: number): void {
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