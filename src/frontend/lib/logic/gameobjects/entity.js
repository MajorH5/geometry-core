import { Vector2 } from "../../utils/vector2.js";
import { GameObject } from "./gameobject.js";
import { Projectile } from "./projectiles/projectile.js";

export const Entity = (function () {
    return class Entity extends GameObject {
        constructor(maxHealth, bodyConfig) {
            super(bodyConfig);

            this.maxHealth = maxHealth || 100;
            this.health = this.maxHealth;
            this.healtbarOffset = 10;
        }

        emitProjectiles(angle, projectileInfo) {
            if (!this.isSpawned || this.isDead()) {
                return;
            }

            for (let i = 0; i < projectileInfo.amount; i++) {
                const velocity = new Vector2(Math.cos(angle), Math.sin(angle)).scale(projectileInfo.speed);
                const projectile = new Projectile(this, this.getCenter(), velocity, projectileInfo);

                this.world.spawn(projectile);
            }
        }

        damage(amount) {
            if (amount <= 0) return;

            this.health = Math.max(0, this.health - amount);

            if (this.health <= 0) {
                this.despawn();
            }
        }

        heal(amount) {
            if (amount <= 0) return;

            this.health = Math.min(this.maxHealth, this.health + amount);
        }

        isDead() {
            return this.health <= 0;
        }

        isAlive() {
            return this.health > 0;
        }

        render(context, offset, scale) {
            super.render(context, offset, scale);

            const barWidth = this.body.size.x * scale;
            const barHeight = 6 * scale;
            const x = (this.body.position.x + this.body.size.x / 2 + offset.x) * scale - barWidth / 2;
            const y = (this.body.position.y - this.body.size.y / 2 + offset.y) * scale - barHeight + this.healtbarOffset * scale;

            context.fillStyle = 'black';
            context.fillRect(x, y, barWidth, barHeight);

            const healthWidth = (this.health / this.maxHealth) * barWidth;
            context.fillStyle = 'limegreen';
            context.fillRect(x, y, healthWidth, barHeight);

            context.strokeStyle = 'black';
            context.lineWidth = 1 * scale;
            context.strokeRect(x, y, barWidth, barHeight);
        }

    };
})();