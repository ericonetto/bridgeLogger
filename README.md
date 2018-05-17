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
KONKER_API_HOST="http://data.demo.konkerlabs.net:80"
KONKER_API_DATA="http://data.demo.konkerlabs.net:80"
KONKER_USER="user@email.com"
KONKER_PASS="password"
KONKER_API_KEY="device_username"
KONKER_API_PASS="device_password"
```

## Run

```sh
npm start
```

## Examples

See [test.js](test.js)
This test will simulate a tracker