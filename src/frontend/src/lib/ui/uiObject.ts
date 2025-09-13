import { Vector2 } from "../utils/vector2";

type Vector2Type = InstanceType<typeof Vector2>;

export const UIObject = (function () {
    return class UIObject {
        position: Vector2Type;
        visible: boolean;

        constructor (config: any) {
            this.position = config.position || new Vector2(0, 0);
            this.visible = config.visible || true;
        }

        update (deltaTime: number): void {
            
        }

        render (context: any): void {
            
        }
    }
})();