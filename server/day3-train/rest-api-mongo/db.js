var mongojs = require('mongojs');

var databaseUrl = 'mongodb://202.139.192.74/tgr2019';
var collections = ['users'];

var option = {
    "auth": {
        "user": process.env.DB_UNAME,
        "password": process.env.DB_PASSWORD
    }
}

var connect = mongojs(databaseUrl, collections, option);

module.exports = {
    connect: connect
};