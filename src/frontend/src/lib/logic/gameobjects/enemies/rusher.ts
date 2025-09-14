import { Vector2 } from "../../../utils/vector2.ts";
import { Entity } from "../entity.ts";

type Vector2Type = InstanceType<typeof Vector2>;

const RUSHER_HEALTH = 100;

export const Rusher = (function () {
    return class Rusher extends Entity {
        constructor() {
            super(RUSHER_HEALTH, true, {
                size: new Vector2(50, 50)
            });
            
            this.name = 'Rusher';
        }

        render(context: any, offset: Vector2Type, scale: number): void {
            const centerX = (this.body.position.x + this.body.size.x / 2 + offset.x) * scale;
            const centerY = (this.body.position.y + this.body.size.y / 2 + offset.y) * scale;
            const baseSize = Math.max(this.body.size.x, this.body.size.y) * scale;
            const time = Date.now() * 0.001;

            context.save();

            // Menacing glow effect
            const glowRadius = baseSize * 0.8;
            const glowGradient = context.createRadialGradient(
                centerX, centerY, baseSize * 0.3,
                centerX, centerY, glowRadius
            );
            glowGradient.addColorStop(0, 'rgba(255, 50, 50, 0.4)');
            glowGradient.addColorStop(0.7, 'rgba(200, 0, 0, 0.2)');
            glowGradient.addColorStop(1, 'rgba(150, 0, 0, 0)');

            context.fillStyle = glowGradient;
            context.beginPath();
            context.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
            context.fill();

            // Main triangle body with rotation
            const triangleRotation = time * 0.5;
            const triangleSize = baseSize * 0.5;

            context.save();
            context.translate(centerX, centerY);
            context.rotate(triangleRotation);

            // Main triangle
            context.beginPath();
            for (let i = 0; i < 3; i++) {
                const angle = (i / 3) * Math.PI * 2 - Math.PI / 2; // Point upward initially
                const x = Math.cos(angle) * triangleSize;
                const y = Math.sin(angle) * triangleSize;

                if (i === 0) context.moveTo(x, y);
                else context.lineTo(x, y);
            }
            context.closePath();

            // Triangle gradient fill
            const triangleGradient = context.createLinearGradient(0, -triangleSize, 0, triangleSize);
            triangleGradient.addColorStop(0, '#FF3030');
            triangleGradient.addColorStop(0.5, '#CC0000');
            triangleGradient.addColorStop(1, '#990000');

            context.fillStyle = triangleGradient;
            context.fill();

            // Triangle border
            context.strokeStyle = '#FF6666';
            context.lineWidth = 3 * scale;
            context.stroke();

            context.restore();

            // Animated spikes around the triangle
            const spikeCount = 12;
            const spikeDistance = baseSize * 0.6;
            const spikeLength = baseSize * 0.3;

            for (let i = 0; i < spikeCount; i++) {
                const spikeAngle = (i / spikeCount) * Math.PI * 2 + time * 0.8;
                const spikePulse = Math.sin(time * 3 + i * 0.5) * 0.3 + 0.7;
                const currentSpikeLength = spikeLength * spikePulse;

                const baseX = centerX + Math.cos(spikeAngle) * spikeDistance;
                const baseY = centerY + Math.sin(spikeAngle) * spikeDistance;
                const tipX = centerX + Math.cos(spikeAngle) * (spikeDistance + currentSpikeLength);
                const tipY = centerY + Math.sin(spikeAngle) * (spikeDistance + currentSpikeLength);

                // Spike gradient
                const spikeGradient = context.createLinearGradient(baseX, baseY, tipX, tipY);
                spikeGradient.addColorStop(0, 'rgba(255, 80, 80, 0.8)');
                spikeGradient.addColorStop(1, 'rgba(255, 150, 150, 0.3)');

                context.strokeStyle = spikeGradient;
                context.lineWidth = (4 * spikePulse) * scale;
                context.beginPath();
                context.moveTo(baseX, baseY);
                context.lineTo(tipX, tipY);
                context.stroke();

                // Spike tips
                context.fillStyle = '#FFAAAA';
                context.beginPath();
                context.arc(tipX, tipY, 2 * scale * spikePulse, 0, Math.PI * 2);
                context.fill();
            }

            // Inner core with pulsing effect
            const corePulse = Math.sin(time * 4) * 0.2 + 0.8;
            const coreSize = triangleSize * 0.4 * corePulse;

            context.fillStyle = 'rgba(255, 255, 255, 0.3)';
            context.beginPath();
            context.arc(centerX, centerY, coreSize, 0, Math.PI * 2);
            context.fill();

            context.strokeStyle = '#FF8888';
            context.lineWidth = 2 * scale;
            context.stroke();

            // Orbiting danger indicators
            const orbitCount = 3;
            for (let i = 0; i < orbitCount; i++) {
                const orbitAngle = (i / orbitCount) * Math.PI * 2 + time * 1.2;
                const orbitRadius = baseSize * 0.4;
                const orbitX = centerX + Math.cos(orbitAngle) * orbitRadius;
                const orbitY = centerY + Math.sin(orbitAngle) * orbitRadius;

                context.fillStyle = 'rgba(255, 100, 100, 0.7)';
                context.beginPath();
                context.arc(orbitX, orbitY, 4 * scale, 0, Math.PI * 2);
                context.fill();
            }

            context.restore();

            // Enemy name/identifier
            if (this.name) {
                context.save();
                context.textAlign = 'center';
                context.font = `Bold ${14 * scale}px "Courier New", monospace`;

                // Text shadow
                context.fillStyle = 'rgba(0, 0, 0, 0.8)';
                context.fillText(this.name,
                    centerX + 1 * scale,
                    centerY + baseSize * 0.8 + 1 * scale
                );

                // Main text
                context.fillStyle = '#FF5555';
                context.fillText(this.name,
                    centerX,
                    centerY + baseSize * 0.8
                );
                context.restore();
            }

            super.render(context, offset, scale);
        }
    }
})();