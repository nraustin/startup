class ChatNotifier {
    constructor() {
        this.subscribers = [];
        this.messages = {};
        this.ws = null;
        this.currSymbol = null;
    }

    connect(symbol) {
        if(this.ws) {
            this.ws.close();
        }
        this.currSymbol = symbol;
        this.messages[symbol] = [];
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const host = import.meta.env.DEV ? 'localhost:4000' : window.location.host;
        this.ws = new WebSocket(`${protocol}://${host}/chat?symbol=${symbol}`);
        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if(!this.messages[symbol]) {
                this.messages[symbol] = [];
            }
            this.messages[symbol].push(message);
            if (this.messages[symbol].length > 5) {
                this.messages[symbol].shift();
            }
            this.subscribers.forEach(cb => cb([...this.messages[symbol]]));
        }

        this.ws.onclose = () => {
            console.log("Chat WS closed");
        }

    }

    subscribe(callback) {
        this.subscribers.push(callback);
        const messages = this.messages[this.currSymbol] || [];
        callback(messages); 
    }
    unsubscribe(callback) {
        this.subscribers = this.subscribers.filter(cb => cb !== callback);
    }

    sendMessage(username, message) {
        const msgObj = typeof message === 'string' ? {username, message} : { ...message, username};
        console.log(msgObj);
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(msgObj));
        }
    }
}

export const chatNotifier = new ChatNotifier();