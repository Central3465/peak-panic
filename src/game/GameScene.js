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
    }

    create() {
        const { width, height } = this.scale

        this.cameras.main.setBackgroundColor("#9bd8ed")

        this.platforms = this.physics.add.staticGroup()

        this.peaches = this.physics.add.group({ allowGravity: true, immovable: true})

        this.hazards = this.physics.add.group({ allowGravity: false, immovable: true}) // rocks

        this.createPlatform(width / 2, 500)

        this.player = this.add.rectangle(width / 2, 500, 24, 30, 0x334155)

        this.physics.add.existing(this.player)

        this.player.body.setSize(24, 30)
        this.player.body.setCollideWorldBounds(false)
        this.player.body.setGravityY(900)
        this.player.body.setVelocityY(-500) // idk why it says it might not exist even though the tooltip has it

        this.physics.add.collider(this.player, this.platforms, this.bounce, (player) => player.body.velocity.y > 0, this) // callback

        this.physics.add.overlap(this.player, this.peaches, this.collectPeach, null, this) // for player to collect peaches

        this.physics.add.overlap(this.player, this.hazards, this.hitRock, null, this)
        
        this.cursors = this.input.keyboard.createCursorKeys()
        this.keys = this.input.keyboard.addKeys({ up: Phaser.Input.Keyboard.KeyCodes.W, down: Phaser.Input.Keyboard.KeyCodes.S, left: Phaser.Input.Keyboard.KeyCodes.A, right: Phaser.Input.Keyboard.KeyCodes.D })
        
        this.cameras.main.setBounds(0, -100000, width, 101000) // x y width height for cam
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1) // no offset
        this.cameras.main.setDeadzone(0, 180) // width height

        this.generatePlatforms()

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
            player.body.setVelocityY(-500)
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
            if (Math.random() < 0.75) {
                this.createPeach(x, this.nextPlatformY - 30)
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
        this.scoreText.setText(`Altitude: ${this.score}m\nScore: ${totalScore} peaches`)

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

        this.hazards.getChildren().slice().forEach((rock) => {
            if (rock && rock.y > this.cameras.main.scrollY + this.scale.height + 100) {
                rock.destroy()
            }
        })

        this.peaches.getChildren().slice().forEach((peach) => {
            if (peach && peach.y > this.cameras.main.scrollY + this.scale.height + 100) {
                peach.destroy()
            }
        })

        if (this.player.y > this.cameras.main.scrollY + this.scale.height + 100) {
            this.endGame() // check if player has fallen off lol
        }
    }

    createRock() {
        const x = Phaser.Math.Between(35, this.scale.width - 35)
        const y = this.cameras.main.scrollY - 80
        this.showRockWarning(x)
        const rock = this.add.rectangle(x, y, 24, 24, 0x64748b)

        this.physics.add.existing(rock)

        rock.body.setAllowGravity(false)
        rock.body.setVelocityY(220)
        rock.body.setImmovable(true)

        this.hazards.add(rock)
    }

    hitRock(player, rock) {
        rock.destroy()
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

    endGame() {
        this.gameOver = true;
        this.physics.pause();
        this.gameOverText.setText(`Game Over!\n\n` + `Altitude: ${this.score}m\n` + `Peaches: ${this.peachCount}\n` + `Final Score: ${this.score + this.peachCount * 50}\n\n` + `Refresh the page to play again!`)
        this.gameOverText.setVisible(true)
    }
}