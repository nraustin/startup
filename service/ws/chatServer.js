const WebSocket = require('ws');

function initChatServer(server) {
  const ws = new WebSocket.Server({noServer: true});
  const chatRooms = new Map();
  const chatHistory = new Map();

  ws.on('connection', (clientWs, req, symbol) => {
    console.log(`connected on: ${symbol}`);
    if (!chatRooms.has(symbol)) {
      chatRooms.set(symbol, new Set());
    }
    chatRooms.get(symbol).add(clientWs);
    const history = chatHistory.get(symbol) || [];
    history.forEach(chatMsg => {
        if(clientWs.readyState == WebSocket.OPEN){
            clientWs.send(JSON.stringify(chatMsg));
        }
    })
    clientWs.on('message', (msg) => {
      const parsed = JSON.parse(msg);
      const chatMsg = {...parsed, timestamp: parsed.timestamp || new Date().toLocaleTimeString(), symbol};
      if(!chatHistory.has(symbol)){
        chatHistory.set(symbol, []);
      }
      const history = chatHistory.get(symbol);
      history.push(chatMsg);
      if(history.length > 5){
        history.shift();
      }
      for (const client of chatRooms.get(symbol)) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(chatMsg));
        }
      }
    });

    clientWs.on('close', () => {
      chatRooms.get(symbol)?.delete(clientWs);
    });
  });

  return ws;
}

module.exports = initChatServer;