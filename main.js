// read and validate tokens
require('dotenv').config();
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Users } = require('./models');
const { loginLink } = require('./loginLink');
const { createSecrets } = require('./createSecrets');
const operations = require(path.resolve(__dirname, '../../config/operations.config'));

async function checkForAccessToken(req, res) {
  //Access cookies

  //if there is already an accessToken, execute operations
  if (req.cookies.accessToken !== null) {
    res.locals.permitted = true;
    res.locals.accessToken = req.cookies.accessToken;
    return;
  };

  //If there is no refreshToken, then they will not be permitted
  if (req.cookies.refreshToken === null) {
    res.locals.permitted = false;
    return;
  };

  //Check for the refreshToken in the DB
  //if hashed refresh token matched users token, give new accessToken and refreshToken, delete old refresh token
  //if tokens dont match, return 403 status
  const userObj = jwt.decode(req.cookies.refreshToken);

  Users.find({ username: userObj.user }, (err, user) => {
    if (!err) {
      bcrypt.compare(refreshToken, user.refreshToken)
        .then(res => {
          if (res === true) {
            //give user a new accessToken
            const secret = process.env[`ACCESS_TOKEN_${userObj.role.toUpperCase()}_SECRET`];
            const accessToken = jwt.sign(userObj.role, secret, { expiresIn: '15m' });
            res.locals.accessToken = accessToken;
            //give user new refreshToken
            const newRefreshToken = jwt.sign(userObj.role, process.env.REFRESH_TOKEN_SECRET);
            const hashedToken = bcrypt.hashSync(newRefreshToken, 10);
            //update the refreshToken in DB
            Users.findOneAndUpdate({ username: userObj.user }, { refreshToken: hashedToken});
            res.locals.permitted = true;
            return;
          }
          //refreshToken did not match
          else {
            console.log("Refresh Token invalid");
            res.locals.permitted = false;
            return;
          };
        });
    }
    else {
      console.log(err);
      return res.status(403).json('User refresh token not found in database');
    };
  });
};

//Middleware to validate accessToken

async function validateToken(req, res, next) {
  checkForAccessToken(req, res);

  //checks for presence of a token
  if (res.locals.permitted == false) return res.status(403).json('Access token not provided');

  //Check access tokens validity
  const accessToken = req.cookies.accessToken;
  const operation = req.body.query.split('{\n')[0].trim().split(' ')[0];
  
  //For every role that is approved for this operation, we test against those secrets
  let authorized = false;
  let shouldBreak = false;
  for (const role of operations[operation]) {
    const secret = process.env[`ACCESS_TOKEN_${role.toUpperCase()}_SECRET`];
    jwt.verify(accessToken, secret, (err, success) => {
      if (success) {
        authorized = true;
        shouldBreak = true;
      };
    });
    if (shouldBreak) break;
  };

  if (authorized) return next();
  else {
    return res.status(403).json('Invalid Permissions');
  };
};

//export
module.exports = { validateToken, loginLink, createSecrets };
