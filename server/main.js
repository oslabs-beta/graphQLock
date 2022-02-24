//imports
// const path = require('path');
const app = express();
const express = require('express');
require('dotenv').config();
const bcrypt = require('bcrypt');
// const roles = require('../configFiles/operations.config.gl');
const { User } =  require('./models')
// const controller = require('./controller');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//TO DO:
  //Must include a userID in the DB **
  //Refactor looping endpoints to server to more accurately verify the accessToken**
  //Require in bcrypt**
  //Require in User from models**
  //Ensure req.body.user works (are roles included in each request?)

function checkForAccessToken(req, res, next) {
  //Must send accessToken under authorization header as a Bearer token
  const authHeader = req.headers['authorization']
  const accessToken = authHeader && authHeader.split(' ')[1]
  //if there is already an accessToken execute operations
  if (accessToken !== null) {
    res.locals.permitted = true
    res.locals.token = accessToken
    return next()
  }

  //Must send refreshToken under authorizationRefresh header as a Bearer token
  const refreshHeader = req.headers['authorizationRefresh']
  const refreshToken = refreshHeader && refreshHeader.split(' ')[1]
  //If there is no refreshToken, then they will not be permitted
  if (refreshToken === null) {
    res.locals.permitted = false
    return next()
  }
  //Check for the refreshToken in the DB
  //if hashed refresh token matched users token, give new accessToken and refreshToken, delete old refresh token
  //if tokens dont match, return next

  //A WAY TO CONSISTENTLY ACQUIRE THE ROLE
  const userRole = {role: req.body.role}
  User.find( { username: req.body.user }, (err, user) => {
    if (!err) {
      bcrypt.compare(refreshToken, user.refreshToken)
        .then(res => {
          if (res === true) {
            //give user a new accessToken
            const secret = `process.env.ACCESS_TOKEN_${role.toUpperCase()}_SECRET`
            accessToken = jwt.sign(userRole, secret, {expiresIn: '15m'})
            res.locals.accessToken = accessToken
            //give user new refreshToken
            const newRefreshToken = jwt.sign(userRole, process.env.REFRESH_TOKEN_SECRET)
            //update the refreshToken
            User.findOneAndUpdate( { username: req.body.user }, (err, user) => {
              if (!err) {
                user.refreshToken = newRefreshToken
              } else {
                return res.status(404).send('Error Occured in checkAccessTokens')
              }
            })
            res.locals.permitted = true
            return next()
          }
          //refreshToken did not match
          else {
            res.locals.permitted = false
            return next()
          }
        })
    }
    else {
      console.log(err)
      return res.status(404).send('Error Occurred in checkAccessTokens')
    }
  })
}

//for each operation, create an endpoint
for (const operation in roles) {
    app.use(`/${operation}`, checkForAccessToken, (req, res) => {
      if (res.locals.permitted == false) return res.sendStatus(401)
      
      //for each role associated with the operation, check the accessToken with that secret
      accessToken = res.locals.accessToken
      for (const role in roles[operation]) {
        //Do we store the secrets in a database, or in process.env?
        const secret = `process.env.ACCESS_TOKEN_${role.toUpperCase()}_SECRET`;
        jwt.verify(accessToken, secret, (err, found) => {
          if (found) return res.json(true);
        })
      }
      return res.sendStatus(401);
  });
};

//global error handling
app.use((err, req, res, next) => {
  const defaultError = {
    log: 'Express error handler caught unknown middleware error',
    status: 500,
    message: { error: 'Caught Unknown Error'}
  }
  const errObj = {...defaultError, ...err};
  console.log(errObj.log);
  return res.status(errObj.status).json(errObj.message);
});

app.listen(3000, () => console.log('Server listening on port: 3000'));

//export
module.exports = app;
