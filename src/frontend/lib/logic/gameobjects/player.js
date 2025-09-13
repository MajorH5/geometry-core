import { Vector2 } from "../../utils/vector2.js";
import { Entity } from "./entity.js";

const INPUT_LEFT = 'left';
const INPUT_RIGHT = 'right';
const INPUT_UP = 'up';
const INPUT_DOWN = 'down';

const PLAYER_SPEED = 10;
const PLAYER_VELOCITY_SMOOTHNESS = 0.16;

export const Player = (function () {
    return class Player extends Entity {
        constructor(isLocalPlayer = false, canvas) {
            super(100, {
                size: new Vector2(50, 50)
            })

            this.canvas = canvas;
            this.isLocalPlayer = isLocalPlayer;
            this.controlsLocked = false;
            this.mousePosition = new Vector2(-1, -1);
            this.keys = {};

            if (this.isLocalPlayer) {
                this.bindControls();
            }
        }

        bindControls() {
            document.addEventListener('keydown', (event) => {
                if (this.controlsLocked || !this.isSpawned || this.world.isPaused) {
                    return;
                }

                const key = event.key.toLowerCase();

                switch (key) {
                    case 'arrowup':
                    case 'w':
                        this.keys[INPUT_UP] = true;
                        break;
                    case 'arrowleft':
                    case 'a':
                        this.keys[INPUT_LEFT] = true;
                        break;
                    case 'arrowdown':
                    case 's':
                        this.keys[INPUT_DOWN] = true
                        break;
                    case 'arrowright':
                    case 'd':
                        this.keys[INPUT_RIGHT] = true;
                        break;
                }
            });

            document.addEventListener('keyup', (event) => {
                const key = event.key.toLowerCase();

                switch (key) {
                    case 'arrowup':
                    case 'w':
                        delete this.keys[INPUT_UP];
                        break;
                    case 'arrowleft':
                    case 'a':
                        delete this.keys[INPUT_LEFT];
                        break;
                    case 'arrowdown':
                    case 's':
                        delete this.keys[INPUT_DOWN]
                        break;
                    case 'arrowright':
                    case 'd':
                        delete this.keys[INPUT_RIGHT];
                        break;
                }
            });

            this.canvas.addEventListener('mousemove', (event) => {
                var rect = this.canvas.getBoundingClientRect();

                var scaleX = this.canvas.width / rect.width;
                var scaleY = this.canvas.height / rect.height;

                const mouseX = (event.clientX - rect.left) * scaleX,
                    mouseY = (event.clientY - rect.top) * scaleY;

                this.mousePosition = new Vector2(mouseX, mouseY);
            });

            this.canvas.addEventListener('mousedown', (event) => {
                const wasLeftMouse = event.button === 0;

                if (this.controlsLocked || !this.isSpawned || !wasLeftMouse) {
                    return;
                }


            });

            this.canvas.addEventListener('mouseup', (event) => {
                const wasLeftMouse = event.button === 0;

                if (this.controlsLocked || !this.isSpawned || !wasLeftMouse) {
                    return;
                }

                // TODO
            });

            this.canvas.addEventListener('mouseleave', () => {
                this.mousePosition = new Vector2(-1, -1);
            });
        }

        updateMovementControls() {
            const movementVector = new Vector2(0, 0);

            if (this.keys[INPUT_RIGHT]) {
                movementVector.x = 1;
            } else if (this.keys[INPUT_LEFT]) {
                movementVector.x = -1;
            }

            if (this.keys[INPUT_UP]) {
                movementVector.y = -1;
            } else if (this.keys[INPUT_DOWN]) {
                movementVector.y = 1;
            }

            const targetVelocity = movementVector.scale(PLAYER_SPEED);

            this.body.velocity = this.body.velocity.lerp(targetVelocity, PLAYER_VELOCITY_SMOOTHNESS);
        }

        update(deltaTime) {
            super.update(deltaTime);
            this.updateMovementControls();
        }

        render(context) {
            super.render(context);
            const circleSize = Math.max(this.body.size.x, this.body.size.y);

            context.beginPath();
            context.arc(
                this.body.position.x,
                this.body.position.y,
                circleSize / 2,
                0, Math.PI * 2
            );
            context.fillStyle = this.isLocalPlayer ? 'blue' : 'red';
            context.fill();
            context.closePath();
            context.strokeStyle = 'black';
            context.stroke();

            context.textAlign = 'center';
            context.font = 'Bold 20px Arial';
            context.fillText('You', this.body.position.x, this.body.position.y + circleSize);
        }

    }
})();