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
            new Phaser.Geom.Point(100, 400),
            new Phaser.Geom.Point(240, 140),
            new Phaser.Geom.Point(380, 400)
        ], true)

        mountain.fillStyle(0x7896a5)
        mountain.fillPoints([
            new Phaser.Geom.Point(0, 500),
            new Phaser.Geom.Point(150, 300),
            new Phaser.Geom.Point(300, 500)
        ], true)

        this.add.text(width / 2, 140, "Peak Panic", { fontSize: "48px", fontFamily: "monospace", fontStyle: "bold", color: "#17324d", stroke: "#ffffff", strokeThickness: 5}).setOrigin(0.5)

        this.add.text(width / 2, 205, "Climb to the top!", { fontSize: "12px", fontFamily: "monospace", color: "#17324d"}).setOrigin(0.5)

        const startButton = this.add.text(width / 2, 340, "Play", { fontSize: "20px", fontFamily: "monospace", color: "#ffffff", backgroundColor: "#426b45", padding: { x: 16, y: 12}})

        startButton.setOrigin(0.5)
        startButton.setInteractive({ useHandCusor: true})

        startButton.on("pointerdown", () => {
            this.scene.start("GameScene")
        })

        startButton.on("pointerover", () => {
            startButton.setScale(1.08)
        })

        startButton.on("pointerout", () => {
            startButton.setScale(1)
        })

        this.add.text(width / 2, height - 45, "A BAI Studio production", { fontSize: "12px", fontFamily: "monospace", color: "#17324d"}).setOrigin(0.5)
    }
}