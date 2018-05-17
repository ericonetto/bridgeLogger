var net = require('net');
var publicIp = require('public-ip');
var st310U = require('./lib/suntech/st310U')
var dotenv = require('dotenv');
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






var bridgeServer = net.createServer(function(trackerClient) { 
  console.log('Tracker connected');


    // Create a client connection
  var client = mqtt.connect(url, mqttOptions);

  client.on('connect', function(res) { // When connected
      console.log("Mqtt connected");
      // subscribe to a topic
      client.subscribe(subscribeChannel);
  });

  // when a message arrives, do something with it
  client.on('message', function(topic, message, packet) {
      var messageJson = JSON.parse(message.toString());
      if(messageJson==[] || messageJson==undefined || messageJson==""){
	      return
      }
      if(messageJson.command==[] || messageJson.command==undefined || messageJson==""){
	      return
      }
      console.log("Mqtt->Tracker: " + messageJson.command);
      trackerClient.write(messageJson.command);
  });


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





  var serverClient = new net.Socket();

  //connection to REMOTE SERVER
  serverClient.connect(remoteServerPort, remoteServerIp, function() {
    console.log('Connected to server ' + remoteServerIp);
  });
  
  //REMOTE SERVER Sendig data to TRACKER
  serverClient.on('data', function(data) {
    console.log(remoteServerIp + '->tracker: ' + data);
    trackerClient.write(data.toString());
  });
  
  serverClient.on('close', function() {
    console.log('Connection closed');
  });
  
  //TRACKER sendig data to REMOTE SERVER
  trackerClient.on('data', function(data) {
    console.log('tracker->' + remoteServerIp + ': ' + data);
    serverClient.write(data.toString());

    var err = null;    
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

  });

  trackerClient.on('end', function() {
    console.log('server disconnected');
  });

});


//start listening bridge
bridgeServer.listen(bridgePort, function() { 
  console.log('Bridge ready!');
  publicIp.v4().then(ip => {
    console.log(' public ip: ' + ip);
    console.log(' port: ' + bridgePort);
    console.log('');
  });
  

});





