import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { C as SRGBColorSpace, D as Vector3, E as TorusGeometry, S as RepeatWrapping, T as SphereGeometry, _ as MeshBasicMaterial, a as Box3, b as PlaneGeometry, c as Color, d as Fog, f as Group, g as Mesh, h as LoopRepeat, i as AnimationMixer, l as CylinderGeometry, m as LoopOnce, n as clone, o as BoxGeometry, p as HemisphereLight, r as WebGLRenderer, s as CanvasTexture, t as GLTFLoader, u as DirectionalLight, v as MeshLambertMaterial, w as Scene, x as PointLight, y as PerspectiveCamera } from "../_libs/three.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-B8Gj5Ltp.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var SPEC = {
	jabStartup: .07,
	crossStartup: .08,
	launchStartup: .11,
	active: .1,
	poisePlayer: 50,
	poiseGrunt: 34,
	meterCost: 45,
	dashSpeed: 14,
	jabDamage: 12,
	crossDamage: 16,
	launchDamage: 20,
	throwDamage: 14,
	enemyWindup: .36
};
var DEFAULT_TUNE = {
	moveSpeed: 6.4,
	grapple: 1.75,
	launcher: 8.6,
	wallBonus: 22,
	jumpV: 9.6,
	gravity: 28,
	hitstun: .26,
	enemySpeed: 3.35
};
var EMPTY_HUD = {
	running: false,
	paused: false,
	mode: "roam",
	hp: 100,
	maxHp: 100,
	meter: 100,
	poise: SPEC.poisePlayer,
	maxPoise: SPEC.poisePlayer,
	combo: 0,
	foes: 0,
	banner: "",
	canGrab: false,
	cleared: false,
	streetClear: false,
	scaffoldClear: false,
	plazaClear: false,
	tune: DEFAULT_TUNE
};
var STORE = "ashlane-tune-v2";
function clampNum(value, min, max, fallback) {
	if (!Number.isFinite(value)) return fallback;
	return Math.min(max, Math.max(min, value));
}
function clampTune(partial, base = DEFAULT_TUNE) {
	return {
		moveSpeed: clampNum(partial.moveSpeed ?? base.moveSpeed, 3, 10, base.moveSpeed),
		grapple: clampNum(partial.grapple ?? base.grapple, .8, 3.2, base.grapple),
		launcher: clampNum(partial.launcher ?? base.launcher, 4, 16, base.launcher),
		wallBonus: clampNum(partial.wallBonus ?? base.wallBonus, 0, 60, base.wallBonus),
		jumpV: clampNum(partial.jumpV ?? base.jumpV, 6, 14, base.jumpV),
		gravity: clampNum(partial.gravity ?? base.gravity, 14, 42, base.gravity),
		hitstun: clampNum(partial.hitstun ?? base.hitstun, .12, .55, base.hitstun),
		enemySpeed: clampNum(partial.enemySpeed ?? base.enemySpeed, 1.4, 6.5, base.enemySpeed)
	};
}
function loadTune() {
	if (typeof localStorage === "undefined") return { ...DEFAULT_TUNE };
	try {
		const raw = localStorage.getItem(STORE);
		if (!raw) return { ...DEFAULT_TUNE };
		return clampTune(JSON.parse(raw));
	} catch {
		return { ...DEFAULT_TUNE };
	}
}
function saveTune(tune) {
	try {
		localStorage.setItem(STORE, JSON.stringify(tune));
	} catch {}
}
function specDocument(mode, tune) {
	return JSON.stringify({
		mode: mode === "roam" ? "ROAM" : mode === "belt" ? "BELT" : "PLATFORM",
		note: "Ashlane rule card. Change one number, apply, then walk the same ward.",
		tune,
		fixed: SPEC
	}, null, 2);
}
function parseSpecText(raw) {
	try {
		const data = JSON.parse(raw);
		const src = data.tune ?? data;
		const tune = {};
		if (src.moveSpeed != null) tune.moveSpeed = Number(src.moveSpeed);
		if (src.grapple != null) tune.grapple = Number(src.grapple);
		if (src.launcher != null) tune.launcher = Number(src.launcher);
		if (src.wallBonus != null) tune.wallBonus = Number(src.wallBonus);
		if (src.jumpV != null) tune.jumpV = Number(src.jumpV);
		if (src.gravity != null) tune.gravity = Number(src.gravity);
		if (src.hitstun != null) tune.hitstun = Number(src.hitstun);
		if (src.enemySpeed != null) tune.enemySpeed = Number(src.enemySpeed);
		let mode;
		const label = String(data.mode ?? "").toUpperCase();
		if (label === "ROAM" || label === "OMNI" || label === "FREE" || label === "PLAZA") mode = "roam";
		else if (label === "BELT" || label === "BRAWL" || label === "STREET") mode = "belt";
		else if (label === "PLATFORM" || label === "SCAFFOLD") mode = "platform";
		return {
			ok: true,
			tune,
			mode
		};
	} catch {
		return {
			ok: false,
			error: "That spec isn't valid JSON."
		};
	}
}
var R = .42;
var NAMES = [
	"Cinder",
	"Bolt",
	"Rook",
	"Moth",
	"Vesper",
	"Kiln",
	"Ashen",
	"Piton"
];
function forward(yaw) {
	return {
		x: -Math.sin(yaw),
		z: -Math.cos(yaw)
	};
}
function yawFromDir(x, z) {
	return Math.atan2(-x, -z);
}
function approachAngle(cur, target, rate, dt) {
	return cur + Math.atan2(Math.sin(target - cur), Math.cos(target - cur)) * (1 - Math.exp(-rate * dt));
}
function box(minX, maxX, minZ, maxZ, h, kind) {
	return {
		minX,
		maxX,
		minY: 0,
		maxY: h,
		minZ,
		maxZ,
		kind
	};
}
function buildBoxes() {
	return [
		box(-26, 26, -26, -24, 3, "wall"),
		box(-26, 26, 24, 26, 3, "wall"),
		box(-26, -24, -26, 26, 3, "wall"),
		box(24, 26, -24, 24, 3, "wall"),
		box(-18, -7, -13, -5, 5.2, "wall"),
		box(7, 18, -13, -5, 6.4, "wall"),
		box(-18, -7, 5, 13, 5.6, "wall"),
		box(7, 18, 5, 13, 4.8, "wall"),
		box(4.2, 6.2, -6.2, -4.4, 1.15, "wall"),
		box(3.2, 5.1, 1.2, 3.2, 1.35, "wall"),
		box(14.2, 15.15, -23.4, -14.9, 2.8, "gate"),
		box(-22, -16.6, 16.7, 17.7, 2.15, "wall"),
		box(-13.6, 18, 16.7, 17.7, 2.15, "wall"),
		box(-22, 16.4, 21.9, 22.9, 2.4, "wall"),
		box(16.2, 17.3, 17.2, 22.4, 2.5, "wall"),
		box(-18, -14, 18.7, 21.3, 1.15, "plat"),
		box(-10.6, -6.2, 18.7, 21.3, 2.4, "plat"),
		box(-3, 1.4, 18.7, 21.3, 1.25, "plat"),
		box(4.6, 10.4, 18.7, 21.3, 2.55, "plat"),
		box(-13.5, -11.1, 19.2, 20.8, .2, "spring"),
		box(-5.7, -3.5, 19.2, 20.8, .2, "spring"),
		box(1.9, 4.1, 19.2, 20.8, .2, "spring"),
		box(12.2, 15.4, 19, 21, 2.2, "goal")
	];
}
function blankBody(sim, partial) {
	const grunt = partial.kind === "grunt";
	return {
		id: sim.nextId++,
		name: grunt ? NAMES[sim.nextId % NAMES.length] : "Ash",
		home: "plaza",
		homeX: partial.x,
		homeZ: partial.z,
		y: 0,
		vx: 0,
		vy: 0,
		vz: 0,
		yaw: 0,
		hp: grunt ? 64 : 100,
		maxHp: grunt ? 64 : 100,
		poise: grunt ? SPEC.poiseGrunt : SPEC.poisePlayer,
		meter: grunt ? 0 : 100,
		state: "free",
		stateT: 0,
		swing: 0,
		swung: false,
		queued: false,
		comboWindow: 0,
		cd: .45,
		iframe: grunt ? 0 : .7,
		grounded: true,
		alive: true,
		slam: false,
		...partial
	};
}
function prefersReduced() {
	try {
		return typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
	} catch {
		return false;
	}
}
function createSim(tune) {
	const sim = {
		mode: "roam",
		running: false,
		paused: false,
		tune: clampTune(tune ?? {}),
		bodies: [],
		boxes: buildBoxes(),
		particles: [],
		camYaw: 0,
		orbit: 0,
		hitstop: 0,
		shake: 0,
		time: 0,
		banner: "",
		bannerT: 0,
		sfx: [],
		cleared: false,
		streetClear: false,
		scaffoldClear: false,
		plazaClear: false,
		bufAtk: 0,
		bufGrab: 0,
		bufBlast: 0,
		bufJump: 0,
		prevAtk: false,
		prevGrab: false,
		prevBlast: false,
		prevJump: false,
		prevDash: false,
		reduced: prefersReduced(),
		spawnX: 0,
		spawnY: 0,
		spawnZ: 2,
		spawnYaw: 0,
		nextId: 1,
		grabId: -1,
		coyote: .12,
		springLock: 0,
		canGrab: false,
		combo: 0,
		comboT: 0,
		spinPulse: 0,
		aimX: 0,
		aimZ: 0,
		foes: 0
	};
	spawnBodies(sim);
	return sim;
}
function placePlayer(sim, mode) {
	const p = sim.bodies[0];
	if (!p) return;
	if (mode === "belt") {
		p.x = -20;
		p.z = -19;
		p.yaw = -Math.PI / 2;
	} else if (mode === "platform") {
		p.x = -21.2;
		p.z = 20;
		p.yaw = -Math.PI / 2;
	} else {
		p.x = 0;
		p.z = 2;
		p.yaw = 0;
	}
	p.y = 0;
	p.vx = 0;
	p.vy = 0;
	p.vz = 0;
	p.state = "free";
	sim.spawnX = p.x;
	sim.spawnZ = p.z;
	sim.spawnYaw = p.yaw;
	sim.camYaw = p.yaw;
	sim.orbit = 0;
}
function addGrunt(sim, x, z, y, home) {
	const g = blankBody(sim, {
		kind: "grunt",
		x,
		z,
		y,
		home,
		homeX: x,
		homeZ: z
	});
	const p = sim.bodies[0];
	g.yaw = p ? yawFromDir(p.x - g.x, p.z - g.z) : 0;
	sim.bodies.push(g);
}
function spawnBodies(sim) {
	sim.bodies = [];
	sim.grabId = -1;
	sim.cleared = false;
	sim.streetClear = false;
	sim.scaffoldClear = false;
	sim.plazaClear = false;
	sim.nextId = 1;
	sim.bodies.push(blankBody(sim, {
		kind: "player",
		x: 0,
		z: 2,
		yaw: 0,
		name: "Ash",
		home: "plaza"
	}));
	addGrunt(sim, 6, -4, 0, "plaza");
	addGrunt(sim, -8, 4, 0, "plaza");
	addGrunt(sim, 7, -1, 0, "plaza");
	addGrunt(sim, -16, -19, 0, "street");
	addGrunt(sim, -7, -18.3, 0, "street");
	addGrunt(sim, 1.5, -19.6, 0, "street");
	addGrunt(sim, 9, -18.4, 0, "street");
	addGrunt(sim, -8.4, 20, 2.4, "scaffold");
	addGrunt(sim, 7.2, 20, 2.55, "scaffold");
	placePlayer(sim, sim.mode);
	sim.foes = 9;
}
function setMode(sim, mode) {
	sim.mode = mode;
	sim.hitstop = 0;
	spawnBodies(sim);
	sim.banner = intro(mode);
	sim.bannerT = 2.4;
}
function warp(sim, mode) {
	sim.mode = mode;
	sim.hitstop = 0;
	sim.grabId = -1;
	const p = sim.bodies[0];
	if (p?.state === "grab") p.state = "free";
	for (const b of sim.bodies) if (b.state === "grab") b.state = "free";
	placePlayer(sim, mode);
	sim.banner = intro(mode);
	sim.bannerT = 1.6;
}
function intro(mode) {
	if (mode === "belt") return "Scrap street. Clear it and the gate opens.";
	if (mode === "platform") return "Coil scaffolds. Jump to the brass pylon.";
	return "Cinder ward. North is the street. South is the scaffolds.";
}
function rematch(sim) {
	const mode = sim.mode;
	spawnBodies(sim);
	sim.mode = mode;
	placePlayer(sim, mode);
	sim.banner = "Rematch";
	sim.bannerT = 1;
}
function burst(sim, x, y, z, color) {
	for (let i = 0; i < 7; i++) sim.particles.push({
		x,
		y,
		z,
		vx: (Math.random() - .5) * 6,
		vy: 1.5 + Math.random() * 4,
		vz: (Math.random() - .5) * 6,
		life: .38,
		max: .38,
		color
	});
	if (sim.particles.length > 40) sim.particles.splice(0, sim.particles.length - 40);
}
function breakGrab(sim) {
	if (sim.grabId < 0 && sim.bodies[0]?.state !== "grab") return;
	const p = sim.bodies[0];
	const e = sim.bodies.find((b) => b.id === sim.grabId);
	if (p?.state === "grab") p.state = "free";
	if (e && e.state === "grab") e.state = "hit";
	sim.grabId = -1;
}
function hurt(sim, b, dmg, poiseDmg, kx, kz, lift) {
	if (!b.alive || b.iframe > 0 || b.state === "out") return false;
	if (b.state === "grab") return false;
	b.hp -= dmg;
	b.poise -= poiseDmg;
	b.vx = kx;
	b.vz = kz;
	b.vy = Math.max(b.vy, lift);
	b.iframe = b.kind === "player" ? .38 : .14;
	sim.hitstop = Math.max(sim.hitstop, lift > 4 ? .06 : .04);
	sim.shake = Math.min(1, sim.shake + (lift > 4 ? .55 : .32));
	sim.sfx.push(b.kind === "player" ? "hurt" : "hit");
	burst(sim, b.x, b.y + 1, b.z, b.kind === "player" ? 14964526 : 15774761);
	if (b.kind === "player" && sim.grabId >= 0) breakGrab(sim);
	if (b.hp <= 0) {
		b.hp = 0;
		if (b.kind === "player") {
			b.state = "down";
			b.stateT = 1.05;
		} else {
			b.alive = false;
			b.state = "out";
			b.stateT = .7;
			sim.combo += 1;
			sim.comboT = 1.3;
		}
		return true;
	}
	if (b.poise <= 0) {
		b.poise = b.kind === "player" ? SPEC.poisePlayer : SPEC.poiseGrunt;
		b.state = "down";
		b.stateT = .85;
		sim.sfx.push("crumple");
		return true;
	}
	if (lift > 4) {
		b.state = "launch";
		b.stateT = .2;
		return true;
	}
	b.state = "hit";
	b.stateT = sim.tune.hitstun;
	return true;
}
function nearestGrunt(sim, maxDist) {
	const p = sim.bodies[0];
	let best = null;
	let bestD = maxDist;
	for (const e of sim.bodies) {
		if (e.kind !== "grunt" || !e.alive || e.state === "out" || e.state === "down" || e.state === "grab") continue;
		if (e.y > p.y + 1.3 || Math.abs(e.y - p.y) > 1.2) continue;
		const d = Math.hypot(e.x - p.x, e.z - p.z);
		if (d <= bestD) {
			best = e;
			bestD = d;
		}
	}
	return best;
}
function hitGrunts(sim, hx, hz, radius, dmg, kb, lift, poise, dirX, dirZ) {
	const p = sim.bodies[0];
	let any = false;
	for (const e of sim.bodies) {
		if (e.kind !== "grunt" || !e.alive || e.state === "grab") continue;
		if (Math.abs(e.y + .7 - (p.y + .8)) > 1.35) continue;
		if (Math.hypot(e.x - hx, e.z - hz) > radius) continue;
		const awayX = e.x - p.x;
		const awayZ = e.z - p.z;
		const al = Math.hypot(awayX, awayZ) || 1;
		if (hurt(sim, e, dmg, poise, (dirX * .7 + awayX / al * .3) * kb, (dirZ * .7 + awayZ / al * .3) * kb, lift)) {
			any = true;
			p.meter = Math.min(100, p.meter + 8);
			sim.combo += 1;
			sim.comboT = 1.25;
		}
	}
	return any;
}
function swingDur(swing) {
	return swing === 3 ? .44 : .32;
}
function beginSwing(sim, p) {
	if (p.comboWindow > 0 || p.queued) p.swing = p.swing >= 3 ? 1 : p.swing + 1;
	else p.swing = 1;
	p.queued = false;
	p.comboWindow = 0;
	p.state = "atk";
	p.swung = false;
	p.stateT = swingDur(p.swing);
	sim.bufAtk = 0;
	sim.sfx.push("swing");
}
function startDash(sim, p) {
	let dx = sim.aimX;
	let dz = sim.aimZ;
	const m = Math.hypot(dx, dz);
	if (m < .2) {
		const f = forward(p.yaw);
		dx = f.x;
		dz = f.z;
	} else {
		dx /= m;
		dz /= m;
	}
	p.state = "dash";
	p.stateT = .16;
	p.iframe = Math.max(p.iframe, .16);
	p.vx = dx * SPEC.dashSpeed;
	p.vz = dz * SPEC.dashSpeed;
	p.yaw = yawFromDir(dx, dz);
	sim.bufGrab = 0;
	sim.sfx.push("dash");
}
function throwEnemy(sim, e) {
	const p = sim.bodies[0];
	let dx = sim.aimX;
	let dz = sim.aimZ;
	const m = Math.hypot(dx, dz);
	if (m < .25) {
		const f = forward(p.yaw);
		dx = f.x;
		dz = f.z;
	} else {
		dx /= m;
		dz /= m;
	}
	e.state = "throw";
	e.slam = true;
	e.iframe = .08;
	e.vx = dx * 12.5;
	e.vz = dz * 12.5;
	e.vy = 3.4;
	e.stateT = .48;
	e.hp -= SPEC.throwDamage;
	p.meter = Math.min(100, p.meter + 10);
	p.state = "free";
	p.iframe = Math.max(p.iframe, .12);
	sim.grabId = -1;
	sim.bufGrab = 0;
	sim.sfx.push("throw");
	if (e.hp <= 0) {
		e.hp = 0;
		e.alive = false;
		e.state = "out";
	}
}
function wallSlam(sim, b) {
	b.slam = false;
	b.hp -= sim.tune.wallBonus;
	b.vx *= -.28;
	b.vz *= -.28;
	b.vy = 4.2;
	sim.shake = Math.min(1, sim.shake + .75);
	sim.hitstop = Math.max(sim.hitstop, .07);
	sim.sfx.push("slam");
	burst(sim, b.x, b.y + .8, b.z, 15984340);
	const p = sim.bodies[0];
	if (p) p.meter = Math.min(100, p.meter + 14);
	if (b.hp <= 0) {
		b.hp = 0;
		b.alive = false;
		b.state = "out";
		b.stateT = .7;
		return;
	}
	b.poise = SPEC.poiseGrunt;
	b.state = "launch";
	b.stateT = .25;
}
function resolveXZ(sim, b) {
	let hit = false;
	for (const box of sim.boxes) {
		if (box.kind === "spring" || box.kind === "goal" || box.kind === "plat") continue;
		if (box.kind === "gate" && sim.streetClear) continue;
		if (b.y >= box.maxY - .08) continue;
		if (b.y + 1.45 < box.minY) continue;
		const cx = Math.min(Math.max(b.x, box.minX), box.maxX);
		const cz = Math.min(Math.max(b.z, box.minZ), box.maxZ);
		let dx = b.x - cx;
		let dz = b.z - cz;
		let d2 = dx * dx + dz * dz;
		if (d2 >= R * R) continue;
		hit = true;
		if (d2 < 1e-6) {
			dx = 1;
			dz = 0;
			d2 = 1;
		}
		const d = Math.sqrt(d2);
		const push = (R - d) / d;
		b.x += dx * push;
		b.z += dz * push;
		const nx = dx / d;
		const nz = dz / d;
		const vn = b.vx * nx + b.vz * nz;
		if (vn < 0) {
			b.vx -= vn * nx;
			b.vz -= vn * nz;
		}
	}
	return hit;
}
function resolveY(sim, b, prevY) {
	b.grounded = false;
	if (b.y <= 0) {
		b.y = 0;
		if (b.vy <= 0) {
			b.vy = 0;
			b.grounded = true;
		}
	}
	for (const box of sim.boxes) {
		if (box.kind !== "plat" && box.kind !== "wall" && box.kind !== "gate" && box.kind !== "goal") continue;
		if (box.kind === "gate" && sim.streetClear) continue;
		if (b.x + R <= box.minX || b.x - R >= box.maxX || b.z + R <= box.minZ || b.z - R >= box.maxZ) continue;
		if (prevY >= box.maxY - .06 && b.y < box.maxY && b.vy <= 0) {
			b.y = box.maxY;
			b.vy = 0;
			b.grounded = true;
		}
	}
}
function trySpring(sim, b) {
	if (b.kind !== "player" || sim.springLock > 0 || b.vy > .4) return;
	for (const box of sim.boxes) {
		if (box.kind !== "spring") continue;
		if (b.x < box.minX || b.x > box.maxX || b.z < box.minZ || b.z > box.maxZ) continue;
		if (b.y > .45) continue;
		b.vy = Math.max(sim.tune.launcher, sim.tune.jumpV * 1.35);
		b.grounded = false;
		if (b.state === "down" || b.state === "hit") b.state = "free";
		sim.springLock = .35;
		sim.sfx.push("spring");
		return;
	}
}
function moveBody(sim, b, dt) {
	if (!b.alive && b.state === "out") {
		b.y -= dt * .9;
		b.stateT -= dt;
		return;
	}
	const prevY = b.y;
	b.vy -= sim.tune.gravity * dt;
	b.y += b.vy * dt;
	const dist = Math.hypot(b.vx, b.vz) * dt;
	const steps = Math.max(1, Math.ceil(dist / .28));
	const h = dt / steps;
	for (let i = 0; i < steps; i++) {
		b.x += b.vx * h;
		b.z += b.vz * h;
		if (resolveXZ(sim, b) && b.state === "throw" && b.slam) {
			wallSlam(sim, b);
			break;
		}
	}
	b.x = Math.min(24.2, Math.max(-24.2, b.x));
	b.z = Math.min(24.2, Math.max(-24.2, b.z));
	resolveY(sim, b, prevY);
	if (b.kind === "player") trySpring(sim, b);
	if ((b.state === "launch" || b.state === "throw") && b.grounded) {
		b.vx *= .25;
		b.vz *= .25;
		if (!b.alive || b.hp <= 0) {
			b.state = "out";
			b.alive = false;
		} else {
			b.state = "down";
			b.stateT = b.kind === "player" ? .35 : .55;
		}
		sim.sfx.push("land");
	}
}
function steer(sim, input) {
	if (sim.mode === "roam") {
		const fX = -Math.sin(sim.camYaw);
		const fZ = -Math.cos(sim.camYaw);
		const rX = Math.cos(sim.camYaw);
		const rZ = -Math.sin(sim.camYaw);
		sim.aimX = fX * -input.y + rX * input.x;
		sim.aimZ = fZ * -input.y + rZ * input.x;
	} else {
		sim.aimX = input.x;
		sim.aimZ = input.y;
	}
	const mag = Math.hypot(sim.aimX, sim.aimZ);
	if (mag > 1) {
		sim.aimX /= mag;
		sim.aimZ /= mag;
	}
}
function applyMove(sim, p, dt, scale) {
	const mag = Math.hypot(sim.aimX, sim.aimZ);
	if (mag > .08) {
		const speed = sim.tune.moveSpeed * scale;
		const tx = sim.aimX / mag * speed;
		const tz = sim.aimZ / mag * speed;
		const k = 1 - Math.exp(-10 * dt);
		p.vx += (tx - p.vx) * k;
		p.vz += (tz - p.vz) * k;
		if (sim.mode === "roam") p.yaw = approachAngle(p.yaw, yawFromDir(sim.aimX, sim.aimZ), 14, dt);
		else if (Math.abs(sim.aimX) > .2) p.yaw = approachAngle(p.yaw, sim.aimX >= 0 ? -Math.PI / 2 : Math.PI / 2, 16, dt);
		else p.yaw = approachAngle(p.yaw, yawFromDir(sim.aimX, sim.aimZ), 12, dt);
	} else {
		const k = 1 - Math.exp(-14 * dt);
		p.vx += (0 - p.vx) * k;
		p.vz += (0 - p.vz) * k;
	}
}
function engaged(home, p) {
	if (home === "street") return p.z < -12.6;
	if (home === "scaffold") return p.z > 14.2;
	return p.z > -12.8 && p.z < 14.6;
}
function updateEnemies(sim, dt) {
	const p = sim.bodies[0];
	for (const e of sim.bodies) {
		if (e.kind !== "grunt") continue;
		e.iframe = Math.max(0, e.iframe - dt);
		e.cd = Math.max(0, e.cd - dt);
		if (!e.alive) continue;
		if (e.state === "grab" || e.state === "throw") continue;
		if (e.state === "hit" || e.state === "down") {
			e.stateT -= dt;
			e.vx *= Math.exp(-6 * dt);
			e.vz *= Math.exp(-6 * dt);
			if (e.stateT <= 0) e.state = "free";
			continue;
		}
		if (e.state === "launch") continue;
		if (e.state === "windup") {
			e.vx = 0;
			e.vz = 0;
			e.stateT -= dt;
			if (e.stateT <= 0) {
				const f = forward(e.yaw);
				e.state = "atk";
				e.stateT = .22;
				e.swung = false;
				e.vx = f.x * 5.5;
				e.vz = f.z * 5.5;
			}
			continue;
		}
		if (e.state === "atk") {
			e.stateT -= dt;
			if (!e.swung && e.stateT < .14) {
				e.swung = true;
				if (p.iframe <= 0 && p.state !== "dash" && Math.hypot(p.x - e.x, p.z - e.z) < 1.22 && Math.abs(p.y - e.y) < 1.2) {
					const f = forward(e.yaw);
					hurt(sim, p, 9, 10, f.x * 6.5, f.z * 6.5, 1.2);
				}
			}
			if (e.stateT <= 0) {
				e.state = "free";
				e.cd = .9;
			}
			continue;
		}
		if (e.state !== "free") continue;
		const hot = engaged(e.home, p);
		let ax = (hot ? p.x : e.homeX) - e.x;
		let az = (hot ? p.z : e.homeZ) - e.z;
		const d = Math.hypot(ax, az) || 1;
		if (hot && d < 1.22 && e.cd <= 0 && Math.abs(e.y - p.y) < 1.1 && p.state !== "down") {
			e.state = "windup";
			e.stateT = SPEC.enemyWindup;
			e.yaw = yawFromDir(ax, az);
			e.vx = 0;
			e.vz = 0;
			continue;
		}
		if (!hot && d < .35) {
			e.vx = 0;
			e.vz = 0;
			continue;
		}
		ax /= d;
		az /= d;
		if (hot) for (const o of sim.bodies) {
			if (o === e || o.kind !== "grunt" || !o.alive) continue;
			const ox = e.x - o.x;
			const oz = e.z - o.z;
			const od = Math.hypot(ox, oz);
			if (od < 1.15 && od > .001) {
				ax += ox / od * .85;
				az += oz / od * .85;
			}
		}
		const m = Math.hypot(ax, az) || 1;
		const sp = !hot ? sim.tune.enemySpeed * .65 : d < 1.05 ? 0 : sim.tune.enemySpeed;
		e.vx = ax / m * sp;
		e.vz = az / m * sp;
		if (sp > 0) e.yaw = approachAngle(e.yaw, yawFromDir(e.vx, e.vz), 10, dt);
	}
}
function updatePlayer(sim, dt, dashEdge) {
	const p = sim.bodies[0];
	p.iframe = Math.max(0, p.iframe - dt);
	const atk = sim.bufAtk > 0;
	const grab = sim.bufGrab > 0;
	const blast = sim.bufBlast > 0;
	const jump = sim.bufJump > 0;
	if (p.state === "down" || p.state === "hit") {
		p.stateT -= dt;
		p.vx *= Math.exp(-8 * dt);
		p.vz *= Math.exp(-8 * dt);
		if (p.stateT <= 0) {
			if (p.hp <= 0) respawn(sim);
			else p.state = "free";
		}
		return;
	}
	if (p.state === "launch") return;
	if (p.state === "dash") {
		p.stateT -= dt;
		if (p.stateT <= 0) p.state = "free";
		return;
	}
	if (p.state === "spin") {
		p.stateT -= dt;
		applyMove(sim, p, dt, .35);
		p.yaw += 12 * dt;
		sim.spinPulse -= dt;
		if (sim.spinPulse <= 0) {
			sim.spinPulse = .14;
			const f = forward(p.yaw);
			hitGrunts(sim, p.x, p.z, 2.15, 11, 7.5, 1.4, 12, f.x, f.z);
		}
		if (p.stateT <= 0) p.state = "free";
		return;
	}
	if (p.state === "grab") {
		p.vx = 0;
		p.vz = 0;
		p.stateT -= dt;
		const e = sim.bodies.find((b) => b.id === sim.grabId);
		if (!e || !e.alive) {
			sim.grabId = -1;
			p.state = "free";
			return;
		}
		if (grab) throwEnemy(sim, e);
		else if (atk) {
			sim.bufAtk = 0;
			e.hp -= 8;
			e.poise -= 7;
			p.meter = Math.min(100, p.meter + 6);
			sim.hitstop = .035;
			sim.sfx.push("hit");
			burst(sim, e.x, e.y + 1, e.z, 15774761);
			if (e.hp <= 0) {
				e.hp = 0;
				e.alive = false;
				e.state = "out";
				p.state = "free";
				sim.grabId = -1;
			}
		} else if (p.stateT <= 0) {
			e.state = "free";
			p.state = "free";
			sim.grabId = -1;
		}
		return;
	}
	if (p.state === "atk") {
		const dur = swingDur(p.swing);
		const startup = p.swing === 3 ? SPEC.launchStartup : p.swing === 2 ? SPEC.crossStartup : SPEC.jabStartup;
		const elapsed = dur - p.stateT;
		if (!p.swung && elapsed >= startup && elapsed < startup + SPEC.active) {
			p.swung = true;
			const f = forward(p.yaw);
			const lift = p.swing === 3 ? sim.tune.launcher : p.swing === 2 ? 2.4 : .2;
			const dmg = p.swing === 3 ? SPEC.launchDamage : p.swing === 2 ? SPEC.crossDamage : SPEC.jabDamage;
			const kb = p.swing === 3 ? 3.2 : p.swing === 2 ? 6.2 : 3.6;
			const poise = p.swing === 3 ? 18 : 11;
			hitGrunts(sim, p.x + f.x * .85, p.z + f.z * .85, p.swing === 3 ? .95 : .78, dmg, kb, lift, poise, f.x, f.z);
			p.vx += f.x * 2.4;
			p.vz += f.z * 2.4;
		}
		if (atk) {
			p.queued = true;
			sim.bufAtk = 0;
		}
		p.stateT -= dt;
		applyMove(sim, p, dt, .4);
		if (p.stateT <= 0) {
			if (p.queued) beginSwing(sim, p);
			else {
				p.state = "free";
				p.comboWindow = .42;
			}
		}
		return;
	}
	if (dashEdge) {
		startDash(sim, p);
		return;
	}
	if (atk) {
		beginSwing(sim, p);
		return;
	}
	if (grab) {
		const e = nearestGrunt(sim, sim.tune.grapple);
		if (e) {
			p.state = "grab";
			p.stateT = 1.35;
			e.state = "grab";
			e.vx = 0;
			e.vz = 0;
			e.vy = 0;
			sim.grabId = e.id;
			sim.bufGrab = 0;
			sim.sfx.push("grab");
		} else startDash(sim, p);
		return;
	}
	if (blast) {
		sim.bufBlast = 0;
		if (p.meter < SPEC.meterCost) sim.sfx.push("deny");
		else {
			p.meter -= SPEC.meterCost;
			p.state = "spin";
			p.stateT = .56;
			sim.spinPulse = 0;
			sim.sfx.push("blast");
			return;
		}
	}
	if (jump && sim.coyote > 0) {
		p.vy = sim.tune.jumpV;
		p.grounded = false;
		sim.coyote = 0;
		sim.bufJump = 0;
		sim.sfx.push("jump");
	}
	applyMove(sim, p, dt, 1);
}
function respawn(sim) {
	const p = sim.bodies[0];
	p.x = sim.spawnX;
	p.y = 0;
	p.z = sim.spawnZ;
	p.vx = 0;
	p.vy = 0;
	p.vz = 0;
	p.yaw = sim.spawnYaw;
	p.hp = p.maxHp;
	p.poise = SPEC.poisePlayer;
	p.state = "free";
	p.iframe = 1.15;
	p.alive = true;
	sim.camYaw = p.yaw;
	sim.banner = "Back on your feet";
	sim.bannerT = 1.15;
}
function glueGrab(sim) {
	if (sim.grabId < 0) return;
	const p = sim.bodies[0];
	const e = sim.bodies.find((b) => b.id === sim.grabId);
	if (!e || p.state !== "grab") return;
	const f = forward(p.yaw);
	e.x = p.x + f.x * 1.02;
	e.z = p.z + f.z * 1.02;
	e.y = p.y;
	e.vx = 0;
	e.vy = 0;
	e.vz = 0;
	e.yaw = p.yaw + Math.PI;
}
function overlapGoal(p, boxes) {
	return boxes.some((b) => b.kind === "goal" && p.grounded && p.x > b.minX && p.x < b.maxX && p.z > b.minZ && p.z < b.maxZ && p.y >= b.maxY - .25);
}
function refreshZone(sim) {
	const z = sim.bodies[0].z;
	let next = sim.mode;
	if (sim.mode === "belt") {
		if (z > -13.2) next = "roam";
	} else if (sim.mode === "platform") {
		if (z < 14.2) next = "roam";
	} else if (z < -15.4) next = "belt";
	else if (z > 15.6) next = "platform";
	if (next === sim.mode) return;
	sim.mode = next;
	sim.orbit = 0;
	if (next === "roam") sim.camYaw = 0;
	sim.banner = next === "belt" ? "Scrap street" : next === "platform" ? "Coil scaffolds" : "Cinder ward";
	sim.bannerT = 1.5;
}
function living(sim, home) {
	return sim.bodies.some((b) => b.kind === "grunt" && b.home === home && b.alive);
}
function step(sim, input, dt) {
	sim.sfx.length = 0;
	sim.time += dt;
	const atkEdge = input.attack && !sim.prevAtk;
	const grabEdge = input.grab && !sim.prevGrab;
	const blastEdge = input.blast && !sim.prevBlast;
	const jumpEdge = input.jump && !sim.prevJump;
	const dashEdge = input.dash && !sim.prevDash;
	sim.prevAtk = input.attack;
	sim.prevGrab = input.grab;
	sim.prevBlast = input.blast;
	sim.prevJump = input.jump;
	sim.prevDash = input.dash;
	if (atkEdge) sim.bufAtk = .16;
	else sim.bufAtk = Math.max(0, sim.bufAtk - dt);
	if (grabEdge) sim.bufGrab = .16;
	else sim.bufGrab = Math.max(0, sim.bufGrab - dt);
	if (blastEdge) sim.bufBlast = .16;
	else sim.bufBlast = Math.max(0, sim.bufBlast - dt);
	if (jumpEdge) sim.bufJump = .14;
	else sim.bufJump = Math.max(0, sim.bufJump - dt);
	if (!sim.running || sim.paused) return;
	if (sim.hitstop > 0) {
		sim.hitstop -= dt;
		sim.shake *= Math.exp(-8 * dt);
		return;
	}
	steer(sim, input);
	updatePlayer(sim, dt, dashEdge);
	updateEnemies(sim, dt);
	for (const b of sim.bodies) moveBody(sim, b, dt);
	glueGrab(sim);
	const p = sim.bodies[0];
	if (p.grounded) sim.coyote = .12;
	else sim.coyote = Math.max(0, sim.coyote - dt);
	if (p.state === "free") p.poise = Math.min(SPEC.poisePlayer, p.poise + 7 * dt);
	p.comboWindow = Math.max(0, p.comboWindow - dt);
	sim.springLock = Math.max(0, sim.springLock - dt);
	sim.comboT -= dt;
	if (sim.comboT <= 0) sim.combo = 0;
	sim.bannerT -= dt;
	if (sim.bannerT <= 0) sim.banner = "";
	sim.shake *= Math.exp(-3.2 * dt);
	refreshZone(sim);
	if (sim.mode === "roam") sim.camYaw = sim.orbit;
	for (let i = sim.particles.length - 1; i >= 0; i--) {
		const bit = sim.particles[i];
		bit.life -= dt;
		if (bit.life <= 0) {
			sim.particles.splice(i, 1);
			continue;
		}
		bit.vy -= 16 * dt;
		bit.x += bit.vx * dt;
		bit.y += bit.vy * dt;
		bit.z += bit.vz * dt;
		if (bit.y < 0) {
			bit.y = 0;
			bit.vy *= -.25;
		}
	}
	let foes = 0;
	for (const b of sim.bodies) if (b.kind === "grunt" && b.alive) foes += 1;
	sim.foes = foes;
	sim.canGrab = p.state === "free" && nearestGrunt(sim, sim.tune.grapple) != null;
	const wasStreet = sim.streetClear;
	const wasPlaza = sim.plazaClear;
	sim.streetClear = !living(sim, "street");
	sim.plazaClear = !living(sim, "plaza");
	if (!sim.scaffoldClear && overlapGoal(p, sim.boxes)) {
		sim.scaffoldClear = true;
		sim.banner = "Pylon lit";
		sim.bannerT = 2.2;
		sim.sfx.push("win");
	}
	if (!wasStreet && sim.streetClear) {
		sim.banner = "Gate's open";
		sim.bannerT = 2.2;
		sim.sfx.push("win");
	}
	if (!sim.cleared && sim.streetClear && sim.plazaClear && sim.scaffoldClear) {
		sim.cleared = true;
		sim.banner = "Circuit clear";
		sim.bannerT = 6;
		sim.sfx.push("win");
	} else if (!wasPlaza && sim.plazaClear && !sim.cleared) {
		sim.banner = "Plaza clear";
		sim.bannerT = 1.8;
	}
}
function snapshot(sim) {
	const p = sim.bodies[0];
	return {
		running: sim.running,
		paused: sim.paused,
		mode: sim.mode,
		hp: p?.hp ?? 100,
		maxHp: p?.maxHp ?? 100,
		meter: p?.meter ?? 0,
		poise: p?.poise ?? SPEC.poisePlayer,
		maxPoise: SPEC.poisePlayer,
		combo: sim.combo,
		foes: sim.foes,
		banner: sim.banner,
		canGrab: sim.canGrab,
		cleared: sim.cleared,
		streetClear: sim.streetClear,
		scaffoldClear: sim.scaffoldClear,
		plazaClear: sim.plazaClear,
		tune: sim.tune
	};
}
var PAL = [
	{
		cloth: 14964526,
		skin: 15123106,
		visor: 15774761
	},
	{
		cloth: 6056819,
		skin: 13808538,
		visor: 10475472
	},
	{
		cloth: 7227962,
		skin: 12887172,
		visor: 14964526
	},
	{
		cloth: 4086858,
		skin: 14139556,
		visor: 15774761
	},
	{
		cloth: 6961738,
		skin: 14729896,
		visor: 15984340
	},
	{
		cloth: 3819100,
		skin: 14204582,
		visor: 14964526
	}
];
function createView(canvas) {
	const renderer = new WebGLRenderer({
		canvas,
		antialias: true,
		alpha: false,
		powerPreference: "high-performance"
	});
	renderer.outputColorSpace = SRGBColorSpace;
	renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.matchMedia("(pointer: coarse)").matches ? 1.35 : 1.75));
	const scene = new Scene();
	scene.background = new Color(6047292);
	scene.fog = new Fog(6047292, 36, 88);
	const camera = new PerspectiveCamera(58, 1, .1, 120);
	camera.position.set(8, 14, 16);
	camera.lookAt(0, 1, 0);
	scene.add(new HemisphereLight(16774890, 6965818, 1.55));
	const sun = new DirectionalLight(16773853, 2.35);
	sun.position.set(14, 22, 10);
	scene.add(sun);
	const rim = new DirectionalLight(14964526, .35);
	rim.position.set(-10, 8, -6);
	scene.add(rim);
	const ground = new Mesh(new PlaneGeometry(64, 64), new MeshLambertMaterial({
		map: groundTex(),
		color: 16777215
	}));
	ground.rotation.x = -Math.PI / 2;
	scene.add(ground);
	const lane = new Mesh(new PlaneGeometry(46, 8.2), new MeshLambertMaterial({ color: 2892830 }));
	lane.rotation.x = -Math.PI / 2;
	lane.position.set(0, .02, -19);
	scene.add(lane);
	const scaffold = new Mesh(new PlaneGeometry(46, 5.4), new MeshLambertMaterial({ color: 1840660 }));
	scaffold.rotation.x = -Math.PI / 2;
	scaffold.position.set(-4, .02, 20);
	scene.add(scaffold);
	const ring = new Mesh(new TorusGeometry(1, .035, 8, 28), new MeshBasicMaterial({
		color: 15774761,
		transparent: true,
		opacity: .9
	}));
	ring.rotation.x = Math.PI / 2;
	ring.visible = false;
	scene.add(ring);
	const pit = new Mesh(new TorusGeometry(3.1, .06, 8, 40), new MeshBasicMaterial({ color: 15774761 }));
	pit.rotation.x = Math.PI / 2;
	pit.position.y = .04;
	scene.add(pit);
	const shared = {
		leg: new BoxGeometry(.22, .55, .22),
		torso: new BoxGeometry(.62, .58, .32),
		head: new SphereGeometry(.26, 14, 10),
		visor: new BoxGeometry(.36, .11, .16),
		arm: new BoxGeometry(.16, .46, .16),
		bar: new PlaneGeometry(.72, .08)
	};
	const fighters = [];
	let rigs = null;
	let rigsShown = false;
	const loader = new GLTFLoader();
	Promise.all([
		"/models/kaykit/Knight.glb",
		"/models/kaykit/Rogue.glb",
		"/models/kaykit/Barbarian.glb"
	].map((url) => loader.loadAsync(url))).then((loaded) => {
		rigs = loaded.map((gltf) => prepRig(gltf.scene, gltf.animations));
	}).catch(() => {
		rigs = null;
	});
	const boxMeshes = [];
	const pGeo = new BoxGeometry(.14, .14, .14);
	const pMats = [
		15774761,
		14964526,
		15984340
	].map((color) => new MeshBasicMaterial({ color }));
	const pool = Array.from({ length: 32 }, () => {
		const mesh = new Mesh(pGeo, pMats[0]);
		mesh.visible = false;
		scene.add(mesh);
		return mesh;
	});
	const _desired = new Vector3();
	const _target = new Vector3();
	let idle = .4;
	let built = false;
	function resize() {
		const w = canvas.clientWidth || 1;
		const h = canvas.clientHeight || 1;
		renderer.setSize(w, h, false);
		camera.aspect = w / Math.max(1, h);
		camera.updateProjectionMatrix();
	}
	function ensureWorld(sim) {
		if (built) return;
		built = true;
		for (const box of sim.boxes) boxMeshes.push(buildBox(box));
		addLamps();
		addSign();
	}
	function buildBox(box) {
		const midX = (box.minX + box.maxX) / 2;
		const midZ = (box.minZ + box.maxZ) / 2;
		if (box.kind === "spring") {
			const mesh = new Mesh(new CylinderGeometry(.62, .68, .1, 14), new MeshBasicMaterial({ color: 15774761 }));
			mesh.position.set(midX, .07, midZ);
			scene.add(mesh);
			return mesh;
		}
		if (box.kind === "goal") {
			const group = new Group();
			const deck = new Mesh(new BoxGeometry(box.maxX - box.minX, box.maxY, box.maxZ - box.minZ), new MeshLambertMaterial({ color: 12878906 }));
			deck.position.y = box.maxY / 2;
			const pole = new Mesh(new CylinderGeometry(.12, .18, 1.5, 8), new MeshBasicMaterial({ color: 14964526 }));
			pole.position.y = box.maxY + .75;
			const orb = new Mesh(new SphereGeometry(.28, 12, 10), new MeshBasicMaterial({ color: 15774761 }));
			orb.position.y = box.maxY + 1.65;
			group.add(deck, pole, orb);
			group.position.set(midX, 0, midZ);
			scene.add(group);
			return group;
		}
		const h = box.maxY - box.minY;
		const geo = new BoxGeometry(box.maxX - box.minX, h, box.maxZ - box.minZ);
		const wide = box.maxX - box.minX > 20 || box.maxZ - box.minZ > 20;
		const color = box.kind === "gate" ? 14964526 : box.kind === "plat" ? 9268037 : wide ? 6970192 : h < 2 ? 9067066 : 8021336;
		const mat = new MeshLambertMaterial({
			color,
			transparent: box.kind === "gate",
			opacity: box.kind === "gate" ? .45 : 1
		});
		const mesh = new Mesh(geo, mat);
		mesh.position.set(midX, h / 2, midZ);
		scene.add(mesh);
		return mesh;
	}
	function addLamps() {
		for (const [x, z] of [
			[-5, -2],
			[6, 3],
			[0, -16],
			[-8, 16]
		]) {
			const post = new Mesh(new CylinderGeometry(.08, .1, 3.2, 6), new MeshLambertMaterial({ color: 1972500 }));
			post.position.set(x, 1.6, z);
			const bulb = new Mesh(new SphereGeometry(.18, 10, 8), new MeshBasicMaterial({ color: 15774761 }));
			bulb.position.set(x, 3.25, z);
			scene.add(post, bulb);
			const light = new PointLight(15774761, .6, 8);
			light.position.set(x, 3.1, z);
			scene.add(light);
		}
	}
	function addSign() {
		const tex = signTex();
		const board = new Mesh(new PlaneGeometry(3.4, 1.5), new MeshBasicMaterial({ map: tex }));
		board.position.set(-6.92, 3.1, -9);
		board.rotation.y = Math.PI / 2;
		scene.add(board);
	}
	function syncFighters(sim) {
		const usingRigs = rigs != null;
		if (fighters.length === sim.bodies.length && fighters.every((f, i) => f.id === sim.bodies[i].id) && rigsShown === usingRigs) return;
		rigsShown = usingRigs;
		for (const f of fighters) {
			scene.remove(f.group);
			scene.remove(f.bar);
			f.mixer?.stopAllAction();
			for (const m of f.mats) m.dispose();
		}
		fighters.length = 0;
		sim.bodies.forEach((b, i) => {
			const made = usingRigs && rigs ? makeRig(shared, rigs[b.kind === "player" ? 0 : i % 2 + 1], b.kind === "player" ? 15774761 : 14964526) : makeFighter(shared, b.kind === "player" ? PAL[0] : PAL[i % (PAL.length - 1) + 1]);
			made.id = b.id;
			scene.add(made.group);
			scene.add(made.bar);
			fighters.push(made);
		});
	}
	function render(sim, dt) {
		ensureWorld(sim);
		syncFighters(sim);
		const p = sim.bodies[0];
		for (let i = 0; i < sim.boxes.length; i++) {
			const box = sim.boxes[i];
			const mesh = boxMeshes[i];
			if (!mesh) continue;
			if (box.kind === "gate") mesh.visible = !sim.streetClear;
		}
		fighters.forEach((f, i) => {
			const b = sim.bodies[i];
			poseFighter(f, b, sim, camera, dt);
		});
		for (let i = 0; i < pool.length; i++) {
			const bit = sim.particles[i];
			const mesh = pool[i];
			if (!bit) {
				mesh.visible = false;
				continue;
			}
			mesh.visible = true;
			mesh.position.set(bit.x, bit.y, bit.z);
			const s = .5 + bit.life / bit.max * .8;
			mesh.scale.setScalar(s);
			mesh.material = pMats[bit.color === 14964526 ? 1 : bit.color === 15984340 ? 2 : 0];
		}
		if (p) {
			ring.visible = sim.canGrab && sim.running && !sim.paused;
			ring.position.set(p.x, p.y + .05, p.z);
			const g = sim.tune.grapple;
			ring.scale.setScalar(g);
		}
		placeCamera(sim, dt, camera, _desired, _target, () => {
			idle += dt;
			return idle;
		});
		renderer.render(scene, camera);
	}
	function dispose() {
		renderer.dispose();
		scene.traverse((obj) => {
			const mesh = obj;
			if (mesh.geometry) mesh.geometry.dispose();
			const mat = mesh.material;
			if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
			else mat?.dispose();
		});
	}
	resize();
	return {
		render,
		resize,
		dispose
	};
}
function placeCamera(sim, dt, camera, desired, target, idleOf) {
	const p = sim.bodies[0];
	if (!p || !sim.running) {
		const idle = idleOf();
		desired.set(Math.sin(idle * .18) * 16, 14, Math.cos(idle * .18) * 16);
		target.set(0, 1.2, 0);
	} else if (sim.mode === "roam") {
		const fx = -Math.sin(sim.camYaw);
		const fz = -Math.cos(sim.camYaw);
		const cx = p.x - fx * 5.6;
		const cy = p.y + 2.45;
		const cz = p.z - fz * 5.6;
		const clipped = clipCam(p.x, p.y + 1.3, p.z, cx, cy, cz, sim.boxes);
		desired.set(clipped.x, clipped.y, clipped.z);
		target.set(p.x + fx * .4, p.y + 1.25, p.z + fz * .4);
	} else if (sim.mode === "belt") {
		desired.set(p.x, p.y + 13.5, p.z + 12);
		target.set(p.x, p.y + 1, p.z);
	} else {
		desired.set(p.x, p.y + 11, p.z + 9);
		target.set(p.x, p.y + 1.15, p.z);
	}
	const k = 1 - Math.exp(-7 * dt);
	camera.position.lerp(desired, k);
	if (sim.running && !sim.reduced && sim.shake > .03) {
		camera.position.x += (Math.random() - .5) * sim.shake * .4;
		camera.position.y += (Math.random() - .5) * sim.shake * .22;
	}
	camera.lookAt(target);
}
function clipCam(px, py, pz, cx, cy, cz, boxes) {
	const n = 12;
	for (let i = 1; i <= n; i++) {
		const t = i / n;
		const x = px + (cx - px) * t;
		const y = py + (cy - py) * t;
		const z = pz + (cz - pz) * t;
		for (const b of boxes) {
			if (b.kind !== "wall") continue;
			if (x > b.minX && x < b.maxX && y > b.minY && y < b.maxY && z > b.minZ && z < b.maxZ) {
				const bt = Math.max(.18, (i - 1) / n);
				return {
					x: px + (cx - px) * bt,
					y: Math.max(py, py + (cy - py) * bt),
					z: pz + (cz - pz) * bt
				};
			}
		}
	}
	return {
		x: cx,
		y: cy,
		z: cz
	};
}
function makeFighter(shared, pal) {
	const cloth = new MeshLambertMaterial({ color: pal.cloth });
	const skin = new MeshLambertMaterial({ color: pal.skin });
	const dark = new MeshLambertMaterial({ color: 1972500 });
	const visor = new MeshBasicMaterial({ color: pal.visor });
	const group = new Group();
	const hipL = new Group();
	const hipR = new Group();
	hipL.position.set(-.14, .55, 0);
	hipR.position.set(.14, .55, 0);
	const legL = new Mesh(shared.leg, dark);
	const legR = new Mesh(shared.leg, dark);
	legL.position.y = -.22;
	legR.position.y = -.22;
	hipL.add(legL);
	hipR.add(legR);
	const torso = new Mesh(shared.torso, cloth);
	torso.position.y = .95;
	const head = new Mesh(shared.head, skin);
	head.position.y = 1.46;
	const vis = new Mesh(shared.visor, visor);
	vis.position.set(0, 1.48, .18);
	const armL = new Group();
	const armR = new Group();
	armL.position.set(-.42, 1.18, 0);
	armR.position.set(.42, 1.18, 0);
	const aL = new Mesh(shared.arm, cloth);
	const aR = new Mesh(shared.arm, cloth);
	aL.position.y = -.2;
	aR.position.y = -.2;
	armL.add(aL);
	armR.add(aR);
	group.add(hipL, hipR, torso, head, vis, armL, armR);
	const bar = new Mesh(shared.bar, new MeshBasicMaterial({ color: pal.visor }));
	return {
		id: 0,
		group,
		armL,
		armR,
		bar,
		mats: [
			cloth,
			skin,
			dark,
			visor,
			bar.material
		],
		mixer: null,
		actions: {},
		clip: ""
	};
}
function poseFighter(f, b, sim, camera, dt) {
	const moving = b.grounded && Math.hypot(b.vx, b.vz) > .7 && (b.state === "free" || b.state === "atk");
	const pop = f.mixer ? 1 + Math.min(1.2, Math.max(0, b.y)) * .06 : 1 + Math.min(2.4, Math.max(0, b.y)) * .26;
	const sink = b.alive ? 1 : .55;
	f.group.visible = b.alive || b.y > -.7;
	f.group.position.set(b.x, b.y + (f.mixer || !moving ? 0 : Math.abs(Math.sin(sim.time * 12 + b.id)) * .05), b.z);
	f.group.rotation.y = b.yaw + Math.PI;
	f.group.scale.setScalar(Math.max(.05, (b.kind === "grunt" ? 1.02 : 1) * pop * sink));
	if (f.mixer) {
		const want = clipFor(b);
		playClip(f, want.name, want.loop);
		f.mixer.update(dt);
	} else {
		const atk = b.state === "atk" ? Math.sin(Math.min(1, Math.max(0, .34 - b.stateT) / .28) * Math.PI) : 0;
		f.armR.rotation.x = b.state === "windup" ? -1.25 : b.state === "spin" ? Math.sin(sim.time * 22) : -1.45 * atk;
		f.armL.rotation.x = b.state === "spin" ? -Math.sin(sim.time * 22) : b.state === "grab" ? -.8 : -.35 * atk;
	}
	const show = b.alive && b.hp < b.maxHp;
	f.bar.visible = show;
	if (show) {
		f.bar.position.set(b.x, b.y + 2.05, b.z);
		f.bar.scale.set(Math.max(.05, b.hp / b.maxHp), 1, 1);
		f.bar.lookAt(camera.position.x, f.bar.position.y, camera.position.z);
	}
}
var GEAR = /sword|axe|shield|knife|crossbow|mug|throw|dagger|quiver|arrow|staff|wand|spell|badge/i;
function prepRig(scene, animations) {
	scene.traverse((obj) => {
		if (GEAR.test(obj.name)) obj.visible = false;
	});
	for (const clip of animations) clip.tracks = clip.tracks.filter((track) => !track.name.startsWith("root.position"));
	return {
		scene,
		animations
	};
}
function makeRig(shared, template, barColor) {
	const model = clone(template.scene);
	model.updateMatrixWorld(true);
	const bounds = new Box3().setFromObject(model);
	const scale = 1.7 / Math.max(.01, bounds.max.y - bounds.min.y);
	model.scale.setScalar(scale);
	model.position.y = -bounds.min.y * scale;
	const group = new Group();
	group.add(model);
	const mixer = new AnimationMixer(model);
	const actions = {};
	for (const clip of template.animations) {
		const action = mixer.clipAction(clip);
		actions[clip.name] = action;
	}
	const bar = new Mesh(shared.bar, new MeshBasicMaterial({ color: barColor }));
	const fighter = {
		id: 0,
		group,
		armL: group,
		armR: group,
		bar,
		mats: [bar.material],
		mixer,
		actions,
		clip: ""
	};
	playClip(fighter, "Unarmed_Idle", true);
	return fighter;
}
function playClip(f, name, loop) {
	if (!f.mixer || f.clip === name) return;
	const next = f.actions[name];
	if (!next) return;
	const prev = f.clip ? f.actions[f.clip] : void 0;
	next.reset();
	next.setLoop(loop ? LoopRepeat : LoopOnce, loop ? Infinity : 1);
	next.clampWhenFinished = !loop;
	next.enabled = true;
	next.fadeIn(.1).play();
	if (prev && prev !== next) prev.fadeOut(.1);
	f.clip = name;
}
function clipFor(b) {
	if (!b.alive || b.state === "out") return {
		name: "Death_A",
		loop: false
	};
	if (b.state === "down") return {
		name: "Lie_Idle",
		loop: true
	};
	if (b.state === "hit" || b.state === "launch") return {
		name: "Hit_A",
		loop: false
	};
	if (b.state === "dash") return {
		name: "Dodge_Forward",
		loop: false
	};
	if (b.state === "spin") return {
		name: "2H_Melee_Attack_Spin",
		loop: true
	};
	if (b.state === "throw") return {
		name: "Hit_B",
		loop: false
	};
	if (b.state === "grab") return {
		name: "Unarmed_Idle",
		loop: true
	};
	if (b.state === "atk" || b.state === "windup") {
		if (b.swing >= 3) return {
			name: "Unarmed_Melee_Attack_Kick",
			loop: false
		};
		if (b.swing === 2) return {
			name: "Unarmed_Melee_Attack_Punch_B",
			loop: false
		};
		return {
			name: "Unarmed_Melee_Attack_Punch_A",
			loop: false
		};
	}
	if (!b.grounded) return {
		name: b.vy > 1 ? "Jump_Start" : "Jump_Idle",
		loop: true
	};
	const speed = Math.hypot(b.vx, b.vz);
	if (speed > 3.2) return {
		name: "Running_A",
		loop: true
	};
	if (speed > .45) return {
		name: "Walking_A",
		loop: true
	};
	return {
		name: "Unarmed_Idle",
		loop: true
	};
}
function groundTex() {
	const c = document.createElement("canvas");
	c.width = 256;
	c.height = 256;
	const g = c.getContext("2d");
	if (!g) return null;
	g.fillStyle = "#4a3c32";
	g.fillRect(0, 0, 256, 256);
	g.strokeStyle = "#6e5a4a";
	g.lineWidth = 2;
	for (let i = 0; i <= 256; i += 32) {
		g.beginPath();
		g.moveTo(i, 0);
		g.lineTo(i, 256);
		g.stroke();
		g.beginPath();
		g.moveTo(0, i);
		g.lineTo(256, i);
		g.stroke();
	}
	const tex = new CanvasTexture(c);
	tex.colorSpace = SRGBColorSpace;
	tex.wrapS = RepeatWrapping;
	tex.wrapT = RepeatWrapping;
	tex.repeat.set(8, 8);
	return tex;
}
function signTex() {
	const c = document.createElement("canvas");
	c.width = 512;
	c.height = 220;
	const g = c.getContext("2d");
	if (!g) return null;
	g.fillStyle = "#12100e";
	g.fillRect(0, 0, 512, 220);
	g.fillStyle = "#f0b429";
	g.fillRect(18, 18, 476, 184);
	g.fillStyle = "#12100e";
	g.font = "700 86px sans-serif";
	g.textAlign = "center";
	g.textBaseline = "middle";
	g.fillText("ASHLANE", 256, 118);
	const tex = new CanvasTexture(c);
	tex.colorSpace = SRGBColorSpace;
	return tex;
}
var WATCH = /* @__PURE__ */ new Set([
	"ArrowLeft",
	"ArrowRight",
	"ArrowUp",
	"ArrowDown",
	"KeyA",
	"KeyD",
	"KeyW",
	"KeyS",
	"Space",
	"ShiftLeft",
	"ShiftRight",
	"KeyJ",
	"KeyK",
	"KeyL",
	"KeyU",
	"KeyZ",
	"KeyX"
]);
function mount(canvas, push) {
	const sim = createSim(loadTune());
	const view = createView(canvas);
	const keys = /* @__PURE__ */ new Set();
	const stick = {
		x: 0,
		y: 0
	};
	const btns = {
		attack: false,
		grab: false,
		blast: false,
		jump: false,
		dash: false
	};
	const input = {
		x: 0,
		y: 0,
		attack: false,
		grab: false,
		blast: false,
		jump: false,
		dash: false
	};
	let audio = null;
	let raf = 0;
	let hudAcc = 0;
	let last = performance.now();
	let acc = 0;
	let pointerId = -1;
	let orbiting = false;
	const onKeyDown = (e) => {
		if (WATCH.has(e.code)) e.preventDefault();
		keys.add(e.code);
		unlock();
	};
	const onKeyUp = (e) => keys.delete(e.code);
	const clearKeys = () => keys.clear();
	window.addEventListener("keydown", onKeyDown);
	window.addEventListener("keyup", onKeyUp);
	window.addEventListener("blur", clearKeys);
	document.addEventListener("visibilitychange", clearKeys);
	let lastX = 0;
	const onPointerDown = (e) => {
		if (e.button !== 0 || !sim.running || sim.mode !== "roam") return;
		orbiting = true;
		pointerId = e.pointerId;
		lastX = e.clientX;
		canvas.setPointerCapture(e.pointerId);
		unlock();
	};
	const onPointerMove = (e) => {
		if (!orbiting || e.pointerId !== pointerId) return;
		sim.orbit -= (e.clientX - lastX) * .005;
		lastX = e.clientX;
	};
	const onPointerUp = (e) => {
		if (e.pointerId !== pointerId) return;
		orbiting = false;
		pointerId = -1;
	};
	canvas.addEventListener("pointerdown", onPointerDown);
	canvas.addEventListener("pointermove", onPointerMove);
	canvas.addEventListener("pointerup", onPointerUp);
	canvas.addEventListener("pointercancel", onPointerUp);
	const parent = canvas.parentElement ?? canvas;
	const ro = new ResizeObserver(() => view.resize());
	ro.observe(parent);
	window.__controlsTest = {
		getYaw: () => sim.bodies[0]?.yaw ?? 0,
		getX: () => sim.bodies[0]?.x ?? 0,
		getSpeed: () => {
			const p = sim.bodies[0];
			return p ? Math.hypot(p.vx, p.vz) : 0;
		},
		setKeys: (codes) => {
			keys.clear();
			for (const code of codes) keys.add(code);
		}
	};
	const pump = (now) => {
		const frameDt = Math.min(.05, (now - last) / 1e3);
		last = now;
		acc += frameDt;
		readInput(sim, keys, stick, btns, input);
		let guard = 0;
		while (acc >= 1 / 60 && guard < 5) {
			step(sim, input, 1 / 60);
			playSfx(sim.sfx);
			acc -= 1 / 60;
			guard += 1;
		}
		view.render(sim, frameDt);
		hudAcc += frameDt;
		if (hudAcc > .1) {
			hudAcc = 0;
			push(snapshot(sim));
		}
		raf = requestAnimationFrame(pump);
	};
	push(snapshot(sim));
	raf = requestAnimationFrame(pump);
	function unlock() {
		if (!audio) {
			const Ctx = window.AudioContext || window.webkitAudioContext;
			if (!Ctx) return;
			audio = new Ctx();
		}
		if (audio.state === "suspended") audio.resume();
	}
	function playSfx(names) {
		if (!audio || audio.state !== "running") return;
		const heard = /* @__PURE__ */ new Set();
		for (const name of names) {
			if (heard.has(name)) continue;
			heard.add(name);
			blip(audio, name);
			if (heard.size > 3) break;
		}
	}
	return {
		start(mode) {
			unlock();
			sim.running = true;
			sim.paused = false;
			setMode(sim, mode);
			push(snapshot(sim));
		},
		pause(paused) {
			sim.paused = paused;
			push(snapshot(sim));
		},
		rematch() {
			rematch(sim);
			sim.paused = false;
			push(snapshot(sim));
		},
		focus(mode) {
			unlock();
			sim.running = true;
			sim.paused = false;
			warp(sim, mode);
			push(snapshot(sim));
		},
		tune(partial) {
			sim.tune = clampTune(partial, sim.tune);
			saveTune(sim.tune);
			push(snapshot(sim));
		},
		setStick(x, y) {
			stick.x = x;
			stick.y = y;
		},
		setBtn(name, down) {
			btns[name] = down;
			if (down) unlock();
		},
		dispose() {
			cancelAnimationFrame(raf);
			window.removeEventListener("keydown", onKeyDown);
			window.removeEventListener("keyup", onKeyUp);
			window.removeEventListener("blur", clearKeys);
			document.removeEventListener("visibilitychange", clearKeys);
			canvas.removeEventListener("pointerdown", onPointerDown);
			canvas.removeEventListener("pointermove", onPointerMove);
			canvas.removeEventListener("pointerup", onPointerUp);
			canvas.removeEventListener("pointercancel", onPointerUp);
			ro.disconnect();
			view.dispose();
			window.__controlsTest = void 0;
		}
	};
}
function readInput(sim, keys, stick, btns, input) {
	let x = stick.x;
	let y = stick.y;
	if (keys.has("KeyA") || keys.has("ArrowLeft")) x -= 1;
	if (keys.has("KeyD") || keys.has("ArrowRight")) x += 1;
	if (keys.has("KeyW") || keys.has("ArrowUp")) y -= 1;
	if (keys.has("KeyS") || keys.has("ArrowDown")) y += 1;
	const pads = navigator.getGamepads?.();
	const pad = pads ? pads[0] : null;
	if (pad) {
		const dz = deadzone(pad.axes[0] ?? 0, pad.axes[1] ?? 0);
		x += dz.x;
		y += dz.y;
		if ((pad.axes[2] ?? 0) > .2 || (pad.axes[2] ?? 0) < -.2) sim.orbit -= (pad.axes[2] ?? 0) * .03;
	}
	const mag = Math.hypot(x, y);
	if (mag > 1) {
		x /= mag;
		y /= mag;
	}
	input.x = x;
	input.y = y;
	input.attack = btns.attack || keys.has("KeyJ") || keys.has("KeyZ") || !!pad?.buttons[0]?.pressed;
	input.grab = btns.grab || keys.has("KeyK") || !!pad?.buttons[1]?.pressed;
	input.blast = btns.blast || keys.has("KeyL") || keys.has("KeyX") || !!pad?.buttons[2]?.pressed;
	input.jump = btns.jump || keys.has("Space") || keys.has("KeyU") || !!pad?.buttons[3]?.pressed;
	input.dash = btns.dash || keys.has("ShiftLeft") || keys.has("ShiftRight") || !!pad?.buttons[5]?.pressed;
}
function deadzone(x, y) {
	const m = Math.hypot(x, y);
	if (m < .18) return {
		x: 0,
		y: 0
	};
	const scale = (m - .18) / (1 - .18) / m;
	return {
		x: x * scale,
		y: y * scale
	};
}
function blip(audio, name) {
	const o = audio.createOscillator();
	const g = audio.createGain();
	const now = audio.currentTime;
	const spec = {
		swing: [
			220,
			.07,
			"square"
		],
		hit: [
			180,
			.08,
			"triangle"
		],
		hurt: [
			110,
			.14,
			"sawtooth"
		],
		grab: [
			140,
			.1,
			"square"
		],
		throw: [
			90,
			.12,
			"sawtooth"
		],
		slam: [
			70,
			.18,
			"square"
		],
		blast: [
			320,
			.16,
			"sawtooth"
		],
		jump: [
			420,
			.08,
			"square"
		],
		spring: [
			520,
			.12,
			"square"
		],
		dash: [
			260,
			.06,
			"triangle"
		],
		win: [
			660,
			.22,
			"square"
		],
		deny: [
			80,
			.08,
			"square"
		],
		crumple: [
			100,
			.12,
			"triangle"
		],
		land: [
			150,
			.05,
			"triangle"
		]
	}[name] ?? [
		200,
		.05,
		"square"
	];
	o.type = spec[2];
	o.frequency.setValueAtTime(spec[0], now);
	if (name === "win") o.frequency.exponentialRampToValueAtTime(880, now + .18);
	g.gain.setValueAtTime(.08, now);
	g.gain.exponentialRampToValueAtTime(.001, now + spec[1]);
	o.connect(g);
	g.connect(audio.destination);
	o.start(now);
	o.stop(now + spec[1] + .02);
}
var MODES = [
	{
		id: "roam",
		label: "Cinder ward",
		hint: "Third person. The plaza fight, then walk north or south on your own."
	},
	{
		id: "belt",
		label: "Scrap street",
		hint: "Side view. Up and down is depth. The gate stays shut until the street is empty."
	},
	{
		id: "platform",
		label: "Coil scaffolds",
		hint: "Same hands, gravity on. Springs, jumps, then the brass pylon."
	}
];
function AshlaneApp() {
	const canvasRef = (0, import_react.useRef)(null);
	const api = (0, import_react.useRef)(null);
	const queued = (0, import_react.useRef)(null);
	const [hud, setHud] = (0, import_react.useState)(EMPTY_HUD);
	const [specText, setSpecText] = (0, import_react.useState)(() => specDocument("roam", EMPTY_HUD.tune));
	const [specErr, setSpecErr] = (0, import_react.useState)("");
	const seeded = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const handle = mount(canvas, setHud);
		api.current = handle;
		if (queued.current) {
			handle.start(queued.current);
			queued.current = null;
		}
		return () => {
			handle.dispose();
			api.current = null;
		};
	}, []);
	(0, import_react.useEffect)(() => {
		if (seeded.current) return;
		seeded.current = true;
		setSpecText(specDocument(hud.mode, hud.tune));
	}, [hud]);
	function begin(mode) {
		if (!api.current) {
			queued.current = mode;
			return;
		}
		if (hud.running) api.current.focus(mode);
		else api.current.start(mode);
	}
	function applySpec() {
		const parsed = parseSpecText(specText);
		if (!parsed.ok) {
			setSpecErr(parsed.error);
			return;
		}
		setSpecErr("");
		api.current?.tune(parsed.tune);
		if (parsed.mode) begin(parsed.mode);
	}
	const playing = hud.running && !hud.paused;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-dvh flex-col overflow-hidden bg-ink text-cream",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex shrink-0 items-center justify-between gap-3 px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-xs tracking-widest text-ember",
					children: "ASHLANE"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-lg leading-tight",
					children: labelFor(hud.mode)
				})] }), hud.running ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, {
							label: "HP",
							value: hud.hp / hud.maxHp,
							tone: "ember"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, {
							label: "KI",
							value: hud.meter / 100,
							tone: "brass"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "rounded-full border border-line bg-ink-2 px-4 py-2 font-display text-xs text-cream",
							onClick: () => api.current?.pause(true),
							children: "Modes"
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "max-w-48 text-right text-sm text-cream-dim",
					children: "One ward. Three feelings."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative min-h-0 flex-1 px-3 pb-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "stage h-full overflow-hidden rounded-2xl border border-line",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
							ref: canvasRef,
							className: "h-full w-full"
						}),
						hud.running && hud.banner ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "pointer-events-none absolute inset-x-0 top-4 text-center font-display text-brass",
							children: hud.banner
						}) : null,
						hud.combo > 1 && playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "pointer-events-none absolute right-4 top-4 font-display text-ember",
							children: [hud.combo, " HIT"]
						}) : null,
						playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "pointer-events-none absolute bottom-3 left-4 max-w-[70%] text-sm text-cream-dim",
							children: objective(hud)
						}) : null,
						!hud.running ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "veil absolute inset-0 flex items-end justify-center p-4 sm:items-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "w-full max-w-md",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-display text-3xl text-cream",
										children: "Ashlane"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-sm leading-relaxed text-cream-dim",
										children: "Free-roam the plaza, brawl the street, jump the scaffolds. The bodies are KayKit's CC0 adventurers, already rigged, playing their own punch, kick, dodge, and run clips."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-4 flex flex-col gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "rounded-full bg-ember px-5 py-3 font-display text-sm text-ink",
											onClick: () => begin("roam"),
											children: "Start"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-2 gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "rounded-full border border-line bg-ink-2 px-4 py-3 text-sm text-cream",
												onClick: () => begin("belt"),
												children: "Scrap street"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "rounded-full border border-line bg-ink-2 px-4 py-3 text-sm text-cream",
												onClick: () => begin("platform"),
												children: "Coil scaffolds"
											})]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-3 text-sm text-cream-dim",
										children: "WASD run · Space jump · J hit · K grab or dash · L spin · Shift dash · drag to look in the plaza"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
										className: "tune mt-4",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
												className: "cursor-pointer font-display text-xs text-brass",
												children: "Rule card"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-2 text-sm text-cream-dim",
												children: "Change one rule and apply. Movement, jump, gravity, grapple range, launch height, hitstun, how fast they chase, and wall-slam bonus."
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
												className: "mt-3 block text-xs text-cream-dim",
												children: [
													"Move ",
													hud.tune.moveSpeed.toFixed(1),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
														type: "range",
														min: 3,
														max: 10,
														step: .1,
														value: hud.tune.moveSpeed,
														onChange: (e) => api.current?.tune({ moveSpeed: Number(e.target.value) })
													})
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
												className: "mt-2 block text-xs text-cream-dim",
												children: [
													"Jump ",
													hud.tune.jumpV.toFixed(1),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
														type: "range",
														min: 6,
														max: 14,
														step: .1,
														value: hud.tune.jumpV,
														onChange: (e) => api.current?.tune({ jumpV: Number(e.target.value) })
													})
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
												className: "mt-2 block text-xs text-cream-dim",
												children: [
													"Gravity ",
													hud.tune.gravity.toFixed(0),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
														type: "range",
														min: 14,
														max: 42,
														step: 1,
														value: hud.tune.gravity,
														onChange: (e) => api.current?.tune({ gravity: Number(e.target.value) })
													})
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
												className: "spec-box mt-3",
												value: specText,
												spellCheck: false,
												onChange: (e) => setSpecText(e.target.value)
											}),
											specErr ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 text-sm text-ember",
												children: specErr
											}) : null,
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "mt-2 flex gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													className: "rounded-full bg-brass px-4 py-2 text-sm text-ink",
													onClick: applySpec,
													children: "Apply rules"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													className: "rounded-full border border-line px-4 py-2 text-sm",
													onClick: () => setSpecText(specDocument(hud.mode, hud.tune)),
													children: "Refresh"
												})]
											})
										]
									})
								]
							})
						}) : null,
						hud.running && hud.paused ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "veil absolute inset-0 flex items-center justify-center p-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "w-full max-w-sm",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-display text-xl",
										children: "Modes"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm text-cream-dim",
										children: "Hop to a part of the ward. The fights you already finished stay finished."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-4 flex flex-col gap-2",
										children: [
											MODES.map((mode) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												className: "rounded-2xl border border-line bg-ink-2 px-4 py-3 text-left",
												onClick: () => begin(mode.id),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-display text-sm text-brass",
													children: mode.label
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "mt-1 block text-sm text-cream-dim",
													children: mode.hint
												})]
											}, mode.id)),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "rounded-full bg-ember px-4 py-3 font-display text-sm text-ink",
												onClick: () => api.current?.pause(false),
												children: "Resume"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "rounded-full border border-line px-4 py-3 text-sm",
												onClick: () => api.current?.rematch(),
												children: "Rematch"
											})
										]
									})
								]
							})
						}) : null
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pad-dock",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stick, { onChange: (x, y) => api.current?.setStick(x, y) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap justify-end gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pad, {
							label: "Jump",
							hot: false,
							onDown: (d) => api.current?.setBtn("jump", d)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pad, {
							label: "Grab",
							hot: hud.canGrab,
							onDown: (d) => api.current?.setBtn("grab", d)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pad, {
							label: "Hit",
							hot: false,
							onDown: (d) => api.current?.setBtn("attack", d)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pad, {
							label: "Spin",
							hot: false,
							onDown: (d) => api.current?.setBtn("blast", d)
						})
					]
				})]
			})
		]
	});
}
function labelFor(mode) {
	if (mode === "belt") return "Scrap street";
	if (mode === "platform") return "Coil scaffolds";
	return "Cinder ward";
}
function objective(hud) {
	if (hud.cleared) return "Circuit clear. Open Modes and rematch if you want another pass.";
	if (hud.mode === "belt") return hud.streetClear ? "Gate's open. Walk south for the scaffolds." : "Depth-dodge the street. The gate opens when it's empty.";
	if (hud.mode === "platform") return hud.scaffoldClear ? "Pylon lit." : "Springs, then land on the brass pylon.";
	const left = [
		hud.plazaClear ? "" : "plaza",
		hud.streetClear ? "" : "street",
		hud.scaffoldClear ? "" : "scaffolds"
	].filter(Boolean);
	return left.length ? `Still open: ${left.join(", ")}.${hud.canGrab ? " Grab is in range." : ""}` : "Walk it.";
}
function Meter({ label, value, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "w-16",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-1 font-display text-xs text-cream-dim",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-2 overflow-hidden rounded-full bg-ink-2",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: tone === "ember" ? "h-full bg-ember" : "h-full bg-brass",
				style: { width: `${Math.max(0, Math.min(1, value)) * 100}%` }
			})
		})]
	});
}
function Pad({ label, hot, onDown }) {
	function set(down) {
		return (e) => {
			e.preventDefault();
			onDown(down);
		};
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		className: "pad-btn",
		"data-hot": hot ? "1" : "0",
		onPointerDown: set(true),
		onPointerUp: set(false),
		onPointerCancel: set(false),
		onPointerLeave: set(false),
		children: label
	});
}
function Stick({ onChange }) {
	const ref = (0, import_react.useRef)(null);
	const origin = (0, import_react.useRef)({
		x: 0,
		y: 0,
		id: -1
	});
	const [knob, setKnob] = (0, import_react.useState)({
		x: 0,
		y: 0
	});
	function point(e) {
		const max = 36;
		let x = e.clientX - origin.current.x;
		let y = e.clientY - origin.current.y;
		const m = Math.hypot(x, y);
		if (m > max) {
			x = x / m * max;
			y = y / m * max;
		}
		setKnob({
			x,
			y
		});
		onChange(x / max, y / max);
	}
	function down(e) {
		const el = ref.current;
		if (!el) return;
		el.setPointerCapture(e.pointerId);
		const r = el.getBoundingClientRect();
		origin.current = {
			x: r.left + r.width / 2,
			y: r.top + r.height / 2,
			id: e.pointerId
		};
		point(e);
	}
	function move(e) {
		if (origin.current.id !== e.pointerId) return;
		point(e);
	}
	function up(e) {
		if (origin.current.id !== e.pointerId) return;
		origin.current.id = -1;
		setKnob({
			x: 0,
			y: 0
		});
		onChange(0, 0);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref,
		className: "stick",
		onPointerDown: down,
		onPointerMove: move,
		onPointerUp: up,
		onPointerCancel: up,
		role: "slider",
		"aria-label": "Move",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { transform: `translate(${knob.x}px, ${knob.y}px)` } })
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AshlaneApp, {});
}
//#endregion
export { Home as component };
