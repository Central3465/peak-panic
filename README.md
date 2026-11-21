# What is Peak Panic?

It's a vertical pixel-art climbing arcade game where the only way is up. Climb up the platforms while dodging falling rocks, collecting peaches, reaching checkpoints and exploring the different levels of the mountain.

## What is this?

This is a pixel-art climbing game I built for Hackclub Terra Week 5. The core funtionality of the game is incredibly simple: climb as high as you can, collect peaches and avoid the rocks. 

Oh, and also the platforms get narrower the higher you go. 

It's a work in progress. It'll probably be archived in a few days. Unlike my other Hackclub projects, I have this sudden urge to continue this project after as it's my first ever game built with the Phaser framework. You'll find out more info about this soon 🙂.

## Gameplay

Climb an increasingly dangerous mountain using your A and D key or your left and right arrow keys, or you could play on your phone. Yes, I did spend my time making mobile support. 

### Features

- Vertical scrolling camera that actually follows you. Revolutionary, I know.
- Player movement via keyboard or arrow keys, or your phone!
- Automatic bouncing when you hit off a platform or land on one. There's no jumping controls. Spamming the spacebar (or W, that's me, idrk why) will do nothing except damaging your keyboard.
- Platform collisions and physics!!!
- Dynamically generated platforms that spawn as you climb and destroy themselves when they scroll out of view. This is called "performance optimisation" and I will be happily accepting compliments. 
- Peaches. Collect them. It's my favourite fruit. 
- Power-ups with a 15% spawn chance that increase your jump height. Gambling, but make it vertical. 
- A main menu and a restart button so pressing Ctrl+R is no longer part of your finger load. You're welcome.

## Controls

| Action | Key              |
| ------ | ---------------- |
| Left   | Left Arrow / A   |
| Right  | Right Arrow / D  |
| Jump   | It's automatic.  |

Mobile controls do exist!! Phaser will automatically detect if your device supports touch and display two buttons on either side of your screen with arrow emojis for the controls. 

I'll link a video here soon showcasing how to play, because it may be confusing, I understand that.

## Tech Stack

- JavaScript
- Phaser 3
- Vite
- Node.js
- PostgreSQL

## Running Locally

### Prerequisites

- Node.js
- npm
- A prefrontal cortex

### Installation

```bash
git clone https://github.com/Central3465/peak-panic.git
cd peak-panic
npm install
npm run dev
```

That's it. If it doesn't work, it's probably your fault (configuration error, idk copy the error and send it to chatgpt or something). In the unlikely event that ChatGPT doesn't help and the error is on my end, open an issue or a pull request if you have the fix. 

## Development Status

Work in progress. The core gameplay loop is done. More mechanics, artwork, audio and online features are planned. It's being developed as part of Hackclub Terra and might be archived in a few days, depending on my decisions.

Recent commits suggest my most recent opponent was PostgreSQL database and score saving. The fact that there's a `server/` folder now means I've made some questionable life choices.

## Contributing

Please don't submit "big" features without discussing with me first. Only open a PR if you have the code for a fix or it's a small code change, like a typo or colour change. If you're going to open a PR, ensure your code is tested and it works. If you used AI to generate the code, ensure you test it, you understand it and it works. If you used AI to generated the PR fully with no human intevention, your PR will simply be rejected. 

## Credits

- With thanks and love to Phaser, Vite and Railway for the game engine framework.

## License

MIT License. 