import { Vector2 } from "../../../utils/vector2.ts";
import { Entity } from "../entity.ts";

type Vector2Type = InstanceType<typeof Vector2>;

const SHOOTER_HEALTH = 100;

export const Shooter = (function () {
    return class Shooter extends Entity {
        constructor() {
            super(SHOOTER_HEALTH, true, {
                size: new Vector2(80, 80)
            });

            this.name = 'Shooter';
        }

        render(context: any, offset: Vector2Type, scale: number): void {
            const centerX = (this.body.position.x + this.body.size.x / 2 + offset.x) * scale;
            const centerY = (this.body.position.y + this.body.size.y / 2 + offset.y) * scale;
            const baseSize = Math.max(this.body.size.x, this.body.size.y) * scale;
            const time = Date.now() * 0.001;

            context.save();

            // Tactical targeting aura - changed to red
            const auraRadius = baseSize * 0.9;
            const auraGradient = context.createRadialGradient(
                centerX, centerY, baseSize * 0.2,
                centerX, centerY, auraRadius
            );
            auraGradient.addColorStop(0, 'rgba(255, 80, 80, 0.3)');
            auraGradient.addColorStop(0.6, 'rgba(200, 50, 50, 0.15)');
            auraGradient.addColorStop(1, 'rgba(180, 0, 0, 0)');

            context.fillStyle = auraGradient;
            context.beginPath();
            context.arc(centerX, centerY, auraRadius, 0, Math.PI * 2);
            context.fill();

            // Main hexagonal body
            const hexRotation = time * 0.3;
            const hexSize = baseSize * 0.45;

            context.save();
            context.translate(centerX, centerY);
            context.rotate(hexRotation);

            // Draw hexagon
            context.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2;
                const x = Math.cos(angle) * hexSize;
                const y = Math.sin(angle) * hexSize;

                if (i === 0) context.moveTo(x, y);
                else context.lineTo(x, y);
            }
            context.closePath();

            // Hexagon gradient fill - changed to red
            const hexGradient = context.createLinearGradient(0, -hexSize, 0, hexSize);
            hexGradient.addColorStop(0, '#E24A4A');
            hexGradient.addColorStop(0.5, '#BA2E2E');
            hexGradient.addColorStop(1, '#8A1E1E');

            context.fillStyle = hexGradient;
            context.fill();

            // Hexagon border - changed to red
            context.strokeStyle = '#FA6060';
            context.lineWidth = 2 * scale;
            context.stroke();

            context.restore();

            // Targeting crosshairs (rotating) - changed to red
            const crosshairRotation = time * -0.4;
            const crosshairSize = baseSize * 0.7;

            context.save();
            context.translate(centerX, centerY);
            context.rotate(crosshairRotation);

            // Outer crosshair ring
            context.strokeStyle = 'rgba(250, 96, 96, 0.6)';
            context.lineWidth = 2 * scale;
            context.beginPath();
            context.arc(0, 0, crosshairSize, 0, Math.PI * 2);
            context.stroke();

            // Crosshair lines
            const lineLength = crosshairSize * 0.3;
            const lineOffset = crosshairSize * 0.6;

            for (let i = 0; i < 4; i++) {
                const angle = (i / 4) * Math.PI * 2;
                const startX = Math.cos(angle) * lineOffset;
                const startY = Math.sin(angle) * lineOffset;
                const endX = Math.cos(angle) * (lineOffset + lineLength);
                const endY = Math.sin(angle) * (lineOffset + lineLength);

                context.beginPath();
                context.moveTo(startX, startY);
                context.lineTo(endX, endY);
                context.stroke();
            }

            context.restore();

            // Weapon barrels (geometric tubes) - changed to red
            const barrelCount = 4;
            const barrelDistance = baseSize * 0.5;

            for (let i = 0; i < barrelCount; i++) {
                const barrelAngle = (i / barrelCount) * Math.PI * 2 + time * 0.1;
                const barrelX = centerX + Math.cos(barrelAngle) * barrelDistance;
                const barrelY = centerY + Math.sin(barrelAngle) * barrelDistance;

                // Barrel base (diamond shape)
                context.save();
                context.translate(barrelX, barrelY);
                context.rotate(barrelAngle);

                const diamondSize = 8 * scale;
                context.beginPath();
                context.moveTo(0, -diamondSize);
                context.lineTo(diamondSize, 0);
                context.lineTo(0, diamondSize);
                context.lineTo(-diamondSize, 0);
                context.closePath();

                // Diamond gradient - changed to red
                const diamondGradient = context.createLinearGradient(0, -diamondSize, 0, diamondSize);
                diamondGradient.addColorStop(0, '#E88B8B');
                diamondGradient.addColorStop(1, '#E24A4A');

                context.fillStyle = diamondGradient;
                context.fill();
                context.strokeStyle = '#FA6060';
                context.lineWidth = 1 * scale;
                context.stroke();

                context.restore();
            }

            // Energy core with geometric patterns - changed to red
            const coreSize = hexSize * 0.6;
            const corePulse = Math.sin(time * 2.5) * 0.15 + 0.85;

            context.save();
            context.translate(centerX, centerY);

            // Inner geometric pattern
            for (let ring = 0; ring < 3; ring++) {
                const ringSize = (coreSize * (ring + 1) / 3) * corePulse;
                const ringRotation = time * (0.5 + ring * 0.2);

                context.save();
                context.rotate(ringRotation);

                // Draw triangular segments
                const segmentCount = 6;
                for (let i = 0; i < segmentCount; i++) {
                    if (i % 2 === 0) continue; // Skip every other for pattern effect

                    const startAngle = (i / segmentCount) * Math.PI * 2;
                    const endAngle = ((i + 1) / segmentCount) * Math.PI * 2;

                    context.beginPath();
                    context.moveTo(0, 0);
                    context.arc(0, 0, ringSize, startAngle, endAngle);
                    context.closePath();

                    const alpha = 0.3 - (ring * 0.08);
                    context.fillStyle = `rgba(226, 74, 74, ${alpha})`;
                    context.fill();
                }

                context.restore();
            }

            context.restore();

            // Scanning beams (geometric rays) - changed to red
            const beamCount = 8;
            const beamRotation = time * 1.5;

            for (let i = 0; i < beamCount; i++) {
                const beamAngle = (i / beamCount) * Math.PI * 2 + beamRotation;
                const beamLength = baseSize * (0.8 + Math.sin(time * 2 + i) * 0.3);
                const beamOpacity = (Math.sin(time * 3 + i * 0.8) * 0.3 + 0.4);

                const beamEndX = centerX + Math.cos(beamAngle) * beamLength;
                const beamEndY = centerY + Math.sin(beamAngle) * beamLength;

                // Beam gradient - changed to red
                const beamGradient = context.createLinearGradient(
                    centerX, centerY, beamEndX, beamEndY
                );
                beamGradient.addColorStop(0, `rgba(250, 96, 96, ${beamOpacity})`);
                beamGradient.addColorStop(1, `rgba(250, 96, 96, 0)`);

                context.strokeStyle = beamGradient;
                context.lineWidth = 2 * scale;
                context.beginPath();
                context.moveTo(centerX, centerY);
                context.lineTo(beamEndX, beamEndY);
                context.stroke();
            }

            // Central targeting dot
            context.fillStyle = 'rgba(255, 255, 255, 0.8)';
            context.beginPath();
            context.arc(centerX, centerY, 3 * scale * corePulse, 0, Math.PI * 2);
            context.fill();

            // Perimeter warning indicators - already red, keeping the same
            const indicatorCount = 6;
            const indicatorDistance = baseSize * 0.85;

            for (let i = 0; i < indicatorCount; i++) {
                const indicatorAngle = (i / indicatorCount) * Math.PI * 2 + time * -0.6;
                const indicatorPulse = Math.sin(time * 4 + i * 1.2) * 0.4 + 0.6;

                const indX = centerX + Math.cos(indicatorAngle) * indicatorDistance;
                const indY = centerY + Math.sin(indicatorAngle) * indicatorDistance;

                // Small geometric indicator (square)
                context.save();
                context.translate(indX, indY);
                context.rotate(indicatorAngle + time);

                const indSize = 4 * scale * indicatorPulse;
                context.fillStyle = `rgba(250, 96, 96, ${indicatorPulse})`;
                context.fillRect(-indSize / 2, -indSize / 2, indSize, indSize);

                context.restore();
            }

            context.restore();

            // Entity name/identifier - already red, keeping the same
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
                context.fillStyle = '#E24A4A';
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