class ChatMessage {
    constructor(username, message) {
        this.username = username;
        this.message = message;
        this.timestamp = new Date().toLocaleTimeString();
    }
}

class ChatNotifier {
    constructor() {
        this.subscribers = [];
        this.messages = [];
        
        this.placeholderUsers = ["John", "Hugo", "Charlie", "Jin"];
        this.randomMessages = [
            "I feed on volatility",
            "I had a GPU for breakfast.",
            "This is so overhyped, c'mon guys",
            "Why does this price action seem fake?",
            "You couldn't lose your money faster even if you lit it on fire!",
        ]

        setInterval(() => {
            this.sendRandomMessage();
        }, 3000);
    }

    subscribe(callback) {
        this.subscribers.push(callback);
        callback(this.messages); 
    }

    sendMessage(username, message) {
        const chatMessage = new ChatMessage(username, message);
        this.messages.push(chatMessage);

        if (this.messages.length > 5) {
            this.messages.shift()
        }

        this.subscribers.forEach(callback => callback([...this.messages]));
    }

    sendRandomMessage() {
        const randUser = this.placeholderUsers[Math.floor(Math.random()*this.placeholderUsers.length)];
        const randMsg = this.randomMessages[Math.floor(Math.random()*this.randomMessages.length)];

        this.sendMessage(randUser, randMsg);
    }
}

export const chatNotifier = new ChatNotifier();