export const Replicator = (function () {
    return class Replicator {
        constructor (url) {
            this.url = url;
            this.socket = new WebSocket(url, "v1.json.spacetimedb");

            this.socket.onopen = () => this._onSocketOpen();
            this.socket.onclose = () => this._onSocketClose();
            this.socket.onmessage = (...args) => this._onSocketMessage(...args);

            globalThis.socket = this.socket;
        }

        _onSocketOpen () {
            console.log(`[Replicator._onSocketOpen]: WebSocket has opened to remote server: ${this.url}`);
        }
        
        _onSocketClose () {
            console.log(`[Replicator._onSocketOpen]: The WebSocket to ${this.url} has closed.`);
            
        }
        
        _onSocketMessage (event) {
            const data = JSON.parse(event.data);
            console.log(`[Replicator._onSocketOpen]: Incoming socket data from server.`, data);
        }

    };
})();