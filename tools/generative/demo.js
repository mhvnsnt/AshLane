/**
 * demo.js — Generate sample outputs from all AshLane generative tools.
 * Usage: node demo.js [--seed N] [--out dir]
 */
import fs from "fs";
import path from "path";
import { TEXTURES } from "./svg-textures.js";
import { tag, throwup, piece, crewSet } from "./graffiti.js";
import { FRAMES } from "./ui-frames.js";
import { generateCity, asciiMap } from "./city-seed.js";

const args = process.argv.slice(2);
const seedArg = args.indexOf("--seed");
const outArg = args.indexOf("--out");
const seed = seedArg >= 0 ? Number(args[seedArg + 1]) : 7;
const out = outArg >= 0 ? args[outArg + 1] : "samples";

fs.mkdirSync(out, { recursive: true });
let count = 0;
const save = (name, content) => {
  fs.writeFileSync(path.join(out, name), content);
  count++;
};

// textures
for (const [name, gen] of Object.entries(TEXTURES)) {
  save(`${name}.svg`, gen({ seed }));
}
// graffiti
save("tag-ashlane.svg", tag("ASHLANE", { seed }));
save("tag-sombra.svg", tag("SOMBRA", { seed: seed + 1 }));
save("throwup-demo.svg", throwup("LANE KINGS", { seed: seed + 2 }));
save("piece-demo.svg", piece("ASHLANE", "est. 2026", { seed: seed + 3 }));
crewSet(["VK", "RNS", "BK"], { seed }).forEach((svg, i) => save(`crew-${i}.svg`, svg));
// ui frames
save("frame-spray.svg", FRAMES.sprayFrame({ w: 480, h: 320, seed }));
save("divider-caution.svg", FRAMES.cautionDivider({ w: 600, h: 36, text: "DO NOT CROSS", seed }));
save("divider-chain.svg", FRAMES.chainDivider({ w: 600, h: 28, seed }));
save("panel-metal.svg", FRAMES.metalPanel({ w: 480, h: 300, seed }));
save("banner-torn.svg", FRAMES.tornBanner({ w: 600, h: 90, text: "ASHLANE", seed }));
save("corners.svg", FRAMES.cornerBrackets({ w: 200, h: 200 }));
// city
const city = generateCity({ seed: `ashlane-${seed}` });
save("city.json", JSON.stringify(city, null, 2));
save("city-map.txt", asciiMap(city) + `\n\nbuildings: ${city.stats.buildings}, props: ${city.stats.props}, graffiti: ${city.stats.graffitiSpots}`);

console.log(`seed=${seed} → ${count} files in ${out}/`);
console.log(asciiMap(city));
