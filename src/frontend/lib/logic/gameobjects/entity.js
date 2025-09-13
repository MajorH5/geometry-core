import { GameObject } from "./gameobject.js";

export const Entity = (function () {
    return class Entity extends GameObject {
        constructor(maxHealth, bodyConfig) {
            super(bodyConfig);

            this.maxHealth = maxHealth || 100;
            this.health = this.maxHealth;
            this.healtbarOffset = 10;
        }

        emitProjectile (angle, projectileInfo) {
            if (!this.isSpawned || this.isDead()) {
                return;
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

        isDead () {
            return this.health <= 0;
        }

        isAlive () {
            return this.health > 0;
        }

        render(context) {
            super.render(context);

            const barWidth = this.body.size.x;
            const barHeight = 6;
            const x = this.body.position.x + this.body.size.x / 2 - barWidth / 2;
            const y = this.body.position.y - this.body.size.y / 2 - barHeight + this.healtbarOffset;

            context.fillStyle = 'black';
            context.fillRect(x, y, barWidth, barHeight);

            const healthWidth = (this.health / this.maxHealth) * barWidth;
            context.fillStyle = 'limegreen';
            context.fillRect(x, y, healthWidth, barHeight);

            context.strokeStyle = 'black';
            context.lineWidth = 1;
            context.strokeRect(x, y, barWidth, barHeight);
        }

    };
})();