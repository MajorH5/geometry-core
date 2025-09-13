export const ParticleEmitter = (function () {
    return class ParticleEmitter {
        constructor () {
            this.particles = [];
        }

        update (deltaTime) {
            for (let i = 0; i < this.particles.length; i++) {
                this.particles[i].update(deltaTime);
            }
        }

        render (context) {
            for (let i = 0; i < this.particles.length; i++) {
                this.particles[i].render(context);
            }
        }

        clear () {
            this.particles = [];
        }
    }
})();