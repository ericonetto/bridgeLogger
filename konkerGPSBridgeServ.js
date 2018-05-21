var net = require('net');
var publicIp = require('public-ip');
var st310U = require('./lib/suntech/st310U')
var dotenv = require('dotenv');
var bridge =require('../bridge/httpServerBridge');

dotenv.load();


var remoteServerIp = '34.196.183.170';
var remoteServerPort=7210;

var bridgePort= 7211;



var deviceUserName= process.env.KONKER_API_KEY;
var devicePassword= process.env.KONKER_API_PASS;

var mqtt = require('mqtt'), url = require('url');
// Parse
var mqtt_url = url.parse(process.env.CLOUDAMQP_MQTT_URL || 'mqtt://mqtt.demo.konkerlabs.net:1883');
var auth = (mqtt_url.auth || ':').split(':');
var url = "mqtt://" + mqtt_url.host;

//deviceUserName: auth[0] + ":" + auth[0] if you are on a shared instance
var mqttOptions = {
  port: mqtt_url.port,
  clientId: 'mqttjs_' + Math.random().toString(16).substr(2, 8),
  username: deviceUserName,
  password: devicePassword
};

var subscribeChannel='data/' + deviceUserName + '/sub/command';


function publishToKonker(message, channel){
    if (client.connected){
      var publishChannel='data/' + deviceUserName + '/pub/' + channel
      //console.log(publishChannel);
      //message={"teste":123};
      // publish a message to a topic
      if(message!=undefined && message!=""){
        if (message.lat!=false && message.lon!=false){
          message["_lat"]=message.lat;
          message["_lon"]=message.lon;
        }
      }
      client.publish(publishChannel, JSON.stringify(message), function() {
        console.log("Bridge->Mqtt: Message is published");
        });
    }else{
        console.log("Mqtt reconnecting");
        client.reconnect(url, mqttOptions);
    }
}




/////////////////


var bridgeServer = new bridge(remoteServerIp,remoteServerPort,bridgePort,true);

bridgeServer.start();


////
bridgeServer.onRemoteConnected((gpsDevice,remoteServer)=>{

  // Create a MQTT connection
  var client = mqtt.connect(url, mqttOptions);

  client.on('connect', function(res) { // When MQTT server connected
      console.log("Mqtt connected");
      // subscribe to a topic
      client.subscribe(subscribeChannel);
  });

  // when a message arrives from Konker, send it to gps
  client.on('message', function(topic, message, packet) {
      var messageJson = JSON.parse(message.toString());
      if(messageJson==[] || messageJson==undefined || messageJson==""){
        return
      }
      if(messageJson.command==[] || messageJson.command==undefined || messageJson==""){
        return
      }
      console.log("Mqtt->Tracker: " + messageJson.command);
      gpsDevice.write(messageJson.command);
  });


  //when data arrives from GPS
  bridgeServer.onTarguetData((data)=>{
    //parse and publish to konker
    var dataStr = data.toString().trim();
    if (dataStr !== '') {
      var gps = st310U.parse(dataStr);
      if (gps) {
        let dataToKonker =gps;
        if(dataToKonker!="" &&  dataToKonker!="[]" && dataToKonker!=undefined){
          publishToKonker(dataToKonker, "location")
        }     
      } else {
        console.log('-> Cannot parse that data from device');
      }
    }

  })

  //when data arrives from remote server
  bridgeServer.onRemoteData((data)=>{

  })

})






