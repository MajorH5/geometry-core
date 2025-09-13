export const Engine = (function () {
    return class Engine {
        constructor(worldSize) {
            this.worldSize = worldSize;
            this.bodies = [];
        }

        checkCollision(body1, body2) {
            return body1.position.x >= body2.position.x &&
                body1.position.x < body2.position.x + body2.size.x &&
                body1.position.y >= body2.position.y &&
                body1.position.y < body2.position.y + body2.size.y
        }

        update(deltaTime) {
            for (let i = 0; i < this.bodies.length; i++) {
                const body1 = this.bodies[i];

                for (let j = 0; j < this.bodies.length; j++) {
                    if (i === j) {
                        // same object skip them
                        continue;
                    }

                    const body2 = this.bodies[j];

                    const didCollide = this.checkCollision(body1, body2);

                    if (!didCollide) {
                        continue;
                    }

                    body1.collision.trigger(body2);
                    body2.collision.trigger(body1);
                }

            }
        }
    }
})();