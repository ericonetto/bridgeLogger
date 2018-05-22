var net = require('net');
var publicIp = require('public-ip');
var dotenv = require('dotenv');
var bridge =require('./lib/bridge/httpServerBridge');
var binaryParser =require('./binaryParser');

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

bridgeServer.start();


bridgeServer.on("targuetData",(data)=>{

  var msgmap={
    format:{
      header:2,
      protocol:1,
      packetLenght:2,
      serialNumber:2
    },
    content:{
      "01":{
        terminalId:8,
        treminalLanguage:1,
        timezone:1,
      },
      "02":{
        dateTime:4,
        latitude:4,
        logitude:4,
        speed:1,
        course:2,
        base:9,
        positionStatus:1,
        deviceStatus:2,
        batteryVolts:2,
        signalStrenght:2,
        analogInput1:2,
        analogInput2:2
      },
      "03":{
        status:2
      },
      "04":{
        dateTime:4,
        latitude:4,
        longitude:4,
        speed:1,
        course:2,
        baseStation:9,
        positionStatus:1,
        alarmType:1
      },
      "05":{
        dateTime:4,
        latitude:4,
        longitude:4,
        speed:1,
        course:2,
        baseStation:9,
        positionStatus:1,
        statusType:1,
      },
      "12":{
        battery:2,
        adc:4,
        odometer:4,
        gspGsmCounter:4,
        steps:4,
        sensor:12
      }
    }
  }

  var lastPosition=0;
  while(lastPosition<data.length){
    var msgFormat= new binaryParser(msgmap.format,data.slice(lastPosition,data.length));

    var packetLenght=parseInt(msgFormat.packetLenght.toString('hex'),16);
    console.log("header:" + msgFormat.header.toString('hex'));
    console.log("protocol:" +  msgFormat.protocol.toString('hex'));
    console.log("packetLenght:" + packetLenght);
    console.log("serialNumber:" + msgFormat.serialNumber.toString('hex'));
  
    var formatLastPosition=msgFormat.lastPosition;
    var protocol=msgFormat.protocol.toString('hex');
  
    var protocolMap=msgmap.content[protocol];
    
    
    if(protocolMap!=undefined){
      var msgContent= new binaryParser(protocolMap,data.slice(formatLastPosition,data.length));
  
      for (var key in protocolMap) {
        console.log(protocol +"-" + key + ": " + msgContent[key].toString('hex'));
      }
    }else{
      lastPosition=data.length;
    }


    lastPosition=lastPosition+packetLenght+(formatLastPosition-msgmap.format.serialNumber);
    console.log("");
  }




})







