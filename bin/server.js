'use strict';

var Primus = require('primus'),
    http = require('http'),
    five = require("johnny-five");

// ------------------------------------------------
// Johnny five
// ------------------------------------------------

five.Board({
  port: "/dev/cu.usbmodem621" // tmac top usb
}).on("ready", function() {
  var rgb1, rgb2;

  rgb1 = new five.Led.RGB([3, 5, 6]);
  rgb2 = new five.Led.RGB([9, 10, 11]);
  // rainbow = [ "FF000", "FF7F00", "00FF00", "FFFF00", "0000FF", "4B0082", "8F00FF" ];
  // rainbow = [ [0, 0, 0], [255, 0, 0], [0, 255, 0], [0, 0, 255], [255, 255, 255] ];

  this.repl.inject({
    rgb1: rgb1,
    rgb2: rgb2
  });

  rgb1.color([50,0,0]); // Red
  rgb2.color([0,50,0]); // Green
});

// ------------------------------------------------
// Server
// ------------------------------------------------

// var server = http.createServer(),
//   primus = new Primus(server, {
//     transformer: 'sockjs'
//   });

// primus.on('connection', function(spark) {
//   console.log('connection:\t', spark.id);

//   spark.on('data', function(data) {
//     spark.write("Server says '" + data + "'");
//   });
// });

// primus.on('disconnection', function(spark) {
//   console.log('disconnection:\t', spark.id);
// });

// console.log(' [*] Listening on 0.0.0.0:9999' );
// server.listen(9999, '0.0.0.0');