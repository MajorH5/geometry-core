export const Vector2 = (function () {
    return class Vector2 {
        public x: number;
        public y: number;

        constructor(x: number, y: number) {
            this.x = x;
            this.y = y;
        }

        add(vector: Vector2): Vector2 {
            if (!(vector instanceof Vector2)) throw new Error("nah cant do that vec2s only pls.")
            return new Vector2(this.x + vector.x, this.y + vector.y);
        }

        subtract(vector: Vector2): Vector2 {
            if (!(vector instanceof Vector2)) throw new Error("nah cant do that vec2s only pls.")
            return new Vector2(this.x - vector.x, this.y - vector.y);
        }

        multiply(vector: Vector2): Vector2 {
            if (!(vector instanceof Vector2)) throw new Error("nah cant do that vec2s only pls.")
            return new Vector2(this.x * vector.x, this.y * vector.y);
        }

        scale(scalar: number): Vector2 {
            return new Vector2(this.x * scalar, this.y * scalar);
        }

        div(divisor: number): Vector2 {
            return new Vector2(this.x / divisor, this.y / divisor);
        }

        lerp(target: Vector2, t: number): Vector2 {
            if (!(target instanceof Vector2)) throw new Error("nah cant do that vec2s only pls.")
            return new Vector2(
                this.x + (target.x - this.x) * t,
                this.y + (target.y - this.y) * t
            );
        }

        normalize(): Vector2 {
            const magnitude = Math.sqrt(this.x * this.x + this.y * this.y);
            if (magnitude === 0) {
                return new Vector2(0, 0);
            }
            return new Vector2(this.x / magnitude, this.y / magnitude);
        }

        floor (): Vector2 {
            return new Vector2(Math.floor(this.x), Math.floor(this.y))
        }

        equals (vector: Vector2): boolean {
            return this.x === vector.x && this.y === vector.y;
        }
    };
})();