var net = require('net');
var publicIp = require('public-ip');
"use strict";


//DEFINITIONS
//TARGUET -> DEVICE THAT WILL BE CONNECTING TO THIS BRIDGE
//REMOTE SERVER -> THE RMOTE SERVER THAT THIS BRIDGE WILL RELLAY ALL MESSAGES FROM AND TO

class bridge {
  
  constructor(remoteServerIp, remoteServerPort, bridgePort) {
    this._remoteServerIp=remoteServerIp;
    this._remoteServerPort=remoteServerPort;
    this._bridgePort=bridgePort;


    
  }


  start(){
    var bridgePort= this._bridgePort;
    var remoteServerIp= this._remoteServerIp;
    var remoteServerPort= this._remoteServerPort;
    var onRemoteConnected=this.onRemoteConnected; 
    var onRemoteData=this.onRemoteData; 
    var onConnectionClose=this.onConnectionClose; 
    var onTarguetData=this.onTarguetData; 
    var onDisconnection=this.onDisconnection; 


    this._bridgeServer = net.createServer(function(targuetClient) { 
      var serverClient = new net.Socket();
      //connection to REMOTE SERVER
      serverClient.connect(remoteServerPort, remoteServerIp, function() {
        console.log('Connected to server ' + remoteServerIp);
        onRemoteConnected();
      });
     
      //ON REMOTE SERVER Sendig data to TARGUET
      serverClient.on('data', function(data) {
        console.log("FROM "+ remoteServerIp + '->targuet: ' + data);
        targuetClient.write(data.toString());
        onRemoteData();
      });
      
      //ON CONNECTION CLOSED
      serverClient.on('close', function() {
        console.log('Connection closed');
        onConnectionClose();
      });
      
      //TARGUET sendig data to REMOTE SERVER
      targuetClient.on('data', function(data) {
        console.log('FROM targuet->' + remoteServerIp + ': ' + data);
        serverClient.write(data.toString());
        onTarguetData();
      });
    
      //DISCONNECTION
      targuetClient.on('end', function() {
        console.log('Server disconnected');
        onDisconnection();
      });
    
    });


    //start listening bridge
    this._bridgeServer.listen(bridgePort, function() { 
      console.log(' Bridge ready!');
      publicIp.v4().then(ip => {
        console.log(' Bridge public ip: ' + ip);
        console.log(' port: ' + bridgePort);
        console.log('');
      });
    });


  }

  onRemoteConnected(callback){callback}
  onRemoteData(callback){callback}
  onTarguetData(callback){callback}
  onConnectionClose(callback){callback}
  onDisconnection(callback){callback}


}


var command="";
if (process.argv.length>2 ) command=process.argv[2];

if (command=="--params"){
  if (process.argv.length!=6 ) return;
  var remoteServer=process.argv[3];
  var remoteServerPort=process.argv[4];
  var bridgeport=process.argv[5];
  console.log("Parameters passed-> remoteServer: " + remoteServer + ", remoteServerPort: " + remoteServerPort + ", bridgeport: " +bridgeport);
  var myServer= new bridge(remoteServer,remoteServerPort,bridgeport);
  myServer.start();
}


