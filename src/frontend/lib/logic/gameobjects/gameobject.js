import { Body } from "../../physics/body.js";
import { Constants } from "../../utils/constants.js";

export const GameObject = (function () {
    return class GameObject {
        constructor (bodyConfig) {
            this.body = new Body(bodyConfig);

            this.isSpawned = false;
            this.world = null;
        }
        
        setPosition (position, centerOn = false) {
            if (centerOn) {
                position = position.subtract(this.body.size.div(2));
            }

            this.body.position = position;
        }

        getPosition () {
            return this.position;
        }

        onSpawn (world) {
            this.isSpawned = true;
            this.world = world
        }

        onDespawn () {
            this.isSpawned = false;
            this.world = null;
        }

        despawn () {
            if (!this.isSpawned || this.world === null) {
                return;
            }

            this.world.despawn(this);
        }

        update (deltaTime) {

        }

        render (context) {
            if (Constants.DEBUG_MODE) {
                this.body.render(context);
            }
        }
    };
})();