import React from 'react';
import { chatNotifier } from './chatNotifier';

export function Chatroom ( {userName, stockSymbol} ) {
    const [messages, setMessages] = React.useState([]);
    const [inputMessage, setInputMessage] = React.useState("");
    React.useEffect(() => {
        chatNotifier.connect(stockSymbol);
        chatNotifier.subscribe(setMessages);
    }, [stockSymbol]);

    function handleSendMessage() {
        if (inputMessage.trim()) {
            chatNotifier.sendMessage(userName, inputMessage);
            setInputMessage("");
        }
    }

    return (
        <table width="100%">
            <tbody>
            <tr className="chatbox-container">
                <td className="chatbox">
                    {messages.map((msg, i) => (
                        <p key={i}>
                            <strong>{msg.username}:</strong> {msg.message} <span className="timestamp">({msg.timestamp})</span>
                        </p>
                    ))}
                </td>
            </tr>
            <tr className="chatbox-send-msg-container">
                <td className="chatbox-send-msg">
                    <input
                        type="text" 
                        placeholder="Send a message..."
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                    />
                    <button className="send-msg-button" onClick={handleSendMessage}>Send</button>
                </td>
            </tr>
            </tbody>
        </table>
    );
}