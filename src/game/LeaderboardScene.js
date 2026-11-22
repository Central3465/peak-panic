import Phaser from "phaser"

export default class LeaderboardScene extends Phaser.Scene {
    constructor() {
        super("LeaderboardScene")
    }

    create() {
        const {width, height} = this.scale

        this.cameras.main.setBackgroundColor("#172033")

        this.add.text(width/2, 55, "Global Leaderboard", { fontSize: "27px", fontFamily: "Terra, monospace", fontStyle: "bold", color: "#facc15"}).setOrigin(0.5)

        this.add.text(width/2, 90, "The mountain's finest climbers", { fontSize: "10px", fontFamily: "Terra, monospace", color: "#94a3b8"}).setOrigin(0.5)

        this.statusText = this.add.text(width/2, 145, "Loading the scores...", { fontSize: "14px", fontFamily: "Terra, monospace", color: "#ffffff"}).setOrigin(0.5)

        this.entries = this.add.container(0, 0)

        this.createButton(width/2, height-115, "Refresh", () => this.loadLeaderboard())

        this.createButton(width/2, height-55, "Back to menu", () => this.scene.start("MenuScene"))

        // cancel any pending request so it can't touch destroyed objects
        this.events.once("shutdown", () => this.abortController?.abort())

        this.loadLeaderboard()
    }

    createButton(x, y, label, callback) {
        const button = this.add.text(x, y, `[${label}]`, { fontSize: "15px", fontFamily: "Terra, monospace", color: "#ffffff", backgroundColor: "#334155", padding: {x:14, y:10}})
        button.setOrigin(0.5)
        button.setInteractive({useHandCursor: true})
        button.on("pointerdown", callback)
        button.on("pointerover", () => {button.setColor("#facc15")})
        button.on("pointerout", () => {button.setColor("#ffffff")})
    }

    async loadLeaderboard() {
        // starting a new load cancels any load whilst still fetching data
        this.abortController?.abort()
        const controller = new AbortController()
        this.abortController = controller

        this.statusText.setText("Loading the scores...")
        this.entries.removeAll(true)

        try {
            const response = await fetch("/api/leaderboard?limit=10", { signal: controller.signal })

            if (!response.ok) {
                throw new Error("leaderboard request failed")
            }

            const data = await response.json()

            if (controller.signal.aborted) return

            this.entries.removeAll(true)
            data.leaderboard.forEach((player, index) => this.createEntry(player, index))

            this.statusText.setText(data.count === 0 ? "No climbers yet, be the first 😉" : "")
        } catch (error) {
            if (controller.signal.aborted) return

            console.error(error)
            this.statusText.setText("failed to load leaderboard")
        }
    }

    createEntry(player, index) {
        const width = this.scale.width

        const y = 145 + index * 42

        const colours = ["#facc15", "#cbd5e1", "#cd7f32"]

        const colour = colours[index] || "#ffffff"

        const row = this.add.rectangle(width/2, y, width-35, 34, 0x334155, 0.9)

        const rank = this.add.text(35, y, `#${index+1}`, { fontSize: "14px", fontFamily: "Terra, monospace", color: colour, fontStyle: "bold"}).setOrigin(0, 0.5)

        const username = this.add.text(85, y, player.username, { fontSize: "13px", fontFamily: "Terra, monospace", color: "#ffffff"}).setOrigin(0, 0.5)

        const score = this.add.text(width-35, y, `${player.score}`, { fontSize: "14px", fontFamily: "Terra, monospace", color: colour, fontStyle: "bold"}).setOrigin(1, 0.5)

        this.entries.add([row, rank, username, score])
    }
}