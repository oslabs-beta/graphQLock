require('dotenv').config();
const mongoose = require('mongoose');

// mongoose.connect(process.env.mongoURI, {
mongoose.connect('mongodb://Phoenix:graphqlockteam@graphqlock-refreshtoken-shard-00-00.p3mv1.mongodb.net:27017,graphqlock-refreshtoken-shard-00-01.p3mv1.mongodb.net:27017,graphqlock-refreshtoken-shard-00-02.p3mv1.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-ujt427-shard-0&authSource=admin&retryWrites=true&w=majority', {
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
