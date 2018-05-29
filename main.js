var net = require('net');
var publicIp = require('public-ip');
var dotenv = require('dotenv');
var bridge =require('./lib/bridge/httpServerBridge');
var eelinkParser =require('./lib/protocols/parserEelink');
var konkerConn =require('./konker/konkerConn');


dotenv.load();

var remoteServerIp = process.env.REMOTE_SERVER_IP;
var remoteServerPort = process.env.REMOTE_SERVER_PORT;
var bridgePort = process.env.BRIDGE_PORT;
var mqttURL = process.env.CLOUDAMQP_MQTT_URL
var deviceUserName = process.env.KONKER_API_KEY;
var devicePassword = process.env.KONKER_API_PASS;
console.log("Bridge parameters passed->");
console.log("remoteServerIp: " + remoteServerIp);
console.log("remoteServerPort: " + remoteServerPort);
console.log("mqttURL: " + mqttURL);
console.log("deviceUserName: " + deviceUserName);
console.log("devicePassword: " + devicePassword);
/*
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
*/
/////////////////
var bridgeServer = new bridge(remoteServerIp,remoteServerPort,bridgePort,true);
var konker = new konkerConn(mqttURL, deviceUserName, devicePassword);


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
    if(jsonValues.time!=undefined){jsonToTransmit._ts = parseInt("0x" + jsonValues.time)*1000;}
    if(jsonValues.latitude!=undefined){jsonToTransmit._lat = signedHexStrToInt(jsonValues.latitude)/1800000;}
    if(jsonValues.longitude!=undefined){jsonToTransmit._lon = signedHexStrToInt(jsonValues.longitude)/1800000;}
    if(jsonValues.altitude!=undefined){jsonToTransmit.altitude = parseInt(jsonValues.altitude, 16);}
    if(jsonValues.speed!=undefined){jsonToTransmit.speed = parseInt(jsonValues.speed, 16);}
    if(jsonValues.course!=undefined){jsonToTransmit.course = parseInt(jsonValues.course, 16);}
    if(jsonValues.satellites!=undefined){jsonToTransmit.satellites = parseInt(jsonValues.satellites);}
    if(jsonValues.battery!=undefined){jsonToTransmit.battery = parseInt(jsonValues.battery, 16)/1000;}
        if(jsonValues.ain0!=undefined){jsonToTransmit.ain0 = parseInt(jsonValues.ain0, 16);}
    if(jsonValues.ain1!=undefined){jsonToTransmit.ain1 = parseInt(jsonValues.ain1, 16);}

    if(jsonValues.status!=undefined){
      var mask="00000000" + parseInt("0x" + jsonValues.status.toString('hex'),16).toString(2);
      function maskBit(b){
          return mask.charAt(mask.length-(1+b))==1;
      }
  
      status={
        gpsfixed:maskBit(0),
        cardsgnd:maskBit(1),
        //Bit 2 originaly used to detect engine on/off
        //enginfired:maskBit(2),
        //Bit 2 heare instead is used with door sensor to detect closed/open door
        door:maskBit(2),
        accelersup:maskBit(3),
        motionwarn:maskBit(4),
        rlycontrol:maskBit(5),
        rlytrigg:maskBit(6),
        extchrsup:maskBit(7),
        charging:maskBit(8),
        active:maskBit(9),
        gpsrunning:maskBit(10),
        obdrunning:maskBit(11),
        din0:maskBit(12),
        din1:maskBit(13),
        din2:maskBit(14),
        din3:maskBit(15)
      }
      jsonToTransmit.status=status;
    }
  


    //NOT DOCUMENTED IN PROTOCOL
    //temperature originaly documented as
        //if(jsonValues.temperature!=undefined){jsonToTransmit.temperature = parseInt(jsonValues.temperature, 16)/256;}
    if(jsonValues.tempnodoc!=undefined){jsonToTransmit.temperature = parseInt(jsonValues.tempnodoc, 16)/16;}
    konker.publishToKonker(jsonToTransmit,"data")
  }

});







