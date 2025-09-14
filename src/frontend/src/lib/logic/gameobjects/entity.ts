import { Vector2 } from "../../utils/vector2";
import { GameObject } from "./gameobject.js";
import { Projectile } from "./projectiles/projectile.ts";
import { ProjectileInfo } from "./projectiles/projectileInfo.ts";

type Vector2Type = InstanceType<typeof Vector2>;

export const Entity = (function () {
    return class Entity extends GameObject {
        maxHealth: number;
        health: number;
        healtbarOffset: number;
        name: string;
        attackAngle: number;
        projectileInfo: InstanceType<typeof ProjectileInfo>;
        lastAttack: number;
        isFiring: boolean;
        hostile: boolean;

        constructor(maxHealth: number, hostile: boolean, bodyConfig: any) {
            super(bodyConfig);

            this.hostile = hostile;
            this.maxHealth = maxHealth || 100;
            this.health = this.maxHealth;
            this.healtbarOffset = 10;
            this.attackAngle = 0;
            this.name = 'entity';
            this.projectileInfo = new ProjectileInfo({

            });

            this.isFiring = false;
            this.lastAttack = -Infinity;
        }

        loadState (networkEntity: any) {
            this.health = networkEntity.health;
            this.maxHealth = networkEntity.maxHealth;
            console.log(this.health, this.maxHealth, this.hostile)
            this.setPosition(new Vector2(networkEntity.x, networkEntity.y));

            const projectileInfo = networkEntity.projectileInfo;

            this.projectileInfo = new ProjectileInfo({
                amount: projectileInfo.amount,
                speed: projectileInfo.speed,
                size: new Vector2(projectileInfo.size, projectileInfo.size),
                damage: projectileInfo.damage,
                spread: projectileInfo.spread,
                color: projectileInfo.color,
                rateOfFire: projectileInfo.rateOfFire,
            });
        }

        canFireProjectile(): boolean {
            return this.isFiring && ((Date.now() - this.lastAttack) / 1000) >= this.projectileInfo.rateOfFire;
        }

        setProjectileInfo (projectileInfo: InstanceType<typeof ProjectileInfo>) {
            this.projectileInfo = projectileInfo;
        }

        emitProjectiles(angle: number, projectileInfo: any): void {
            if (!this.world || this.isDead()) {
                return;
            }

            for (let index = 0; index < projectileInfo.amount; index++) {
                const spreadRad = projectileInfo.spread * (Math.PI / 180);
                const emissionAngle = (index - (projectileInfo.amount / 2)) * spreadRad + angle
		        const direction = new Vector2(Math.cos(emissionAngle), Math.sin(emissionAngle))

                const velocity = direction.scale(projectileInfo.speed);
                const projectile = new Projectile(this, this.getCenter(), velocity, projectileInfo);

                this.world.spawn(projectile);
            }
        }

        damage(amount: number): void {
            if (amount <= 0) return;

            this.health = Math.max(0, this.health - amount);

            if (this.health <= 0) {
                this.despawn();
            }
        }

        heal(amount: number): void {
            if (amount <= 0) return;

            this.health = Math.min(this.maxHealth, this.health + amount);
        }

        isDead(): boolean {
            return this.health <= 0;
        }

        isAlive(): boolean {
            return this.health > 0;
        }

        update (deltaTime: number) {
            super.update(deltaTime);

            if (this.canFireProjectile()) {
                this.emitProjectiles(this.attackAngle, this.projectileInfo);
                this.lastAttack = Date.now();
            }
        }

        render(context: any, offset: Vector2Type, scale: number): void {
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