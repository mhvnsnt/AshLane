# Where Ash Lane is

Mobile game. TanStack Start and Three.js. Not C++. Not Godot. Do not rewrite the engine.

The city is one walkable lane. Jobs start in the district named on the card, not on the plaza, unless the card says the plaza. Only the pier job "They come back" sends a second crew. Campaign save key is `ashlane-campaign-v2`.

Named street fighters live in `src/game3d/ward.ts`. The pause list is the other-book cast in `src/game3d/roster.ts`.

Kenney City Kit (Commercial) buildings are CC0 and sit in `public/models/kenney/`. They are shells you walk around. The rooms you enter are the ring, cage, subway, crane roof, and back room, built in `sim.ts`.

Do not import Schwarzerblitz stages, characters, or music. Those assets are all rights reserved. GPL engines (OpenBOR, some Godot games) must not be copied into this closed game. MIT, BSD, Apache, and CC0 only.

The shopping cart mesh is `public/models/gen/cart.glb`, generated without Tripo. It has a steel material applied in `view.ts` because the file had no UVs.

Kenney nature grass, trees, a fence, a rock, a dog, and a cat are CC0 and sit in the yard, the pier, and the market. A sword and a spear from the Kenney mini-arena kit can be picked up with Use. They swing with the pipe rules: the spear reaches farther, the blade cuts a little harder. They are not guns.

Do not retarget a foreign skeleton onto these fighters. That is what caused the T-pose. New attacks have to be clips that already match the rig in the lane, or they stay out.

