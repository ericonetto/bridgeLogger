var binaryParser =require('../helper/binaryParser');
var eelinkmap =require('../lib/protocols/msgmaps/eelink.js');
var eelinkParser =require('../lib/protocols/parserEelink');
var konkerConn =require('../konker/konkerConn');

function signedHexStrToInt(hexString){
    if(hexString[0]=="f"){
        return -(~parseInt(hexString, 16)+1);
    }else{
        return parseInt(hexString, 16)
    }
}


var d
d="676712004300265b049d7403fd788323fafda8e50309000000000002d4000355fb00000eb43a007b16d505dd000000000000758e758802c40199000000000000000000000000011a";
d="676712004300145b06bbf103fd7881a2fafdaa4902f0000000000002d4000355fb00000eb42c007b170005e50000000000007aa97aa302d701a700000000000000000000000001cc";

var data=new Buffer(d,'hex');

var jsonValues = eelinkParser(data);

console.log("jsonValues");
console.log(JSON.stringify(jsonValues));
console.log("");


var jsonToTransmit = {}

if(jsonValues.time!=undefined){
    jsonToTransmit._ts = parseInt("0x" + jsonValues.time)*1000;
}
if(jsonValues.latitude!=undefined){
    jsonToTransmit._lat = signedHexStrToInt(jsonValues.latitude)/1800000;
}
if(jsonValues.longitude!=undefined){
    jsonToTransmit._lon = signedHexStrToInt(jsonValues.longitude)/1800000;
}
if(jsonValues.altitude!=undefined){
    jsonToTransmit.altitude = parseInt(jsonValues.altitude, 16);
}
if(jsonValues.speed!=undefined){
    jsonToTransmit.speed = parseInt(jsonValues.speed, 16);
}
if(jsonValues.course!=undefined){
    jsonToTransmit.course = parseInt(jsonValues.course, 16);
}
if(jsonValues.satellites!=undefined){
    jsonToTransmit.satellites = parseInt(jsonValues.satellites);
}
if(jsonValues.battery!=undefined){
    jsonToTransmit.battery = parseInt(jsonValues.battery, 16)/1000;
}
if(jsonValues.temperature!=undefined){
    jsonToTransmit.temperature = parseInt(jsonValues.temperature, 16)/256;
}
if(jsonValues.ain0!=undefined){
    jsonToTransmit.ain0 = parseInt(jsonValues.ain0, 16);
}
if(jsonValues.ain1!=undefined){
    jsonToTransmit.ain1 = parseInt(jsonValues.ain1, 16);
}


console.log(JSON.stringify(jsonToTransmit))