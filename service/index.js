const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const uuid = require('uuid');
require('dotenv').config();

const authCookieName = 'token';
const POLYGON_API_KEY = process.env.POLYGON_API_KEY; 

let users = [];
let porfolioValues = [];

const port = process.argv.length > 2 ? process.argv[2] : 3000;

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
  }
  res.clearCookie(authCookieName);
  res.status(204).end();
});

apiRouter.get('/stocks', verifyAuth, async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ error: "Missing stock query" });
  }
  try {
    const response = await fetch(`https://api.polygon.io/v3/reference/tickers?search=${query}&active=true&limit=10&apiKey=${POLYGON_API_KEY}`);
    if (!response.ok) {
      throw new Error(`Polygon API error: ${response.statusText}`);
    }

    const data = await response.json();
    res.json(data.results || []);
  } catch (err) {
    console.error("Error fetching stock data:", err.message);
    res.status(500).json({err: "Error retrieving stock data"});
  }
});

apiRouter.get('/stocks/stock-data', verifyAuth, async (req, res) => {
  const { symbol, timeframe } = req.query;
  if (!symbol || !timeframe) {
      return res.status(400).json({err: "Missing stock symbol or timeframe"});
  }
  try {
      const statusResponse = await fetch(`https://api.polygon.io/v1/marketstatus/now?apiKey=${POLYGON_API_KEY}`);
      if (!statusResponse.ok) throw new Error("Failed to fetch market status");
      const marketStatus = await statusResponse.json();

      let data = [];
      let timespan = "minute";
      let multiplier = 1;

      if (timeframe === "1d") {
          timespan = "day";
      } else if (timeframe === "1w") {
          timespan = "day";
          multiplier = 7;
      } else if (timeframe === "1m") {
          timespan = "day";
          multiplier = 30;
      }

      const today = new Date().toISOString().split("T")[0];
      if (marketStatus.market === "closed") {
          let yesterday = new Date();
          yesterday.setDate(yesterday.getDate()-1);
          const prevDate = yesterday.toISOString().split("T")[0];

          const prevDayUrl = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/minute/${prevDate}/${prevDate}?adjusted=true&sort=asc&limit=1000&apiKey=${POLYGON_API_KEY}`;
          const prevDayResponse = await fetch(prevDayUrl);
          if (!prevDayResponse.ok) throw new Error("Failed to fetch previous day's data");

          const prevDayData = await prevDayResponse.json();
          if (prevDayData.results) {
              data = prevDayData.results.map(entry => ({time: new Date(entry.t).toLocaleTimeString(), price: entry.c,}));
              price = prevDayData.results[prevDayData.results.length-1].c;
          }
      } else {
          const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/${multiplier}/${timespan}/${today}/${today}?adjusted=true&sort=asc&limit=100&apiKey=${POLYGON_API_KEY}`;
          const response = await fetch(url);
          if (!response.ok) throw new Error(`Polygon API error: ${response.statusText}`);

          const result = await response.json();
          data = result.results.map((entry) => ({time: new Date(entry.t).toLocaleTimeString(), price: entry.c,}));
          price = result.results[result.results.length-1].c;
      }
      res.json({data, marketStatus, price});

  } catch (err) {
      console.error("Error fetching stock data:", err.message);
      res.status(500).json({err: "Error retrieving stock data"});
  }
});

let tempUsers = {
  "Jack": {username: "Jack", portfolioValue: Math.floor(Math.random()*5000) + 500},
  "Kate": {username: "Kate", portfolioValue: Math.floor(Math.random()*5000) + 500},
  "Sawyer": {username: "Sawyer", portfolioValue: Math.floor(Math.random()*5000) + 500}
}

apiRouter.get('/leaderboard', verifyAuth, (req, res) => {
  const {username, portfolioValue} = req.user;

  // if bet not placed
  if (!tempUsers[username]){
    tempUsers[username] = {username, portfolioValue: portfolioValue}
  }

  const rankedUsers = Object.values(tempUsers).sort((a, b) => b.portfolioValue - a.portfolioValue);
  res.json(rankedUsers);
});

apiRouter.post('/update-portfolio', verifyAuth, (req, res) => {
  const {username, portfolioValue} = req.body;
  if (!username || portfolioValue === undefined) {
      return res.status(400).json({error: "Invalid request data"});
  }
  tempUsers[username] = {username, portfolioValue};
  res.json({message: "Portfolio updated successfully"});
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
  users.push(user);

  return user;
}

async function findUser(field, value) {
  if (!value) return null;

  return users.find((u) => u[field] === value);
}

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
