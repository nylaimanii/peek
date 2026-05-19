# AGENTS.md

## about peek

peek is an interactive web app that teaches mechanistic interpretability. users train a tiny neural network in the browser, then explore what it learned through three views:

1. **flow view** — trace a single data point through the network, watch which neurons activate
2. **circuit view** — see attribution + ablate neurons to test causal importance
3. **feature view** — decompose hidden activations with a sparse autoencoder, see clean monosemantic features

a guided 8-chapter tour walks users from "what's a neural net" to "i understand attribution graphs" in ~20 minutes.

## stack

next.js 16 (app router), typescript, tailwind v4, tensorflow.js, react flow, d3, framer motion, zustand. mdx for the guided tour (later).

## conventions

- typescript strict mode, prefer explicit types over `any`
- functional components with hooks
- tailwind utility classes, no css modules
- design language: soft pastel palette (defined in tailwind config)
- comments aimed at a CS student learning ML — explain *why*, not just *what*

## current build phase

scaffolding (steps 1-6 of a 30-step build). do not add features outside the current step without asking.
