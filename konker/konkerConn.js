var mqtt = require('mqtt')
var url = require('url');
const EventEmitter = require('events').EventEmitter;
"use strict";


var konkerClass = class commKonker extends EventEmitter {
  
    constructor(mqttURL, deviceUserName, devicePassword) {
        super();

        // Parse
        var mqtt_url = url.parse(mqttURL || 'mqtt://mqtt.demo.konkerlabs.net:1883');
        var auth = (mqtt_url.auth || ':').split(':');
        this.url = "mqtt://" + mqtt_url.host;

        this.deviceUserName=deviceUserName;

        //deviceUserName: auth[0] + ":" + auth[0] if you are on a shared instance
        this.mqttOptions = {
            port: mqtt_url.port,
            clientId: 'mqttjs_' + Math.random().toString(16).substr(2, 8),
            username: deviceUserName,
            password: devicePassword
        };

        this.subscribeChannel='data/' + deviceUserName + '/sub/command';
  
    }

    start(){
        var thisClass=this;

        // Create a MQTT connection
        this.client = mqtt.connect(this.url, this.mqttOptions);
        var mqttClient=this.client;

        this.client.on('connect', function(res) { // When MQTT server connected
            thisClass.emit('connected', res);
            console.log("Mqtt: Connected");
            // subscribe to a topic
            mqttClient.subscribe(thisClass.subscribeChannel,(info)=>{
                console.log("Mqtt: Subscribed");
                thisClass.emit('subcribed', info);
            });
        });
        
        // when a message arrives from Konker, send it to gps
        this.client.on('message', function(topic, message, packet) {
            var messageJson = JSON.parse(message.toString());
            console.log("Mqtt: Message received");
            thisClass.emit('receive', messageJson);
        });

    }

    publishToKonker(message, channel){
        if (this.client.connected){
          var publishChannel='data/' + this.deviceUserName + '/pub/' + channel

          this.client.publish(publishChannel, JSON.stringify(message), function() {
                console.log("Mqtt: Message published");
            });
        }else{
            console.log("Mqtt: Reconnecting");
            this.client.reconnect(this.url, this.mqttOptions);
        }
    }

}


module.exports = konkerClass;



















