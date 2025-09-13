import { ParticleManager } from "../vfx/particles/particleManager.js";
import { Physics } from "../physics/physics.js";

export const World = (function () {
    return class World {
        constructor(worldSize, replicator) {
            this.worldSize = worldSize;
            this.gameObjects = [];
            this.physics = new Physics(worldSize);
            this.particleManager = new ParticleManager();
            this.replicator = replicator;
        }

        spawn(gameObject, objectId = -1) {
            if (gameObject.isSpawned) {
                return;
            }

            this.gameObjects.push(gameObject);
            this.physics.add(gameObject.body);

            gameObject.onSpawn(this, objectId);
        }

        despawn(gameObject) {
            const index = this.gameObjects.indexOf(gameObject);

            if (index === -1) {
                // not found
                return;
            }

            this.gameObjects.splice(index, 1);
            this.physics.remove(gameObject.body);
            gameObject.onDespawn();
        }

        update(deltaTime) {
            this.physics.update(deltaTime);

            for (let i = 0; i < this.gameObjects.length; i++) {
                const gameObject = this.gameObjects[i];
                gameObject.update(deltaTime);
            }

            this.particleManager.update(deltaTime);
        }

        render(context) {
            this.drawGrid(context, this.worldSize.x, this.worldSize.y);
            for (let i = 0; i < this.gameObjects.length; i++) {
                const gameObject = this.gameObjects[i];
                gameObject.render(context);
            }
            this.particleManager.render(context);
        }

        drawGrid(context, width, height, spacing = 20, majorEvery = 5) {
            context.save();

            context.clearRect(0, 0, width, height);

            const originX = width / 2;
            const originY = height / 2;

            context.lineWidth = 1;

            context.strokeStyle = '#ddd';
            for (let x = originX % spacing; x < width; x += spacing) {
                context.beginPath();
                context.moveTo(x, 0);
                context.lineTo(x, height);
                context.stroke();
            }
            for (let y = originY % spacing; y < height; y += spacing) {
                context.beginPath();
                context.moveTo(0, y);
                context.lineTo(width, y);
                context.stroke();
            }

            context.strokeStyle = '#bbb';
            context.lineWidth = 1.5;
            for (let x = originX % (spacing * majorEvery); x < width; x += spacing * majorEvery) {
                context.beginPath();
                context.moveTo(x, 0);
                context.lineTo(x, height);
                context.stroke();
            }
            for (let y = originY % (spacing * majorEvery); y < height; y += spacing * majorEvery) {
                context.beginPath();
                context.moveTo(0, y);
                context.lineTo(width, y);
                context.stroke();
            }

            context.strokeStyle = '#000';
            context.lineWidth = 2;

            context.beginPath();
            context.moveTo(0, originY);
            context.lineTo(width, originY);
            context.stroke();
            context.beginPath();
            context.moveTo(originX, 0);
            context.lineTo(originX, height);
            context.stroke();

            context.restore();
        }
    }
})();