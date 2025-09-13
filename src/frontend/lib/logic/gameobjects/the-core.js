import { Vector2 } from "../../utils/vector2.js";
import { GameObject } from "./gameobject.js";

export const TheCore = (function () {
    return class TheCore extends GameObject {
        constructor() {
            super({
                size: new Vector2(50, 50)
            });

            this.time = 0; // keep track of animation
        }

        render(context, deltaTime) {
            super.render(context);

            this.time += deltaTime; // increment time

            const centerX = this.body.position.x + this.body.size.x / 2;
            const centerY = this.body.position.y + this.body.size.y / 2;
            const baseRadius = Math.max(this.body.size.x, this.body.size.y) / 2;

            // Pulsating radius using sine wave
            const pulse = Math.sin(this.time * 3) * 10; // frequency & amplitude
            const radius = baseRadius + pulse;

            // Draw multiple layered circles for 4D effect
            for (let i = 0; i < 4; i++) {
                const layerPulse = Math.sin(this.time * 3 + i) * 5;
                const layerRadius = radius + layerPulse;

                context.beginPath();
                context.arc(centerX, centerY, layerRadius, 0, Math.PI * 2);
                context.closePath();

                // Gradient fill for glow effect
                const alpha = 0.2 + 0.15 * (4 - i); // outer layers more transparent
                context.fillStyle = `rgba(100, 200, 255, ${alpha})`;
                context.fill();
            }

            // Inner bright core
            context.beginPath();
            context.arc(centerX, centerY, baseRadius / 2, 0, Math.PI * 2);
            context.fillStyle = 'cyan';
            context.fill();
            context.closePath();

            // Optional outline
            context.strokeStyle = 'white';
            context.lineWidth = 2;
            context.beginPath();
            context.arc(centerX, centerY, radius, 0, Math.PI * 2);
            context.stroke();
        }
    }
})();
