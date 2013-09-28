(function (){
  'use strict';

  var ANIMATION_INTERVAL = 5; // milliseconds
  var PLAYER_1_COLOR = "#5a55bd"; // Purple
  var PLAYER_2_COLOR = "#3fbf6a"; // Green

  var INITIAL_SHIELD_LEVEL = 5;
  var INITIAL_NUM_SHIPS = 5;

  var App = {};

  var GameState = Backbone.Model.extend({
    initialize: function() {
      this.isGameOver = false;
    },
    gameOver: function(winner, loser) {
      this.set('winner', winner);
      this.set('loser', loser);

      this.set('isGameOver', true);
    }
  });

  var Player = Backbone.Model.extend({
    /**
     * Initialize player
     *
     * @param  {Integer} num player number
     */
    initialize: function(hash) {
      this.num = hash.num;

      this.ships = new Ships([], this);
      for (var i = 0; i < hash.initShipNum; i++) {
        this.ships.add(new Ship({
          id: i,
          playerModel: this
        }));
      }
    },

    /**
     * Get ship
     *
     * @param  {Integer} num ship number
     */
    ship: function(num) {
      return this.ships.get(num);
    },

    randomShip: function() {
      return this.ships.random();
    },

    isDead: function() {
      return this.ships.allDead();
    },

    elemIsDead: function(shipElem) {
      var id = $(shipElem).parent().data("id"),
        ship = this.ships.get(id);

      return ship.isDead();
    }
  });

  var Ship = Backbone.Model.extend({
    initialize: function(hash) {
      this.playerNum = hash.playerModel.num;
      this.shieldLevel = INITIAL_SHIELD_LEVEL;
    },

    elem: function() {
      return $(".p" + this.playerNum + "-ships li[data-id=" + this.id + "]");
    },
    elemShip: function() {
      return this.elem().find(".p" + this.playerNum + "-ship");
    },
    shipOffset: function() {
      return this.elem().offset();
    },

    // Half way
    x: function() {
      var left = this.shipOffset()['left'],
        width = this.elem().width(),
        x = left + (width / 2);

      return x;
    },
    y: function() {
      var top = this.shipOffset()['top'],
        height = this.elem().height();

      // Include height for player 1
      return (this.playerNum === 1) ? top + height : top;
    },

    decrementShieldLevel: function() {
      if (this.shieldLevel) {
        this.shieldLevel--;
      }
    },

    isDead: function() {
      return this.shieldLevel <= 0;
    }
  });

  var Ships = Backbone.Collection.extend({
    model: Ship,
    initialize: function(ships, playerModel) {
      this.playerNum = playerModel.num;
    },

    random: function() {
      var shipsNotDead = this.notDead(),
        randomShipNum = Math.floor(Math.random() * shipsNotDead.length);

      return shipsNotDead[randomShipNum];
    },

    notDead: function() {
      return _.reject(this.models, function(ship) {
        return ship.isDead();
      });
    },

    allDead: function() {
      return this.notDead().length <= 0;
    }
  });

  var PlayerView = Backbone.View.extend({
    template: _.template($("#player-template").html()),
    render: function(player) {
      this.$el.append(this.template(player));
    }
  });

  var GameOverView = Backbone.View.extend({
    template: _.template($("#game-over-template").html()),
    render: function(gameState) {
      this.$el.append(this.template(gameState));
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

    animate: function(self, receiverShip) {
      if (self.path.getTotalLength() <= self.counter){   //break as soon as the total length is reached
        clearInterval(self.animation);

        // Delete bullet
        self.bullet.remove();
        self.path.remove();

        // Remove shield
        var receiverShipElem = receiverShip.elem();

        receiverShipElem.removeClass("level-" + receiverShip.shieldLevel);
        receiverShip.decrementShieldLevel();
        receiverShipElem.addClass("level-" + receiverShip.shieldLevel);

        // Flash alert class
        receiverShipElem.addClass("shield-alert")
          .fadeOut(200)
          .fadeIn(200, function() {
            receiverShipElem.removeClass("shield-alert");
          });

        // Check if dead
        if (receiverShip.isDead()) {
          receiverShipElem.addClass("dead");
        }

        if (self.receiverPlayer.isDead()) {
          App.state.gameOver(self.attackPlayer, self.receiverPlayer);
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

    shipNum: function() {
      return this.$el.parent().data();
    },

    // Fire pew pew
    render: function() {
      var shipNum = this.shipNum(),
        receiverShip = this.receiverPlayer.randomShip();

      if (receiverShip) {
        this.curve(
          this.attackPlayer.ship(shipNum).x(),
          this.attackPlayer.ship(shipNum).y(),
          receiverShip.x(),
          receiverShip.y(),
          this.color
        );
        this.animation = setInterval(this.animate, ANIMATION_INTERVAL, this, receiverShip);
      } else {
        App.state.gameOver(this.attackPlayer, this.receiverPlayer);
      }
    }

  });

  $(function() {
    var height = window.outerHeight,
      width = window.outerWidth,
      canvas = new Raphael("canvas", width, height);

    function init() {
      App.state = new GameState();

      App.state.on('change:isGameOver', function(model, isGameOver) {
        var gameOverView;
        if (isGameOver) {
          gameOverView = new GameOverView({
            el: $(".container")
          });
          // TODO: Passing App.state as a parameter doesn't seem to work
          gameOverView.render(App.state);
        } else {
          gameOverView.$el.find('.game-over-container').remove();
        }
      });

      var player1 = new Player({ num: 1, initShipNum: INITIAL_NUM_SHIPS }),
        player2 = new Player({ num: 2, initShipNum: INITIAL_NUM_SHIPS }),
        player1View = new PlayerView({
          el: $(".container")
        }),
        player2View = new PlayerView({
          el: $(".container")
        });

      player1View.render(player1);
      player2View.render(player2);

      $(".p1-ship").click(function() {
        if (!App.state.isGameOver && !player1.elemIsDead(this)) {
          var pew = new Pew(canvas, this, player1, player2, PLAYER_1_COLOR);
          pew.render();
        }
      });

      $(".p2-ship").click(function() {
        if (!App.state.isGameOver && !player2.elemIsDead(this)) {
          var pew = new Pew(canvas, this, player2, player1, PLAYER_2_COLOR);
          pew.render();
        }
      });

      // Make App global for debugginer
      window.App = App;
    }

    init();
  });

})();