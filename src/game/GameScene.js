import Phaser from "phaser";

export default class GameScene extends Phaser.Scene {
    constructor() {
        super("GameScene");

        this.score = 0
        this.highestY = 500
        this.nextPlatformY = 450
        this.gameOver = false
    }

    create() {
        const { width, height } = this.scale

        this.cameras.main.setBackgroundColor("#9bd8ed")

        this.platforms = this.physics.add.staticGroup()

        this.createPlatform(width / 2, 500)

        this.player = this.add.rectangle(width / 2, 500, 24, 30, 0x334155)

        this.physics.add.existing(this.player)

        this.player.body.setSize(24, 30)
        this.player.body.setCollideWorldBounds(false)
        this.player.body.setGravityY(900)
        this.player.body.setVelocityY(-450) // idk why it says it might not exist even though the tooltip has it

        this.physics.add.collider(this.player, this.platforms, this.bounce, (player) => player.body.velocity.y > 0, this) // callback
        
        this.cursors = this.input.keyboard.createCursorKeys()
        this.keys = this.input.keyboard.addKeys({ up: Phaser.Input.Keyboard.KeyCodes.W, down: Phaser.Input.Keyboard.KeyCodes.S, left: Phaser.Input.Keyboard.KeyCodes.A, right: Phaser.Input.Keyboard.KeyCodes.D })
        
        this.cameras.main.setBounds(0, -100000, width, 101000) // x y width height for cam
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1) // no offset
        this.cameras.main.setDeadzone(0, 180) // width height

        this.generatePlatforms()

        this.scoreText = this.add.text(16, 16, "Altitude: 0m", { fontSize: "20px", fontFamily: "monospace", color: "#17324d", fontStyle: "bold"})
        this.scoreText.setScrollFactor(0)
        this.scoreText.setDepth(10)
        
        this.gameOverText = this.add.text(width / 2, height / 2, "Game over!", { fontSize: "26px", fontFamily: "monospace", color: "#ffffff", align: "center", backgroundColor: "#17324d", padding: {x: 16, y: 16}})
        this.gameOverText.setOrigin(0.5)
        this.gameOverText.setScrollFactor(0)
        this.gameOverText.setVisible(false)
        this.gameOverText.setDepth(20)
    }

    createPlatform(x, y) {
        const platform = this.add.rectangle(x, y, 90, 14, 0x426b45) // ohhh the color is hex

        this.physics.add.existing(platform, true)
        this.platforms.add(platform)

        return platform
    }

    bounce(player, platform) {
        if (player.body.velocity.y > 0) {
            player.body.setVelocityY(-450)
        }
    }

    generatePlatforms() {
        const width = this.scale.width;
        const cameraTop = this.cameras.main.scrollY - 900

        while (this.nextPlatformY > cameraTop) {
            const x = Phaser.Math.Between(55, width - 55)

            this.createPlatform(x, this.nextPlatformY)

            this.nextPlatformY -= Phaser.Math.Between(95, 135)
        }
    }

    update() {
        if (this.gameOver) return;

        const speed = 260

        if (this.cursors.left.isDown || this.keys.left.isDown) {
            this.player.body.setVelocityX(-speed)
        } else if (this.cursors.right.isDown || this.keys.right.isDown) {
            this.player.body.setVelocityX(speed)
        } else {
            this.player.body.setVelocityX(0)
        }

        if (this.player.x < 0) {
            this.player.x = this.scale.width
        } else if (this.player.x > this.scale.width) {
            this.player.x = 0
        }

        this.highestY = Math.min(this.highestY, this.player.y) // calculate altitude

        this.score = Math.max(0, Math.floor((500 - this.highestY) / 10))
        this.scoreText.setText(`Altitude: ${this.score}m`)

        this.generatePlatforms()

        this.platforms.getChildren().slice().forEach((platform) => {
            if (platform && platform.y > this.cameras.main.scrollY + this.scale.height + 100) {
                platform.destroy() // remove platforms that are below the camera -> better performance hopefully
            }
        })

        if (this.player.y > this.cameras.main.scrollY + this.scale.height + 100) {
            this.endGame() // check if player has fallen off lol
        }
    }

    endGame() {
        this.gameOver = true;
        this.physics.pause();
        this.gameOverText.setText(`Game Over!\n\nYour altitude was: ${this.score}m!`)
        this.gameOverText.setVisible(true)
    }
}