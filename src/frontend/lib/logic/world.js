import { Physics } from "../physics/physics.js";

export const World = (function () {
    return class World {
        constructor (worldSize, replicator) {
            this.worldSize = worldSize;
            this.entities = [];

            this.physics = new Physics(worldSize);
            this.replicator = replicator;
        }

        spawn (entity) {
            if (entity.isSpawned) {
                return;
            }

            this.entities.push(entity);
            this.physics.add(entity.body);
            entity.onSpawn(this);
        }

        despawn (entity) {
            const index = this.entities.indexOf(entity);

            if (index === -1) {
                // not found
                return;
            }

            this.entities.splice(index, 1);
            this.physics.remove(entity.body);
            entity.onDespawn();
        }

        update (deltaTime) {
            this.physics.update(deltaTime);
            
            for (let i = 0; i < this.entities.length; i++) {
                const entity = this.entities[i];
                entity.update(deltaTime);
            }
        }

        render (context) {
            for (let i = 0; i < this.entities.length; i++) {
                const entity = this.entities[i];
                entity.render(context);
            }
        }
    }
})();