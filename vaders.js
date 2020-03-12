
var SCREEN_X = 800;
var SCREEN_Y = 600;

var config = {
    type: Phaser.AUTO,
    width: SCREEN_X,
    height: SCREEN_Y,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 200 }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);
var platforms;
var platform_positions = [[100,590],[300,590], [500,590], [700,590]]; 
var player;
var pointer;
var enemy_virii;
var enemy_count;
var size;
var laugh;
var level = 0;
var live_enemies;
var level_txt;
function preload()
{
        this.load.setBaseURL("https://anarchode.github.io/something-sneezy/");
        this.load.image("virus", "assets/gfx/corona.png");
        this.load.image("platform", "assets/gfx/platform.png");
        this.load.spritesheet("player", "assets/gfx/corona_sheet.png", {frameWidth: 60, frameHeight: 60});
        this.load.audio("laugh", "assets/snd/coronalaugh.wav");
      
}

function create() 
{
    pointer = this.input.activePointer;
    level += 1;
    level_txt = this.add.text(16,16, "Level: " + level, { fontSize: "32px", fill: "#fff" });
    
    platforms = this.physics.add.staticGroup();
    for (var i=0; i < platform_positions.length; i++) {
        platforms.create(platform_positions[i][0], platform_positions[i][1], "platform");
        if (Math.random() > 0.5) {
            platforms.create(100+Math.random()*600, 100+Math.random()*400, "platform" );
        }
    }
    var particles = this.add.particles("virus");
       var emitter = particles.createEmitter({
            speed: 50,
            scale: { start: 0.01, end: 0.02 },
            blendMode: 'ADD'
        });


    player = this.physics.add.sprite(100,450, "player");
    player.setCollideWorldBounds(true);


    enemy_count = 5 + level;
    enemy_virii = this.physics.add.group({
        key: "virus",
        repeat: enemy_count-1,
        setXY: { x: 12, y: 20, stepX: 70}
    });
    live_enemies = enemy_count;


    enemy_virii.children.iterate(function (child) {
        child.setBounce(1,1);
        child.displayHeight = 10+Math.random()*80;
        child.displayWidth = child.displayHeight;
        child.setVelocity(child.displayHeight*2, child.displayHeight*2);
        child.setCollideWorldBounds(true);
    });

    this.physics.add.overlap(player, enemy_virii, hitEnemy, null, this);



    
    this.anims.create({
        key: 'move',
        frames: this.anims.generateFrameNumbers('player', { start: 3, end: 0 }),
        frameRate: 10,
        repeat: -1
    });



    emitter.startFollow(player);
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(enemy_virii, platforms);

    laugh = this.sound.add("laugh");

}

function update()
{
    if (pointer.isDown) {
        player.setVelocityX((pointer.x - player.body.x)*2);
        player.setVelocityY((pointer.y - player.body.y)*2);
        player.anims.play("move", true);
    } 
    else {
        player.anims.stop("move",true);
    }
}

function hitEnemy(player, enemy) {
    if (player.displayHeight > enemy.displayHeight) {
        player.displayHeight += enemy.displayHeight/5;
        player.displayWidth = player.displayHeight;
        laugh.play();
        enemy.disableBody(true, true);
        live_enemies -= 1;
        if (live_enemies == 0) {
            this.scene.restart();
        }

    } else {
        level = 0;
        this.scene.restart();
    }
}