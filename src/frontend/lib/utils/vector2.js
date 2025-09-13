export const Vector2 = (function () {
    return class Vector2 {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }

        add(vector) {
            return new Vector2(this.x + vector.x, this.y + vector.y);
        }

        subtract(vector) {
            return new Vector2(this.x - vector.x, this.y - vector.y);
        }

        multiply(vector) {
            return new Vector2(this.x * vector.x, this.y * vector.y);
        }

        scale(scalar) {
            return new Vector2(this.x * scalar, this.y * scalar);
        }

        div (divisor) {
            return new Vector2(this.x / divisor, this.y / divisor);
        }

        lerp(target, t) {
            return new Vector2(
                this.x + (target.x - this.x) * t,
                this.y + (target.y - this.y) * t
            );
        }
    };
})();