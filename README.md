# What is psychic-octo-chainsaw?

*psychic-octo-chainsaw* is just a placeholder name Github generated for me when I created this repo.

This is a vertical climbing arcade game where the only way is up!

It is a pixel-art climbing game for my Hackclub Terra Week 5 project, yayy!

The objective of the game is very simple: climb as high as possible, collect peaches along the way and avoid falling from the platforms! I added a tiny feature which makes the game harder as you go up, the platforms will get narrower. 

## Gameplay

Climb an increasingly challenging mountain using simple keyboard controls. 

### Features
- Vertical scrolling camera that actually follows you as you go up.
- Player movement using keyboard controls or arrow keys.
- Automatic bouncing when landing on the platforms.
- Platform collisions and physics!!!
- Dynamically generated platforms as you go up, they also destroy themselves if they go out of view to save performance!
- Collect peaches as you go up along the way!
- There's a 15% chance of a power up spawning on a platform which will increase your jump height!

## Controls
- Left arrow key / A = Move left
- Right arrow key / D = Move right

Jumping is automatic, so spamming the spacebar will not work. And yes, I have to figure out mobile controls soon.

## Tech Stack
- JavaScript
- Phaser 3
- Vite
- Node.js
- PostgreSQL

## Running locally
### Prerequisites
- Node.js
- npm

### Installation

Clone the repo:
```bash
git clone https://github.com/Central3465/psychic-octo-chainsaw.git
cd psychic-octo-chainsaw
```
Install dependencies:
```bash
npm install
```
Start the development server:
```bash
npm run dev
```

## Development Status

It is currently a work in progress, the initial gameplay have been completed with more mechanics, artwork, audio and online featuers planned. It is being developed as part of Hack Club Terra and will be archived in a few days. 

## License

MIT License.

## Contributing

Not encouraged, since this project is only temporary, I don't want you to waste your time writing the code and opening a PR as I might not be able to respond to you. 