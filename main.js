// read and validate tokens
require('dotenv').config();
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const { Users } =  require('./models');
const { loginLink } = require('./loginLink');
const { createSecrets } = require('./createSecrets');

// const roles = require('../configFiles/operations.config.gl');

//TO DO:
  //Ensure res.locals.role works (are roles included in each request?) Determined that we will stick with the res.locals.role for now.

// helper function that checks for an access token --move to controller
function checkForAccessToken(req, res) {
  //Access cookies

  //if there is already an accessToken, execute operations
  if (req.cookies.accessToken !== null) {
    res.locals.permitted = true
    res.locals.accessToken = req.cookies.accessToken
    return
  }

  //If there is no refreshToken, then they will not be permitted
  if (req.cookies.refreshToken === null) {
    res.locals.permitted = false
    return
  }

  //Check for the refreshToken in the DB
  //if hashed refresh token matched users token, give new accessToken and refreshToken, delete old refresh token
  //if tokens dont match, return next

  //A WAY TO CONSISTENTLY ACQUIRE THE ROLE
  const userRole = res.locals.role

  Users.find( { username: req.body.user }, (err, user) => {
    if (!err) {
      bcrypt.compare(refreshToken, user.refreshToken)
        .then(res => {
          if (res === true) {
            //give user a new accessToken
            const secret = eval(`process.env.ACCESS_TOKEN_${userRole.toUpperCase()}_SECRET`)
            const accessToken = jwt.sign(userRole, secret, {expiresIn: '15m'})
            res.locals.accessToken = accessToken
            //give user new refreshToken
            const newRefreshToken = jwt.sign(userRole, process.env.REFRESH_TOKEN_SECRET)
            //update the refreshToken in DB
            Users.findOneAndUpdate( { username: req.body.user }, (err, user) => {
              if (!err) {
              user.refreshToken = newRefreshToken
            } else {
              return res.status(404).send('Error occured in checkAccessTokens');
            }
            })
            res.locals.permitted = true
            return 
          }
          //refreshToken did not match
          else {
            res.locals.permitted = false
            return 
          }
        })
    }
    else {
      console.log(err)
      return res.status(404).send('Error occurred in checkAccessTokens')
    }
  })
}

//Middleware to validate accessToken

// check for the presence of access token and checks validity
function validateToken (req, res, next) {
  checkForAccessToken(req, res) ;
  //checks for presence of a token
  if (res.locals.permitted == false) return res.sendStatus(401);
  //if valid return next()
  //if not valid return status401
  const { role, accessToken } = res.locals;
  const secret = eval(`process.env.ACCESS_TOKEN_${role.toUpperCase()}_SECRET`)
  jwt.verify(accessToken, secret, (err, found) => {
    if (err) {
      console.log(err);
      return res.status(401).send('Error occurred in validateToken');
    } else {
      if (found === undefined) {
        console.log('Access Token Invlaid');
        return res.status(401).send('Access Token Invalid')
      }
      
      return next();
    }
  });
}


//global error handling
// app.use((err, req, res, next) => {
//   const defaultError = {
//     log: 'Express error handler caught unknown middleware error',
//     status: 500,
//     message: { error: 'Caught Unknown Error'}
//   }
//   const errObj = {...defaultError, ...err};
//   console.log(errObj.log);
//   return res.status(errObj.status).json(errObj.message);
// });

//export
module.exports = { validateToken, loginLink, createSecrets };
