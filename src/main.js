import Phaser from "phaser";
import GameScene from "./game/GameScene";
import MenuScene from "./game/MenuScene";
import LeaderboardScene from "./game/LeaderboardScene"
import "./style.css";

new Phaser.Game({
  type: Phaser.AUTO,
  width: 480,
  height: 720,
  parent: "game",
  backgroundColor: "#9bd8ed",
  physics: {
    default: "arcade",
    arcade: { debug: false }
  },
  scene: [MenuScene, GameScene, LeaderboardScene],
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH},
  pixelArt: true,
  roundPixels: true
})