import { Vector2 } from "./vector2.js";

export const Constants = (function () {
    return {
        CANVAS_SIZE: new Vector2(800, 600),
        SERVER_WS_URL: 'ws://localhost:3000/v1/database/<database_name>/subscribe',
        DEBUG_MODE: true,
    };
})();