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
//Mensagem sem sensor de temperatura
d="676712004301c85b06e79703fd788192fafdac2502d5000300000302d4000355fb0000512e2c067b170105e50000000000007b607b5a02d701a7000000000000000000000000fce0"
d="676712004301895b06e1f903fd788192fafdac2502d5000000000002d4000355fb0000512e2d007b170105760000000000007b487b4202d701a7000000000000000000000000fce0";

//Mengagem com sensor de temperatura 25.3°C => 25.3 * 256 => 6476.8 => 0x194c
d="676712004301c05b06e6ca03fd788192fafdac2502d5000000000002d4000355fb0000512e36007b164e05d50000000000007b5d7b5702d701a70000000000000000000000000194";
//Mengagem com sensor de temperatura 25.2°C => 25.2 * 256 => 6451 => 0x1933
d="676712004301cd5b06e7f103fd78853dfafdb118039e000000000502d4000355fb0000512e3b067b16f605dd0000000000007b617b5b02d701a70000000000000000000000000193";

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

//NOT DOCUMENTED IN PROTOCOL
if(jsonValues.tempnodoc!=undefined){
    jsonToTransmit.tempnodoc = parseInt(jsonValues.tempnodoc, 16)/256;
}



console.log(JSON.stringify(jsonToTransmit))