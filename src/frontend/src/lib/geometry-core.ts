import { Replicator } from "./network/replicator";
import { Constants } from "./utils/constants";

import { Player } from "./logic/gameobjects/player";
import { World } from "./logic/world";
import { Vector2 } from "./utils/vector2";
import { TheCore } from "./logic/gameobjects/the-core";
import type { Player as PlayerType } from "./module_bindings";
import { EnemyTypeIds } from "./logic/gameobjects/enemies/enemyTypeIds";
import { Spiker } from "./logic/gameobjects/enemies/spiker";
import { Entity } from "./logic/gameobjects/entity";
import { Shooter } from "./logic/gameobjects/enemies/shooter";

export const GeometryCore = (function () {
    return class GeometryCore {
        private canvas: HTMLCanvasElement;
        private context: CanvasRenderingContext2D;
        private localPlayer: InstanceType<typeof Player>;
        private replicator: Replicator;
        private initialized: boolean;
        private isRunning: boolean;
        private lastFrameTime: number | null;
        private world: InstanceType<typeof World> | null;
        private resizeHandler: () => void;

        constructor(canvas: HTMLCanvasElement) {
            this.canvas = canvas;
            const context = canvas.getContext("2d");
            if (!context) {
                throw new Error("Could not get 2D context from canvas");
            }
            this.context = context;

            this.localPlayer = new Player(true, canvas);

            this.replicator = new Replicator(Constants.SERVER_WS_URL, Constants.GLOBAL_DB_NAME);
            this.initialized = false;
            this.isRunning = false;
            this.lastFrameTime = null;

            this.world = null;

            this.world = new World(new Vector2(500, 500), this.replicator, this.canvas);

            const core = new TheCore();
            this.world.spawn(core);
            core.setPosition(this.world.worldSize.div(2), true);

            // Bind the resize handler
            this.resizeHandler = this.handleResize.bind(this);
        }

        private handleResize(): void {
            this.resizeCanvas();
        }

        private resizeCanvas(): void {
            const dpr: number = window.devicePixelRatio || 1;

            // Set canvas size to window size
            this.canvas.width = window.innerWidth * dpr;
            this.canvas.height = window.innerHeight * dpr;

            this.canvas.style.width = window.innerWidth + 'px';
            this.canvas.style.height = window.innerHeight + 'px';

            // Re-apply canvas settings after resize
            this.context.scale(dpr, dpr);
            this.context.imageSmoothingEnabled = false;
            (this.context as any).textRenderingOptimization = 'optimizeSpeed';
        }

        initialize(): void {
            if (this.initialized) {
                return;
            }

            this.initialized = true;

            // Initial canvas resize
            this.resizeCanvas();

            // Add resize event listener
            window.addEventListener('resize', this.resizeHandler);

            this.replicator.connect().then(() => {
                this.replicator.onPlayerUpdate((ctx, _, newNetworkedPlayer) => {
                    if (this.world === null) return;

                    const isLocalPlayer = newNetworkedPlayer.identity.data === this.replicator.getIdentity()?.data;
                    const player = this.world.playerLookup.get(newNetworkedPlayer.id) as InstanceType<typeof Player> | undefined;

                    if (player) {
                        player.loadState(newNetworkedPlayer, isLocalPlayer);
                    }
                });

                this.replicator.onPlayerInsert((ctx, networkedPlayer) => {
                    if (this.world === null) return;

                    const isLocalPlayer = networkedPlayer.identity.data === this.replicator.getIdentity()?.data;

                    if (isLocalPlayer) {
                        this.localPlayer.loadState(networkedPlayer, isLocalPlayer)
                        this.world.spawn(this.localPlayer, networkedPlayer.id);
                        this.world.camera.setSubject(this.localPlayer);
                        return;
                    }

                    const player = new Player(isLocalPlayer, this.canvas);
                    player.loadState(networkedPlayer, isLocalPlayer)
                    this.world.spawn(player, networkedPlayer.id);
                });

                this.replicator.onPlayerDelete((ctx, networkedPlayer) => {
                    if (this.world === null) return;

                    const isLocalPlayer = networkedPlayer.identity.data === this.replicator.getIdentity()?.data;

                    if (isLocalPlayer) {
                        return;
                    }

                    const entity = this.world.playerLookup.get(networkedPlayer.id) as InstanceType<typeof Player> | undefined;

                    if (entity) {
                        this.world.despawn(entity);
                    }
                });

                this.replicator.onEnemyInsert((_, networkedEnemy) => {
                    if (!this.world) return;
                    let entity: InstanceType<typeof Entity> | null = null;

                    switch (networkedEnemy.typeId) {
                        case EnemyTypeIds.RUSHER:
                            entity = new Spiker();
                            break;
                        case EnemyTypeIds.SHOOTER:
                            entity = new Shooter();
                            break;
                    }

                    if (entity !== null) {
                        entity.loadState(networkedEnemy, false);
                        this.world.spawn(entity, networkedEnemy.id);
                    } else {
                    }
                });

                this.replicator.onEnemyUpdate((ctx, _, networkedEnemy) => {
                    if (this.world === null) return;

                    const entity = this.world.entityLookup.get(networkedEnemy.id) as InstanceType<typeof Entity> | undefined;

                    if (entity) {
                        entity.loadState(networkedEnemy, false);
                    }
                });

                this.replicator.onEnemyDelete((_, networkedEnemy) => {
                    if (this.world === null) return;

                    const entity = this.world.entityLookup.get(networkedEnemy.id) as InstanceType<typeof Entity> | undefined;

                    if (entity) {
                        this.world.despawn(entity);
                    }
                });
            });
        }

        start(): void {
            if (this.isRunning) {
                return;
            }

            this.isRunning = true;
            this.loop();
        }

        private loop(): void {
            if (!this.isRunning) {
                return;
            }

            const now: number = Date.now();
            const deltaTime: number = this.lastFrameTime !== null ? now - this.lastFrameTime : 1 / 60;

            this.update(deltaTime);
            this.render();

            this.lastFrameTime = now;
            requestAnimationFrame(() => this.loop());
        }

        stop(): void {
            if (!this.isRunning) {
                return;
            }

            this.isRunning = false;
        }

        destroy(): void {
            this.stop();
            window.removeEventListener('resize', this.resizeHandler);
        }

        private update(deltaTime: number): void {
            if (this.world !== null) {
                this.world.update(deltaTime);
            }
        }

        private render(): void {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.context.translate(-0.5, -0.5);

            if (this.world !== null) {
                this.world.render(this.context);
            }
            this.context.translate(0.5, 0.5);
        }
    };
})();