// read and validate tokens
require('dotenv').config();

const bcrypt = require('bcrypt');
const express = require('express');
const app = express();

const { Users } =  require('./models')
// const roles = require('../configFiles/operations.config.gl');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//TO DO:
  //Must include a userID in the DB **
  //Refactor looping endpoints to server to more accurately verify the accessToken**
  //Require in bcrypt**
  //Require in User from models**
  //Ensure req.body.user works (are roles included in each request?)

// helper function to get cookie -- move to controller - JWTs stored inside cookie
function getCookie(name, cookieString) {
  const parts = cookieString.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

// helper function that checks for an access token --move to controller
function checkForAccessToken(req, res) {
  //Access cookies
  const cookies = `; ${document.cookie}`;
  const accessToken = getCookie(accessToken, cookies);
  const refreshToken = getCookie(refreshToken, cookies);
  console.log('Access Token:', accessToken);
  console.log('Refresh Token', refreshToken);

  //if there is already an accessToken, execute operations
  if (accessToken !== null) {
    res.locals.permitted = true
    res.locals.accessToken = accessToken
    return
  }

  //If there is no refreshToken, then they will not be permitted
  if (refreshToken === null) {
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
          const secret = `process.env.ACCESS_TOKEN_${userRole.toUpperCase()}_SECRET`
          accessToken = jwt.sign(userRole, secret, {expiresIn: '15m'})
          res.locals.accessToken = accessToken
          //give user new refreshToken
          const newRefreshToken = jwt.sign(userRole, process.env.REFRESH_TOKEN_SECRET)
          //update the refreshToken in DB
          User.findOneAndUpdate( { username: req.body.user }, (err, user) => {
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

// NOT USING THIS CODE (CLEAN UP)
// //for each operation, create an endpoint
// for (const operation in roles) {
//     app.use(`/${operation}`, checkForAccessToken, (req, res) => {
//       if (res.locals.permitted == false) return res.sendStatus(401)
      
//       //for each role associated with the operation, check the accessToken with that secret
//       accessToken = res.locals.accessToken
//       for (const role in roles[operation]) {
//         //Do we store the secrets in a database, or in process.env?
//         const secret = `process.env.ACCESS_TOKEN_${role.toUpperCase()}_SECRET`;
//         jwt.verify(accessToken, secret, (err, found) => {
//           if (found) return res.json(true);
//         })
//       }
//       return res.sendStatus(401);
//   });
// };

//MIDDLWARE TO READ AND VALIDATE COOKIE
// check for the presence of access token and checks validity
function validateToken (req, res, next) {
  checkForAccessToken(req, res) ;
  //checks for presence of a token
  if (res.locals.permitted == false) return res.sendStatus(401);
  //if valid return next()
  //if not valid return status401
  const { role, accessToken } = res.locals;
  jwt.verify(accessToken, `process.env.ACCESS_TOKEN_${role.toUpperCase()}_SECRET`, (err, found) => {
    if (err) {
      console.log(err);
      return res.status(401).send('Error occurred in validateToken');
    }
    return next();
  });
}



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
