import { Vector2 } from "./vector2.js";

export const Constants = (function () {
    return {
        CANVAS_SIZE: new Vector2(800, 600),
        SERVER_WS_URL: 'ws://localhost:3000/v1/database/c2001e2c680da7326356bd71b5e27f039a579435102ee371b95ceda8c321019b/subscribe',
        DEBUG_MODE: true,
    };
})();