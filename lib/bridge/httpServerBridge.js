var net = require('net');
var publicIp = require('public-ip');
"use strict";


//DEFINITIONS
//TARGUET -> DEVICE THAT WILL BE CONNECTING TO THIS BRIDGE
//REMOTE SERVER -> THE RMOTE SERVER THAT THIS BRIDGE WILL RELLAY ALL MESSAGES FROM AND TO

var bridgeClass = class bridge {
  
  constructor(remoteServerIp, remoteServerPort, bridgePort,verbose=false) {
    this.remoteServerIp=remoteServerIp;
    this.remoteServerPort=remoteServerPort;
    this.bridgePort=bridgePort;
    this.verbose=verbose;
    this.connected=false;

  }

  

  start(){
    var bridgePort= this.bridgePort;
    var remoteServerIp= this.remoteServerIp;
    var remoteServerPort= this.remoteServerPort;
    var onRemoteConnected=this.onRemoteConnected; 
    var onRemoteData=this.onRemoteData; 
    var onConnectionClose=this.onConnectionClose; 
    var onTarguetData=this.onTarguetData; 
    var onDisconnection=this.onDisconnection; 
    var verbose=this.verbose;
    var connected=this.connected;


    this.server = net.createServer(function(_targuetClient) { 
      var serverClient = new net.Socket();
      //connection to REMOTE SERVER
      serverClient.connect(remoteServerPort, remoteServerIp, function() {
        if(verbose) console.log('Connected to server ' + remoteServerIp);
        connected=true;
        onRemoteConnected(_targuetClient, serverClient);
      });
     
      //ON REMOTE SERVER Sendig data to TARGUET
      serverClient.on('data', function(data) {
        if(verbose) console.log("FROM "+ remoteServerIp + '->targuet: ' + data.toString('hex'));
        _targuetClient.write(data.toString());
        onRemoteData(data);
      });
      
      //ON CONNECTION CLOSED
      serverClient.on('close', function() {
        if(verbose) console.log('Connection closed');
        connected=false;
        onConnectionClose();
      });
      
      //TARGUET sendig data to REMOTE SERVER
      _targuetClient.on('data', function(data) {
        if(verbose) console.log('FROM targuet->' + remoteServerIp + ': ' + data.toString('hex'));
        serverClient.write(data.toString());
        onTarguetData(data);
      });
    
      //DISCONNECTION
      _targuetClient.on('end', function() {
        if(verbose) console.log('Server disconnected');
        connected=false;
        onDisconnection();
      });
    
    });


    //start listening bridge
    this.server.listen(bridgePort, function() { 
      if(verbose){
        console.log(' Bridge ready!');
        publicIp.v4().then(ip => {
          console.log(' Bridge public ip: ' + ip);
          console.log(' port: ' + bridgePort);
          console.log('');
        });
      }
    });
  }


  onRemoteConnected(callback){callback}
  onRemoteData(callback){callback}
  onTarguetData(callback){callback}
  onConnectionClose(callback){callback}
  onDisconnection(callback){callback}


}

//PARAMETERS
var command="";
if (process.argv.length>2 ) command=process.argv[2];
if (command=="-params"){
  if (process.argv.length!=6 ) return;
  var remoteServer=process.argv[3];
  var remoteServerPort=process.argv[4];
  var bridgeport=process.argv[5];
  console.log("Parameters passed-> remoteServer: " + remoteServer + ", remoteServerPort: " + remoteServerPort + ", bridgeport: " +bridgeport);
  var myServer= new bridgeClass(remoteServer,remoteServerPort,bridgeport,true);
  myServer.start();
  
}


module.exports = bridgeClass;


