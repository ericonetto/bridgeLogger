var net = require('net');
var publicIp = require('public-ip');
"use strict";
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


    this._bridgeServer = net.createServer(function(trackerClient) { 
      var serverClient = new net.Socket();
      //connection to REMOTE SERVER
      this.serverClient.connect(remoteServerPort, remoteServerIp, function() {
        console.log('Connected to server ' + remoteServerIp);
        this.onRemoteConnected();
      });
     
      //ON REMOTE SERVER Sendig data to TARGUET
      serverClient.on('data', function(data) {
        console.log(remoteServerIp + '->tracker: ' + data);
        trackerClient.write(data.toString());
        this.onRemoteData();
      });
      
      //ON CONNECTION CLOSED
      serverClient.on('close', function() {
        console.log('Connection closed');
        this.onConnectionClose();
      });
      
      //TARGUET sendig data to REMOTE SERVER
      trackerClient.on('data', function(data) {
        console.log('tracker->' + remoteServerIp + ': ' + data);
        serverClient.write(data.toString());
        this.onTarguetData();
      });
    
      //DISCONNECTION
      trackerClient.on('end', function() {
        console.log('Server disconnected');
        this.onDisconnection();
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


