var net = require('net');
var publicIp = require('public-ip');
var dotenv = require('dotenv');
var bridge =require('./lib/bridge/httpServerBridge');
var binaryParser =require('./binaryParser');

dotenv.load();

var remoteServerIp="192.168.1.1";
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
    protocol:{
      protocol:1
    },
    format:{
      header:2,
      protocol:1,
      packetLenght:2,
      serialNumber:2
    },
    protocols:{
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


  var msgFormat= new binaryParser(msgmap.format,data.slice(lastPosition,data.length));

  console.log("header:" + msgFormat.header.toString('hex'));
  console.log("protocol:" + msgFormat.protocol.toString('hex'));
  console.log("packetLenght:" + msgFormat.packetLenght.toString('hex'));
  console.log("serialNumber:" + msgFormat.serialNumber.toString('hex'));
  lastPosition=msgFormat.lastPosition;
  while(lastPosition<data.length){
    var nextProtocol= new binaryParser(msgmap.protocol,data.slice(lastPosition,data.length));
    
    lastPosition=lastPosition+nextProtocol.lastPosition;
    protocol=nextProtocol.protocol.toString('hex');
    switch(protocol){
      case "01":
        //Login data packet
        var loginData= new binaryParser(msgmap.protocols[protocol],data.slice(lastPosition,data.length));
        console.log("loginData.terminalId: " + loginData.terminalId.toString('hex'));
        console.log("loginData.treminalLanguage: " + loginData.treminalLanguage.toString('hex'));
        console.log("loginData.timezone: " + loginData.timezone.toString('hex'));
        lastPosition=lastPosition+loginData.lastPosition;
        break;
      case "02":
        //GPS data packet
        var gpsData= new binaryParser(msgmap.protocols[protocol],data.slice(msgFormat.lastPosition,data.length));
        console.log("gpsData.dateTime: " + gpsData.dateTime.toString('hex'));
        console.log("gpsData.latitude: " + gpsData.latitude.toString('hex'));
        console.log("gpsData.logitude: " + gpsData.logitude).toString('hex');
        lastPosition=lastPosition+gpsData.lastPosition;
        break;
      case "03":
        //HEARTBEAT data packet
        var heartbeatData= new binaryParser(msgmap.protocols[protocol],data.slice(msgFormat.lastPosition,data.length));
        console.log("heartbeatData.status: " + heartbeatData.status.toString('hex'));
        lastPosition=lastPosition+heartbeatData.lastPosition;
        break;
      case "04":
        //ALARM data packet
        var alarmData= new binaryParser(msgmap.protocols[protocol],data.slice(msgFormat.lastPosition,data.length));
        lastPosition=lastPosition+alarmData.lastPosition;
        break;
      case "05":
        //TERMINAL data packet
        var terminalData= new binaryParser(msgmap.protocols[protocol],data.slice(msgFormat.lastPosition,data.length));
        lastPosition=lastPosition+terminalData.lastPosition;
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

  }


})







