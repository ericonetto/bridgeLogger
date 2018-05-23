var net = require('net');
var publicIp = require('public-ip');
var dotenv = require('dotenv');
var bridge =require('./lib/bridge/httpServerBridge');
var eelinkParser =require('./parserEelink');
var konkerConn =require('./konker/konkerConn');


dotenv.load();

var remoteServerIp="177.168.1.1";
var remoteServerPort=30000;
var bridgePort=30001;

//PARAMETERS
var command="";
if (process.argv.length>2 ) command=process.argv[2];
if (command=="-parse"){
  if (process.argv.length!=6 ) return;
  remoteServerIp=process.argv[3];
  remoteServerPort=process.argv[4];
  bridgePort=process.argv[5];
  console.log("Parameters passed-> remoteServer: " + remoteServerIp + ", remoteServerPort: " + remoteServerPort + ", bridgeport: " +bridgePort);

  process.argv=[];
  
}

/////////////////
var bridgeServer = new bridge(remoteServerIp,remoteServerPort,bridgePort,true);
var konker = new konkerConn("mqtt://mqtt.demo.konkerlabs.net:1883","8r29lu88tme4","3DFB98IJyA84");


konker.start();

konker.on("subcribed",()=>{
    bridgeServer.start();
});

function signedHexStrToInt(hexString){
  if(hexString[0]=="f"){
      return -(~parseInt(hexString, 16)+1);
  }else{
      return parseInt(hexString, 16)
  }
}


bridgeServer.on("targuetData",(data)=>{
  var jsonValues = eelinkParser(data);
  var jsonToTransmit = {}
  if(jsonValues.pid=="12"){
    jsonToTransmit._ts = parseInt("0x" + jsonValues.time);
    jsonToTransmit._lat = signedHexStrToInt(jsonValues.latitude)/1800000;
    jsonToTransmit._lon = signedHexStrToInt(jsonValues.longitude)/1800000;
    jsonToTransmit.altitude = parseInt(jsonValues.altitude, 16);
    jsonToTransmit.speed = parseInt(jsonValues.speed, 16);
    jsonToTransmit.course = parseInt(jsonValues.course, 16);
    jsonToTransmit.satellites = parseInt(jsonValues.satellites);
    jsonToTransmit.battery = parseInt(jsonValues.battery, 16)/1000;
    jsonToTransmit.temperature = parseInt(jsonValues.temperature, 16)/256;
  
    konker.publishToKonker(jsonToTransmit,"data")
  }

});







