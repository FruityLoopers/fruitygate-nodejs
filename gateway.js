var express = require('express');
var app = express();
var http = require('http').Server(app);

var voteRepository = require('voteRepository')();

var serialport = require('serialport');
var SerialPort = serialport.SerialPort;
var serialPort;

var usage = 'Usage:\nnode gateway HTTP_PORT SERIAL_PORT\nnode gateway HTTP_PORT noserial\nnode gateway HTTP_PORT\nHint: Try \'node list\' to see a list of serial port names';

var serialEnabled;

var NODES_IN_MESH = {};
var LINE_HANDLERS = [];

/* startup */
processArgs();

function processArgs(){
    var numArgs = process.argv.length;
    serialEnabled = true;

    if(numArgs == 3) {
        //node gateway HTTP_PORT
        findAndBeginSerial();
        beginHttp(process.argv[2]);

    } else if(numArgs == 4 && process.argv[3] == 'noserial') {
        //node gateway HTTP_PORT noserial
        serialEnabled = false;
        beginHttp(process.argv[2]);

    } else if(numArgs == 4) {
        //node gateway HTTP_PORT SERIAL_PORT
        beginSerial(process.argv[3]);
        beginHttp(process.argv[2]);

    } else {
        exitWithInfo(usage);
    }
}

/* begin serial */
function findAndBeginSerial() {
    serialport.list(function (err, ports) {
        var found = 0;
        var name, port;
        for(var i = 0; i < ports.length; i++) {
            port = ports[i];
            if(port.manufacturer == 'SEGGER') {
                found++;
                name = port.comName;
            }
        }
        found == 1 ? beginSerial(name) : exitWithInfo(usage);
    });
}

function beginSerial(port) {
    log('Opening serial port ' + port);
    serialPort = new SerialPort(port, {
        baudrate: 38400,
        parser: serialport.parsers.readline('\n')
    }, false);

    serialPort.open(function(error) {
        if(error) {
            exitWithInfo('Serial failed to open: ' + error);
        } else {
            serialPort.write('status\r');
            serialPort.on('data', function(data) {
                incomingFromSerial(data);
            });
        }
    });
}

/* begin http */
function beginHttp(port) {
    if(isValidPort(port)) {
        log('Opening http port ' + port);
        http.listen(port, function(){
            runWebServer(app);
        });
    } else {
        exitWithInfo(usage);
    }
}

function runWebServer(app) {
    app.get('/', function(req, res){
        res.sendFile(__dirname + '/index.html');
    });

    app.get('/mesh-status', function(req,res){
      var now = new Date();
      var nodes = {};
      for( k in NODES_IN_MESH ){
        var node = NODES_IN_MESH[k];
        nodes[node.nodeId] = {
          nodeId: node.nodeId,
          lastSeen: node.lastSeen,
          lastSeenAgo: "" + (now - node.lastSeen)/1000 + " seconds ago"
        };
      }


      res.send(JSON.stringify({nodes:nodes}));
    });

    app.use('/assets',express.static('assets'));
}
var HEARTBEAT_REGEX = /HEARTBEAT RECEIVED from nodeId:(\d+)/;
LINE_HANDLERS.push( function heartbeatHandler(input){
  var regexMatch = input.match(HEARTBEAT_REGEX);
  if( regexMatch ){
    var nodeId = regexMatch[1];
    NODES_IN_MESH[nodeId] = {
      nodeId: nodeId,
      lastSeen: new Date()
    };
  }
});

/* incoming */
function incomingFromSerial(input) {
    LINE_HANDLERS.forEach( function(handler){
      handler(input);
    });


    if(hasGatewayJson(input)) {
        console.log('Gateway conditional entered...');
        var gatewayObj = gatewayJsonToObject(input);
        var packet = toPacket(gatewayObj);
        logIncoming('local mesh node', gatewayObj['sender'], gatewayObj['receiver'], gatewayObj['message']);
    } else if(hasHandshakeJson(input)) {
        var handshakeObj = handshakeJsonToObject(input);

        console.log('Handshake conditional entered...');

        var packet = toPacket(handshakeObj);
        if(handshakeObj['message'] == 'OUT => CLUSTER_INFO_UPDATE') {
            console.log('Out');
        } else if (handshakeObj['message'] == 'IN <= CLUSTER_WELCOME') {
            console.log('In');
        }
        console.log(handshakeObj['message']);
        console.log(handshakeObj['nodeId']);
    } else {
        console.log('Unrecognized packet, logging below');
        console.log(input);
    }
}

/* outgoing */
function pushToSerial(packet) {
    if(serialEnabled) {
        logOutgoing('serial');
        serialPort.write('action ' + toTargetId(packet) + ' gateway ' + toMessage(packet) + ' \r');
    }
}

/* message parsing */
function gatewayJsonToObject(input) {
    return JSON.parse(
        input.substring(
            input.indexOf('{ "gateway-message":'),
            input.indexOf('}}') + 2
        )
    )['gateway-message'];
}

function handshakeJsonToObject(input) {
    return JSON.parse(
        input.substring(
            input.indexOf('{"handshakeMessage" : '),
            input.indexOf('}}') + 2
        )
    )['handshakeMessage'];
}

function partnerStatusJsonToObject(input) {
    console.log('about to substring...');
    console.log(input);

    return JSON.parse(
        input.substring(
            0,
            input.indexOf('[Node.cpp')
        )
    );
}

function toPacket(obj) {
    return JSON.stringify(obj);
}

function toGatewayPacket(obj) {
    return obj['receiver'] + '-' + obj['message'];
}

function toHandshakePacket(obj) {
    return obj[''] + '-' + obj['message'];
}

function toTargetId(packet) {
    return packet.substring(0, packet.indexOf('-'));
}

function toMessage(packet) {
    return packet.substring(packet.indexOf('-')+1);
}

/* logs */
function log(out) {
    var now = new Date();
    console.log(
        '[' +
        pad(now.getMonth() + 1) + '-' +
        pad(now.getDate()) + '-' +
        now.getFullYear() + ' ' +
        pad(now.getHours()) + ':' +
        pad(now.getMinutes()) + ':' +
        pad(now.getSeconds()) + '] ' +
        out
    );
}

function logIncoming(source, sender, target, message) {
    log('Incoming from ' + source + ' [' + sender + '], message \'' + message + '\' for target ' + target);
}

function logOutgoing(dest) {
    log('Pushing to ' + dest + '...');
}

/* utilities */
function pad(number) {
    return ('0' + number).slice(-2);
}

function isValidPort(input) {
    return !isNaN(input);
}

function hasGatewayJson(input) {
    return input.indexOf('{ "gateway-message":') > 1;
}

function hasHandshakeJson(input) {
    return input.indexOf('{"handshakeMessage" :') > 1;
}

function exitWithInfo(info) {
    console.log(info);
    process.exit(0);
}
