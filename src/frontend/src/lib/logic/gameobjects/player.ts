import { ProjectileInfo } from "./projectiles/projectileInfo.ts";
import { Vector2 } from "../../utils/vector2";
import { Entity } from "./entity.ts";
import { Player as NetworkedPlayer } from "../../module_bindings/player_type.ts";

type Vector2Type = InstanceType<typeof Vector2>;

const INPUT_LEFT = 'left';
const INPUT_RIGHT = 'right';
const INPUT_UP = 'up';
const INPUT_DOWN = 'down';

const PLAYER_HEALTH = 100;
const PLAYER_SPEED = 8.5;
const PLAYER_VELOCITY_SMOOTHNESS = 0.175;

export const Player = (function () {
    return class Player extends Entity {
        canvas: any;
        isLocalPlayer: boolean;
        controlsLocked: boolean;
        mousePosition: Vector2Type;
        attackAngle: number;
        keys: { [key: string]: boolean };
        playerName: string;

        constructor(isLocalPlayer: boolean = false, canvas: any) {
            super(PLAYER_HEALTH, false, {
                size: new Vector2(50, 50)
            })

            this.playerName = 'You';
            this.canvas = canvas;
            this.isLocalPlayer = isLocalPlayer;
            this.controlsLocked = false;
            this.mousePosition = new Vector2(-1, -1);
            this.attackAngle = 0;
            this.keys = {};

            if (this.isLocalPlayer) {
                this.bindControls();
            }

            this.renderPriority = 10;
        }

        loadState (networkedPlayer: any, isLocalPlayer: boolean | undefined) {
            super.loadState(networkedPlayer, isLocalPlayer);

            this.playerName = networkedPlayer.name.substring(0, 10);

            if (!networkedPlayer.isOnline || networkedPlayer.isDead) {
                this.despawn();
            }
        }

        bindControls(): void {
            document.addEventListener('keydown', (event) => {
                if (this.controlsLocked || !this.isSpawned) {
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

            this.canvas.addEventListener('mousemove', (event: MouseEvent) => {
                var rect = this.canvas.getBoundingClientRect();

                var scaleX = this.canvas.width / rect.width;
                var scaleY = this.canvas.height / rect.height;

                const mouseX = (event.clientX - rect.left) * scaleX,
                    mouseY = (event.clientY - rect.top) * scaleY;

                this.mousePosition = new Vector2(mouseX, mouseY);
            });

            this.canvas.addEventListener('mousedown', (event: MouseEvent) => {
                const wasLeftMouse = event.button === 0;

                if (this.controlsLocked || !this.isSpawned || !wasLeftMouse) {
                    return;
                }

                this.isFiring = true;
            });

            this.canvas.addEventListener('mouseup', (event: MouseEvent) => {
                const wasLeftMouse = event.button === 0;

                if (!wasLeftMouse) {
                    return;
                }

                this.isFiring = false;
            });

            this.canvas.addEventListener('mouseleave', () => {
                this.isFiring = false;
                this.mousePosition = new Vector2(-1, -1);
            });
        }

        getMouseDirection(): Vector2Type {
            if (this.world === null) {
                return new Vector2(0, 0);
            }

            const camera = this.world.camera;
            const cameraOffset = camera.getOffset(), cameraScale = camera.getScale();

            const screenPositionCenter = this.getScreenPosition(cameraOffset, cameraScale, true);
            const targetPoint = this.mousePosition;

            const angle = Math.atan2(targetPoint.y - screenPositionCenter.y,
                targetPoint.x - screenPositionCenter.x);

            return new Vector2(Math.cos(angle), Math.sin(angle)).normalize();
        }

        updateMovementControls(): void {
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

        update(deltaTime: number): void {
            super.update(deltaTime);
            
            if (this.isLocalPlayer) {
                this.updateMovementControls();
                const attackDirection = this.getMouseDirection();
                this.attackAngle = Math.atan2(attackDirection.y, attackDirection.x);
            }

            // replicate to server
            if (this.world !== null && this.isLocalPlayer && this.objectId !== -1) {
                const replicator = this.world.getReplicator()

                if (replicator.isConnected()) {
                    replicator.movePlayer(this.objectId, this.body.position.x, this.body.position.y);
                    
                    let attackAngleDeg = this.attackAngle * (180 / Math.PI);
                    attackAngleDeg = ((attackAngleDeg % 360) + 360) % 360;
                    replicator.updateAttack(this.objectId, this.isFiring, Math.floor(attackAngleDeg));
                }
            }
        }

        render(context: any, offset: Vector2Type, scale: number): void {
            const circleSize = Math.max(this.body.size.x, this.body.size.y) * scale;
            const centerX = (this.body.position.x + this.body.size.x / 2 + offset.x) * scale;
            const centerY = (this.body.position.y + this.body.size.y / 2 + offset.y) * scale;
            const radius = circleSize / 2;
            const time = Date.now() * 0.001;

            context.save();

            const glowRadius = radius * 1.3;
            const gradient = context.createRadialGradient(centerX, centerY, radius * 0.8, centerX, centerY, glowRadius);

            if (this.isLocalPlayer) {
                gradient.addColorStop(0, 'rgba(0, 178, 225, 0.3)');
                gradient.addColorStop(1, 'rgba(0, 178, 225, 0)');
            } else {
                gradient.addColorStop(0, 'rgba(80, 220, 120, 0.3)');
                gradient.addColorStop(1, 'rgba(80, 220, 120, 0)');
            }

            context.fillStyle = gradient;
            context.beginPath();
            context.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
            context.fill();

            context.beginPath();
            context.arc(centerX, centerY, radius, 0, Math.PI * 2);
            context.fillStyle = this.isLocalPlayer ? '#00B2E1' : '#50DC78';
            context.fill();

            const coreRadius = radius * 0.6;
            const spikes = 8;

            context.beginPath();
            for (let i = 0; i < spikes; i++) {
                const angle = (i / spikes) * Math.PI * 2 + time * 0.5;
                const outerRadius = coreRadius + Math.sin(time * 2 + i) * 3 * scale;
                const innerRadius = coreRadius * 0.4;

                const x1 = centerX + Math.cos(angle) * outerRadius;
                const y1 = centerY + Math.sin(angle) * outerRadius;
                const x2 = centerX + Math.cos(angle + Math.PI / spikes) * innerRadius;
                const y2 = centerY + Math.sin(angle + Math.PI / spikes) * innerRadius;

                if (i === 0) context.moveTo(x1, y1);
                else context.lineTo(x1, y1);
                context.lineTo(x2, y2);
            }
            context.closePath();

            if (this.isLocalPlayer) {
                context.fillStyle = 'rgba(255, 255, 255, 0.4)';
            } else {
                context.fillStyle = 'rgba(200, 255, 220, 0.4)';
            }
            context.fill();

            context.lineWidth = 3 * scale;
            context.strokeStyle = this.isLocalPlayer ? '#0085A8' : '#2E8B57';
            context.beginPath();
            context.arc(centerX, centerY, radius, 0, Math.PI * 2);
            context.stroke();

            const accentSize = radius * 0.15;
            const accentDistance = radius * 0.85;

            for (let i = 0; i < 4; i++) {
                const angle = (i / spikes) * Math.PI * 2 + time * 0.3;
                const accentX = centerX + Math.cos(angle) * accentDistance;
                const accentY = centerY + Math.sin(angle) * accentDistance;

                context.beginPath();
                context.arc(accentX, accentY, accentSize, 0, Math.PI * 2);
                context.fillStyle = this.isLocalPlayer ? 'rgba(0, 178, 225, 0.8)' : 'rgba(80, 220, 120, 0.8)';
                context.fill();

                context.lineWidth = 1 * scale;
                context.strokeStyle = this.isLocalPlayer ? '#FFFFFF' : '#CCFFCC';
                context.stroke();
            }

            if (this.attackAngle !== -1) {
                const attackDirection = new Vector2(Math.cos(this.attackAngle), Math.sin(this.attackAngle));

                const indicatorOffset = radius * 1.15;
                const indicatorStartX = centerX + attackDirection.x * indicatorOffset;
                const indicatorStartY = centerY + attackDirection.y * indicatorOffset;

                const indicatorLength = radius * 2;
                const indicatorEndX = centerX + attackDirection.x * indicatorLength;
                const indicatorEndY = centerY + attackDirection.y * indicatorLength;

                const indicatorColor = this.isLocalPlayer ? '#40E0E0' : '#40E080';
                const indicatorGlowColor = this.isLocalPlayer ? '#80F0F0' : '#80F0C0';

                context.lineWidth = 3 * scale;
                context.strokeStyle = indicatorColor;
                context.beginPath();
                context.moveTo(indicatorStartX, indicatorStartY);
                context.lineTo(indicatorEndX, indicatorEndY);
                context.stroke();

                const arrowSize = 10 * scale;
                const arrowAngle = Math.atan2(attackDirection.y, attackDirection.x);

                context.fillStyle = indicatorColor;
                context.beginPath();
                context.moveTo(indicatorEndX, indicatorEndY);
                context.lineTo(
                    indicatorEndX - Math.cos(arrowAngle - 0.5) * arrowSize,
                    indicatorEndY - Math.sin(arrowAngle - 0.5) * arrowSize
                );
                context.lineTo(
                    indicatorEndX - Math.cos(arrowAngle + 0.5) * arrowSize,
                    indicatorEndY - Math.sin(arrowAngle + 0.5) * arrowSize
                );
                context.closePath();
                context.fill();

                const pulse = Math.sin(time * 3) * 0.2 + 0.8;
                context.globalAlpha = pulse;

                context.shadowColor = indicatorGlowColor;
                context.shadowBlur = 6 * scale;
                context.lineWidth = 1.5 * scale;
                context.strokeStyle = indicatorGlowColor;
                context.beginPath();
                context.moveTo(indicatorStartX, indicatorStartY);
                context.lineTo(indicatorEndX, indicatorEndY);
                context.stroke();

                context.shadowBlur = 0;
                context.globalAlpha = 1;
            }

            context.restore();

            context.save();
            context.textAlign = 'center';
            context.font = `Bold ${16 * scale}px "Courier New", monospace`;

            context.fillStyle = 'rgba(0, 0, 0, 0.7)';
            context.fillText(this.playerName,
                centerX + 1 * scale,
                centerY + circleSize + 1 * scale
            );

            context.fillStyle = this.isLocalPlayer ? '#00B2E1' : '#50DC78';
            context.fillText(this.playerName,
                centerX,
                centerY + circleSize
            );
            context.restore();

            super.render(context, offset, scale);
        }

    }
    
})();