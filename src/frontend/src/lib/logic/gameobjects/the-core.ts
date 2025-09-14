import { Vector2 } from "../../utils/vector2";
import { Entity } from "./entity.ts";

type Vector2Type = InstanceType<typeof Vector2>;

const THE_CORE_HEALTH = 100;

export const TheCore = (function () {
    return class TheCore extends Entity {
        time: number;
        healtbarOffset: number;

        constructor() {
            super(THE_CORE_HEALTH, false, {
                size: new Vector2(50, 50)
            });

            this.time = 0;
            this.healtbarOffset = -10;
        }

        render(context: any, offset: Vector2Type, scale: number): void {
            super.render(context, offset, scale);

            const centerX = (this.body.position.x + this.body.size.x / 2 + offset.x) * scale;
            const centerY = (this.body.position.y + this.body.size.y / 2 + offset.y) * scale;
            const baseRadius = (Math.max(this.body.size.x, this.body.size.y) / 2) * scale;

            const pulse = Math.sin(this.getElapsedTimeMs() * 0.002) * 10 * scale;
            const radius = baseRadius + pulse;

            for (let i = 0; i < 7; i++) {
                const layerPulse = (Math.sin(this.getElapsedTimeMs() * 0.004 + i) * 5 + (i * 2)) * scale;
                const layerRadius = radius + layerPulse;

                context.beginPath();
                const wavePoints = 64;
                const time = this.getElapsedTimeMs() * 0.001;

                for (let p = 0; p <= wavePoints; p++) {
                    const angle = (p / wavePoints) * Math.PI * 2;

                    const wave1 = Math.sin(angle * 8 + time * 2 + i) * (layerRadius * 0.05);
                    const wave2 = Math.sin(angle * 3 - time * 1.5 + i * 0.5) * (layerRadius * 0.08);
                    const wave3 = Math.sin(angle * 12 + time * 3 + i * 0.3) * (layerRadius * 0.03);

                    const distortion = wave1 + wave2 + wave3;
                    const currentRadius = layerRadius + distortion;

                    const x = centerX + Math.cos(angle) * currentRadius;
                    const y = centerY + Math.sin(angle) * currentRadius;

                    if (p === 0) {
                        context.moveTo(x, y);
                    } else {
                        context.lineTo(x, y);
                    }
                }
                context.closePath();

                const alpha = 0.2 + 0.15 * (7 - i);
                context.fillStyle = `rgba(100, 200, 255, ${alpha})`;
                context.fill();
            }

            const time = this.getElapsedTimeMs() * 0.001;

            for (let layer = 0; layer < 4; layer++) {
                const layerTime = time + layer * 0.5;
                const layerScale = 1.2 - layer * 0.1;
                const layerAlpha = (0.8 - layer * 0.15);

                for (let formation = 0; formation < 3; formation++) {
                    const formationRotation = layerTime * (0.3 + formation * 0.2) + formation * Math.PI * 0.66;
                    const formationRadius = baseRadius * (0.6 + formation * 0.3) * layerScale;

                    const sizePulse = Math.sin(layerTime * 2 + formation * 2) * 0.3 + 1;
                    const currentRadius = formationRadius * sizePulse;

                    const triangleCount = 6;
                    for (let t = 0; t < triangleCount; t++) {
                        const triangleAngle = (t / triangleCount) * Math.PI * 2 + formationRotation;
                        const triangleX = centerX + Math.cos(triangleAngle) * currentRadius * 0.7;
                        const triangleY = centerY + Math.sin(triangleAngle) * currentRadius * 0.7;

                        const triangleRotation = layerTime * (1 + layer * 0.5) + t * 0.5;
                        const triangleSize = baseRadius * 0.25 * layerScale * sizePulse;

                        context.save();
                        context.translate(triangleX, triangleY);
                        context.rotate(triangleRotation);

                        context.beginPath();
                        for (let v = 0; v < 3; v++) {
                            const vertexAngle = (v / 3) * Math.PI * 2;
                            const x = Math.cos(vertexAngle) * triangleSize;
                            const y = Math.sin(vertexAngle) * triangleSize;
                            if (v === 0) context.moveTo(x, y);
                            else context.lineTo(x, y);
                        }
                        context.closePath();

                        const blueVariation = (layerTime * 30 + formation * 60 + t * 30) % 100;
                        const lightness = 40 + blueVariation * 0.4;
                        const saturation = 60 + (blueVariation % 40);

                        context.fillStyle = `hsla(210, ${saturation}%, ${lightness}%, ${layerAlpha * 0.4})`;
                        context.fill();

                        context.strokeStyle = `hsla(200, ${saturation + 20}%, ${lightness + 20}%, ${layerAlpha * 0.8})`;
                        context.lineWidth = 1.5 * scale;
                        context.stroke();

                        context.restore();
                    }
                }

                if (layer < 2) {
                    const connectionAlpha = layerAlpha * 0.3;
                    context.strokeStyle = `rgba(150, 220, 255, ${connectionAlpha})`;
                    context.lineWidth = 0.8 * scale;

                    for (let c = 0; c < 12; c++) {
                        const angle1 = (c / 12) * Math.PI * 2 + layerTime;
                        const angle2 = ((c + 3) / 12) * Math.PI * 2 + layerTime;
                        const r = baseRadius * layerScale * 0.7;

                        context.beginPath();
                        context.moveTo(
                            centerX + Math.cos(angle1) * r,
                            centerY + Math.sin(angle1) * r
                        );
                        context.lineTo(
                            centerX + Math.cos(angle2) * r,
                            centerY + Math.sin(angle2) * r
                        );
                        context.stroke();
                    }
                }
            }

            context.strokeStyle = 'white';
            context.lineWidth = 2 * scale;
            context.beginPath();

            const outerWavePoints = 64;
            for (let p = 0; p <= outerWavePoints; p++) {
                const angle = (p / outerWavePoints) * Math.PI * 2;
                const time = this.getElapsedTimeMs() * 0.001;

                const wave = Math.sin(angle * 6 + time * 2) * (radius * 0.04) +
                    Math.sin(angle * 10 - time * 1.8) * (radius * 0.02);

                const currentRadius = radius + wave;
                const x = centerX + Math.cos(angle) * currentRadius;
                const y = centerY + Math.sin(angle) * currentRadius;

                if (p === 0) {
                    context.moveTo(x, y);
                } else {
                    context.lineTo(x, y);
                }
            }

            context.stroke();
        }
    }
})();