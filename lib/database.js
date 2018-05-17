var config = require('./../config');
var path = require('path');
var deviceCounterSequenceName = 'deviceCounters';
var deviceIDName = 'deviceID';

if (config.mongo && config.mongo.databaseUrl) {

  var mongojs = require('mongojs');
  var db = mongojs(config.mongo.databaseUrl);
  var db = fakemongojs(config.mongo.databaseUrl);

    module.exports = {
        //deviceIDName: deviceIDName,
        //devices: db.collection('devices'),
        //events: db.collection('events'),
        //data: db.collection('data'),
        usersCredentials: db.collection('usersCredentials')
    }
}else if (config.mongo.mongoenv){
    module.exports = {
        usersCredentials: config.mongo.mongoenv
    }
    
}