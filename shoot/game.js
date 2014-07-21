
BasicGame.Game = function (game) {

};

BasicGame.Game.prototype = {

  preload: function () {
    this.load.image('sea', 'assets/sea.png');
    this.load.image('bullet', 'assets/bullet.png');

    // This loads a spritesheet for the enemy plane (frames)
    this.load.spritesheet('greenEnemy', 'assets/enemy.png', 32, 32);

    this.load.spritesheet('explosion', 'assets/explosion.png', 32, 32);

    this.load.spritesheet('player', 'assets/player.png', 64, 64);

  },

  create: function () {

    // Add the sea sprite (background)
    this.sea = this.add.tileSprite(0, 0, 1024, 768, 'sea');

    // Add the player sprite with cursor key movement
    this.player = this.add.sprite(400, 650, 'player');
    this.player.anchor.setTo(0.5, 0.5);
    this.player.animations.add('fly', [ 0, 1, 2 ], 20, true);
    this.player.play('fly');
    this.game.physics.enable(this.player, Phaser.Physics.ARCADE);
    this.player.body.collideWorldBounds = true;
    this.player.speed = 300;

    // Cartesian coordinates specified for enemy
    this.enemy = this.add.sprite(512, 300, 'greenEnemy');
    this.enemy.animations.add('fly', [ 0, 1, 2 ], 20, true);
    this.enemy.play('fly');
    this.enemy.anchor.setTo(0.5, 0.5);

    this.physics.enable(this.enemy, Phaser.Physics.ARCADE);

    // Add a bullet and enable some physics
    this.bullets = [];
    // Set a delay to prevent an overload of bullets
    this.nextShotAt = 0;
    this.shotDelay = 100;

    // this.bullet = this.add.sprite(512, 400, 'bullet');
    // this.bullet.anchor.setTo(0.5, 0.5);
    // this.physics.enable(this.bullet, Phaser.Physics.ARCADE);
    // this.bullet.body.velocity.y = -400;

    this.cursors = this.input.keyboard.createCursorKeys();

    this.addInstructions();
  },

  addInstructions: function () {

    this.instructions = this.add.text( 510, 600, 
      'Use Arrow Keys to Move, Press Z to Fire\n' + 
      'Tapping/clicking does both', 
      { font: '20px monospace', fill: '#fff', align: 'center' }
    );
    this.instructions.anchor.setTo(0.5, 0.5);
    this.instExpire = this.time.now + 2000;
  },

  update: function () {

      // Scroll screen vertically
      this.sea.tilePosition.y += 0.2;

      // Move the bullet
      // this.bullet.y -= 1;
      
      // Check enemy hit
      // this.physics.arcade.overlap(
      //   this.bullet, this.enemy, this.enemyHit, null, this
      // );

      // Iterate over the bullets and check enemy hit
      for (var i = 0; i < this.bullets.length; i++) {
        this.physics.arcade.overlap(
          this.bullets[i], this.enemy, this.enemyHit, null, this
        );
      }

      // Handle player movement
      this.player.body.velocity.x = 0;
      this.player.body.velocity.y = 0;

      // We can move the sprite to the mouse pointer stopping a certain
      // distance from the pointer to prevent a jump
      if (this.game.input.activePointer.isDown &&
        this.game.physics.arcade.distanceToPointer(this.player) > 15) {
        this.game.physics.arcade.moveToPointer(this.player, this.player.speed);
      }

      // Handle Z key to fire bullets
      if (this.input.keyboard.isDown(Phaser.Keyboard.Z) ||
        this.input.activePointer.isDown) {
        this.fire();
      }

      if (this.cursors.left.isDown) {
        this.player.body.velocity.x = -this.player.speed;
      } else if (this.cursors.right.isDown) {
        this.player.body.velocity.x = this.player.speed;
      }

      if (this.cursors.up.isDown) {
        this.player.body.velocity.y = -this.player.speed;
      } else if (this.cursors.down.isDown) {
        this.player.body.velocity.y = this.player.speed;
      }

      // Flash the instructions then destroy after expire time
      if (this.instructions.exists && this.time.now > this.instExpire) {
        this.instructions.destroy();
      } 
  },

  fire: function() {

      // Prevent firing of bullet if delay not passed
      if (this.nextShotAt > this.time.now) {
        return;
      }
      this.nextShotAt = this.time.now + this.shotDelay;

      // Add a bullet
      var bullet = this.add.sprite(this.player.x, this.player.y - 20, 'bullet');
      bullet.anchor.setTo(0.5, 0.5);

      // Set physics
      this.physics.enable(bullet, Phaser.Physics.ARCADE);

      // Set velocity
      bullet.body.velocity.y = -500;

      // Push into the bullets array
      this.bullets.push(bullet);
  },

  // This is fired from above when there's an overlap between bullet and enemy
  enemyHit: function (bullet, enemy) {

     bullet.kill();
     enemy.kill();

     // Just overwrite the enemy sprite with the explosion and play
     var explosion = this.add.sprite(enemy.x, enemy.y, 'explosion');
     explosion.anchor.setTo(0.5, 0.5);
     explosion.animations.add('boom');
     explosion.play('boom', 15, false, true);
  },

  render: function() {

     // show AABB bounding boxes for the images
     //this.game.debug.body(this.bullet);
     //this.game.debug.body(this.enemy);
   },

  quitGame: function (pointer) {

    //  Here you should destroy anything you no longer need.
    //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

    //  Then let's go back to the main menu.
    this.state.start('MainMenu');

  }

};
