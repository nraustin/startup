const express = require('express');
const apiRouter = express.Router();
const DB = require('../database.js');
const { setAuthCookie, createUser, findUser, verifyAuth, authCookieName } = require('../auth/utils.js');
const bcrypt = require('bcryptjs');
const uuid = require('uuid');
const { DateTime} = require('luxon');

require('dotenv').config();
const POLYGON_API_KEY = process.env.POLYGON_API_KEY; 

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
    console.log(result)
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

apiRouter.get('/portfolio/:username', verifyAuth, async (req, res) => {
  const username = req.params.username;
  console.log(username);
  const user = await DB.getUser(username);
  res.json({portfolioValue: user.portfolioValue});
});

apiRouter.get('/market-open/:symbol', async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  const now = DateTime.now().setZone('America/Denver')
  const marketOpenTime = now.set({hour: 7, minute: 30})
  const targetDate = now < marketOpenTime ? now.minus({days: 1}) : now;
  const dateStr = targetDate.toISODate();
  const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/minute/${dateStr}/${dateStr}?adjusted=true&sort=asc&limit=1&apiKey=${process.env.POLYGON_API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();

  if (!data.results?.length) {
    return res.status(404).json({error: 'No open price found'});
  }
  const openPrice = data.results[0].o;
  res.json({symbol, openPrice, date: dateStr});
});


module.exports = apiRouter;




