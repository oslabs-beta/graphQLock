// read and validate tokens
require('dotenv').config();
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Users } = require('./models');
const { loginLink } = require('./loginLink');
const { createSecrets } = require('./createSecrets');
const operations = require(path.resolve(__dirname, '../../graphqlock.json'));

async function checkForAccessToken(req, res) {
  //Access cookies

  //if there is an accessToken presented, continue with the validation
  if (req.cookies.accessToken !== undefined) {
    res.locals.permitted = true;
    res.locals.accessToken = req.cookies.accessToken;
    return;
  }

  //if there is no refreshToken, then they will not be permitted
  if (req.cookies.refreshToken === undefined) {
    res.locals.permitted = false;
    return;
  };
  
  //Check for the refreshToken in the DB
  //if hashed refresh token matched users token, give new accessToken and refreshToken, delete old refresh token
  //if tokens dont match, return 403 status
  const userObj = jwt.decode(req.cookies.refreshToken);

  await Users.find({ username: userObj.user }).exec()
    .then(user => {
      //found user on database and check if refreshToken is valid
      const result = bcrypt.compareSync(req.cookies.refreshToken, user[0].refreshToken);
      if (result) {
        //give user a new accessToken
        const secret = process.env[`ACCESS_TOKEN_${userObj.role.toUpperCase()}_SECRET`];
        const newAccessToken = jwt.sign({role: userObj.role}, secret, {expiresIn: '15m'});
        //give user new refreshToken
        const newRefreshToken = jwt.sign({user: userObj.user, role: userObj.role}, process.env.REFRESH_TOKEN_SECRET);
        const hashedToken = bcrypt.hashSync(newRefreshToken, 10);
        //update the refreshToken in DB
        Users.findOneAndUpdate({ username: userObj.user }, { refreshToken: hashedToken});
        
        //allow continuation to validation
        res.locals.permitted = true;
        
        //sets cookies to be sent back to client
        res.locals.accessToken = newAccessToken
        res.cookie('accessToken', newAccessToken, { maxAge: 15 * 60 * 1000, httpOnly: true, secure: true });
        res.cookie('refreshToken', newRefreshToken, { httpOnly: true, secure: true });
        return;
      }
      //submitted refreshToken does not match with database refreshToken
      else {
        console.log("Refresh Token invalid");
        res.locals.permitted = false;
        return;
      };
    })
    .catch (err => {
      console.log('checkForAccessToken function: User.find or bcrypt error: ', err);
      return res.status(403).json('User refresh token not found or does not match');
    })
};

//Middleware to validate accessToken

async function validateToken(req, res, next) {
  //checks for presence of a token
  await checkForAccessToken(req, res);
  if (res.locals.permitted === false) return res.status(401).json('Inappropriate Access or Refresh Token');

  //checks access token validity
  const accessToken = res.locals.accessToken;
  const userObj = jwt.decode(accessToken);
  const operation = req.body.query.split('{\n')[0].trim().split(' ')[0];
  const field = req.body.query.split('{\n')[1].trim().split(' ')[0];

  let authorized = false;

  jwt.verify(accessToken, process.env[`ACCESS_TOKEN_${userObj.role.toUpperCase()}_SECRET`], { algorithms: ['RS256'] }, (err, success) => {
    if (success) {
      if (!(operation in operations[success.role])) return;
      if (operations[success.role][operation].includes(field) || operations[success.role][operation].includes('.')) authorized = true;
    };
  });

  if (authorized) return next();
  else {
    console.log('validateToken function: Failed Authorization. No Permission.');
    return res.status(403).json('Invalid Permissions');
  };
};

//export
module.exports = { validateToken, loginLink, createSecrets };
