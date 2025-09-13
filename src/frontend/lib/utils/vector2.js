export const Vector2 = (function () {
    return class Vector2 {
        constructor (x, y) {
            this.x = x;
            this.y = y;
        }

        add (vector) {
            return new Vector2(this.x + vector.x, this.y + vector.y);
        }

        subtract (vector) {
            return new Vector2(this.x - vector.x, this.y - vector.y);
        }

        multiply (vector) {
            return new Vector2(this.x * vector.x, this.y * vector.y);
        }
    };
})();