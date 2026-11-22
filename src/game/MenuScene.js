import Phaser from "phaser"

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super("MenuScene")
    }

    create() {
        const { width, height } = this.scale

        this.cameras.main.setBackgroundColor("#9bd8ed")

        const mountain = this.add.graphics()

        mountain.fillStyle(0xffffff)
        mountain.fillPoints([
            { x: 100, y: 400},
            { x: 240, y: 140},
            { x: 300, y: 400}
        ], true)

        mountain.fillStyle(0x7896a5)
        mountain.fillPoints([
            { x: 0, y: 500},
            { x: 140, y: 300},
            { x: 300, y: 500}
        ], true)

        this.add.text(width / 2, 140, "Peak Panic", { fontSize: "48px", fontFamily: "Terra, monospace", fontStyle: "bold", color: "#17324d", stroke: "#ffffff", strokeThickness: 5}).setOrigin(0.5)

        this.add.text(width / 2, 205, "Climb to the top!", { fontSize: "12px", fontFamily: "Terra, monospace", color: "#17324d"}).setOrigin(0.5)

        const startButton = this.add.text(width / 2, 340, "Play", { fontSize: "20px", fontFamily: "Terra, monospace", color: "#ffffff", backgroundColor: "#426b45", padding: { x: 16, y: 12}})
        const leaderboardButton = this.add.text(width/2, 410, "Global Leaderboard", { fontSize: "16px", fontFamily: "Terra, monospace", color: "#ffffff", backgroundColor: "#334155", padding: {x:14, y:10}})
        const changeNameButton = this.add.text(width/2, 465, "Change username", { fontSize: "14px", fontfamily: "Terra, monospace", color: "#ffffff", backgroundColor: "#334155", padding: {x:12,y:9}})
        const musicButton = this.add.text(width-20, 25, "Music: On", { fontSize: "12px", fontFamily: "Terra, monospace", color: "#ffffff", backgroundColor: "#334155", padding: {x: 10, y:8}})

        leaderboardButton.setOrigin(0.5)
        leaderboardButton.setInteractive({useHandCursor: true})
        startButton.setOrigin(0.5)
        startButton.setInteractive({ useHandCursor: true})
        changeNameButton.setOrigin(0.5)
        changeNameButton.setInteractive({useHandCursor: true})
        musicButton.setOrigin(1, 0)
        musicButton.setInteractive({useHandCursor: true})

        musicButton.on("pointerdown", () => {
            this.sound.mute = !this.sound.mute
            musicButton.setText(this.sound.mute ? "Music: Off" : "Music: On")
        })

        startButton.on("pointerdown", () => {
            let username = localStorage.getItem("username")

            if (!username) {
                username = window.prompt("Choose your username:")

                if (username === null) return

                username = username.trim()

                if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
                    window.alert("username must be 3-20 characters and contain only letters, numbers or underscores.")
                    return
                }

                localStorage.setItem("username", username) // yes i know that anyone can impersonate other people
            }
            this.startBackgroundMusic()
            this.scene.start("GameScene")
        })

        startButton.on("pointerover", () => {
            startButton.setScale(1.08)
        })

        startButton.on("pointerout", () => {
            startButton.setScale(1)
        })

        leaderboardButton.on("pointerdown", () => {this.scene.start("LeaderboardScene")})
        leaderboardButton.on("pointerover", () => {leaderboardButton.setColor("#facc15")})
        leaderboardButton.on("pointerout", () => {leaderboardButton.setColor("#ffffff")})

        changeNameButton.on("pointerdown", () => {
            const username = window.prompt("Enter your new username:", localStorage.getItem("username") || "")

            if (username === null) return

            const cleaned = username.trim()

            if (!/^[a-zA-Z0-9_]{3,20}$/.test(cleaned)) {
                window.alert("invalid username!")
                return
            }

            localStorage.setItem("username", cleaned)
            
            window.alert("Username updated!")
        })

        this.add.text(width / 2, height - 45, "A BAI Studio production", { fontSize: "12px", fontFamily: "Terra, monospace", color: "#17324d"}).setOrigin(0.5)
    }

    startBackgroundMusic() {
        let music = this.sound.get("background-music")

        if (!music) {
            music = this.sound.add("background-music", {
                loop: true,
                volume: 0.25
            })
        }

        if (!music.isPlaying) {
            music.play()
        }
    }

    preload() {
        this.load.audio("background-music", "/assets/audio/town.mp3")
    }
}