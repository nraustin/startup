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

apiRouter.post('/auth/create', async (req, res) => {
  if (await findUser('email', req.body.email)) {
    console.log("in auth/create")
    res.status(409).send({ msg: 'Existing user' });
  } else {
    const user = await createUser(req.body.email, req.body.password);

    setAuthCookie(res, user.token);
    res.send({ email: user.email });
  }
});

apiRouter.post('/auth/login', async (req, res) => {
  const user = await findUser('email', req.body.email);
  if (user) {
    if (await bcrypt.compare(req.body.password, user.password)) {
      user.token = uuid.v4();
      setAuthCookie(res, user.token);
      res.send({ email: user.email });
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

apiRouter.get('/stocks', async (req, res) => {
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
    res.status(500).json({ err: "Error retrieving stock data" });
  }
});

apiRouter.get('/stock-data', async (req, res) => {
  const { symbol, timeframe } = req.query;

  if (!symbol || !timeframe) {
      return res.status(400).json({ error: "Missing stock symbol or timeframe" });
  }

  let timespan = "minute";
  let multiplier = 1; 

  if (timeframe === "1d") {
      timespan = "day";
      multiplier = 1;
  } else if (timeframe === "1w") {
      timespan = "day";
      multiplier = 7;
  } else if (timeframe === "1m") {
      timespan = "day";
      multiplier = 30;
  }

  const today = new Date().toISOString().split("T")[0];
  const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/${multiplier}/${timespan}/${today}/${today}?adjusted=true&sort=asc&limit=100&apiKey=${POLYGON_API_KEY}`;

  try {
      const response = await fetch(url);
      if (!response.ok) {
          throw new Error(`Polygon API error: ${response.statusText}`);
      }
      const data = await response.json();
      if (!data.results) {
          return res.status(404).json({ error: "No data available" });
      }
      const formattedData = data.results.map((entry) => ({
          time: new Date(entry.t).toLocaleTimeString(),
          price: entry.c,
      }));

      res.json(formattedData);
  } catch (err) {
      console.error("Error fetching stock data:", err.message);
      res.status(500).json({ err: "Error retrieving stock data" });
  }
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

async function createUser(email, password) {
  const passwordHash = await bcrypt.hash(password, 10);

  const user = {
    email: email,
    password: passwordHash,
    token: uuid.v4(),
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
