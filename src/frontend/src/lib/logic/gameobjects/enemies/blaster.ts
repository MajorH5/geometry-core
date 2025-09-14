import { Vector2 } from "../../../utils/vector2.ts";
import { Entity } from "../entity.ts";

type Vector2Type = InstanceType<typeof Vector2>;

const BLASTER_HEALTH = 100;

export const Blaster = (function () {
    return class Blaster extends Entity {
        constructor() {
            super(BLASTER_HEALTH, true, {
                size: new Vector2(50, 50)
            });

            this.name = 'Blaster';
        }

        render(context: any, offset: Vector2Type, scale: number): void {
            const centerX = (this.body.position.x + this.body.size.x / 2 + offset.x) * scale;
            const centerY = (this.body.position.y + this.body.size.y / 2 + offset.y) * scale;
            const baseSize = Math.max(this.body.size.x, this.body.size.y) * scale;
            const time = Date.now() * 0.001;

            context.save();

            // Energy discharge aura
            const auraRadius = baseSize * 1.1;
            const auraGradient = context.createRadialGradient(
                centerX, centerY, baseSize * 0.15,
                centerX, centerY, auraRadius
            );
            auraGradient.addColorStop(0, 'rgba(255, 40, 40, 0.5)');
            auraGradient.addColorStop(0.5, 'rgba(220, 30, 30, 0.25)');
            auraGradient.addColorStop(1, 'rgba(160, 20, 20, 0)');

            context.fillStyle = auraGradient;
            context.beginPath();
            context.arc(centerX, centerY, auraRadius, 0, Math.PI * 2);
            context.fill();

            // Main octagonal body with rotation
            const octRotation = time * 0.4;
            const octSize = baseSize * 0.4;

            context.save();
            context.translate(centerX, centerY);
            context.rotate(octRotation);

            // Draw octagon
            context.beginPath();
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const x = Math.cos(angle) * octSize;
                const y = Math.sin(angle) * octSize;

                if (i === 0) context.moveTo(x, y);
                else context.lineTo(x, y);
            }
            context.closePath();

            // Octagon gradient fill
            const octGradient = context.createLinearGradient(0, -octSize, 0, octSize);
            octGradient.addColorStop(0, '#E85555');
            octGradient.addColorStop(0.5, '#C22222');
            octGradient.addColorStop(1, '#900000');

            context.fillStyle = octGradient;
            context.fill();

            // Octagon border
            context.strokeStyle = '#FF4444';
            context.lineWidth = 2.5 * scale;
            context.stroke();

            context.restore();

            // Energy blast chambers (rotating diamonds)
            const chamberCount = 6;
            const chamberDistance = baseSize * 0.55;
            const chamberRotation = time * -0.8;

            for (let i = 0; i < chamberCount; i++) {
                const chamberAngle = (i / chamberCount) * Math.PI * 2 + chamberRotation;
                const chamberPulse = Math.sin(time * 2.8 + i * 1.3) * 0.3 + 0.7;
                const chamberX = centerX + Math.cos(chamberAngle) * chamberDistance;
                const chamberY = centerY + Math.sin(chamberAngle) * chamberDistance;

                context.save();
                context.translate(chamberX, chamberY);
                context.rotate(chamberAngle + time * 1.2);

                const chamberSize = 12 * scale * chamberPulse;

                // Draw diamond
                context.beginPath();
                context.moveTo(0, -chamberSize);
                context.lineTo(chamberSize, 0);
                context.lineTo(0, chamberSize);
                context.lineTo(-chamberSize, 0);
                context.closePath();

                // Diamond gradient
                const diamondGradient = context.createLinearGradient(0, -chamberSize, 0, chamberSize);
                diamondGradient.addColorStop(0, '#FF8888');
                diamondGradient.addColorStop(0.5, '#E85555');
                diamondGradient.addColorStop(1, '#C22222');

                context.fillStyle = diamondGradient;
                context.fill();

                context.strokeStyle = '#FFAAAA';
                context.lineWidth = 1.5 * scale;
                context.stroke();

                context.restore();
            }

            // Central energy core with layered geometric rings
            const coreRotation = time * 1.5;

            context.save();
            context.translate(centerX, centerY);

            // Multiple rotating rings
            for (let ring = 0; ring < 4; ring++) {
                const ringSize = (octSize * (0.8 - ring * 0.15));
                const ringRotSpeed = (ring + 1) * 0.5;

                context.save();
                context.rotate(coreRotation * ringRotSpeed);

                const segments = 4 + ring * 2;
                for (let i = 0; i < segments; i++) {
                    const segmentAngle = (i / segments) * Math.PI * 2;
                    const segmentSize = 3 * scale;
                    const segmentX = Math.cos(segmentAngle) * ringSize;
                    const segmentY = Math.sin(segmentAngle) * ringSize;

                    // Small rectangular segments
                    context.save();
                    context.translate(segmentX, segmentY);
                    context.rotate(segmentAngle);

                    const alpha = 0.6 - ring * 0.1;
                    context.fillStyle = `rgba(255, 68, 68, ${alpha})`;
                    context.fillRect(-segmentSize / 2, -segmentSize / 4, segmentSize, segmentSize / 2);

                    context.restore();
                }

                context.restore();
            }

            context.restore();

            // Energy discharge beams (pulsing lines)
            const beamCount = 12;
            const beamRotation = time * 0.7;

            for (let i = 0; i < beamCount; i++) {
                const beamAngle = (i / beamCount) * Math.PI * 2 + beamRotation;
                const beamPulse = Math.sin(time * 4 + i * 0.8) * 0.4 + 0.6;
                const beamLength = baseSize * (0.7 + beamPulse * 0.4);

                const beamStartX = centerX + Math.cos(beamAngle) * (baseSize * 0.45);
                const beamStartY = centerY + Math.sin(beamAngle) * (baseSize * 0.45);
                const beamEndX = centerX + Math.cos(beamAngle) * beamLength;
                const beamEndY = centerY + Math.sin(beamAngle) * beamLength;

                // Beam gradient
                const beamGradient = context.createLinearGradient(
                    beamStartX, beamStartY, beamEndX, beamEndY
                );
                beamGradient.addColorStop(0, `rgba(255, 100, 100, ${beamPulse})`);
                beamGradient.addColorStop(1, `rgba(255, 150, 150, 0)`);

                context.strokeStyle = beamGradient;
                context.lineWidth = (2 + beamPulse) * scale;
                context.beginPath();
                context.moveTo(beamStartX, beamStartY);
                context.lineTo(beamEndX, beamEndY);
                context.stroke();

                // Beam end flare
                context.fillStyle = `rgba(255, 120, 120, ${beamPulse * 0.8})`;
                context.beginPath();
                context.arc(beamEndX, beamEndY, 2 * scale * beamPulse, 0, Math.PI * 2);
                context.fill();
            }

            // Central targeting reticle
            const reticleSize = octSize * 0.5;
            const reticlePulse = Math.sin(time * 3) * 0.2 + 0.8;

            context.strokeStyle = `rgba(255, 255, 255, ${reticlePulse})`;
            context.lineWidth = 2 * scale;
            context.beginPath();
            context.arc(centerX, centerY, reticleSize * reticlePulse, 0, Math.PI * 2);
            context.stroke();

            // Cross lines in reticle
            const crossSize = reticleSize * 0.6;
            context.beginPath();
            context.moveTo(centerX - crossSize, centerY);
            context.lineTo(centerX + crossSize, centerY);
            context.moveTo(centerX, centerY - crossSize);
            context.lineTo(centerX, centerY + crossSize);
            context.stroke();

            // Blast charge indicators (orbiting squares)
            const indicatorCount = 4;
            const indicatorOrbit = baseSize * 0.75;
            const indicatorRotation = time * -1.1;

            for (let i = 0; i < indicatorCount; i++) {
                const indicatorAngle = (i / indicatorCount) * Math.PI * 2 + indicatorRotation;
                const indicatorCharge = Math.sin(time * 3.5 + i * 2) * 0.4 + 0.6;

                const indX = centerX + Math.cos(indicatorAngle) * indicatorOrbit;
                const indY = centerY + Math.sin(indicatorAngle) * indicatorOrbit;

                context.save();
                context.translate(indX, indY);
                context.rotate(time * 2 + i);

                const indSize = 6 * scale * indicatorCharge;
                context.fillStyle = `rgba(255, 80, 80, ${indicatorCharge})`;
                context.fillRect(-indSize / 2, -indSize / 2, indSize, indSize);

                // Inner bright core
                context.fillStyle = `rgba(255, 200, 200, ${indicatorCharge * 0.8})`;
                const coreSize = indSize * 0.4;
                context.fillRect(-coreSize / 2, -coreSize / 2, coreSize, coreSize);

                context.restore();
            }

            context.restore();

            // Entity name
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
                context.fillStyle = '#E85555';
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