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
    var msgFormat= new binaryParser(msgmap,data,startPosition);
    var packetSize=parseInt(msgFormat.size.toString('hex'),16);
    var pid=msgFormat.pid.toString('hex');
    var pidMap=msgmap.content[pid];
    
    Object.assign(returnJson, getValues(msgmap, msgFormat));
   
    if(pidMap!=undefined && pid!="12"){
      var msgContent= new binaryParser(pidMap, data, msgFormat.lastPosition);
  
      Object.assign(returnJson, getValues(pidMap, msgContent));


    }else if(pid=="12"){
      var locationFormatMap=msgmap.content["12"].location;
      var locationHead= new binaryParser(locationFormatMap, data, msgFormat.lastPosition);
      var mask=(parseInt(locationHead.mask[0], 16)).toString(2);
      
      Object.assign(returnJson, getValues(locationFormatMap, locationHead));


      if(mask[0]=="1"){
        var locationDataMap=msgmap.content["12"].location.masks.bit0;
        var locationData= new binaryParser(locationDataMap, data,locationHead.lastPosition);
        
        Object.assign(returnJson, getValues(locationDataMap, locationData));
      }
      if(mask[1]=="1"){
        var locationDataMap=msgmap.content["12"].location.masks.bit1;
        var locationData= new binaryParser(locationDataMap, data,locationData.lastPosition);

        Object.assign(returnJson, getValues(locationDataMap, locationData));
      }
      if(mask[2]=="1" || mask[3]=="1"){
        var locationDataMap=msgmap.content["12"].location.masks.bit2;
        var locationData= new binaryParser(locationDataMap, data,locationData.lastPosition);

        Object.assign(returnJson, getValues(locationDataMap, locationData));
      }
      if(mask[4]=="1" || mask[5]=="1" || mask[6]=="1"){
        var locationDataMap=msgmap.content["12"].location.masks.bit4;
        var locationData= new binaryParser(locationDataMap, data,locationData.lastPosition);

        Object.assign(returnJson, getValues(locationDataMap, locationData));
      }
      var locationDataMap=msgmap.content["12"];
      var locationData= new binaryParser(locationDataMap, data,locationData.lastPosition);

      Object.assign(returnJson, getValues(locationDataMap, locationData));

    }else{
      lastPosition=data.length;
    }
    
    startPosition=packetSize+(msgFormat.lastPosition-msgmap.sequence);
  }

  return returnJson;
}  


module.exports = parseData;