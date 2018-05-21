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
    header:{header:2},
    format:{
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
      }
    }
  }

  var lastPosition=0;
  var protocol="";
  var packetLenght=data.length;


  while(lastPosition<data.length){
    var msgHeader= new binaryParser(msgmap.header,data.slice(lastPosition,data.length));
    console.log("header:" + msgHeader.header.toString('hex'));
    lastPosition=msgHeader.lastPosition;
  
    while(lastPosition<packetLenght){
      var msgFormat= new binaryParser(msgmap.format,data.slice(lastPosition,data.length));
      var packetLenght=parseInt(msgFormat.packetLenght.toString('hex'),10)
      console.log("protocol:" +  msgFormat.protocol.toString('hex'));
      console.log("packetLenght:" + packetLenght);
      console.log("serialNumber:" + msgFormat.serialNumber.toString('hex'));
    
      lastPosition=lastPosition+msgFormat.lastPosition;
      protocol=msgFormat.protocol.toString('hex');
    
      var msgContent= new binaryParser(msgmap.content[protocol],data.slice(lastPosition,data.length));
    
      switch(protocol){
        case "01":
          //Login data packet
          console.log("loginData.terminalId: " + msgContent.terminalId.toString('hex'));
          console.log("loginData.treminalLanguage: " + msgContent.treminalLanguage.toString('hex'));
          console.log("loginData.timezone: " + msgContent.timezone.toString('hex'));
          
          break;
        case "02":
          //GPS data packet
          console.log("gpsData.dateTime: " + msgContent.dateTime.toString('hex'));
          console.log("gpsData.latitude: " + msgContent.latitude.toString('hex'));
          console.log("gpsData.logitude: " + msgContent.logitude.toString('hex'));
          console.log("gpsData.speed: " + msgContent.speed.toString('hex'));
          console.log("gpsData.course: " + msgContent.course.toString('hex'));
          console.log("gpsData.base: " + msgContent.base.toString('hex'));
          console.log("gpsData.positionStatus: " + msgContent.positionStatus.toString('hex'));
          console.log("gpsData.deviceStatus: " + msgContent.deviceStatus.toString('hex'));
          console.log("gpsData.batteryVolts: " + msgContent.batteryVolts.toString('hex'));
          console.log("gpsData.signalStrenght: " + msgContent.signalStrenght.toString('hex'));
          console.log("gpsData.analogInput1: " + msgContent.analogInput1.toString('hex'));
          console.log("gpsData.analogInput2: " + msgContent.analogInput2.toString('hex'));
          break;
        case "03":
          //HEARTBEAT data packet
          console.log("heartbeatData.status: " + msgContent.status.toString('hex'));
    
          break;
        case "04":
          //ALARM data packet
    
          break;
        case "05":
          //TERMINAL data packet
          break;
        case "06":
          //SMS commands upload data packet
          break;
        case "07":
          //OBD data packet
          break;
        case "09":
          //OBD fault codes data packet
          break;
        case "80":
          //SMS commands/interactive message downlink data packet
          break;
        case "81":
          //Ordinary data packet
          break;
        case "0e":
          //Photo information data packet
          break;
        case "0f":
          //Photo content data packet
          break;
        default:
          lastPosition=data.length;
      }
      console.log("current lastPosition: " + lastPosition);
      console.log("msgContent.lastPosition: " + msgContent.lastPosition);
      lastPosition=lastPosition+msgContent.lastPosition; 
      console.log("lastPosition+msgContent.lastPosition: " + lastPosition);
    }
    lastPosition=lastPosition+1;
  }




})







