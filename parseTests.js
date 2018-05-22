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
      mark:2,
      pid:1,
      size:2,
      sequence:2
    },
    content:{
      "01":{
        imei:8,
        language:1,
        timezone:1,
        sysver:2,
        appver:2,
        psver:2,
        psosize:2,
        pscsize:2,
        pssum16:2
      },
      "03":{
        status:2
      },
      "12":{
        location:{
          format:{
            time:4,
            mask:1
          },
          masks:{
            bit0:{
              latitude:4,
              longitude:4,
              altitude: 2,
              speed: 2,
              course: 2,
              satellites: 1
            }
          }
        },
        status:2,
        battery:2,
        ain0:2,
        ain1:2,
        mileage:4,
        gsmcntr:2,
        gpscntr:2,
        pdmstep:2,
        pdmtime:2,
        temperature:2,
        humidity:2,
        illuminance:4,
        co2:4
      }
    }
  }

  var lastPosition=0;
  while(lastPosition<data.length){
    var msgFormat= new binaryParser(msgmap.format,data.slice(lastPosition,data.length));

    var packetSize=parseInt(msgFormat.size.toString('hex'),16);
    console.log("mark:" + msgFormat.mark.toString('hex'));
    console.log("pid:" +  msgFormat.pid.toString('hex'));
    console.log("size:" + packetSize);
    console.log("sequence:" + msgFormat.sequence.toString('hex'));
  
    var formatLastPosition=msgFormat.lastPosition;
    var pid=msgFormat.pid.toString('hex');
  
    var pidMap=msgmap.content[pid];
    
    
    if(pidMap!=undefined && pid!="12"){
      var msgContent= new binaryParser(pidMap,data.slice(formatLastPosition,data.length));
  
      for (var key in pidMap) {
        console.log(pid +"-" + key + ": " + msgContent[key].toString('hex'));
      }
    }else if(pid=="12"){
      var locationFormatMap=msgmap.content["12"].location.format;
      var locationHead= new binaryParser(locationFormatMap,data.slice(formatLastPosition,data.length));
      console.log("locationHead.time:" +  locationHead.time.toString('hex'));
      console.log("locationHead.mask:" +  locationHead.mask.toString('hex'));

      if(locationHead.mask % 2 == 1){
        console.log("location data");
        var locationDataMap=msgmap.content["12"].location.masks.bit0;
        var locationData= new binaryParser(locationDataMap, data.slice(locationHead.lastPosition,data.length));
        console.log("locationData.latitude:" +  locationData.latitude.toString('hex'));
        console.log("locationData.longitude:" +  locationData.longitude.toString('hex'));
        console.log("locationData.altitude:" +  locationData.altitude.toString('hex'));
        console.log("locationData.speed:" +  locationData.speed.toString('hex'));
        console.log("locationData.course:" +  locationData.course.toString('hex'));
        console.log("locationData.satellites:" +  locationData.satellites.toString('hex'));
      }


    }else{
      lastPosition=data.length;
    }


    lastPosition=lastPosition+packetSize+(formatLastPosition-msgmap.format.sequence);
    console.log("");
  }




})







