var net = require('net');
var publicIp = require('public-ip');
var dotenv = require('dotenv');
var bridge =require('../bridge/httpServerBridge');

dotenv.load();


var remoteServerIp = '34.196.183.170';
var remoteServerPort=7210;

var bridgePort= 7211;


/////////////////


var bridgeServer = new bridge(remoteServerIp,remoteServerPort,bridgePort,true);

bridgeServer.start();

////
bridgeServer.onRemoteConnected((gpsDevice,remoteServer)=>{

  //when data arrives from GPS
  bridgeServer.onTarguetData((data)=>{

  })

  //when data arrives from remote server
  bridgeServer.onRemoteData((data)=>{

  })

})






