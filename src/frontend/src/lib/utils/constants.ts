import { Vector2 } from "./vector2.js";

export const Constants = (function () {
    return {
        SERVER_WS_URL: 'ws://localhost:3000',
        GLOBAL_DB_NAME: 'geometry-core',
        DEBUG_MODE: false,
    } as const;
})();