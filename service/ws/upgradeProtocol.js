const url = require('url');

// // listens for HTTP upgrades to support both the webchat and polygon ws
function upgradeConnection(server, routes = {}) {
    server.on('upgrade', (req, socket, head) => {
        const {pathname, searchParams} = new URL(req.url, `http://${req.headers.host}`);
        const handler = routes[pathname];
        if (handler) {
          const symbol = searchParams.get('symbol');
          handler.handleUpgrade(req, socket, head, (ws) => {
            handler.emit('connection', ws, req, symbol);
          });
        } else {
          socket.destroy(); 
        }
    });
}

module.exports = upgradeConnection;