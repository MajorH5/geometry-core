import { Replicator } from "./network/replicator";
import { Constants } from "./utils/constants";

import { Player } from "./logic/gameobjects/player";
import { World } from "./logic/world";
import { Vector2 } from "./utils/vector2";
import { TheCore } from "./logic/gameobjects/the-core";
import type { Player } from "./module_bindings";

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

            this.world = new World(new Vector2(500, 500), this.replicator);

            const core = new TheCore();
            this.world.spawn(core);
            core.setPosition(this.world.worldSize.div(2), true);
        }

        initialize(): void {
            if (this.initialized) {
                return;
            }

            this.initialized = true;

            const dpr: number = window.devicePixelRatio || 1;

            this.canvas.width = Constants.CANVAS_SIZE.x * dpr;
            this.canvas.height = Constants.CANVAS_SIZE.y * dpr;

            this.canvas.style.width = Constants.CANVAS_SIZE.x + 'px';
            this.canvas.style.height = Constants.CANVAS_SIZE.y + 'px';

            this.context.scale(dpr, dpr);

            this.context.imageSmoothingEnabled = false;
            (this.context as any).textRenderingOptimization = 'optimizeSpeed';

            this.replicator.connect().then(() => {
                this.replicator.onPlayerUpdate((ctx, oldNetworkedPlayer, newNetworkedPlayer) => {
                    if (this.world === null) return;

                    const isLocalPlayer = newNetworkedPlayer.identity.data === this.replicator.getIdentity()?.data;

                    if (isLocalPlayer) {
                        return;
                    }

                    const player = this.world.gameObjectLookup.get(newNetworkedPlayer.id) as InstanceType<typeof Player> | undefined;

                    if (player) {
                        player.loadState(newNetworkedPlayer);
                    }
                });

                this.replicator.onPlayerInsert((ctx, networkedPlayer) => {
                    if (this.world === null) return;

                    const isLocalPlayer = networkedPlayer.identity.data === this.replicator.getIdentity()?.data;

                    if (isLocalPlayer) {
                        this.localPlayer.loadState(networkedPlayer)
                        this.world.spawn(this.localPlayer, networkedPlayer.id);
                        this.world.camera.setSubject(this.localPlayer);
                        return;
                    }

                    const player = new Player(isLocalPlayer, this.canvas);
                    player.loadState(networkedPlayer)
                    this.world.spawn(player, networkedPlayer.id);
                });

                this.replicator.onPlayerDelete((ctx, player) => {
                    
                })
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