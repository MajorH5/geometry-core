export const Physics = (function () {
    return class Physics {
        constructor(worldSize) {
            this.worldSize = worldSize;
            this.bodies = [];
        }

        add (body) {
            this.bodies.push(body);
        }

        remove (body) {
            const index = this.bodies.indexOf(body);

            if (index === -1) {
                return;
            }

            this.bodies.splice(index, 1);
        }

        checkCollision(body1, body2) {
            return body1.position.x >= body2.position.x &&
                body1.position.x < body2.position.x + body2.size.x &&
                body1.position.y >= body2.position.y &&
                body1.position.y < body2.position.y + body2.size.y
        }

        update(deltaTime) {
            for (let i = 0; i < this.bodies.length; i++) {
                const body = this.bodies[i];

                body.position = body.position.add(body.velocity);

                if (body.position.x < 0) {
                    body.position.x = 0;
                } else if (body.position.x + body.size.x > this.worldSize.x) {
                    body.position.x = this.worldSize.x - body.size.x;
                }

                if (body.position.y < 0) {
                    body.position.y = 0;
                } else if (body.position.y + body.size.y > this.worldSize.y) {
                    body.position.y = this.worldSize.y - body.size.y;
                }

                for (let j = 0; j < this.bodies.length; j++) {
                    if (i === j) {
                        // same object skip them
                        continue;
                    }

                    const otherBody = this.bodies[j];

                    const didCollide = this.checkCollision(body, otherBody);

                    if (!didCollide) {
                        continue;
                    }

                    body.collision.trigger(otherBody);
                    otherBody.collision.trigger(body);
                }

            }
        }
    }
})();