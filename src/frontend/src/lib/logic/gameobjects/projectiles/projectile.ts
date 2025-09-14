import { GameObject } from "../gameobject";
import { Vector2 } from "../../../utils/vector2";
import { Entity } from "../entity";
import { ProjectileInfo } from "./projectileInfo";
import { Sound } from "../../../sounds/Sounds.ts";

type Vector2Type = InstanceType<typeof Vector2>;

export const Projectile = (function () {
    return class Projectile extends GameObject {
        lifetime: number;
        source: any;
        projectileInfo: InstanceType<typeof ProjectileInfo>;

        constructor(source: any, origin: Vector2Type, velocity: Vector2Type, projectileInfo: InstanceType<typeof ProjectileInfo>) {
            super({
                position: origin,
                velocity: velocity,
                size: projectileInfo.size
            });

            this.projectileInfo = projectileInfo;
            this.lifetime = projectileInfo.lifetime;
            this.source = source;

            this.body.boundaryCollision.listen(() => {
                // hit da wall
                this.despawn();
            });

            this.body.collision.listen((other: any) => {
                if (!this.isSpawned) {
                    return;
                }

                const gameObject = other.getTag('gameobject');

                if (other.solid || (gameObject && !(gameObject instanceof Projectile) && gameObject !== this.source)) {
                    if (this.source instanceof Entity && gameObject instanceof Entity && this.source.hostile === gameObject.hostile) {
                        return;
                    }

                    const replicator = this.world?.getReplicator();

                    if (replicator) {
                        if (this.source.hostile && !gameObject.hostile && gameObject.isLocalPlayer) {
                            // local player hit, report this
                            replicator.damagePlayer(this.source.objectId);

                            const hitSfx = new Sound('/assets/audio/player_hit_sfx.wav', 1);
                            hitSfx.play();
                        } else if (this.source.isLocalPlayer && gameObject.hostile) {
                            // we hit a bad guy
                            replicator.damageEnemy(gameObject.objectId);

                            const sounds = [
                                new Sound('/assets/audio/hit_sfx_1.wav', 1),
                                new Sound('/assets/audio/hit_sfx_2.wav', 1),
                                new Sound('/assets/audio/hit_sfx_3.wav', 1),
                            ];
                            const sound = sounds[Math.floor(Math.random() * sounds.length)];
                            sound.play();
                        }
                    }

                    this.despawn();
                    // hit smth
                }
            });
        }

        update(deltaTime: number): void {
            super.update(deltaTime);

            if (this.getElapsedTimeSec() > this.lifetime) {
                this.despawn();
            }
        }

        render(context: any, offset: Vector2Type, scale: number): void {
            super.render(context, offset, scale);

            const centerX = (this.body.position.x + this.body.size.x / 2 + offset.x) * scale;
            const centerY = (this.body.position.y + this.body.size.y / 2 + offset.y) * scale;
            const baseSize = Math.max(this.body.size.x, this.body.size.y) * scale;
            const time = this.getElapsedTimeMs() * 0.001;

            // Parse hex color and extract RGB values
            const hexColor = this.projectileInfo.color || '#FF64FF';
            const r = parseInt(hexColor.substr(1, 2), 16);
            const g = parseInt(hexColor.substr(3, 2), 16);
            const b = parseInt(hexColor.substr(5, 2), 16);

            context.save();

            // Create pulsating glow effect using base color
            const glowRadius = baseSize * 1.5;
            const glowPulse = Math.sin(time * 8) * 0.3 + 0.7;
            const gradient = context.createRadialGradient(
                centerX, centerY, baseSize * 0.3,
                centerX, centerY, glowRadius * glowPulse
            );
            gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.8)`);
            gradient.addColorStop(0.5, `rgba(${Math.floor(r * 0.8)}, ${Math.floor(g * 0.6)}, ${Math.floor(b * 1.2)}, 0.4)`);
            gradient.addColorStop(1, `rgba(${Math.floor(r * 0.7)}, ${Math.floor(g * 1.1)}, ${Math.floor(b * 1.3)}, 0)`);

            context.fillStyle = gradient;
            context.beginPath();
            context.arc(centerX, centerY, glowRadius * glowPulse, 0, Math.PI * 2);
            context.fill();

            // Draw multiple rotating diamond layers
            for (let layer = 0; layer < 3; layer++) {
                const layerTime = time * (2 + layer * 0.5);
                const layerScale = 1 - layer * 0.15;
                const layerAlpha = 0.9 - layer * 0.2;

                context.save();
                context.translate(centerX, centerY);
                context.rotate(layerTime + layer * Math.PI * 0.25);

                // Create sharp diamond shape
                const diamondSize = baseSize * layerScale;
                const pulse = Math.sin(time * 6 + layer) * 0.2 + 1;
                const currentSize = diamondSize * pulse;

                context.beginPath();
                // Sharp diamond points
                context.moveTo(0, -currentSize); // Top
                context.lineTo(currentSize * 0.7, 0); // Right
                context.lineTo(0, currentSize); // Bottom
                context.lineTo(-currentSize * 0.7, 0); // Left
                context.closePath();

                // Gradient fill for each layer using base color variations
                const layerGradient = context.createRadialGradient(0, 0, 0, 0, 0, currentSize);
                if (layer === 0) {
                    layerGradient.addColorStop(0, `rgba(255, 255, 255, ${layerAlpha})`);
                    layerGradient.addColorStop(0.6, `rgba(${r}, ${g}, ${b}, ${layerAlpha * 0.8})`);
                    layerGradient.addColorStop(1, `rgba(${Math.floor(r * 0.7)}, ${Math.floor(g * 0.5)}, ${Math.floor(b * 1.1)}, ${layerAlpha * 0.4})`);
                } else if (layer === 1) {
                    layerGradient.addColorStop(0, `rgba(${Math.floor(r * 0.9 + 55)}, ${Math.floor(g * 0.8 + 70)}, ${Math.floor(b * 1.1)}, ${layerAlpha})`);
                    layerGradient.addColorStop(1, `rgba(${Math.floor(r * 0.6 + 45)}, ${Math.floor(g * 1.2 + 55)}, ${Math.floor(b * 1.3)}, ${layerAlpha * 0.6})`);
                } else {
                    layerGradient.addColorStop(0, `rgba(${Math.floor(r * 0.5 + 50)}, ${Math.floor(g * 1.1 + 89)}, ${Math.floor(b * 1.4)}, ${layerAlpha})`);
                    layerGradient.addColorStop(1, `rgba(${Math.floor(r * 0.3 + 50)}, ${Math.floor(g * 0.9 + 61)}, ${Math.floor(b * 1.5)}, ${layerAlpha * 0.4})`);
                }

                context.fillStyle = layerGradient;
                context.fill();

                // Sharp outline
                context.strokeStyle = `rgba(255, 255, 255, ${layerAlpha * 0.8})`;
                context.lineWidth = (2 - layer * 0.5) * scale;
                context.stroke();

                context.restore();
            }

            // Add rotating spikes around the core
            const spikeCount = 6;
            const spikeTime = time * 4;

            for (let i = 0; i < spikeCount; i++) {
                const spikeAngle = (i / spikeCount) * Math.PI * 2 + spikeTime;
                const spikeDistance = baseSize * 0.8;
                const spikePulse = Math.sin(time * 10 + i * 0.5) * 0.3 + 0.7;

                const spikeX = centerX + Math.cos(spikeAngle) * spikeDistance * spikePulse;
                const spikeY = centerY + Math.sin(spikeAngle) * spikeDistance * spikePulse;

                context.save();
                context.translate(spikeX, spikeY);
                context.rotate(spikeAngle + Math.PI * 0.5);

                // Draw sharp triangular spike
                const spikeSize = baseSize * 0.3 * spikePulse;
                context.beginPath();
                context.moveTo(0, -spikeSize);
                context.lineTo(spikeSize * 0.3, spikeSize * 0.5);
                context.lineTo(-spikeSize * 0.3, spikeSize * 0.5);
                context.closePath();

                context.fillStyle = `rgba(${Math.floor(r * 1.1)}, ${Math.floor(g * 0.8 + 70)}, ${Math.floor(b * 1.2)}, 0.7)`;
                context.fill();
                context.strokeStyle = `rgba(255, 255, 255, 0.9)`;
                context.lineWidth = 1 * scale;
                context.stroke();

                context.restore();
            }

            // Central core with intense glow using base color
            const coreSize = baseSize * 0.4;
            const corePulse = Math.sin(time * 12) * 0.4 + 0.6;

            // Core glow
            context.shadowColor = `rgba(${r}, ${g}, ${b}, 0.8)`;
            context.shadowBlur = 15 * scale;

            context.beginPath();
            context.arc(centerX, centerY, coreSize * corePulse, 0, Math.PI * 2);
            context.fillStyle = 'rgba(255, 255, 255, 0.9)';
            context.fill();

            // Reset shadow
            context.shadowBlur = 0;

            // Add energy trails based on velocity direction using base color
            if (this.body.velocity.x !== 0 || this.body.velocity.y !== 0) {
                const trailAngle = Math.atan2(this.body.velocity.y, this.body.velocity.x) + Math.PI;
                const trailLength = baseSize * 2;

                for (let t = 0; t < 5; t++) {
                    const trailOffset = trailLength * (t / 5);
                    const trailX = centerX + Math.cos(trailAngle) * trailOffset;
                    const trailY = centerY + Math.sin(trailAngle) * trailOffset;
                    const trailAlpha = 0.6 - (t / 5) * 0.6;
                    const trailSize = baseSize * 0.2 * (1 - t / 5);

                    context.beginPath();
                    context.arc(trailX, trailY, trailSize, 0, Math.PI * 2);
                    context.fillStyle = `rgba(${Math.floor(r * 0.8)}, ${Math.floor(g * 0.7 + 30)}, ${Math.floor(b * 1.3)}, ${trailAlpha})`;
                    context.fill();
                }
            }

            context.restore();
        }
    };
})();