const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const uuid = require('uuid');
const DB = require('./database.js');

const http = require('http')
const server = http.createServer(app)
const WebSocket = require('ws');
require('dotenv').config();

const authCookieName = 'token';
const POLYGON_API_KEY = process.env.POLYGON_API_KEY; 

let users = [];
let porfolioValues = [];

const port = process.argv.length > 2 ? process.argv[2] : 4000;

app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));

var apiRouter = express.Router();
app.use(`/api`, apiRouter);

// Middleware to verify that the user is authorized to call an endpoint
const verifyAuth = async (req, res, next) => {
  const user = await findUser('token', req.cookies[authCookieName]);
  if (user) {
    req.user = user;
    next();
  } else {
    res.status(401).send({ msg: 'Unauthorized' });
  }
};

apiRouter.post('/auth/create', async (req, res) => {
  if (await findUser('username', req.body.username)) {
    console.log("in auth/create")
    res.status(409).send({ msg: 'Existing user' });
  } else {
    const user = await createUser(req.body.username, req.body.password);

    setAuthCookie(res, user.token);
    res.send({ username: user.username });
  }
});

apiRouter.post('/auth/login', async (req, res) => {
  const user = await findUser('username', req.body.username);
  if (user) {
    if (await bcrypt.compare(req.body.password, user.password)) {
      user.token = uuid.v4();
      await DB.updateUser(user);
      setAuthCookie(res, user.token);
      res.send({ username: user.username });
      return;
    }
  }
  res.status(401).send({ msg: 'Unauthorized' });
});

apiRouter.delete('/auth/logout', async (req, res) => {
  const user = await findUser('token', req.cookies[authCookieName]);
  if (user) {
    delete user.token;
    await DB.updateUser(user);
  }
  res.clearCookie(authCookieName);
  res.status(204).end();
});

apiRouter.get('/stocks', verifyAuth, async (req, res) => {
  const {query} = req.query;
  try {
    const response = await fetch(`https://api.polygon.io/v3/reference/tickers?search=${query}&active=true&limit=10&apiKey=${POLYGON_API_KEY}`);
    if (!response.ok) {
      throw new Error(`Polygon API error: ${response.statusText}`);
    }

    const data = await response.json();
    res.json(data.results || []);
  } catch (err) {
    console.error("Error in /stocks", err.message);
    res.status(500).json({err: "Error retrieving stock data"});
  }
});

apiRouter.get('/stocks/stock-data', verifyAuth, async (req, res) => {
  const {symbol, timeframe} = req.query;
  try {
    const statusResponse = await fetch(`https://api.polygon.io/v1/marketstatus/now?apiKey=${POLYGON_API_KEY}`);
    if (!statusResponse.ok) throw new Error("Failed to fetch market status");
    const marketStatus = await statusResponse.json();

    let data = [];
    let price = null;

    if (timeframe === "1w") {
      let today = new Date();
      for (let i = 0; i < 7; i++) {
        let day = new Date();
        day.setDate(today.getDate()-i);
        const dateStr = day.toISOString().split("T")[0];
        const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/hour/${dateStr}/${dateStr}?adjusted=true&sort=asc&limit=1000&apiKey=${POLYGON_API_KEY}`;
        const response = await fetch(url);
        const result = await response.json();

        if (result.results) {
          const dailyData = result.results.map((entry) => {
            const date = new Date(entry.t);
            return {
              time: date.toLocaleDateString("en-US", {timeZone: "America/Denver", hour: "2-digit", minute: "2-digit"}),
              price: entry.c
            };
          });
          data = [...dailyData, ...data];
        }
      }
      price = data.length > 0 ? data[data.length-1].price : null;
    }

    else if (timeframe === "1m") {
      let fromDate = new Date();
      let toDate = new Date();
      fromDate.setMonth(toDate.getMonth()-1);
      const fromISO = fromDate.toISOString().split("T")[0];
      const toISO = toDate.toISOString().split("T")[0];

      const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${fromISO}/${toISO}?adjusted=true&sort=asc&limit=1000&apiKey=${POLYGON_API_KEY}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Polygon API error: ${response.statusText}`);

      const result = await response.json();
      data = result.results.map((entry) => {
        const date = new Date(entry.t);
        return {
          time: date.toLocaleDateString("en-US", { timeZone: "America/Denver" }),
          price: entry.c
        };
      });
      price = result.results[result.results.length-1]?.c ?? null;
    }

    else {
      const today = new Date().toISOString().split("T")[0];
      const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/minute/${today}/${today}?adjusted=true&sort=asc&limit=1000&apiKey=${POLYGON_API_KEY}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Polygon API error: ${response.statusText}`);

      const result = await response.json();
      data = result.results.map(entry => ({
        time: new Date(entry.t).toLocaleTimeString("en-US", {timeZone: "America/Denver"}),
        price: entry.c
      }));
      price = result.results[result.results.length-1].c;
    }

    res.json({data, marketStatus, price});

  } catch (err) {
    console.error("Error in /stocks/stock-data", err.message);
    res.status(500).json({err: "Error retrieving stock data"});
  }
});

apiRouter.get('/stocks/live-history', verifyAuth, async (req, res) => {
  const {symbol} = req.query;
  try {
    const statusResponse = await fetch(`https://api.polygon.io/v1/marketstatus/now?apiKey=${POLYGON_API_KEY}`);
    if (!statusResponse.ok) throw new Error("Failed to fetch market status");
    const marketStatus = await statusResponse.json();

    let dateToUse = new Date();
    if (marketStatus.market === "closed") {
      dateToUse.setDate(dateToUse.getDate() - 1);
    }

    const dateStr = dateToUse.toISOString().split("T")[0];
    const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/minute/${dateStr}/${dateStr}?adjusted=true&sort=asc&limit=1000&apiKey=${POLYGON_API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Polygon API error");

    const result = await response.json();
    const data = result.results.map((entry) => ({
      time: new Date(entry.t).toLocaleTimeString("en-US", {timeZone: "America/Denver"}),
      price: entry.c,
    }));
    const lastPrice = data[data.length-1]?.price ?? null;

    res.json({data, price: lastPrice, marketStatus});
  } catch (err) {
    console.error("Error in /stocks/live-history:", err);
    res.status(500).json({err: "Could not load live history"});
  }
});

// let tempUsers = {
//   "Jack": {username: "Jack", portfolioValue: Math.floor(Math.random()*5000) + 500},
//   "Kate": {username: "Kate", portfolioValue: Math.floor(Math.random()*5000) + 500},
//   "Sawyer": {username: "Sawyer", portfolioValue: Math.floor(Math.random()*5000) + 500}
// }

apiRouter.get('/leaderboard', verifyAuth, async (req, res) => {
  const topUsers = await DB.getTopPortfolios();
  res.json(topUsers);
});

apiRouter.post('/update-portfolio', verifyAuth, async (req, res) => {
  const {portfolioValue} = req.body;
  const {username} = req.user;
  await DB.updatePortfolioValue(username, portfolioValue);
  const topUsers = await DB.getTopPortfolios();
  res.json(topUsers);
});

app.use(function (err, req, res, next) {
  res.status(500).send({ type: err.name, message: err.message });
});

// Return the application's default page if the path is unknown
app.use((_req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

// setAuthCookie in the HTTP response
function setAuthCookie(res, authToken) {
  res.cookie(authCookieName, authToken, {
    secure: true,
    httpOnly: true,
    sameSite: 'strict',
  });
}

async function createUser(username, password) {
  const passwordHash = await bcrypt.hash(password, 10);

  const user = {
    username: username,
    password: passwordHash,
    token: uuid.v4(),
    portfolioValue: 1000,
  };
  await DB.addUser(user);
  users.push(user);

  return user;
}

async function findUser(field, value) {
  if (!value) return null;

  if (field === 'token') {
      return DB.getUserByToken(value);
    }
    return DB.getUser(value);
}

// app.listen(port, () => {
//   console.log(`Listening on port ${port}`);
// });

// ----------------------WebSocket Logic----------------------------------
// Polygon's WS API limits a user to 1 active connection per symbol (and API key, technically).
// In order to circumvent this limitaton, the following server-side WS architecture enables 
// multiple subscriptions to the same symbol. Each client will open a WS connection in the front end 
// that is processed as an incoming connection to the singular WS connection for the back end, which 
// serves as a proxy for connections between users and Polygon.

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

// ---------------------------------------------------------------------
server.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
