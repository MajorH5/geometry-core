export const ParticleManager = (function () {
    return class ParticleManager {
        constructor () {
            this.emitters = [];
        }

        update (deltaTime) {
            for (let i = 0; i < this.emitters.length; i++) {
                this.emitters[i].update(deltaTime);
            }
        }

        render (context) {
            for (let i = 0; i < this.emitters.length; i++) {
                this.emitters[i].render(context);
            }
        }

        clear () {
            this.emitters = [];
        }
    }
})();