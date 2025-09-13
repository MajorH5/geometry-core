import { Body } from "../../physics/body.js";

export const Entity = (function () {
    return class Entity {
        constructor (maxHealth, bodyConfig) {
            this.maxHealth = maxHealth || 100;
            this.health = this.maxHealth;
            this.body = new Body(bodyConfig);
        }
    };
})();