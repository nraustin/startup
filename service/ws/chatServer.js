const WebSocket = require('ws');

function initChatServer(server) {
  const ws = new WebSocket.Server({noServer: true});
  const chatRooms = new Map();

  ws.on('connection', (clientWs, req, symbol) => {
    console.log(`connected on: ${symbol}`);
    if (!chatRooms.has(symbol)) {
      chatRooms.set(symbol, new Set());
    }
    chatRooms.get(symbol).add(clientWs);
    clientWs.on('message', (msg) => {
      const parsed = JSON.parse(msg);
      const chatMsg = {username: parsed.username, message: parsed.message, timestamp: new Date().toLocaleTimeString(), symbol};
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