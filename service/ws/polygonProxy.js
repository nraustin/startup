const WebSocket = require('ws');
require('dotenv').config();

// ----------------------WebSocket Logic----------------------------------
// Polygon's WS API limits a user to 1 active connection per symbol (and API key, technically).
// In order to circumvent this limitaton, the following server-side WS architecture enables 
// multiple subscriptions to the same symbol. Each client will open a WS connection in the front end 
// that is processed as an incoming connection to the singular WS connection for the back end, which 
// serves as a proxy for connections between users and Polygon.
function initPolygonProxy(server) {
    const polygonSocket = new WebSocket('wss://delayed.polygon.io/stocks');
    polygonSocket.on('open', function open() {
      polygonSocket.send(JSON.stringify({action: 'auth', params: process.env.POLYGON_API_KEY}));
    });
    polygonSocket.on('error', (err) => console.error('Polygon WS error:', err));
    polygonSocket.on('close', () => console.log('Polygon WS closed.'));
    
    const wss = new WebSocket.Server({server});
    const clientSubscriptions = new Map();
    
    wss.on('connection', (clientWs) => {
      console.log('Front-end client connected to WS proxy.');
    
      clientSubscriptions.set(clientWs, []);
      clientWs.on('message', (msg) => {
        let data = JSON.parse(msg);
        if (data.type === 'subscribe' && data.symbol) {
          const currentSubs = clientSubscriptions.get(clientWs) || [];
          if (!currentSubs.includes(data.symbol)) {
            currentSubs.push(data.symbol);
            clientSubscriptions.set(clientWs, currentSubs);
          }
          polygonSocket.send(JSON.stringify({action: 'subscribe', params: `A.${data.symbol}`}));
          console.log(`Client subscribed to A.${data.symbol}`);
    
        } else if (data.type === 'unsubscribe' && data.symbol) {
          const currentSubs = clientSubscriptions.get(clientWs) || [];
          clientSubscriptions.set(clientWs, currentSubs.filter(sym => sym !== data.symbol));
          // This isn't going to work; one client will unsubscribe for all clients?
          polygonSocket.send(JSON.stringify({action: 'unsubscribe', params: `A.${data.symbol}`}));
          console.log(`Client unsubscribed from A.${data.symbol}`);
        }
    
      });
    
      clientWs.on('close', () => {
        console.log('Front-end client disconnected.');
        clientSubscriptions.delete(clientWs);
      });
    });
    
    polygonSocket.on('message', (rawData) => {
      let parsed = JSON.parse(rawData)
      if (!Array.isArray(parsed)) {
        return;
      }
    
      parsed.forEach((event) => {
        // console.log(event)
        if (event.ev === 'A') {
          const symbol = event.sym; 
          console.log(event)
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              const subs = clientSubscriptions.get(client) || [];
              if (subs.includes(symbol)) {
                client.send(JSON.stringify(event));
              }
            }
          });
        }
      });
    });

    return wss;
}

module.exports = initPolygonProxy;

