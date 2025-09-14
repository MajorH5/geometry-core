import { Vector2 } from "../../../utils/vector2.ts";
import { Entity } from "../entity.ts";

type Vector2Type = InstanceType<typeof Vector2>;

const TANK_HEALTH = 100;

export const Tank = (function () {
    return class Tank extends Entity {
        offset: number;

        constructor() {
            super(TANK_HEALTH, true, {
                size: new Vector2(100, 100)
            });

            this.offset = Math.random() * 1000 * 4;

            this.name = 'Tank';
        }

        render(context: any, offset: Vector2Type, scale: number): void {
            const centerX = (this.body.position.x + this.body.size.x / 2 + offset.x) * scale;
            const centerY = (this.body.position.y + this.body.size.y / 2 + offset.y) * scale;
            const baseSize = Math.max(this.body.size.x, this.body.size.y) * scale;
            const time = (this.getElapsedTimeMs() + this.offset) * 0.001;

            context.save();

            // Heavy armor aura - thick and imposing
            const auraRadius = baseSize * 0.9;
            const auraGradient = context.createRadialGradient(
                centerX, centerY, baseSize * 0.3,
                centerX, centerY, auraRadius
            );
            auraGradient.addColorStop(0, 'rgba(180, 20, 20, 0.4)');
            auraGradient.addColorStop(0.6, 'rgba(120, 15, 15, 0.2)');
            auraGradient.addColorStop(1, 'rgba(80, 10, 10, 0)');

            context.fillStyle = auraGradient;
            context.beginPath();
            context.arc(centerX, centerY, auraRadius, 0, Math.PI * 2);
            context.fill();

            // Main rectangular hull (tank body)
            const hullWidth = baseSize * 0.7;
            const hullHeight = baseSize * 0.5;
            const hullRotation = Math.sin(time * 0.2) * 0.05; // Slight wobble for weight

            context.save();
            context.translate(centerX, centerY);
            context.rotate(hullRotation);

            // Draw main hull rectangle
            const hullGradient = context.createLinearGradient(0, -hullHeight / 2, 0, hullHeight / 2);
            hullGradient.addColorStop(0, '#CC3333');
            hullGradient.addColorStop(0.3, '#AA1111');
            hullGradient.addColorStop(0.7, '#880000');
            hullGradient.addColorStop(1, '#660000');

            context.fillStyle = hullGradient;
            context.fillRect(-hullWidth / 2, -hullHeight / 2, hullWidth, hullHeight);

            // Hull border
            context.strokeStyle = '#FF5555';
            context.lineWidth = 3 * scale;
            context.strokeRect(-hullWidth / 2, -hullHeight / 2, hullWidth, hullHeight);

            // Hull armor plating (horizontal lines)
            context.strokeStyle = 'rgba(255, 85, 85, 0.6)';
            context.lineWidth = 2 * scale;
            for (let i = 0; i < 3; i++) {
                const lineY = (-hullHeight / 2) + ((i + 1) / 4) * hullHeight;
                context.beginPath();
                context.moveTo(-hullWidth / 2 + 8 * scale, lineY);
                context.lineTo(hullWidth / 2 - 8 * scale, lineY);
                context.stroke();
            }

            context.restore();

            // Turret (circular top section)
            const turretRadius = baseSize * 0.25;
            const turretY = centerY - baseSize * 0.1;

            // Turret base circle
            const turretGradient = context.createRadialGradient(
                centerX, turretY, turretRadius * 0.3,
                centerX, turretY, turretRadius
            );
            turretGradient.addColorStop(0, '#DD4444');
            turretGradient.addColorStop(0.7, '#BB2222');
            turretGradient.addColorStop(1, '#990000');

            context.fillStyle = turretGradient;
            context.beginPath();
            context.arc(centerX, turretY, turretRadius, 0, Math.PI * 2);
            context.fill();

            context.strokeStyle = '#FF6666';
            context.lineWidth = 2 * scale;
            context.stroke();

            // Main cannon barrel
            const cannonLength = baseSize * 0.6;
            const cannonWidth = 8 * scale;
            const cannonRotation = time * 0.3; // Slow rotation for targeting

            context.save();
            context.translate(centerX, turretY);
            context.rotate(cannonRotation);

            // Cannon barrel
            const cannonGradient = context.createLinearGradient(0, -cannonWidth / 2, 0, cannonWidth / 2);
            cannonGradient.addColorStop(0, '#BB3333');
            cannonGradient.addColorStop(0.5, '#993333');
            cannonGradient.addColorStop(1, '#773333');

            context.fillStyle = cannonGradient;
            context.fillRect(0, -cannonWidth / 2, cannonLength, cannonWidth);

            context.strokeStyle = '#CC5555';
            context.lineWidth = 1.5 * scale;
            context.strokeRect(0, -cannonWidth / 2, cannonLength, cannonWidth);

            // Cannon muzzle
            context.fillStyle = '#AA2222';
            context.fillRect(cannonLength - 4 * scale, -cannonWidth / 2 - 2 * scale, 4 * scale, cannonWidth + 4 * scale);

            context.restore();

            // Track/tread system (rectangular segments on sides)
            const trackCount = 6;
            const trackWidth = 6 * scale;
            const trackHeight = 12 * scale;
            const trackOffset = hullWidth / 2 + 4 * scale;

            for (let side = 0; side < 2; side++) {
                const sideMultiplier = side === 0 ? -1 : 1;
                const trackX = centerX + (sideMultiplier * trackOffset);

                for (let i = 0; i < trackCount; i++) {
                    const trackY = centerY - (hullHeight / 2) + (i / (trackCount - 1)) * hullHeight;
                    const trackPulse = Math.sin(time * 2 + i * 0.8 + side * Math.PI) * 0.1 + 0.9;

                    context.save();
                    context.translate(trackX, trackY);

                    // Track segment
                    context.fillStyle = `rgba(170, 34, 34, ${trackPulse})`;
                    context.fillRect(-trackWidth / 2, -trackHeight / 2, trackWidth, trackHeight);

                    context.strokeStyle = '#CC5555';
                    context.lineWidth = 1 * scale;
                    context.strokeRect(-trackWidth / 2, -trackHeight / 2, trackWidth, trackHeight);

                    context.restore();
                }
            }

            // Secondary weapon systems (small turrets)
            const secondaryCount = 3;
            const secondaryRadius = turretRadius * 0.4;

            for (let i = 0; i < secondaryCount; i++) {
                const secAngle = (i / secondaryCount) * Math.PI * 2 + time * 0.15;
                const secDistance = turretRadius * 1.8;
                const secX = centerX + Math.cos(secAngle) * secDistance;
                const secY = centerY + Math.sin(secAngle) * secDistance;

                // Small turret
                context.fillStyle = '#AA3333';
                context.beginPath();
                context.arc(secX, secY, secondaryRadius, 0, Math.PI * 2);
                context.fill();

                context.strokeStyle = '#DD5555';
                context.lineWidth = 1.5 * scale;
                context.stroke();

                // Small barrel
                context.save();
                context.translate(secX, secY);
                context.rotate(secAngle + time * 0.5);

                const smallBarrel = secondaryRadius * 1.5;
                context.strokeStyle = '#BB4444';
                context.lineWidth = 3 * scale;
                context.beginPath();
                context.moveTo(0, 0);
                context.lineTo(smallBarrel, 0);
                context.stroke();

                context.restore();
            }

            // Armor plating indicators (diamond shapes on hull)
            const armorCount = 4;
            for (let i = 0; i < armorCount; i++) {
                const armorX = centerX + (i - 1.5) * (hullWidth / 4);
                const armorY = centerY + baseSize * 0.15;
                const armorSize = 4 * scale;

                context.save();
                context.translate(armorX, armorY);
                context.rotate(time * 0.4 + i);

                // Diamond armor plate
                context.beginPath();
                context.moveTo(0, -armorSize);
                context.lineTo(armorSize, 0);
                context.lineTo(0, armorSize);
                context.lineTo(-armorSize, 0);
                context.closePath();

                context.fillStyle = 'rgba(221, 68, 68, 0.8)';
                context.fill();

                context.strokeStyle = '#FF7777';
                context.lineWidth = 1 * scale;
                context.stroke();

                context.restore();
            }

            // Exhaust/engine indicators (glowing rectangles at rear)
            const exhaustCount = 2;
            const exhaustWidth = 6 * scale;
            const exhaustHeight = 10 * scale;

            for (let i = 0; i < exhaustCount; i++) {
                const exhaustX = centerX - hullWidth / 2 - 4 * scale;
                const exhaustY = centerY + (i - 0.5) * exhaustHeight * 1.2;
                const exhaustGlow = Math.sin(time * 4 + i * 2) * 0.3 + 0.7;

                // Exhaust glow
                const exhaustGradient = context.createLinearGradient(
                    exhaustX - exhaustWidth, exhaustY,
                    exhaustX, exhaustY
                );
                exhaustGradient.addColorStop(0, `rgba(255, 100, 100, ${exhaustGlow * 0.6})`);
                exhaustGradient.addColorStop(1, `rgba(200, 50, 50, ${exhaustGlow})`);

                context.fillStyle = exhaustGradient;
                context.fillRect(exhaustX - exhaustWidth, exhaustY - exhaustHeight / 2, exhaustWidth, exhaustHeight);
            }

            // Heavy armor warning indicators (pulsing squares around perimeter)
            const warningCount = 8;
            const warningDistance = baseSize * 0.6;

            for (let i = 0; i < warningCount; i++) {
                const warningAngle = (i / warningCount) * Math.PI * 2 + time * 0.1;
                const warningPulse = Math.sin(time * 1.5 + i * 0.7) * 0.4 + 0.6;

                const warnX = centerX + Math.cos(warningAngle) * warningDistance;
                const warnY = centerY + Math.sin(warningAngle) * warningDistance;

                context.save();
                context.translate(warnX, warnY);
                context.rotate(time * 0.3);

                const warnSize = 3 * scale * warningPulse;
                context.fillStyle = `rgba(255, 85, 85, ${warningPulse})`;
                context.fillRect(-warnSize, -warnSize, warnSize * 2, warnSize * 2);

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
                    centerY + baseSize * 0.7 + 1 * scale
                );

                // Main text
                context.fillStyle = '#CC3333';
                context.fillText(this.name,
                    centerX,
                    centerY + baseSize * 0.7
                );
                context.restore();
            }

            super.render(context, offset, scale);
        }
    }
})();