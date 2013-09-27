(function (){
  'use strict';

  var ANIMATION_INTERVAL = 5; // milliseconds

  var e;
  var myPath;
  var animation;  //make the variables global, so you can access them in the animation function

  var Player = Backbone.Model.extend({
    initialize: function(num) {
      this.num = num;

      // Only do ship 1 for now
      this.elem = $(".p" + num + "-ship-1");
    },
    // Half way
    x: function() {
      var left = this.elem.offset()['left'],
        width = this.elem.width(),
        x = left + (width / 2);

      return x;
    },
    y: function() {
      var top = this.elem.offset()['top'],
        height = this.elem.height();

      // Include height for player 1
      return (this.num === 1) ? top + height : top;
    }
  });

  // Pew pew pew! Fire pew view
  var Pew = Backbone.View.extend({
    initialize: function(canvas, attackPlayerModel, receiverPlayerModel, shipNum, color) {
      this.canvas = canvas;
      this.attackPlayer = attackPlayerModel;
      this.receiverPlayer = receiverPlayerModel;
      this.shipNum = shipNum;
      this.color = color;

      this.counter = 0;    // a counter that counts animation steps
    },

    animate: function() {
      if (myPath.getTotalLength() <= this.counter){   //break as soon as the total length is reached
        clearInterval(animation);
        return;
      }
      var pos = myPath.getPointAtLength(this.counter);   //get the position (see Raphael docs)
      e.attr({cx: pos.x, cy: pos.y});  //set the circle position

      this.counter++; // count the step counter one up
    },

    curve: function(initialX, initialY, finalX, finalY, colour) {
      var ax = Math.floor(Math.random() * 200) + initialX;
      var ay = Math.floor(Math.random() * 200) + (initialY - 100);
      var bx = Math.floor(Math.random() * 200) + (finalX - 200);
      var by = Math.floor(Math.random() * 200) + (finalY - 100);
      e = this.canvas.circle(initialX, initialY, 5, 5).attr({
        stroke: "none",
        fill: colour
      });
      var path = [["M", initialX, initialY], ["C", ax, ay, bx, by, finalX, finalY]];
      myPath = this.canvas.path(path).attr({
        stroke: colour,
        "stroke-width": 2,
        "stroke-linecap": "round",
        "stroke-opacity": 1
      });
    },

    // Fire pew pew
    render: function() {
      this.curve(this.attackPlayer.x(), this.attackPlayer.y(), this.receiverPlayer.x(), this.receiverPlayer.y(), this.color);
      animation = setInterval(this.animate, ANIMATION_INTERVAL);
    }

  });

  $(function() {
    var height = window.outerHeight,
      width = window.outerWidth,
      canvas = new Raphael("canvas", width, height);

    function init() {
      var player1 = new Player(1),
        player2 = new Player(2);

      $(".p1-ship").click(function() {
        var pew = new Pew(canvas, player1, player2, 1, "blue");
        pew.render();
      });
    }

    init();
  });

})();