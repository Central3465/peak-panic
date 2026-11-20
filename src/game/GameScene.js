import Phaser from "phaser";

export default class GameScene extends Phaser.Scene {
    constructor() {
        super("GameScene");

        this.score = 0
        this.highestY = 500
        this.nextPlatformY = 450
        this.gameOver = false
        this.peachCount = 0 // 🍑 i love peaches
        this.lastPlatformX = 0
        this.hazards = null
        this.nextHazardTime = 0
        this.currentCheckpoint = 0
        this.nextCheckpointAltitude = 500
        this.checkpoints = []
        this.currentZone = null
    }

    create() {
        const { width, height } = this.scale
        
        // reset all states should hopefully fix the error when restarting the game
        this.physics.resume()
        this.score = 0
        this.peachCount = 0
        this.highestY = 500
        this.nextPlatformY = 450
        this.lastPlatformX = width / 2
        this.gameOver = false
        this.springBoost = false
        this.nextHazardTime = 0
        this.currentCheckpoint = 0
        this.nextCheckpointAltitude = 500
        this.checkpoints = []
        this.currentZone = null

        this.cameras.main.setBackgroundColor("#9bd8ed")

        this.platforms = this.physics.add.staticGroup()

        this.peaches = this.physics.add.group({ allowGravity: true, immovable: true})

        this.hazards = this.physics.add.group() // rocks

        this.powerUps = this.physics.add.group({ allowGravity: true, immovable: true })

        this.createPlatform(width / 2, 500)

        this.createPlayerTexture()

        this.player = this.physics.add.sprite(width / 2, 500, "climber")

        this.physics.add.existing(this.player)

        this.player.setScale(2)
        this.player.body.setSize(12, 18)
        this.player.setCollideWorldBounds(false)
        this.player.body.setGravityY(900)
        this.player.body.setVelocityY(-500)

        this.physics.add.collider(this.player, this.platforms, this.bounce, (player) => player.body.velocity.y > 0, this) // callback

        this.physics.add.overlap(this.player, this.peaches, this.collectPeach, null, this) // for player to collect peaches

        this.physics.add.overlap(this.player, this.hazards, this.hitRock, null, this)

        this.physics.add.overlap(this.player, this.powerUps, this.collectSpring, null, this)
        
        this.cursors = this.input.keyboard.createCursorKeys()
        this.keys = this.input.keyboard.addKeys({ up: Phaser.Input.Keyboard.KeyCodes.W, down: Phaser.Input.Keyboard.KeyCodes.S, left: Phaser.Input.Keyboard.KeyCodes.A, right: Phaser.Input.Keyboard.KeyCodes.D })
        
        this.cameras.main.setBounds(0, -100000, width, 101000) // x y width height for cam
        this.cameras.main.stopFollow()
        this.cameras.main.setScroll(0, 0)
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1) // no offset
        this.cameras.main.setDeadzone(0, 180) // width height

        this.generatePlatforms()
        this.springBoost = false

        this.powerUpText = this.add.text(16, 76, "", { fontSize: "14px", fontFamily: "monospace", color: "#2acdee", fontStyle: "bold", stroke: "#17324d", strokeThickness: 3})
        this.powerUpText.setScrollFactor(0)
        this.powerUpText.setDepth(10)

        this.scoreText = this.add.text(16, 16, "Altitude: 0m", { fontSize: "20px", fontFamily: "monospace", color: "#17324d", fontStyle: "bold"})
        this.scoreText.setScrollFactor(0)
        this.scoreText.setDepth(10)

        this.peachText = this.add.text(16, 48, "Peaches: 0", { fontSize: "16px", fontFamily: "monospace", color: "#ffffff", fontStyle: "bold", stroke: "#17324d", strokeThickness: 3})
        this.peachText.setScrollFactor(0)
        this.peachText.setDepth(10)
        
        this.gameOverText = this.add.text(width / 2, height / 2, "Game over!", { fontSize: "26px", fontFamily: "monospace", color: "#ffffff", align: "center", backgroundColor: "#17324d", padding: {x: 16, y: 16}})
        this.gameOverText.setOrigin(0.5)
        this.gameOverText.setScrollFactor(0)
        this.gameOverText.setVisible(false)
        this.gameOverText.setDepth(20)

        this.restartText = this.add.text(width / 2, height / 2 + 100, "Play Again", { fontSize: "18px", fontFamily: "monospace", color: "#ffffff", backgroundColor: "#426b45", padding: { x: 14, y: 10}})
        this.restartText.setOrigin(0.5)
        this.restartText.setScrollFactor(0)
        this.restartText.setVisible(false)
        this.restartText.setDepth(21)
        this.restartText.setInteractive({ useHandCursor: true})
        this.restartText.on("pointerdown", () => {
            this.scene.restart()
        })

        this.checkpointText = this.add.text(16, 104, "Checkpoint: none reached", { fontSize: "13px", fontFamily: "monospace", color: "#ffffff", stroke: "#17324d", strokeThickness: 3})
        this.checkpointText.setScrollFactor(0)
        this.checkpointText.setDepth(10)

        this.notificationText = this.add.text(width / 2, 150, "", { fontSize: "20px", fontFamily: "monospace", fontStyle: "bold", color: "#22c55e", stroke: "#17324d", strokeThickness: 4})
        this.notificationText.setOrigin(0.5)
        this.notificationText.setScrollFactor(0)
        this.notificationText.setDepth(15)
        this.notificationText.setVisible(false)
    }

    createPlatform(x, y, width = 90) {
        const platform = this.add.rectangle(x, y, width, 14, 0x426b45) // ohhh the color is hex

        this.physics.add.existing(platform, true)
        this.platforms.add(platform)

        this.lastPlatformX = x

        return platform
    }

    bounce(player, platform) {
        if (player.body.velocity.y > 0) {
            if (this.springBoost) {
                player.body.setVelocityY(-750)
                this.springBoost = false
                this.powerUpText.setText("")
            } else {
                player.body.setVelocityY(-500)
            }
        }
    }

    generatePlatforms() {
        const width = this.scale.width
        const cameraTop = this.cameras.main.scrollY - 900
        while (this.nextPlatformY > cameraTop) {
            const difficulty = Math.min(this.score / 1000, 1)
            const platformWidth = Math.max(58, 90 - Math.floor(difficulty * 25))
            const gap = Phaser.Math.Between(85, 100 + Math.floor(difficulty * 12)) // make platforms narrow so game is harder
            const maxShift = 110 + Math.floor(difficulty * 30) 
            const x = Phaser.Math.Clamp(this.lastPlatformX + Phaser.Math.Between(-maxShift, maxShift), 55, width - 55)
            this.createPlatform(x, this.nextPlatformY, platformWidth)
            const platformAltitude = Math.max(0, Math.floor((500-this.nextPlatformY) / 10))
            if (platformAltitude >= this.nextCheckpointAltitude) {
                this.createCheckpoint(x, this.nextPlatformY - 35, this.nextCheckpointAltitude)
                this.nextCheckpointAltitude += 500
            }
            if (Math.random() < 0.75) {
                this.createPeach(x, this.nextPlatformY - 30)
            }
            if (Math.random() < 0.15) {
                this.createSpring(x, this.nextPlatformY + 35)
            }
            this.nextPlatformY -= gap;
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

        const totalScore = this.score + this.peachCount * 50

        this.score = Math.max(0, Math.floor((500 - this.highestY) / 10))
        this.scoreText.setText(`Altitude: ${this.score}m\nScore: ${totalScore}`)

        this.generatePlatforms()

        this.platforms.getChildren().slice().forEach((platform) => {
            if (platform && platform.y > this.cameras.main.scrollY + this.scale.height + 100) {
                platform.destroy() // remove platforms that are below the camera -> better performance hopefully
            }
        })

        if (this.time.now > this.nextHazardTime) {
            if (Math.random() < 0.35) {
                this.createRock()
            }

            this.nextHazardTime = this.time.now + Phaser.Math.Between(1800, 3500)
        }

        const cameraBottom = this.cameras.main.scrollY + this.scale.height + 100
        for (const rock of this.hazards.getChildren().slice()) {
            if (rock.y > cameraBottom) {
                this.hazards.remove(rock, true, true)
            }
        }

        for (const checkpoint of this.checkpoints.slice()) {
            if (checkpoint.y > cameraBottom) {
                checkpoint.decoration.destroy()
                checkpoint.destroy()
                this.checkpoints = this.checkpoints.filter(item=> item !== checkpoint)
            }
        }

        this.peaches.getChildren().slice().forEach((peach) => {
            if (peach && peach.y > this.cameras.main.scrollY + this.scale.height + 100) {
                peach.destroy()
            }
        })

        if (this.player.y > this.cameras.main.scrollY + this.scale.height + 100) {
            this.endGame() // check if player has fallen off lol
        }
    }

    createPlayerTexture() {
        if (this.textures.exists("climber")) return

        const graphics = this.make.graphics({ x: 0, y:0, add: false})

        graphics.fillStyle(0x292524)
        graphics.fillRect(4, 0, 8, 3)
        graphics.fillStyle(0xf2bd91)
        graphics.fillRect(4, 3, 8, 6)
        graphics.fillStyle(0xdc4444)
        graphics.fillRect(3, 9, 10, 6)
        graphics.fillStyle(0xf2bd91)
        graphics.fillRect(0, 9, 3, 5)
        graphics.fillRect(13, 9, 3, 5)
        graphics.fillStyle(0x334155)
        graphics.fillRect(4, 15, 4, 3)
        graphics.fillRect(9, 15, 4, 3)
        graphics.fillStyle(0x292524)
        graphics.fillRect(3, 18, 5, 2)
        graphics.fillRect(9, 18, 5, 2)

        graphics.generateTexture("climber", 16, 20)
        graphics.destroy()
    }

    createRock() {
        const x = Phaser.Math.Between(35, this.scale.width - 35)
        const y = this.cameras.main.scrollY - 80
        this.showRockWarning(x)
        const rock = this.add.rectangle(x, y, 24, 24, 0x64748b)

        this.physics.add.existing(rock, false)

        this.hazards.add(rock)

        rock.body.setAllowGravity(false)
        rock.body.setImmovable(false)
        rock.body.setVelocity(0, 250)
        rock.body.setCollideWorldBounds(false)
    }

    hitRock(player, rock) {
        if (this.gameOver) return

        this.hazards.remove(rock, true, true)

        this.endGame()
    }

    showRockWarning(x) {
        const warning = this.add.text(x, 90, "!", { fontSize: "32px", fontFamily: "monospace", color: "#ef4444", fontStyle: "bold"})

        warning.setOrigin(0.5)
        warning.setScrollFactor(0)
        warning.setDepth(15)

        this.time.delayedCall(700, () => {
            warning.destroy()
        })
    }

    createPeach(x, y) {
        const peach = this.add.circle(x, y, 9, 0xffa34d)

        this.physics.add.existing(peach)

        peach.body.setAllowGravity(false)
        peach.body.setImmovable(true)

        this.peaches.add(peach)
    }

    collectPeach(player, peach) {
        peach.destroy()

        this.peachCount++

        this.peachText.setText(`PEACHES: ${this.peachCount}`)
    }

    createSpring(x, y) {
        const spring = this.add.rectangle(x, y, 20, 20, 0xfacc15)

        this.physics.add.existing(spring)

        spring.body.setAllowGravity(false)
        spring.body.setImmovable(true)

        this.powerUps.add(spring)
    }

    collectSpring(player, spring) {
        spring.destroy()

        this.springBoost = true

        this.powerUpText.setText("Spring Boost READY!\nYou can jump higher!")
    }

    createCheckpoint(x, y, altitude) {
        const checkpoint = this.add.rectangle(x, y, 36, 40, 0xfacc15, 0.15)

        this.physics.add.existing(checkpoint, true)

        checkpoint.setData("altitude", altitude)
        checkpoint.setData("activated", false)

        const flag = this.add.graphics()

        flag.fillStyle(0x713f12)
        flag.fillRect(x-3, y-20, 4, 40)
        flag.fillStyle(0xef4444)
        flag.fillRect(x+1, y-20, 20, 12)

        checkpoint.decoration = flag

        this.physics.add.overlap(this.player, checkpoint, () => this.reachCheckpoint(checkpoint), null, this)

        this.checkpoints.push(checkpoint)
    }

    reachCheckpoint(checkpoint) {
        if (checkpoint.getData("activated")) return

        const altitude = checkpoint.getData("altitude")

        checkpoint.setData("activated", true)
        checkpoint.body.enable = false

        this.currentCheckpoint = altitude

        checkpoint.decoration.clear()

        checkpoint.decoration.fillStyle(0x713f12)
        checkpoint.decoration.fillRect(checkpoint.x-3, checkpoint.y-20, 4, 40)
        checkpoint.decoration.fillStyle(0x22c55e)
        checkpoint.decoration.fillRect(checkpoint.x+1, checkpoint.y-20, 20, 12)

        this.checkpointText.setText(`Checkpoint: ${altitude}m`)
        this.notificationText.setText("Checkpoint reached!!")
        this.notificationText.setVisible(true)
        this.time.delayedCall(2000, () => {this.notificationText.setVisible(false)})
    }

    endGame() {
        if (this.gameOver) return
        this.gameOver = true;
        this.physics.pause();
        this.gameOverText.setText(`Game Over!\n\n` + `Altitude: ${this.score}m\n` + `Peaches: ${this.peachCount}\n` + `Final Score: ${this.score + this.peachCount * 50}\n\n`)
        this.gameOverText.setVisible(true)
        this.restartText.setVisible(true)
    }
}