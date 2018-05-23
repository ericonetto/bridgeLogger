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
    var packetSize=parseInt(msgFormat.size.toString('hex'),16);
    var pid=msgFormat.pid.toString('hex');
    var pidMap=msgmap.content[pid];
    
    Object.assign(returnJson, getValues(msgmap, msgFormat));
   
    if(pidMap!=undefined && pid!="12"){
      var msgContent= new binaryParser(pidMap, data, msgFormat.lastPosition);
  
      Object.assign(returnJson, getValues(pidMap, msgContent));


    }else if(pid=="12"){
      var locationDataMap=msgmap.content["12"].location;
      var locationData= new binaryParser(locationDataMap, data, msgFormat.lastPosition);
      var mask="0000" + parseInt("0x" + locationData.mask.toString('hex'),16).toString(2);

      Object.assign(returnJson, getValues(locationDataMap, locationData));


      if(mask[0]=="1"){
        locationDataMap=msgmap.content["12"].location.masks.bit0;
        locationData= new binaryParser(locationDataMap, data,locationData.lastPosition);
        
        Object.assign(returnJson, getValues(locationDataMap, locationData));
      }
      if(mask[1]=="1"){
        locationDataMap=msgmap.content["12"].location.masks.bit1;
        locationData= new binaryParser(locationDataMap, data,locationData.lastPosition);

        Object.assign(returnJson, getValues(locationDataMap, locationData));
      }
      if(mask[2]=="1" || mask[3]=="1"){
        locationDataMap=msgmap.content["12"].location.masks.bit2;
        locationData= new binaryParser(locationDataMap, data,locationData.lastPosition);

        Object.assign(returnJson, getValues(locationDataMap, locationData));
      }
      if(mask[4]=="1" || mask[5]=="1" || mask[6]=="1"){
        locationDataMap=msgmap.content["12"].location.masks.bit4;
        locationData= new binaryParser(locationDataMap, data,locationData.lastPosition);

        Object.assign(returnJson, getValues(locationDataMap, locationData));
      }
      locationDataMap=msgmap.content["12"];
      locationData= new binaryParser(locationDataMap, data,locationData.lastPosition);

      Object.assign(returnJson, getValues(locationDataMap, locationData));

    }else{
      lastPosition=data.length;
    }
    
    startPosition=packetSize+(msgFormat.lastPosition-msgmap.sequence);
  }

  return returnJson;
}  


module.exports = parseData;