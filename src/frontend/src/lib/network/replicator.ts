import { DbConnection } from '../module_bindings';
import { Player } from '../module_bindings';
import { Identity } from '@clockworklabs/spacetimedb-sdk';

export class Replicator {
    private url: string;
    private moduleName: string;
    private conn: DbConnection | null = null;
    private identity: Identity | null = null;
    private connected: boolean = false;

    constructor(url: string, moduleName: string) {
        this.url = url;
        this.moduleName = moduleName;
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

                // Subscribe to all tables to trigger ClientConnected reducer
                this.subscribeToTables(['SELECT * FROM Player']);
                
                resolve();
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

    private subscribeToTables(queries: string[]): void {
        if (!this.conn) return;

        console.log("subscribe")

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
    public async movePlayer(playerId: number, newX: number, newY: number): Promise<void> {
        if (!this.conn) throw new Error('Not connected');
        
        try {
            await this.conn.reducers.movePlayer(playerId, newX, newY);
            console.log(`Moved player ${playerId} to (${newX}, ${newY})`);
        } catch (error) {
            console.error('Failed to move player:', error);
            throw error;
        }
    }

    public async updateHealth(playerId: number, amount: number): Promise<void> {
        if (!this.conn) throw new Error('Not connected');
        
        try {
            await this.conn.reducers.updateHealth(playerId, amount);
            console.log(`Updated player ${playerId} health by ${amount}`);
        } catch (error) {
            console.error('Failed to update health:', error);
            throw error;
        }
    }

    public async updateSpeed(playerId: number, amount: number): Promise<void> {
        if (!this.conn) throw new Error('Not connected');
        
        try {
            await this.conn.reducers.updateSpeed(playerId, amount);
            console.log(`Updated player ${playerId} speed by ${amount}`);
        } catch (error) {
            console.error('Failed to update speed:', error);
            throw error;
        }
    }

    public async updateAttack(playerId: number, amount: number): Promise<void> {
        if (!this.conn) throw new Error('Not connected');
        
        try {
            await this.conn.reducers.updateAttack(playerId, amount);
            console.log(`Updated player ${playerId} attack by ${amount}`);
        } catch (error) {
            console.error('Failed to update attack:', error);
            throw error;
        }
    }

    public async updateAttackSpeed(playerId: number, amount: number): Promise<void> {
        if (!this.conn) throw new Error('Not connected');
        
        try {
            await this.conn.reducers.updateAttackSpeed(playerId, amount);
            console.log(`Updated player ${playerId} attack speed by ${amount}`);
        } catch (error) {
            console.error('Failed to update attack speed:', error);
            throw error;
        }
    }

    public async updateBulletCount(playerId: number, amount: number): Promise<void> {
        if (!this.conn) throw new Error('Not connected');
        
        try {
            await this.conn.reducers.updateBulletCount(playerId, amount);
            console.log(`Updated player ${playerId} bullet count by ${amount}`);
        } catch (error) {
            console.error('Failed to update bullet count:', error);
            throw error;
        }
    }

    // Table queries - using the correct conn.db API
    public getPlayers(): Player[] {
        if (!this.conn) return [];
        return Array.from(this.conn.db.player.iter());
    }

    public getPlayer(playerId: number): Player | undefined {
        if (!this.conn) return undefined;
        return this.conn.db.player.findByPrimaryKey(playerId);
    }

    public getMyPlayer(): Player | undefined {
        if (!this.conn || !this.identity) return undefined;
        return this.conn.db.player.findByIdentity(this.identity);
    }

    // Event subscriptions - using the correct conn.db.table.onEvent API
    public onPlayerInsert(callback: (ctx: any, player: Player) => void): () => void {
        if (!this.conn) return () => {};
        
        this.conn.db.player.onInsert(callback);
        return () => this.conn?.db.player.removeOnInsert(callback);
    }

    public onPlayerUpdate(callback: (ctx: any, oldPlayer: Player, newPlayer: Player) => void): () => void {
        if (!this.conn) return () => {};
        
        this.conn.db.player.onUpdate(callback);
        return () => this.conn?.db.player.removeOnUpdate(callback);
    }

    public onPlayerDelete(callback: (ctx: any, player: Player) => void): () => void {
        if (!this.conn) return () => {};
        
        this.conn.db.player.onDelete(callback);
        return () => this.conn?.db.player.removeOnDelete(callback);
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