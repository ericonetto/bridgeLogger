var binaryParser =require('../../helper/binaryParser');
var eelinkmap =require('./msgmaps/eelink.js');


function getValues(msgmap,binaryParsedData){
  var responseJson={}
  for (var key in msgmap) {
    if(binaryParsedData[key]!=undefined){
      responseJson[key]=binaryParsedData[key].toString('hex');
    }
  }
  return responseJson;
}




function parseData(data){
  var returnJson={};
  var msgmap=eelinkmap;


  var startPosition=0;
  while(startPosition<data.length){
    returnJson={};
    var msgFormat= new binaryParser(msgmap,data,startPosition);
    var packetSize=parseInt(msgFormat.map.size.toString('hex'),16);
    var pid=msgFormat.map.pid.toString('hex');
    var pidMap=msgmap.content[pid];
    
    Object.assign(returnJson, getValues(msgmap, msgFormat.map));
   
    if(pidMap!=undefined && pid!="12"){
      var msgContent= new binaryParser(pidMap, data, msgFormat.lastPosition);
  
      Object.assign(returnJson, getValues(pidMap, msgContent.map));


    }else if(pid=="12"){
      var locationDataMap=msgmap.content["12"].location;
      var locationData= new binaryParser(locationDataMap, data, msgFormat.lastPosition);
      var mask="00000000" + parseInt("0x" + locationData.map.mask.toString('hex'),16).toString(2);
      Object.assign(returnJson, getValues(locationDataMap, locationData.map));
      function maskBit(b){
        return mask.charAt(mask.length-(1+b));
      }

      if(maskBit(0)=="1"){
        locationDataMap=msgmap.content["12"].location.masks.bit0;
        locationData= new binaryParser(locationDataMap, data,locationData.lastPosition);
        
        Object.assign(returnJson, getValues(locationDataMap, locationData.map));
      }
      if(maskBit(1)=="1"){
        locationDataMap=msgmap.content["12"].location.masks.bit1;
        locationData= new binaryParser(locationDataMap, data,locationData.lastPosition);

        Object.assign(returnJson, getValues(locationDataMap, locationData.map));
      }
      if(maskBit(2)=="1"){
        locationDataMap=msgmap.content["12"].location.masks.bit2;
        locationData= new binaryParser(locationDataMap, data,locationData.lastPosition);

        Object.assign(returnJson, getValues(locationDataMap, locationData.map));
      }
      if(maskBit(3)=="1"){
        locationDataMap=msgmap.content["12"].location.masks.bit2;
        locationData= new binaryParser(locationDataMap, data,locationData.lastPosition);

        Object.assign(returnJson, getValues(locationDataMap, locationData.map));
      }

      if(maskBit(4)=="1"){
        locationDataMap=msgmap.content["12"].location.masks.bit4;
        locationData= new binaryParser(locationDataMap, data,locationData.lastPosition);

        Object.assign(returnJson, getValues(locationDataMap, locationData.map));
      }

      if( maskBit(5)=="1"){
        locationDataMap=msgmap.content["12"].location.masks.bit4;
        locationData= new binaryParser(locationDataMap, data,locationData.lastPosition);

        Object.assign(returnJson, getValues(locationDataMap, locationData.map));
      }

      if(maskBit(6)=="1"){
        locationDataMap=msgmap.content["12"].location.masks.bit4;
        locationData= new binaryParser(locationDataMap, data,locationData.lastPosition);

        Object.assign(returnJson, getValues(locationDataMap, locationData.map));
      }

      locationDataMap=msgmap.content["12"];
      locationData= new binaryParser(locationDataMap, data,locationData.lastPosition);

      Object.assign(returnJson, getValues(locationDataMap, locationData.map));

    }else{
      lastPosition=data.length;
    }
    
    startPosition=packetSize+(msgFormat.lastPosition-msgmap.sequence);
  }

  return returnJson;
}  


module.exports = parseData;