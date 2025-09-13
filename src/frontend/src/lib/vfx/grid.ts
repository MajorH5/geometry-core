import { Vfx } from "./vfx.js";
import { Vector2 } from "../utils/vector2.ts";

export const Grid = (function () {
    return class Grid extends Vfx {
        private width: number;
        private height: number;
        private spacing: number;
        private majorEvery: number;

        constructor(width: number, height: number, spacing: number = 20, majorEvery: number = 5) {
            super();

            this.width = width;
            this.height = height;
            this.spacing = spacing;
            this.majorEvery = majorEvery;
        }

        render(context: CanvasRenderingContext2D, offset: Vector2, scale: number): void {
            const width = this.width;
            const height = this.height;

            const spacing = this.spacing * scale;
            const majorEvery = this.majorEvery;

            context.save();

            context.clearRect(0, 0, width, height);

            const originX = (width / 2 + offset.x * scale) % spacing;
            const originY = (height / 2 + offset.y * scale) % spacing;

            context.lineWidth = 1 * scale;

            context.strokeStyle = '#ddd';
            for (let x = originX; x < width; x += spacing) {
                context.beginPath();
                context.moveTo(x, 0);
                context.lineTo(x, height);
                context.stroke();
            }
            for (let y = originY; y < height; y += spacing) {
                context.beginPath();
                context.moveTo(0, y);
                context.lineTo(width, y);
                context.stroke();
            }

            context.strokeStyle = '#bbb';
            context.lineWidth = 1.5 * scale;
            const majorOriginX = (width / 2 + offset.x * scale) % (spacing * majorEvery);
            const majorOriginY = (height / 2 + offset.y * scale) % (spacing * majorEvery);

            for (let x = majorOriginX; x < width; x += spacing * majorEvery) {
                context.beginPath();
                context.moveTo(x, 0);
                context.lineTo(x, height);
                context.stroke();
            }
            for (let y = majorOriginY; y < height; y += spacing * majorEvery) {
                context.beginPath();
                context.moveTo(0, y);
                context.lineTo(width, y);
                context.stroke();
            }

            context.strokeStyle = '#000';
            context.lineWidth = 2 * scale;

            const centerX = width / 2 + offset.x * scale;
            const centerY = height / 2 + offset.y * scale;

            context.beginPath();
            context.moveTo(0, centerY);
            context.lineTo(width, centerY);
            context.stroke();
            context.beginPath();
            context.moveTo(centerX, 0);
            context.lineTo(centerX, height);
            context.stroke();

            context.restore();
        }
    }
})();