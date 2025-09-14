import { DbConnection, Enemy, Player } from '../module_bindings';
import { Identity } from '@clockworklabs/spacetimedb-sdk';
import { Vector2 } from '../utils/vector2';

export class Replicator {
    private url: string;
    private moduleName: string;
    private conn: DbConnection | null = null;
    private identity: Identity | null = null;
    private connected: boolean = false;
    private cache: Map<string, any>;

    constructor(url: string, moduleName: string) {
        this.url = url;
        this.moduleName = moduleName;
        this.cache = new Map();
    }

    public async connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            const onConnect = (
                conn: DbConnection,
                identity: Identity,
                token: string
            ) => {
                this.conn = conn;
                this.identity = identity;
                this.connected = true;

                console.log(`Connected to SpacetimeDB with identity: ${identity.toHexString()}`);

                // Store auth token for reconnection
                if (typeof localStorage !== 'undefined') {
                    localStorage.setItem('auth_token', token);
                }

                // allow handlers to bind first
                resolve();

                // Subscribe to all tables to trigger ClientConnected reducer
                this.subscribeToTables();
            };

            const onDisconnect = () => {
                console.log('Disconnected from SpacetimeDB');
                this.connected = false;
                this.conn = null;
                this.identity = null;
            };

            const onConnectError = (ctx: any, err: Error) => {
                console.error('Error connecting to SpacetimeDB:', err);
                reject(err);
            };

            // Get stored auth token
            const authToken = typeof localStorage !== 'undefined'
                ? localStorage.getItem('auth_token') || ''
                : '';

            this.conn = DbConnection.builder()
                .withUri(this.url)
                .withModuleName(this.moduleName)
                .withToken(authToken)
                .onConnect(onConnect)
                .onDisconnect(onDisconnect)
                .onConnectError(onConnectError)
                .build();

        });
    }

    private subscribeToTables(): void {
        if (!this.conn) return;

        this.conn
            .subscriptionBuilder()
            .onApplied(() => {
                console.log("Ok")
                console.log('SDK client cache initialized - ClientConnected should have run');
                console.log('Current players:', this.getPlayers());
            })
            .subscribeToAllTables();
    }

    public disconnect(): void {
        if (this.conn && this.connected) {
            this.conn.disconnect();
        }
    }

    // Reducer calls - using the correct conn.reducers API
    public damagePlayer(enemyId: number): void {
        if (!this.conn) throw new Error('Not connected');

        try {
            this.conn.reducers.damagePlayer(enemyId);
        } catch (error) {
            console.error('Failed to damage self:', error);
            throw error;
        }
    }

    public damageEnemy(enemyId: number): void {
        if (!this.conn) throw new Error('Not connected');

        try {
            this.conn.reducers.damageEnemy(enemyId);
        } catch (error) {
            console.error('Failed to damage enemy:', error);
            throw error;
        }
    }

    public movePlayer(playerId: number, newX: number, newY: number): void {
        if (!this.conn) throw new Error('Not connected');

        const newPosition = new Vector2(newX, newY).floor();
        const oldPosition = this.cache.get('LocalPlayerPosition');

        if (oldPosition && newPosition.equals(oldPosition)) {
            return;
        }

        this.cache.set('LocalPlayerPosition', newPosition);

        try {
            this.conn.reducers.movePlayer(playerId, newX, newY);
        } catch (error) {
            console.error('Failed to move player:', error);
            throw error;
        }
    }

    public updateAttack(playerId: number, isFiring: boolean, attackAngle: number): void {
        if (!this.conn) throw new Error('Not connected');

        const oldIsFiring = this.cache.get('LocalPlayerIsFiring');
        const oldAttackAngle = this.cache.get('LocalPlayerAttackAngle');

        if (
            oldIsFiring !== undefined && oldIsFiring === isFiring &&
            oldAttackAngle !== undefined && oldAttackAngle === attackAngle
        ) {
            return;
        }

        this.cache.set('LocalPlayerIsFiring', isFiring);
        this.cache.set('LocalPlayerAttackAngle', attackAngle);

        try {
            this.conn.reducers.updateAttack(playerId, isFiring, attackAngle);
        } catch (error) {
            console.error('Failed to update attack:', error);
            throw error;
        }
    }
    
    public getPlayers(): Player[] {
        if (!this.conn) return [];
        return Array.from(this.conn.db.player.iter());
    }

    public getMyPlayer(): Player | undefined {
        if (!this.conn || !this.identity) return undefined;
        return this.getPlayers().find((player) => player.identity === this.identity);
    }

    public onPlayerInsert(callback: (ctx: any, player: Player) => void): () => void {
        if (!this.conn) return () => { };

        this.conn.db.player.onInsert(callback);
        return () => this.conn?.db.player.removeOnInsert(callback);
    }

    public onPlayerUpdate(callback: (ctx: any, oldPlayer: Player, newPlayer: Player) => void): () => void {
        if (!this.conn) return () => { };

        this.conn.db.player.onUpdate(callback);
        return () => this.conn?.db.player.removeOnUpdate(callback);
    }

    public onPlayerDelete(callback: (ctx: any, player: Player) => void): () => void {
        if (!this.conn) return () => { };

        this.conn.db.player.onDelete(callback);
        return () => this.conn?.db.player.removeOnDelete(callback);
    }

    public onEnemyInsert(callback: (ctx: any, enemy: Enemy) => void): () => void {
        if (!this.conn) return () => { };

        this.conn.db.enemy.onInsert(callback);
        return () => this.conn?.db.enemy.removeOnInsert(callback);
    }

    public onEnemyUpdate(callback: (ctx: any, oldEnemy: Enemy, newEnemy: Enemy) => void): () => void {
        if (!this.conn) return () => { };

        this.conn.db.enemy.onUpdate(callback);
        return () => this.conn?.db.enemy.removeOnUpdate(callback);
    }

    public onEnemyDelete(callback: (ctx: any, enemy: Enemy) => void): () => void {
        if (!this.conn) return () => { };

        this.conn.db.enemy.onDelete(callback);
        return () => this.conn?.db.enemy.removeOnDelete(callback);
    }

    // Utility methods
    public isConnected(): boolean {
        return this.connected;
    }

    public getIdentity(): Identity | null {
        return this.identity;
    }

    public getConnection(): DbConnection | null {
        return this.conn;
    }
}