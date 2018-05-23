# konker-tracker-bridge

Node.js integration for the TK10X series GPS trackers


## Install

git clone https://github.com/KonkerLabs/konker-tracker-bridge

```sh
npm install konker-tracker-bridge
```

## Config

```sh
cd konker-tracker-bridge
nano .env
```

Create the .env file with your Konker configurations

```sh
REMOTE_SERVER_IP = remote_gps_server
REMOTE_SERVER_PORT = remote_gps_server_port
BRIDGE_PORT = this_server_port
CLOUDAMQP_MQTT_URL = mqtt://mqtt.demo.konkerlabs.net:1883
KONKER_API_KEY = device_key
KONKER_API_PASS = device_pass
```

## Run

```sh
npm start
```