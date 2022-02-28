require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.mongoURI, {
// mongoose.connect('https://data.mongodb-api.com/app/data-zcptj/endpoint/data/beta', {
    // options for the connect method to parse the URI
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // sets the name of the DB that our collections are part of
    dbName: 'graphQLOCK-refreshTokens'
  })
    .then(() => console.log('Connected to Mongo DB.'))
    .catch(err => console.log(err));

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: String,
  refreshToken: String,
});

const Users = mongoose.model('users', userSchema);

module.exports = { Users };
