(function (){
  'use strict';

  var e;
  var myPath;
  var animation;  //make the variables global, so you can access them in the animation function


  $(function() {
    var canvas = {
      height: window.outerHeight,
      width: window.outerWidth
    };

    var r = new Raphael("canvas", canvas.width, canvas.height),
      discattr = {
        fill: "#666",
        stroke: "none"
      },
      ANIMATION_SPEED = 10; // milliseconds


    var counter = 0;    // a counter that counts animation steps
    var animate = function() {
      if (myPath.getTotalLength() <= counter){   //break as soon as the total length is reached
        clearInterval(animation);
        return;
      }
      var pos = myPath.getPointAtLength(counter);   //get the position (see Raphael docs)
      e.attr({cx: pos.x, cy: pos.y});  //set the circle position

      counter++; // count the step counter one up
    };

    function curve(initialX, initialY, finalX, finalY, colour) {
      var ax = Math.floor(Math.random() * 200) + initialX;
      var ay = Math.floor(Math.random() * 200) + (initialY - 100);
      var bx = Math.floor(Math.random() * 200) + (finalX - 200);
      var by = Math.floor(Math.random() * 200) + (finalY - 100);
      e = r.circle(initialX, initialY, 5, 5).attr({
        stroke: "none",
        fill: colour
      });
      var path = [["M", initialX, initialY], ["C", ax, ay, bx, by, finalX, finalY]];
      myPath = r.path(path).attr({
        stroke: colour,
        "stroke-width": 2,
        "stroke-linecap": "round",
        "stroke-opacity": 1
      });
      r.set(r.circle(initialX, initialY, 5).attr(discattr), r.circle(finalX, finalY, 5).attr(discattr));
    }

    function init() {
      var player1 = {
          offset: $(".p-ship-1").offset()
        },
        player2 = {
          offset: $(".g-ship-1").offset()
        };

      curve(player1.offset.left, player1.offset.top, player2.offset.left, player2.offset.top, "blue");
      animation = setInterval(animate, ANIMATION_SPEED);
    }

    init();
  });

})();