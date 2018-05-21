var net = require('net');
var publicIp = require('public-ip');
var dotenv = require('dotenv');
var bridge =require('./bridge/httpServerBridge');

dotenv.load();


var remoteServer = 'notset';
var remoteServerPort=0;
var bridgePort= 0;
//PARAMETERS
var command="";
if (process.argv.length>2 ) command=process.argv[2];
if (command=="-params"){
  if (process.argv.length!=6 ) return;
  remoteServer=process.argv[3];
  remoteServerPort=process.argv[4];
  bridgeport=process.argv[5];
  console.log("Parameters passed-> remoteServer: " + remoteServer + ", remoteServerPort: " + remoteServerPort + ", bridgeport: " +bridgeport);
  process.argv=[];
  
}


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






