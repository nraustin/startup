const bcrypt = require('bcryptjs');
const uuid = require('uuid');
const DB = require('../database');

const authCookieName = 'token';

let users = [];

const verifyAuth = async (req, res, next) => {
    const user = await findUser('token', req.cookies[authCookieName]);
    if (user) {
      req.user = user;
      next();
    } else {
      res.status(401).send({ msg: 'Unauthorized' });
    }
};
  
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

module.exports = {setAuthCookie, createUser, findUser, verifyAuth, authCookieName}