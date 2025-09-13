import { Body } from "../../physics/body.js";

export const Entity = (function () {
    return class Entity {
        constructor (maxHealth, bodyConfig) {
            this.maxHealth = maxHealth || 100;
            this.health = this.maxHealth;
            this.body = new Body(bodyConfig);

            this.isSpawned = false;
            this.world = null;
        }
        
        damage (amount) {
            if (amount <= 0) return;

            this.health = Math.max(0, this.health - amount);
            
            if (this.health <= 0) {
                this.despawn();
            }
        }

        heal (amount) {
            if (amount <= 0) return;

            this.health = Math.min(this.maxHealth, this.health + amount);
        }

        onSpawn (world) {
            this.isSpawned = true;
            this.world = world
        }

        onDespawn () {
            this.isSpawned = false;
            this.world = null;
        }

        despawn () {
            if (!this.isSpawned || this.world === null) {
                return;
            }

            this.world.despawn(this);
        }
    };
})();