class ChatNotifier {
    constructor() {
        this.subscribers = [];
        this.messages = [];
        this.ws = null;
        
        // this.placeholderUsers = ["John", "Hugo", "Charlie", "Jin"];
        // this.randomMessages = [
        //     "I feed on volatility",
        //     "I had a GPU for breakfast.",
        //     "This is so overhyped, c'mon guys",
        //     "Why does this price action seem fake?",
        //     "You couldn't lose your money faster even if you lit it on fire!",
        // ]

        // setInterval(() => {
        //     this.sendRandomMessage();
        // }, 3000);
    }

    connect(symbol) {
        if(this.ws) {
            this.ws.close();
        }
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const host = import.meta.env.DEV ? 'localhost:4000' : window.location.host;
        this.ws = new WebSocket(`${protocol}://${host}/chat?symbol=${symbol}`);
        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            this.messages.push(message);
            if (this.messages.length > 5) {
                this.messages.shift();
            }
            this.subscribers.forEach(cb => cb([...this.messages]));
        }

        this.ws.onclose = () => {
            console.log("Chat WS closed");
        }

    }

    subscribe(callback) {
        this.subscribers.push(callback);
        callback(this.messages); 
    }

    sendMessage(username, message) {
        const chatMsg = {username, message};
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(chatMsg));
        }
        // const chatMessage = new ChatMessage(username, message);
        // this.messages.push(chatMessage);

        // if (this.messages.length > 5) {
        //     this.messages.shift()
        // }

        // this.subscribers.forEach(callback => callback([...this.messages]));
    }

    // sendRandomMessage() {
    //     const randUser = this.placeholderUsers[Math.floor(Math.random()*this.placeholderUsers.length)];
    //     const randMsg = this.randomMessages[Math.floor(Math.random()*this.randomMessages.length)];

    //     this.sendMessage(randUser, randMsg);
    // }
}

export const chatNotifier = new ChatNotifier();