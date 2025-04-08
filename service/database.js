const { MongoClient } = require('mongodb');
const config = require('./dbConfig.json');

const url = `mongodb+srv://${config.userName}:${config.password}@${config.hostname}`;
const client = new MongoClient(url);
const db = client.db('simon');
const userCollection = db.collection('user');

// This will asynchronously test the connection and exit the process if it fails
(async function testConnection() {
  try {
    await db.command({ ping: 1 });
    console.log(`Connect to database`);
  } catch (ex) {
    console.log(`Unable to connect to database with ${url} because ${ex.message}`);
    process.exit(1);
  }
})();

function getUser(userName) {
  return userCollection.findOne({ userName: userName });
}

function getUserByToken(token) {
  return userCollection.findOne({ token: token });
}

async function addUser(user) {
  await userCollection.insertOne(user);
}

async function updateUser(user) {
  await userCollection.updateOne({ userName: user.userName }, { $set: user });
}

async function updatePortfolioValue(userName, portfolioValue) {
  await userCollection.updateOne({ userName }, { $set: { portfolioValue } }, { upsert: false});
}

function getTopPortfolios() {
  const query = { portfolioValue: {$ne: null} };
  const options = {
    sort: { portfolioValue: -1 },
    limit: 10,
  };
  const cursor = userCollection.find(query, options);
  return cursor.toArray();
}

module.exports = {
  getUser,
  getUserByToken,
  addUser,
  updateUser,
  updatePortfolioValue,
  getTopPortfolios,
};
