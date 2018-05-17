/*
Name:         tk102
Description:  TK102 GPS server for Node.js
Author:       Franklin van de Meent (https://frankl.in)
Source:       https://github.com/fvdm/nodejs-tk102
Feedback:     https://github.com/fvdm/nodejs-tk102/issues
License:      Unlicense / Public Domain (see UNLICENSE file)
              (https://github.com/fvdm/nodejs-tk102/raw/master/UNLICENSE)
*/

var net = require('net');
var tk10Xparse = require('tk10x-parser')
var EventEmitter = require('events').EventEmitter;
var tk102 = new EventEmitter();

var socketComm;

// defaults
tk102.settings = {
  ip: '0.0.0.0',
  port: 0,
  connections: 10,
  timeout: 10
};


// Emit event
tk102.event = function (name, value) {
  tk102.emit(name, value);
  tk102.emit('log', name, value);
};

// Catch uncaught exceptions (server kill)
process.on('uncaughtException', function (err) {
  var error = new Error('uncaught exception');

  error.error = err;
  console.log(error);
  tk102.event('error', error);
});

// Create server
tk102.createServer = function (vars) {
  var key;

  // override settings
  if (typeof vars === 'object' && Object.keys(vars).length >= 1) {
    for (key in vars) {
      tk102.settings[key] = vars[key];
    }
  }

  // start server
  tk102.server = net.createServer();

  // maximum number of slots
  tk102.server.maxConnections = tk102.settings.connections;

  // server started
  tk102.server.on('listening', function () {
    tk102.event('listening', tk102.server.address());
  });

  // inbound connection
  tk102.server.on('connection', function (socket) {
    socketComm=socket;
    var connection = tk102.server.address();

    connection.remoteAddress = socketComm.remoteAddress;
    connection.remotePort = socketComm.remotePort;

    tk102.event('connection', connection);
    socketComm.setEncoding('utf8');

    if (tk102.settings.timeout > 0) {
      socketComm.setTimeout(parseInt(tk102.settings.timeout * 1000, 10));
    }

    socketComm.on('timeout', function () {
      tk102.event('timeout', connection);
      socketComm.destroy();
    });

    socketComm.on('data', function (data) {
      var gps = {};
      var err = null;

      data = data.trim();
      tk102.event('data', data);

      if (data !== '') {
        gps = tk10Xparse(data);

        if (gps) {
          tk102.event('track', gps);
        } else {
          err = new Error('Cannot parse GPS data from device');
          err.reason = err.message;
          err.input = data;
          err.connection = connection;

          tk102.event('fail', err);
        }
      }
    });

    socketComm.on('close', function (hadError) {
      connection.hadError = hadError;
      tk102.event('disconnect', connection);
    });


    // error
    socketComm.on('error', function (error) {
      var err = new Error('Socket error');

      err.reason = error.message;
      err.socket = socket;
      err.settings = tk102.settings;

      tk102.event('error', err);
    });
  });

  tk102.server.on('error', function (error) {
    var err = new Error('Server error');

    if (error === 'EADDRNOTAVAIL') {
      err = new Error('IP or port not available');
    }

    err.reason = error.message;
    err.input = tk102.settings;

    tk102.event('error', err);
  });

  // Start listening
  tk102.server.listen(tk102.settings.port, tk102.settings.ip);

  return tk102;
};

tk102.write =function (message){
  socketComm.write(message)
}


// Clean geo positions, with 6 decimals
tk102.fixGeo = function (one, two) {
  var minutes = one.substr(-7, 7);
  var degrees = parseInt(one.replace(minutes, ''), 10);

  one = degrees + (minutes / 60);
  one = parseFloat((two === 'S' || two === 'W' ? '-' : '') + one);

  return Math.round(one * 1000000) / 1000000;
};

// Check checksum in raw string
tk102.checksum = function (raw) {
  var str = raw.trim().split(/[,*#]/);
  var strsum = parseInt(str[15], 10);
  var strchk = str.slice(2, 15).join(',');
  var check = 0;
  var i;

  for (i = 0; i < strchk.length; i++) {
    check ^= strchk.charCodeAt(i);
  }

  check = parseInt(check.toString(16), 10);
  return (check === strsum);
};

// ready
module.exports = tk102;