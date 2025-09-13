
export const Event = (function () {
    return class Event {
        constructor () {
            this.handlers = [];
        }

        listenOnce (handler) {
            const onceHandler = (...data) => {
                this.unlisten(onceHandler);
                handler(...data);
            };

            this.listen(onceHandler);

             return {
                unlisten: () => {
                    this.unlisten(handler);
                }
            }
        }

        unlisten (handler) {
            const index = this.handlers.indexOf(handler);

            if (index !== -1) {
                this.handlers.splice(index, 1);
            }
        }

        listen (handler) {
            if (this.handlers.includes(handler)){
                return;
            }

            this.handlers.push(handler);
            
            return {
                unlisten: () => {
                    this.unlisten(handler);
                }
            }
        }

        trigger (...data) {
            for (let i = this.handlers.length - 1; i >= 0; i--){
                const handler = this.handlers[i];

                if (handler === undefined) {
                    continue;
                }

                try {
                    handler(...data);
                } catch (e) {
                    console.error(e);
                }
            }
        }
    }
})();