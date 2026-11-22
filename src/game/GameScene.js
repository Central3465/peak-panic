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
        this.mobileLeft = false
        this.mobileRight = false
        this.scoreSubmitted = false
        this.magnetActive = false
        this.magnetEndTime = 0
        this.shieldActive = false
        this.isPaused = false

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

        this.physics.add.overlap(this.player, this.powerUps, this.collectPowerUp, null, this)
        
        this.cursors = this.input.keyboard.createCursorKeys()
        this.keys = this.input.keyboard.addKeys({ up: Phaser.Input.Keyboard.KeyCodes.W, down: Phaser.Input.Keyboard.KeyCodes.S, left: Phaser.Input.Keyboard.KeyCodes.A, right: Phaser.Input.Keyboard.KeyCodes.D })
        this.isMobile = this.sys.game.device.input.touch
        this.pauseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P)
        this.escapeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
        
        this.cameras.main.setBounds(0, -100000, width, 101000) // x y width height for cam
        this.cameras.main.stopFollow()
        this.cameras.main.setScroll(0, 0)
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1) // no offset
        this.cameras.main.setDeadzone(0, 180) // width height

        this.generatePlatforms()
        this.springBoost = false

        this.powerUpText = this.add.text(16, 178, "", { fontSize: "17px",fontFamily: "Terra, monospace", color: "#2acdee", fontStyle: "bold", stroke: "#17324d", strokeThickness: 3})
        this.powerUpText.setScrollFactor(0)
        this.powerUpText.setDepth(10)

        this.scoreText = this.add.text(16, 12, "Altitude: 0m", { fontSize: "24px",fontFamily: "Terra, monospace", color: "#17324d", fontStyle: "bold"})
        this.scoreText.setScrollFactor(0)
        this.scoreText.setDepth(10)

        this.peachText = this.add.text(17, 88, "Peaches: 0", { fontSize: "20px",fontFamily: "Terra, monospace", color: "#ffffff", fontStyle: "bold", stroke: "#17324d", strokeThickness: 3})
        this.peachText.setScrollFactor(0)
        this.peachText.setDepth(10)
        
        this.gameOverText = this.add.text(width / 2, height / 2, "Game over!", { fontSize: "26px", fontFamily: "Terra, monospace", color: "#ffffff", align: "center", backgroundColor: "#17324d", padding: {x: 16, y: 16}})
        this.gameOverText.setOrigin(0.5)
        this.gameOverText.setScrollFactor(0)
        this.gameOverText.setVisible(false)
        this.gameOverText.setDepth(20)

        this.restartText = this.add.text(width / 2, height / 2 + 100, "Play Again", { fontSize: "18px", fontFamily: "Terra, monospace", color: "#ffffff", backgroundColor: "#426b45", padding: { x: 14, y: 10}})
        this.restartText.setOrigin(0.5)
        this.restartText.setScrollFactor(0)
        this.restartText.setVisible(false)
        this.restartText.setDepth(21)
        this.restartText.setInteractive({ useHandCursor: true})
        this.restartText.on("pointerdown", () => {
            this.scene.restart()
        })

        this.checkpointText = this.add.text(16, 124, "Checkpoint: none reached", { fontSize: "16px",fontFamily: "Terra, monospace", color: "#ffffff", stroke: "#17324d", strokeThickness: 3})
        this.checkpointText.setScrollFactor(0)
        this.checkpointText.setDepth(10)

        this.notificationText = this.add.text(width / 2, 150, "", { fontSize: "20px", fontFamily: "Terra, monospace", fontStyle: "bold", color: "#22c55e", stroke: "#17324d", strokeThickness: 4})
        this.notificationText.setOrigin(0.5)
        this.notificationText.setScrollFactor(0)
        this.notificationText.setDepth(15)
        this.notificationText.setVisible(false)

        this.zoneText = this.add.text(16, 150, "Zone: Foothills", { fontSize: "16px",fontFamily: "Terra, monospace", color: "#ffffff", stroke: "#17324d", strokeThickness: 3})
        this.zoneText.setScrollFactor(0)
        this.zoneText.setDepth(10)

        this.submissionText = this.add.text(this.scale.width/2, this.scale.height-35, "", { fontSize: "13px", fontFamily: "Terra, monospace", color: "#ffffff", stroke: "#17324d", strokeThickness: 3})
        this.submissionText.setOrigin(0.5)
        this.submissionText.setScrollFactor(0)
        this.submissionText.setDepth(25)
        this.submissionText.setVisible(false)

        this.abilityText = this.add.text(16, 204, "", { fontSize: "16px",fontFamily: "Terra, monospace", color: "#ffffff", stroke: "#17324d", strokeThickness: 3})
        this.abilityText.setScrollFactor(0)
        this.abilityText.setDepth(10)

        this.input.addPointer(1) // for simultaneous two thumb touches
        this.createMobileControls()

        this.pauseOverlay = this.add.container(0,0)
        this.pauseOverlay.setScrollFactor(0)
        this.pauseOverlay.setDepth(100)
        this.pauseOverlay.setVisible(false)

        const shade = this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.75)
        shade.setScrollFactor(0)

        const pausedTitle = this.add.text(width/2, height/2 - 150, "Game Paused", { fontSize: "36px", fontFamily: "Terra, monospace", color: "#facc15", fontStyle: "bold"}).setOrigin(0.5)
        pausedTitle.setScrollFactor(0)

        this.pauseOverlay.add([shade, pausedTitle])

        this.createPauseButton(width/2, height/2-45, "Resume", () => {this.resumeGame()})

        this.createPauseButton(width/2, height / 2 + 25, "Restart", () => {this.scene.restart()})

        this.createPauseButton(width/2, height / 2 + 95, "Main Menu", () => {this.scene.start("MenuScene")})

        this.pauseButton = this.add.text(width-18, 18, "⏸️", { fontSize: "28px", fontFamily: "Terra, monospace", color: "#ffffff", backgroundColor: "#17324d", padding: {x:12, y:8}})
        this.pauseButton.setOrigin(1,0)
        this.pauseButton.setScrollFactor(0)
        this.pauseButton.setDepth(30)
        this.pauseButton.setInteractive({useHandCursor: true})
        this.pauseButton.on("pointerdown", () => {
            this.pauseGame()
        })
    }

    createPauseButton(x, y, label, callback) {
        const button = this.add.text(x, y, `${label}`, { fontSize: "20px", fontFamily: "Terra, monospace", color: "#ffffff", backgroundColor: "#334155", padding: { x: 18, y:12}})

        button.setOrigin(0.5)
        button.setScrollFactor(0) // container scrollFactor doesn't transfer to children
        button.setInteractive({useHandCursor: true})
        button.on("pointerdown", callback)
        button.on("pointerover", () => {button.setColor("#facc15")})
        button.on("pointerout", () => {button.setColor("#ffffff")})

        this.pauseOverlay.add(button)
    }

    pauseGame() {
        if (this.gameOver || this.isPaused) return

        this.isPaused = true

        this.physics.pause()
        this.time.paused = true

        this.pauseOverlay.setVisible(true)
    }

    resumeGame() {
        if (!this.isPaused) return

        this.isPaused = false

        this.pauseOverlay.setVisible(false)

        this.time.paused = false
        this.physics.resume()
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
            if (Math.random() < 0.06) {
                this.createMagnet(x, this.nextPlatformY - 45)
            }

            if (Math.random() < 0.04) {
                this.createShield(x, this.nextPlatformY - 45)
            }
            this.nextPlatformY -= gap;
        }
    }

    update() {
        if (this.gameOver || this.isPaused) return

        if (Phaser.Input.Keyboard.JustDown(this.pauseKey) || Phaser.Input.Keyboard.JustDown(this.escapeKey)) {
            this.pauseGame()
            return
        }

        const speed = 260

        const movingLeft = this.cursors.left.isDown || this.keys.left.isDown || this.mobileLeft
        const movingRight = this.cursors.right.isDown || this.keys.right.isDown || this.mobileRight
        if (movingLeft && !movingRight) {
            this.player.setVelocityX(-speed)
        } else if (movingRight && !movingLeft) {
            this.player.setVelocityX(speed)
        } else {
            this.player.setVelocityX(0)
        }

        if (this.player.x < 0) {
            this.player.x = this.scale.width
        } else if (this.player.x > this.scale.width) {
            this.player.x = 0
        }

        this.highestY = Math.min(this.highestY, this.player.y) // calculate altitude

        const totalScore = this.score + this.peachCount * 50

        this.score = Math.max(0, Math.floor((500 - this.highestY) / 10))
        this.updateMountainZone()
        this.scoreText.setText(`Altitude: ${this.score}m\nScore: ${totalScore}`)

        this.updateMagnet()

        const magnetSeconds = this.magnetActive ? Math.max(0, Math.ceil((this.magnetEndTime - this.time.now) / 1000)) : 0
        this.abilityText.setText([this.shieldActive ? "Shield: Active" : "", this.magnetActive ? `Magnet: ${magnetSeconds}s` : ""].filter(Boolean).join("\n"))

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

        if (this.shieldActive) {
            this.shieldActive = false

            this.notificationText.setText("The shield saved your life!")
            this.notificationText.setVisible(true)

            this.time.delayedCall(1500, () => {
                this.notificationText.setVisible(false)
            })

            return
        }

        this.endGame()
    }

    showRockWarning(x) {
        const warning = this.add.text(x, 90, "!", { fontSize: "32px", fontFamily: "Terra, monospace", color: "#ef4444", fontStyle: "bold"})

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

    collectPowerUp(player, powerUp) {
        const type = powerUp.getData("type") || "spring"

        powerUp.destroy()

        if (type === "spring") {
            this.springBoost = true
            this.powerUpText.setText("Spring boost ready!")
        } 

        if (type === "magnet") {
            this.magnetActive = true
            this.magnetEndTime = this.time.now + 8000
        }

        if (type === "shield") {
            this.shieldActive = true
        }
    }

    createMagnet(x, y) {
        const magnet = this.add.circle(x, y, 12, 0x3b82f6)

        this.physics.add.existing(magnet)

        magnet.body.setAllowGravity(false)
        magnet.body.setImmovable(true)

        magnet.setData("type", "magnet")
        this.powerUps.add(magnet)
    }

    updateMagnet() {
        if (!this.magnetActive) return

        if (this.time.now >= this.magnetEndTime) {
            this.magnetActive = false
            return
        }

        for (const peach of this.peaches.getChildren()) {
            const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, peach.x, peach.y)

            if (distance < 180) {
                const angle = Phaser.Math.Angle.Between(peach.x, peach.y, this.player.x, this.player.y,)

                peach.x += Math.cos(angle) * 5
                peach.y += Math.sin(angle) * 5

                peach.body.updateFromGameObject()
            }
        }
    }

    createShield(x, y) {
        const shield = this.add.circle(x, y, 12, 0x22c55e)

        this.physics.add.existing(shield)

        shield.body.setAllowGravity(false)
        shield.body.setImmovable(true)

        shield.setData("type", "shield")
        this.powerUps.add(shield)
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

    // i want to add image backgrounds for the different zones but static colours will do for now
    updateMountainZone() {
        let zone
        let background

        if (this.score < 500) {
            zone = "Foothills" // i think that's what you call it the bottom
            background = "#9bd8ed"
        } else if (this.score < 1500) {
            zone = "Alpine" // according to google this means above the tree line
            background = "#7eb9dc"
        } else if (this.score < 3000) {
            zone = "Snowline"
            background = "#426b91"
        } else {
            zone = "Summit"
            background = "#594b78"
        }

        if (zone !== this.currentZone) {
            this.currentZone = zone
            this.cameras.main.setBackgroundColor(background)
            this.zoneText.setText(`Zone: ${zone}`)
        }
    }

    createMobileControls() {
        if (!this.isMobile) return

        const { width, height } = this.scale

        this.mobileLeft = false
        this.mobileRight = false

        this.leftButton = this.add.circle(75, height-85, 48, 0x17324d, 0.65)

        this.leftButton.setScrollFactor(0)
        this.leftButton.setDepth(30)
        this.leftButton.setInteractive()

        this.leftArrow = this.add.text(75, height-85, "◀️", { fontSize: "38px", color: "#ffffff"})
        this.leftArrow.setOrigin(0.5)
        this.leftArrow.setScrollFactor(0)
        this.leftArrow.setDepth(31)

        this.rightButton = this.add.circle(width-75, height-85, 48, 0x17324d, 0.65)

        this.rightButton.setScrollFactor(0)
        this.rightButton.setDepth(30)
        this.rightButton.setInteractive()

        this.rightArrow = this.add.text(width-75, height-85, "▶️", { fontSize: "38px", color: "#ffffff"})
        this.rightArrow.setOrigin(0.5)
        this.rightArrow.setScrollFactor(0)
        this.rightArrow.setDepth(31)

        this.leftButton.on("pointerdown", () => {this.mobileLeft = true})
        this.leftButton.on("pointerup", () => {this.mobileLeft = false})
        this.leftButton.on("pointerout", () => {this.mobileLeft = false})
        this.leftButton.on("pointerupoutside", () => {this.mobileLeft = false})

        this.rightButton.on("pointerdown", () => {this.mobileRight = true})
        this.rightButton.on("pointerup", () => {this.mobileRight = false})
        this.rightButton.on("pointerout", () => {this.mobileRight = false})
        this.rightButton.on("pointerupoutside", () => {this.mobileRight  = false})
    }

    async submitScore() {
        if (this.scoreSubmitted) return

        this.scoreSubmitted = true

        const username = localStorage.getItem("username")

        if (!username) {
            this.submissionText.setText("No username found")
            this.submissionText.setVisible(true)
            return
        }

        const finalScore = this.score + this.peachCount * 50

        this.submissionText.setText("Submitting score...")
        this.submissionText.setVisible(true)

        try {
            const response = await fetch("/api/scores", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({username, score: finalScore, altitude: this.score, peaches: this.peachCount})
            })

            // a 502 from the proxy has an invalid body, so don't assume JSON
            const data = await response.json().catch(() => ({}))

            if (!response.ok) {
                throw new Error(data.error || `score submission failed (HTTP ${response.status})`)
            }

            this.submissionText.setText("Score submitted successfully!")

            this.submissionText.setColor("#4ade80")
        } catch (error) {
            console.error("error submitting score", error)
            this.submissionText.setText("Score submission failed, if this fails after trying again, open an issue")
            this.submissionText.setColor("#f87171")
        }
    }

    endGame() {
        if (this.gameOver) return
        this.gameOver = true;
        this.physics.pause();
        this.gameOverText.setText(`Game Over!\n\n` + `Altitude: ${this.score}m\n` + `Peaches: ${this.peachCount}\n` + `Final Score: ${this.score + this.peachCount * 50}\n\n`)
        this.gameOverText.setVisible(true)
        this.restartText.setVisible(true)
        this.mobileLeft = false
        this.mobileRight = false
        this.submitScore()
    }
}