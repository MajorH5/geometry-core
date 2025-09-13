export const Event = (function () {
    return class Event {
        private handlers: ((...data: any[]) => void)[];

        constructor () {
            this.handlers = [];
        }

        listenOnce (handler: (...data: any[]) => void): { unlisten: () => void } {
            const onceHandler = (...data: any[]) => {
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

        unlisten (handler: (...data: any[]) => void): void {
            const index = this.handlers.indexOf(handler);

            if (index !== -1) {
                this.handlers.splice(index, 1);
            }
        }

        listen (handler: (...data: any[]) => void): { unlisten: () => void } {
            if (this.handlers.includes(handler)){
                return {
                    unlisten: () => {
                        this.unlisten(handler);
                    }
                };
            }

            this.handlers.push(handler);
            
            return {
                unlisten: () => {
                    this.unlisten(handler);
                }
            }
        }

        trigger (...data: any[]): void {
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