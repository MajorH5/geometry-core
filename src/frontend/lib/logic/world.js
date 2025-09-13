import { Physics } from "../physics/physics.js";

export const World = (function () {
    return class World {
        constructor(worldSize, replicator) {
            this.worldSize = worldSize;
            this.entities = [];

            this.physics = new Physics(worldSize);
            this.replicator = replicator;
        }

        spawn(entity) {
            if (entity.isSpawned) {
                return;
            }

            this.entities.push(entity);
            this.physics.add(entity.body);
            entity.onSpawn(this);
        }

        despawn(entity) {
            const index = this.entities.indexOf(entity);

            if (index === -1) {
                // not found
                return;
            }

            this.entities.splice(index, 1);
            this.physics.remove(entity.body);
            entity.onDespawn();
        }

        update(deltaTime) {
            this.physics.update(deltaTime);

            for (let i = 0; i < this.entities.length; i++) {
                const entity = this.entities[i];
                entity.update(deltaTime);
            }
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


        render(context) {
            this.drawGrid(context, this.worldSize.x, this.worldSize.y);
            for (let i = 0; i < this.entities.length; i++) {
                const entity = this.entities[i];
                entity.render(context);
            }
        }
    }
})();