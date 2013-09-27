(function (){
  'use strict';

  var ANIMATION_INTERVAL = 5; // milliseconds
  var PLAYER_1_COLOR = "#5a55bd"; // Purple
  var PLAYER_2_COLOR = "#3fbf6a"; // Green
  var INITIAL_SHIELD_LEVEL = 5;

  var Player = Backbone.Model.extend({
    /**
     * Initialize player
     *
     * @param  {Integer} num player number
     */
    initialize: function(num) {
      this.num = num;

      this.shieldLevel = {};
      for (var i = 1; i < this.numShips(); i++) {
        this.shieldLevel[i] = INITIAL_SHIELD_LEVEL;
      }
    },
    numShips: function() {
      return $(".p" + this.num + "-ships li").length;
    },
    elem: function(shipNum) {
      return $(".p" + this.num + "-ships li:nth-child(" + shipNum + ")");
    },
    elemShip: function(shipNum) {
      return this.elem(shipNum).find(".p" + this.num + "-ship");
    },
    shipOffset: function(shipNum) {
      return this.elem(shipNum).offset();
    },
    // Half way
    x: function(shipNum) {
      var left = this.shipOffset(shipNum)['left'],
        width = this.elem(shipNum).width(),
        x = left + (width / 2);

      return x;
    },
    y: function(shipNum) {
      var top = this.shipOffset(shipNum)['top'],
        height = this.elem(shipNum).height();

      // Include height for player 1
      return (this.num === 1) ? top + height : top;
    },

    decrementShieldLevel: function(shipNum) {
      if (this.shieldLevel[shipNum]) {
        this.shieldLevel[shipNum]--;
      }
    },

    isDead: function(shipNum) {
      return this.shieldLevel[shipNum] <= 0;
    },

    /**
     * Get the ship number to number
     */
    randomShipNum: function() {
      var numTargetShips = this.numShips(),
        randomShip = Math.floor(Math.random() * numTargetShips) + 1;

      return randomShip;
    }
  });

  // Pew pew pew! Fire pew view
  var Pew = Backbone.View.extend({
    initialize: function(canvas, attackerElem, attackPlayerModel, receiverPlayerModel, color) {
      this.canvas = canvas;
      this.setElement(attackerElem);
      this.attackPlayer = attackPlayerModel;
      this.receiverPlayer = receiverPlayerModel;
      this.color = color;

      this.counter = 0;    // a counter that counts animation steps
    },

    /**
     * Ship number based on what number the `el` is in the list. Start from 1.
     *
     * @return {Integer} ship number
     */
    shipNum: function() {
      return this.$el.parent().prevAll().length + 1;
    },

    animate: function(self, receiverShipNum) {
      if (self.path.getTotalLength() <= self.counter){   //break as soon as the total length is reached
        clearInterval(self.animation);

        // Delete bullet
        self.bullet.remove();
        self.path.remove();

        // Remove shield
        var receiverShip = self.receiverPlayer.elemShip(receiverShipNum);

        receiverShip.removeClass("level-" + self.receiverPlayer.shieldLevel[receiverShipNum]);
        self.receiverPlayer.decrementShieldLevel(receiverShipNum);
        receiverShip.addClass("level-" + self.receiverPlayer.shieldLevel[receiverShipNum]);

        // Flash alert class
        receiverShip.addClass("shield-alert")
          .fadeOut(200)
          .fadeIn(200, function() {
            receiverShip.removeClass("shield-alert");
          });

        // Check if dead
        if (self.receiverPlayer.isDead(receiverShipNum)) {
          receiverShip.addClass("dead");
        }

        return;
      }
      var pos = self.path.getPointAtLength(self.counter);   //get the position (see Raphael docs)
      self.bullet.attr({cx: pos.x, cy: pos.y});  //set the circle position

      self.counter++; // count the step counter one up
    },

    curve: function(initialX, initialY, finalX, finalY, colour) {
      var ax = Math.floor(Math.random() * 200) + initialX;
      var ay = Math.floor(Math.random() * 200) + (initialY - 100);
      var bx = Math.floor(Math.random() * 200) + (finalX - 200);
      var by = Math.floor(Math.random() * 200) + (finalY - 100);
      this.bullet = this.canvas.circle(initialX, initialY, 5, 5).attr({
        stroke: "none",
        fill: colour
      });
      var path = [
        ["M", initialX, initialY],
        ["C", ax, ay, bx, by, finalX, finalY]
      ];
      this.path = this.canvas.path(path).attr({
        stroke: colour,
        "stroke-width": 2,
        "stroke-linecap": "round",
        "stroke-opacity": 1
      });
    },

    // Fire pew pew
    render: function() {
      var shipNum = this.shipNum(),
        receiverShipNum = this.receiverPlayer.randomShipNum();
      this.curve(
        this.attackPlayer.x(shipNum),
        this.attackPlayer.y(shipNum),
        this.receiverPlayer.x(receiverShipNum),
        this.receiverPlayer.y(receiverShipNum),
        this.color
      );
      this.animation = setInterval(this.animate, ANIMATION_INTERVAL, this, receiverShipNum);
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
        var pew = new Pew(canvas, this, player1, player2, PLAYER_1_COLOR);
        pew.render();
      });

      $(".p2-ship").click(function() {
        var pew = new Pew(canvas, this, player2, player1, PLAYER_2_COLOR);
        pew.render();
      });
    }

    init();
  });

})();