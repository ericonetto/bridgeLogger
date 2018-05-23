var binaryParser =require('../helper/binaryParser');
var eelinkmap =require('../lib/protocols/msgmaps/eelink.js');
var eelinkParser =require('../parserEelink');
var konkerConn =require('../konker/konkerConn');

function signedHexStrToInt(hexString){
    if(hexString[0]=="f"){
        return -(~parseInt(hexString, 16)+1);
    }else{
        return parseInt(hexString, 16)
    }
}


var data=new Buffer(
    "676712004300265b049d7403fd788323fafda8e50309000000000002d4000355fb00000eb43a007b16d505dd000000000000758e758802c40199000000000000000000000000011a",
    'hex');

var jsonValues = eelinkParser(data);
var jsonToTransmit = {}
jsonToTransmit._ts = parseInt("0x" + jsonValues.time)*1000;
jsonToTransmit._lat = signedHexStrToInt(jsonValues.latitude)/1800000;
jsonToTransmit._lon = signedHexStrToInt(jsonValues.longitude)/1800000;
jsonToTransmit.altitude = parseInt(jsonValues.altitude, 16);
jsonToTransmit.speed = parseInt(jsonValues.speed, 16);
jsonToTransmit.course = parseInt(jsonValues.course, 16);
jsonToTransmit.satellites = parseInt(jsonValues.satellites);
jsonToTransmit.battery = parseInt(jsonValues.battery, 16)/1000;
jsonToTransmit.temperature = parseInt(jsonValues.temperature, 16)/256;

var konker = new konkerConn("mqtt://mqtt.demo.konkerlabs.net:1883","8r29lu88tme4","3DFB98IJyA84");

konker.start();

konker.on("subcribed",()=>{
    konker.publishToKonker({"teste":123},"teste")
});

