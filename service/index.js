const express = require('express');
const cookieParser = require('cookie-parser');
const http = require('http');
const apiRouter = require('./routes/api.js');
const initPolygonProxy = require('./ws/polygonProxy.js');
const initChatServer = require('./ws/chatServer.js');
const upgradeConnection = require('./ws/upgradeProtocol.js')

require('dotenv').config();

const app = express();
const server = http.createServer(app)
const port = process.argv.length > 2 ? process.argv[2] : 4000;

app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));
app.use(`/api`, apiRouter);

app.use(function (err, req, res, next) {
    res.status(500).send({ type: err.name, message: err.message });
});
  
// Return the application's default page if the path is unknown
app.use((_req, res) => {
    res.sendFile('index.html', { root: 'public' });
});

const polygonWS = initPolygonProxy(server);
const chatWS = initChatServer(server);

upgradeConnection(server, {'/chat': chatWS, '/polygon': polygonWS})

server.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
});
  