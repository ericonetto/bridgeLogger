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
    mark:2,
    pid:1,
    size:2,
    sequence:2,
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
          time:4,
          mask:1,
          masks:{
            bit0:{
              latitude:4,
              longitude:4,
              altitude: 2,
              speed: 2,
              course: 2,
              satellites: 1
            },
            bit1:{
              mcc:2,
              mnc:2,
              lac: 2,
              cid: 4,
              rxlev: 1
            },
            bit2:{
              lac: 2,
              cid: 4,
              rxlev: 1
            },
            bit4:{
              lac: 2,
              cid: 4
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


  //test
  //data=new Buffer("676712004300265b049d7403fd788323fafda8e50309000000000002d4000355fb00000eb43a007b16d505dd000000000000758e758802c40199000000000000000000000000011a",'hex');
  

  var startPosition=0;
  while(startPosition<data.length){
    var msgFormat= new binaryParser(msgmap,data,startPosition);

    var packetSize=parseInt(msgFormat.size.toString('hex'),16);
    console.log("mark: " + msgFormat.mark.toString('hex'));
    console.log("pid: " +  msgFormat.pid.toString('hex'));
    console.log("size: " + packetSize);
    console.log("sequence: " + msgFormat.sequence.toString('hex'));
  
    var pid=msgFormat.pid.toString('hex');
    var pidMap=msgmap.content[pid];
   
    
    if(pidMap!=undefined && pid!="12"){
      var msgContent= new binaryParser(pidMap,data,msgFormat.lastPosition);
  
      for (var key in pidMap) {
        if(Object.keys(msgContent[key]).length==0){
          console.log(pid +"-" + key + ": " + msgContent[key].toString('hex'));
        }
      }
    }else if(pid=="12"){
      var locationFormatMap=msgmap.content["12"].location;
      var locationHead= new binaryParser(locationFormatMap,data, msgFormat.lastPosition);
      console.log("locationHead.time: " +  locationHead.time.toString('hex'));
      console.log("locationHead.mask: " +  locationHead.mask.toString('hex'));

      var mask=(parseInt(locationHead.mask[0], 16)).toString(2);
      if(mask[0]=="1"){
        var locationDataMap=msgmap.content["12"].location.masks.bit0;
        var locationData= new binaryParser(locationDataMap, data,locationHead.lastPosition);
        for (var key in locationDataMap) {
          if(locationData[key]!=undefined){
            console.log("locationData." + key + ": " + locationData[key].toString('hex'));
          }
        }
      }
      if(mask[1]=="1"){
        var locationDataMap=msgmap.content["12"].location.masks.bit1;
        var locationData= new binaryParser(locationDataMap, data,locationData.lastPosition);
        for (var key in locationDataMap) {
          if(locationData[key]!=undefined){
            console.log("locationData." + key + ": " + locationData[key].toString('hex'));
          }
        }
      }
      if(mask[2]=="1" || mask[3]=="1"){
        var locationDataMap=msgmap.content["12"].location.masks.bit2;
        var locationData= new binaryParser(locationDataMap, data,locationData.lastPosition);
        for (var key in locationDataMap) {
          if(locationData[key]!=undefined){
            console.log("locationData." + key + ": " + locationData[key].toString('hex'));
          }
        }
      }
      if(mask[4]=="1" || mask[5]=="1" || mask[6]=="1"){
        var locationDataMap=msgmap.content["12"].location.masks.bit4;
        var locationData= new binaryParser(locationDataMap, data,locationData.lastPosition);
        for (var key in locationDataMap) {
          if(locationData[key]!=undefined){
            console.log("locationData." + key + ": " + locationData[key].toString('hex'));
          }
        }
      }
      var locationDataMap=msgmap.content["12"];
      var locationData= new binaryParser(locationDataMap, data,locationData.lastPosition);
      for (var key in locationDataMap) {
        if(locationData[key]!=undefined){
          console.log("locationData." + key + ": " + locationData[key].toString('hex'));
        }
      }

    }else{
      lastPosition=data.length;
    }
    

   startPosition=packetSize+(msgFormat.lastPosition-msgmap.sequence);
    console.log("");
  }




})







