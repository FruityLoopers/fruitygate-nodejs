var _ = require('underscore');
var express = require('express');
var app = express();
var server = require('http').Server(app);
var http = require('http');

var voteRepository = require('./vote_repository')();
var nodeConfigurationRepository = require('./node_configuration_repository')();

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
        server.listen(port, function(){
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
        nodes[node.nodeId] = _.extend(
          _.pick(node,'nodeId','lastSeen','inConn','outConns'),
          {lastSeenAgo: "" + (now - node.lastSeen)/1000 + " seconds ago"}
        );
      }

      res.send(JSON.stringify({nodes:nodes}));
    });

    app.get('/votes', function(req,res){
        voteRepository.getAllVotes().then(function(votes){
            var transformed = [];
            votes.forEach(function(vote) {
                transformed.push({ 
                    voter: parseInt(vote.attributes.voter), 
                    // should be, get color per node
                    color:'green',
                    votetime: parseInt(vote.attributes.voteTime),
                    timestamp: vote.attributes.created_at
                });
            });

            var box = [];
            box.push({box:'Box1', votes:transformed});
            var results = JSON.stringify(
                {'vote_results': box}
            );
            res.send(results);
        });
    });

    app.post('/post', function(req,res){

    });

    app.use('/assets',express.static('assets'));
}

function httpPost(data) {
    var post_options = {
        host: 'qconsf.tuba-dev.com.ar',
        port: 80,
        path: '/voting/api/add',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data)
        }
    };

    var post_request = http.request(post_options, function(response) {
        console.log('Sent Vote');
        response.setEncoding('utf8');
        response.on('data', function(chunk) {
            console.log('Response is ' + chunk);
        });
    });

    post_request.write(data);
    post_request.end();
}

function sendVotes() {
    voteRepository.getAllVotes().then(function(votes){
        var transformed = [];
        votes.forEach(function(vote) {
            transformed.push({
                voter: parseInt(vote.attributes.voter),
                // should be, get color per node
                color:'green',
                timestamp: parseInt(vote.attributes.voteTime)
            });
        })  ;

        var box = [];
        box.push({box:'Box1', votes:transformed});
        var post_data = JSON.stringify({'vote_results': box});
        httpPost(post_data);
    });
    // Handle failure response: {"success":false,"reason":"Invalid request"}
}

var HEARTBEAT_REGEX = /HEARTBEAT RECEIVED from nodeId:(\d+) inConn:(\d+) outConns:\[([\d,]+)\]/;
LINE_HANDLERS.push( function heartbeatHandler(input){
  var regexMatch = input.match(HEARTBEAT_REGEX);
  if( regexMatch ){
    var nodeId = regexMatch[1];
    var inConn = regexMatch[2];
    var outConns = regexMatch[3].split(",");

    NODES_IN_MESH[nodeId] = {
      nodeId: nodeId,
      lastSeen: new Date(),
      inConn: inConn,
      outConns: outConns
    };

  //sendVotes();


  }
});

var VOTE_REGEX = /Gateway (\d+) received voter message from (\d+) with userId (\d+) and time (\d+)/;
LINE_HANDLERS.push(function votesHandler(input){
    var regexMatch = input.match(VOTE_REGEX);
    if( regexMatch ){
        var nodeId = regexMatch[2];
        var voter = regexMatch[3];
        var voteTime = regexMatch[4];
        voteRepository.recordVote({
            nodeId: nodeId,
            voter: voter,
            voteTime: voteTime
        });
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
        pushTimeToMesh();

    } else {
        console.log(input);
    }
}

function pushTimeToMesh() {
    if(serialEnabled) {
        setTimeout(function() {
            var message = 'action 0 voting set_time ' + Date.now()/1000 + ' \r';
            log("Message sent is: " + message);
            serialPort.write(message);
            return;
        }, 5000);
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
