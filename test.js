/*
  Telnet to:   telnet 127.0.0.1 1337
  Copy/paste:  1203292316,0031698765432,GPRMC,211657.000,A,5213.0247,N,00516.7757,E,0.00,273.30,290312,,,A*62,F,imei:123456789012345,123
*/

var net = require ('net');

var gpsAuth ='##,imei:868683024786554,A;'
var gpslocation = 'imei:868683024786554,tracker,171117011425,,F,171423.000,A,2334.4850,S,04641.3309,W,0.00,0;';
var alarm ='imei:868683024786554,sensor alarm,171117011439,,F,171438.000,A,2334.4850,S,04641.3309,W,0.00,0;'

const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter();


var client = new net.Socket();
var reply='';
var timout=10;

function getReply(){
   re=reply;
  reply='';
  return re;
}



client.connect(1337, '127.0.0.1', function() {
  console.log ('Connected to server');
});

client.on('data', function(data) {
  reply=data;
  myEmitter.emit(data, data);
});

client.on('close', function() {
  console.log('Connection closed');
});


test();

var interval = 5 * 1000; // 5 seconds;


function sendLocation(timer, i) {
  if(i > 0){
    setTimeout((callback)=>{
      console.log ('Sending location:' + gpslocation);
      client.write (gpslocation + '\r\n');
      sendLocation(timer, i-1);
    }, timer);
  } 
}

function startLocationSendLoop (i) {
  sendLocation(interval, i);
}






//run tests
function test () {
 


  console.log ('Sending authentication:' + gpsAuth);
  myEmitter.once('LOAD', (a) => {
    setImmediate(() => {
      console.log('LOAD RECEIVED!');

      startLocationSendLoop(10);
    });
  });
  client.write (gpsAuth + '\r\n');

}
