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


var subscribeChannel='data/' + deviceUserName + '/sub/teste123'
var publishChannel='data/' + deviceUserName + '/pub/teste'

// Create a client connection
var client = mqtt.connect(url, mqttOptions);

client.on('connect', function(res) { // When connected
    //console.log("Connected");
    // subscribe to a topic
    client.subscribe(subscribeChannel);
});

// when a message arrives, do something with it
client.on('message', function(topic, message, packet) {
    console.log("Received '" + message + "' on '" + topic + "'");
});


function publishToKonker(menssage){
    if (client.connected){
        // publish a message to a topic
        client.publish(publishChannel, JSON.stringify(menssage), function() {
            //console.log("Message is published");
            client.end(); // Close the connection when published
        });
    }else{
        //console.log("Reconnecting");
        client.reconnect(url, options);
    }
}











let task = setInterval(function() {

 }, 3000);

// clearInterval(task);
