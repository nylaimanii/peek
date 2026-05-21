# peek

peek inside a neural network.

most tools show you a neural net *learning*. peek shows you what it actually *learned*. train a tiny network in your browser, then poke around inside it — watch a single data point flow through the neurons, hover any neuron to see what it detects, untangle which connections matter. it's tensorflow playground for the mechanistic interpretability era, in pastel.

no install, no setup, no phd. just open it and start clicking.

**live:** [peek-two.vercel.app](https://peek-two.vercel.app)

## what you can do

- **train a net** on 9 datasets — the classics (circles, xor, gaussian, spiral) plus weirder ones (moons, rings, checkerboard, stripes, eye)
- **build the architecture** layer by layer — add/remove layers, set each layer's neuron count independently, pick the activation
- **engineer features** — toggle x², xy, sin inputs on and watch a tiny net that *couldn't* learn the spiral suddenly nail it (the classic "features vs depth" lesson, live)
- **watch it decide** — a soft heatmap behind the data shows what the network predicts everywhere, morphing as it trains
- **flow view** — click any data point and watch it light up the neurons it activates, layer by layer
- **per-neuron x-ray** — hover any neuron to see the exact region of space it responds to. early neurons make simple cuts; deep neurons bend into the full shape. that's the "edges → curves → objects" idea you read about in interpretability papers, except you can just hover and see it
- **weighted wiring** — after training, the connections color + thicken by their learned weights so you can see what the net leans on

## why

mechanistic interpretability — figuring out what's actually happening inside neural nets — is one of the most important things going on in AI right now. but the tools to learn it are mostly dense research notebooks. tensorflow playground (2016) is still how most people learn neural nets visually, and it predates basically all of this. peek is an attempt at the missing middle: something you can poke at for 20 minutes and walk away actually understanding what a neuron does.

## stack

next.js 16 · typescript · tailwind v4 · tensorflow.js (trains entirely in your browser, no backend) · react flow · d3 · zustand · deployed on vercel

## running it locally

```bash
npm install
npm run dev
```

opens at http://localhost:3000

## status

v1 — the playground + interpretability views are live and working. next up: sparse autoencoders (untangling what neurons mix together) and a guided tour that walks you through it all.

built solo by [nyla](https://github.com/nylaimanii).

## license

MIT
