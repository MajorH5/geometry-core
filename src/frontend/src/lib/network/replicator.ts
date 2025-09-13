export const Replicator = (function () {
    return class Replicator {
        private url: string;
        private socket: WebSocket;

        constructor (url: string) {
            this.url = url;
            this.socket = new WebSocket(url, "v1.json.spacetimedb");

            this.socket.onopen = () => this._onSocketOpen();
            this.socket.onclose = () => this._onSocketClose();
            this.socket.onmessage = (...args) => this._onSocketMessage(...args);

            (globalThis as any).socket = this.socket;
        }

        private _onSocketOpen (): void {
            console.log(`[Replicator._onSocketOpen]: WebSocket has opened to remote server: ${this.url}`);
        }
        
        private _onSocketClose (): void {
            console.log(`[Replicator._onSocketOpen]: The WebSocket to ${this.url} has closed.`);
            
        }
        
        private _onSocketMessage (event: MessageEvent): void {
            const data = JSON.parse(event.data);
            console.log(`[Replicator._onSocketOpen]: Incoming socket data from server.`, data);
        }

    };
})();