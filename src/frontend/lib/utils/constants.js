import { Vector2 } from "./vector2.js";

export const Constants = (function () {
    return {
        CANVAS_SIZE: new Vector2(800, 600),
        SERVER_WS_URL: 'wss://localhost:3000',
        DEBUG_MODE: true,
    };
})();