import { GameObject } from "../gameobject";
import { Vector2 } from "../../../utils/vector2";
import { Entity } from "../entity";

type Vector2Type = InstanceType<typeof Vector2>;

export const Projectile = (function () {
    return class Projectile extends GameObject {
        lifetime: number;
        source: any;

        constructor(source: any, origin: Vector2Type, velocity: Vector2Type, projectileInfo: any) {
            super({
                position: origin,
                velocity: velocity,
                size: projectileInfo.size
            });

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
    
                        } else if (this.source.isLocalPlayer && gameObject.hostile) {
                            // we hit a bad guy
                            console.log("enemy damaged")
                            replicator.damageEnemy(gameObject.objectId);
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

            context.save();

            // Create pulsating glow effect
            const glowRadius = baseSize * 1.5;
            const glowPulse = Math.sin(time * 8) * 0.3 + 0.7;
            const gradient = context.createRadialGradient(
                centerX, centerY, baseSize * 0.3,
                centerX, centerY, glowRadius * glowPulse
            );
            gradient.addColorStop(0, 'rgba(255, 100, 255, 0.8)');
            gradient.addColorStop(0.5, 'rgba(150, 50, 255, 0.4)');
            gradient.addColorStop(1, 'rgba(100, 200, 255, 0)');

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

                // Gradient fill for each layer
                const layerGradient = context.createRadialGradient(0, 0, 0, 0, 0, currentSize);
                if (layer === 0) {
                    layerGradient.addColorStop(0, `rgba(255, 255, 255, ${layerAlpha})`);
                    layerGradient.addColorStop(0.6, `rgba(255, 100, 255, ${layerAlpha * 0.8})`);
                    layerGradient.addColorStop(1, `rgba(150, 50, 255, ${layerAlpha * 0.4})`);
                } else if (layer === 1) {
                    layerGradient.addColorStop(0, `rgba(200, 150, 255, ${layerAlpha})`);
                    layerGradient.addColorStop(1, `rgba(100, 200, 255, ${layerAlpha * 0.6})`);
                } else {
                    layerGradient.addColorStop(0, `rgba(100, 200, 255, ${layerAlpha})`);
                    layerGradient.addColorStop(1, `rgba(50, 150, 255, ${layerAlpha * 0.4})`);
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

                context.fillStyle = `rgba(255, 150, 255, 0.7)`;
                context.fill();
                context.strokeStyle = `rgba(255, 255, 255, 0.9)`;
                context.lineWidth = 1 * scale;
                context.stroke();

                context.restore();
            }

            // Central core with intense glow
            const coreSize = baseSize * 0.4;
            const corePulse = Math.sin(time * 12) * 0.4 + 0.6;

            // Core glow
            context.shadowColor = 'rgba(255, 100, 255, 0.8)';
            context.shadowBlur = 15 * scale;

            context.beginPath();
            context.arc(centerX, centerY, coreSize * corePulse, 0, Math.PI * 2);
            context.fillStyle = 'rgba(255, 255, 255, 0.9)';
            context.fill();

            // Reset shadow
            context.shadowBlur = 0;

            // Add energy trails based on velocity direction
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
                    context.fillStyle = `rgba(150, 100, 255, ${trailAlpha})`;
                    context.fill();
                }
            }

            context.restore();
        }
    };
})();