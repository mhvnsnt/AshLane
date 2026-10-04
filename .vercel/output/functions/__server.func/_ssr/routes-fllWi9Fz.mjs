import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { A as QuaternionKeyframeTrack, C as MeshBasicMaterial, D as PlaneGeometry, E as PerspectiveCamera, F as TorusGeometry, I as Vector3, M as SRGBColorSpace, N as Scene, O as PointLight, P as SphereGeometry, S as Mesh, T as MeshPhongMaterial, _ as HemisphereLight, a as AnimationMixer, b as LoopOnce, c as BufferAttribute, d as CircleGeometry, f as Color, g as Group, h as Fog, i as AnimationClip, j as RepeatWrapping, k as Quaternion, l as BufferGeometry, m as DirectionalLight, n as clone, o as Box3, p as CylinderGeometry, r as WebGLRenderer, s as BoxGeometry, t as GLTFLoader, u as CanvasTexture, v as LineBasicMaterial, w as MeshLambertMaterial, x as LoopRepeat, y as LineSegments } from "../_libs/three.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-fllWi9Fz.js
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
	tune: DEFAULT_TUNE,
	weapon: "fist",
	area: "plaza",
	phase: "walk",
	phaseStep: "Packs stay on their block until you step in.",
	scuffle: "",
	marketClear: false,
	style: "knight",
	job: "Warm the plaza",
	jobStep: "You were hired to quiet one block. Clear the plaza pack.",
	martial: "",
	stance: "orthodox",
	bout: "off",
	flow: 0,
	story: false,
	mission: 0,
	missionTitle: "",
	missionStep: "",
	actName: "",
	wave: 1,
	waveMax: 1,
	missionClear: false,
	clearedMission: 0
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
/** Street-brawler loop. Structure only: walk a block, commit, string, scrap, clear. */
var PIPELINE = [
	{
		id: "walk",
		title: "Walk",
		step: "Packs stay on their block until you step in."
	},
	{
		id: "commit",
		title: "Commit",
		step: "Scuffle is on. It stays until this block is quiet."
	},
	{
		id: "string",
		title: "String",
		step: "Three hits. The third launches. Hold down and hit to sweep."
	},
	{
		id: "scrap",
		title: "Scrap",
		step: "Grab, throw them into a wall, or dash through a swing. Weapons break."
	},
	{
		id: "clear",
		title: "Clear",
		step: "Block's quiet. Walk to the next one."
	}
];
function phaseCopy(id) {
	return PIPELINE.find((row) => row.id === id) ?? PIPELINE[0];
}
function resolvePhase(opts) {
	if (!opts.scuffle) return "walk";
	if (opts.canGrab || opts.weapon !== "fist") return "scrap";
	if (opts.combo >= 2) return "string";
	return "commit";
}
/** Original job chain. The shape is a street campaign: a hire, short blocks, a partner, then one last fight. */
var JOBS = [
	{
		id: "plaza",
		title: "Warm the plaza",
		step: "You were hired to quiet one block. Clear the plaza pack."
	},
	{
		id: "street",
		title: "Hold the scrap street",
		step: "The gate stays shut until that pack is down."
	},
	{
		id: "scaffold",
		title: "Roof the scaffolds",
		step: "Same hands. Springs, then the brass pylon."
	},
	{
		id: "market",
		title: "Night market",
		step: "East of the gate. A different pack."
	},
	{
		id: "lease",
		title: "The lease",
		step: "Someone comes to take the lane back. Drop them. Spin is still L."
	}
];
function jobNow(flags) {
	if (!flags.plazaClear) return JOBS[0];
	if (!flags.streetClear) return JOBS[1];
	if (!flags.scaffoldClear) return JOBS[2];
	if (!flags.marketClear) return JOBS[3];
	if (!flags.leaseDown) return JOBS[4];
	return {
		id: "hold",
		title: "Lane's yours",
		step: "The jobs are done. Walk it, or rematch the packs."
	};
}
var ACTS = [
	{
		act: 1,
		actName: "The hire",
		homes: ["plaza", "street"],
		stage: "ward"
	},
	{
		act: 2,
		actName: "The roofs",
		homes: ["scaffold", "plaza"],
		stage: "high"
	},
	{
		act: 3,
		actName: "Night market",
		homes: ["market", "street"],
		stage: "pit"
	},
	{
		act: 4,
		actName: "The lease",
		homes: [
			"all",
			"market",
			"plaza"
		],
		stage: "dock"
	},
	{
		act: 5,
		actName: "The drop",
		homes: ["scaffold", "all"],
		stage: "high"
	},
	{
		act: 6,
		actName: "The pit",
		homes: ["market", "plaza"],
		stage: "pit"
	},
	{
		act: 7,
		actName: "The yard",
		homes: ["plaza", "street"],
		stage: "yard"
	}
];
var TITLES = [
	"Corner",
	"Second pack",
	"The bottle",
	"Their spot",
	"The gate",
	"The house",
	"Split them",
	"In the rain",
	"Last of the block",
	"A new name",
	"The next street",
	"Chapter end"
];
var BEATS = [
	"They were waiting on the corner. Clear this pack.",
	"A second group heard the first one fall.",
	"Someone threw a bottle and stayed to swing.",
	"The block wants its spot back.",
	"Keep them off the gate.",
	"Don't let them reach the noodle house.",
	"Rook can take one. You take the rest.",
	"They fight dirtier when the rain picks up.",
	"Last group on this block.",
	"A name you have not heard yet is paying them.",
	"They brought people from the next street.",
	"End of the chapter. Finish it."
];
var MISSIONS = [];
var n = 1;
for (const act of ACTS) for (let i = 0; i < 12; i++) {
	const boss = (act.act === 4 || act.act === 6 || act.act === 7) && i === 11;
	const home = boss ? "all" : act.homes[i % act.homes.length];
	MISSIONS.push({
		n,
		act: act.act,
		actName: act.actName,
		title: `${act.actName}: ${TITLES[i]}`,
		step: BEATS[i] + (home === "scaffold" ? " Jump off the coil, then hit." : ""),
		home,
		stage: act.stage,
		waves: boss ? 1 : 2 + (i % 3 === 2 ? 1 : 0),
		hp: 1 + (act.act - 1) * .28 + i * .04,
		boss
	});
	n += 1;
}
var KEY$1 = "ashlane-campaign-v1";
function loadCleared() {
	try {
		const n = JSON.parse(localStorage.getItem(KEY$1) || "{}").cleared ?? 0;
		return Number.isFinite(n) ? Math.max(0, Math.min(MISSIONS.length, n)) : 0;
	} catch {
		return 0;
	}
}
function saveCleared(cleared) {
	localStorage.setItem(KEY$1, JSON.stringify({ cleared }));
}
function missionAt(index) {
	return MISSIONS[index] ?? MISSIONS[0];
}
var KAYKIT = {
	hips: "hips",
	spine: "spine",
	chest: "chest",
	head: "head",
	upperArmL: "upperarm.l",
	lowerArmL: "lowerarm.l",
	handL: "hand.l",
	upperArmR: "upperarm.r",
	lowerArmR: "lowerarm.r",
	handR: "hand.r",
	upperLegL: "upperleg.l",
	lowerLegL: "lowerleg.l",
	footL: "foot.l",
	upperLegR: "upperleg.r",
	lowerLegR: "lowerleg.r",
	footR: "foot.r"
};
var RIGIFY = {
	hips: "DEF-hips",
	spine: "DEF-spine001",
	chest: "DEF-spine003",
	head: "DEF-head",
	upperArmL: "DEF-upper_armL",
	lowerArmL: "DEF-forearmL",
	handL: "DEF-handL",
	upperArmR: "DEF-upper_armR",
	lowerArmR: "DEF-forearmR",
	handR: "DEF-handR",
	upperLegL: "DEF-thighL",
	lowerLegL: "DEF-shinL",
	footL: "DEF-footL",
	upperLegR: "DEF-thighR",
	lowerLegR: "DEF-shinR",
	footR: "DEF-footR"
};
var bank = null;
var names = /* @__PURE__ */ new Set();
function motionReady() {
	return bank !== null;
}
function motionNames() {
	return names;
}
function motionDur(id) {
	return bank?.clips[id]?.dur ?? 0;
}
function loadMotionBank() {
	return fetch("/motion/bank.json").then((res) => res.ok ? res.json() : null).then((data) => {
		bank = data;
		names.clear();
		if (!data) return;
		for (const id of Object.keys(data.clips)) {
			names.add(id);
			if (data.clips[id].vic) names.add(`${id}:vic`);
		}
	}).catch(() => {
		bank = null;
	});
}
function bakeMotion(root) {
	if (!bank) return [];
	const rest = /* @__PURE__ */ new Map();
	root.traverse((obj) => {
		if (obj.name) rest.set(obj.name, obj.quaternion.clone());
	});
	const map = rest.has("DEF-hips") ? RIGIFY : KAYKIT;
	const clips = [];
	for (const [id, clip] of Object.entries(bank.clips)) {
		const atk = bakeRole(id, clip.times, clip.atk, map, rest);
		if (atk) clips.push(atk);
		if (clip.vic) {
			const vic = bakeRole(`${id}:vic`, clip.times, clip.vic, map, rest);
			if (vic) clips.push(vic);
		}
	}
	return clips;
}
function bakeRole(name, times, role, map, rest) {
	const tracks = [];
	for (const [slot, keys] of Object.entries(role)) {
		const bone = map[slot];
		const q0 = bone ? rest.get(bone) : void 0;
		if (!bone || !q0 || keys.length !== times.length) continue;
		const values = [];
		const q = new Quaternion();
		const out = new Quaternion();
		for (const key of keys) {
			q.set(key[0], key[1], key[2], key[3]);
			out.copy(q0).multiply(q);
			values.push(out.x, out.y, out.z, out.w);
		}
		tracks.push(new QuaternionKeyframeTrack(`${bone}.quaternion`, times, values));
	}
	if (tracks.length === 0) return null;
	return new AnimationClip(name, times[times.length - 1] ?? 1, tracks);
}
function groupsWithState(groups, stateName) {
	const found = [];
	for (const key in groups) if (groups[key].some((name) => name === stateName)) found.push(key);
	return found;
}
function shares(first, second) {
	return first.some((n) => second.indexOf(n) !== -1);
}
/** Their frame stepper. A matching transition wins over advancing the clip. */
function nextActorState(model, actor, inputs) {
	const groups = groupsWithState(model.groups, actor.state_name);
	const animation = model.states[actor.state_name];
	const transition = model.transitions.find((row) => {
		const any = row.from === "any";
		const group = groups.some((name) => name === row.from);
		const same = row.from === actor.state_name;
		const pressed = shares(inputs, row.input);
		let excluded = false;
		if (row.excluding) excluded = row.excluding.some((name) => name === actor.state_name || groups.some((groupName) => groupName === name));
		return (any || group || same) && pressed && !excluded;
	});
	let stateName = actor.state_name;
	let frame = actor.frame_index;
	if (transition) {
		const next = model.states[transition.to];
		if (next) {
			stateName = transition.to;
			if (transition.no_reset !== true) frame = 0;
			else {
				frame += 1;
				if (frame >= next.frames.length) frame = 0;
			}
		} else {
			stateName = model.default_state;
			frame = 0;
		}
	} else if (animation) {
		frame = actor.frame_index + 1;
		if (frame >= animation.frames.length) {
			stateName = animation.next ?? model.default_state;
			frame = 0;
		}
	} else {
		stateName = model.default_state;
		frame = 0;
	}
	return {
		state_name: stateName,
		frame_index: frame
	};
}
var YOKO_MODEL = {
	default_state: "standing",
	states: {
		standing: {
			frames: [{ sprite: "Standing" }],
			next: "standing"
		},
		punching: { frames: [
			{ sprite: "Punching 1" },
			{ sprite: "Punching 2" },
			{
				sprite: "Punching 3",
				attack: 10
			},
			{ sprite: "Punching 3" }
		] },
		kicking: { frames: [
			{ sprite: "Kicking 1" },
			{ sprite: "Kicking 2" },
			{
				sprite: "Kicking 3",
				attack: 5
			},
			{ sprite: "Kicking 3" }
		] },
		walking_fwd: { frames: [{
			sprite: "Walking 1",
			x_move: 10
		}, {
			sprite: "Walking 2",
			x_move: 10
		}] },
		walking_fwd_down: { frames: [{
			sprite: "Walking 1",
			x_move: 5,
			y_move: 5
		}, {
			sprite: "Walking 2",
			x_move: 10,
			y_move: 5
		}] },
		walking_fwd_up: { frames: [{
			sprite: "Walking 1",
			x_move: 5,
			y_move: -5
		}, {
			sprite: "Walking 2",
			x_move: 10,
			y_move: -5
		}] },
		walking_up: { frames: [{
			sprite: "Walking 1",
			y_move: -10
		}, {
			sprite: "Walking 2",
			y_move: -10
		}] },
		walking_down: { frames: [{
			sprite: "Walking 1",
			y_move: 10
		}, {
			sprite: "Walking 2",
			y_move: 10
		}] },
		turn_around: { frames: [{
			sprite: "Standing",
			flip: true
		}] },
		hurt: {
			frames: [
				{
					sprite: "Hurt 1",
					spark: true,
					health_hit: 1,
					signals: "sfx_oof"
				},
				{ sprite: "Hurt 2" },
				{ sprite: "Hurt 2" },
				{ sprite: "Hurt 2" },
				{ sprite: "Hurt 3" }
			],
			uninterruptible: true
		},
		dying: {
			frames: [
				{ sprite: "Hurt 4" },
				{ sprite: "Hurt 4" },
				{ sprite: "Hurt 5" },
				{ sprite: "Hurt 5" },
				{ sprite: "Hurt 4" },
				{ sprite: "Hurt 4" },
				{ sprite: "Hurt 5" },
				{ sprite: "Hurt 5" },
				{ sprite: "Hurt 4" },
				{ sprite: "Hurt 4" },
				{ sprite: "Hurt 5" },
				{
					sprite: "Hurt 5",
					signals: "disable_sender Died"
				}
			],
			uninterruptible: true
		},
		jumping: {
			frames: [{
				sprite: "Jumping",
				jump_v: 1
			}],
			next: "standing"
		}
	},
	groups: {
		attacking: ["punching", "kicking"],
		standing_walking: [
			"standing",
			"turn_around",
			"walking_fwd",
			"walking_down",
			"walking_up",
			"walking_fwd_down",
			"walking_fwd_up"
		]
	},
	transitions: [
		{
			from: "standing_walking",
			to: "jumping",
			input: ["jump"]
		},
		{
			from: "any",
			excluding: ["hurt", "dying"],
			to: "dying",
			input: ["die"]
		},
		{
			from: "any",
			excluding: ["hurt", "dying"],
			to: "hurt",
			input: ["hurt"]
		},
		{
			from: "standing_walking",
			to: "punching",
			input: ["punch"]
		},
		{
			from: "standing_walking",
			to: "kicking",
			input: ["kick"]
		},
		{
			from: "standing_walking",
			to: "walking_fwd",
			input: ["forward"],
			no_reset: true
		},
		{
			from: "standing_walking",
			to: "walking_fwd_down",
			input: ["forward_down"],
			no_reset: true
		},
		{
			from: "standing_walking",
			to: "walking_fwd_up",
			input: ["forward_up"],
			no_reset: true
		},
		{
			from: "standing_walking",
			to: "walking_down",
			input: ["down"],
			no_reset: true
		},
		{
			from: "standing_walking",
			to: "walking_up",
			input: ["up"],
			no_reset: true
		},
		{
			from: "standing",
			to: "turn_around",
			input: ["backward"]
		}
	]
};
var YOKO_FRAME = .1;
/** Their 10px step at 10fps, scaled so 10px matches the default move speed of 6.4. */
var YOKO_PX = .064;
32 * YOKO_PX;
function movementDirectionsFromUserInput(userInput, facingLeft) {
	const directions = [];
	if (userInput.a_key) directions.push("punch");
	if (userInput.s_key) directions.push("kick");
	if (userInput.left) {
		if (facingLeft) {
			if (userInput.down) directions.push("forward_down");
			else if (userInput.up) directions.push("forward_up");
			else directions.push("forward");
		} else directions.push("backward");
	} else if (userInput.right) {
		if (facingLeft) directions.push("backward");
		else if (userInput.down) directions.push("forward_down");
		else if (userInput.up) directions.push("forward_up");
		else directions.push("forward");
	} else if (userInput.down) directions.push("down");
	else if (userInput.up) directions.push("up");
	return directions;
}
/** Their NPC director. Attack rolls stay 0.05 per their frame. */
function npcDirections(actor, actors, rand) {
	const target = actors.find((other) => other.actor_type === "player" && other.enabled);
	if (!target) return [];
	const reach = 24 * YOKO_PX;
	const slack = 8 * YOKO_PX;
	const goal = {
		x: target.position.x < actor.position.x ? target.position.x + reach : target.position.x - reach,
		y: target.position.y
	};
	const pad = {};
	const absX = Math.abs(actor.position.x - goal.x);
	if (actor.position.x < goal.x && absX > slack) pad.right = true;
	else if (actor.position.x > goal.x && absX > slack) pad.left = true;
	else if (actor.position.x < target.position.x && actor.facing_left) pad.right = true;
	else if (actor.position.x > target.position.x && !actor.facing_left) pad.left = true;
	const absY = Math.abs(actor.position.y - goal.y);
	if (actor.position.y < goal.y && absY > slack) pad.down = true;
	else if (actor.position.y > goal.y && absY > slack) pad.up = true;
	const directions = movementDirectionsFromUserInput(pad, actor.facing_left);
	if (Math.hypot(target.position.x - actor.position.x, target.position.y - actor.position.y) <= 2.048) {
		if (rand() < .05) directions.push("punch");
		else if (rand() < .05) directions.push("kick");
	}
	return directions;
}
function busy(b) {
	return b.state === "grab" || b.state === "spin" || b.state === "dash" || b.state === "launch" || b.state === "throw";
}
function frameOf(actor) {
	return YOKO_MODEL.states[actor.state_name]?.frames[actor.frame_index];
}
function actorsOf(sim) {
	const list = [];
	for (const b of sim.bodies) {
		if (b.kind !== "player" && b.home !== "street") continue;
		if (!b.alive || b.state === "out" || b.state === "down") continue;
		if (b.state === "hit" && b.yState !== "hurt" && b.yState !== "dying") continue;
		if (busy(b)) continue;
		list.push({
			id: String(b.id),
			actor_type: b.kind === "player" ? "player" : "npc",
			enabled: b.alive,
			facing_left: b.facingLeft,
			state_name: b.yState,
			frame_index: b.yFrame,
			health: b.yHealth,
			position: {
				x: b.x,
				y: b.z
			},
			body: b
		});
	}
	return list;
}
function playerPad(sim, input) {
	const attack = input.attack || sim.bufAtk > 0;
	const down = input.y > .35;
	return {
		left: input.x < -.35,
		right: input.x > .35,
		up: input.y < -.35,
		down,
		a_key: attack && !down,
		s_key: attack && down
	};
}
function beingAttacked(actor, actors) {
	const other = actor.actor_type === "player" ? "npc" : "player";
	return actors.some((foe) => {
		if (!foe.enabled || foe.actor_type !== other || foe.id === actor.id) return false;
		if (Math.hypot(foe.position.x - actor.position.x, foe.position.y - actor.position.y) > 2.048) return false;
		return (frameOf(foe)?.attack ?? 0) > 0;
	});
}
function writePose(sim, actor) {
	const b = actor.body;
	b.facingLeft = actor.facing_left;
	b.yState = actor.state_name;
	b.yFrame = actor.frame_index;
	b.yHealth = actor.health;
	if (b.state === "down") {
		b.vx = 0;
		b.vz = 0;
		return;
	}
	b.yaw = actor.facing_left ? Math.PI / 2 : -Math.PI / 2;
	if (actor.state_name === "dying") {
		if (b.kind === "player") b.state = "hit";
		else {
			b.state = "out";
			b.alive = false;
			b.hp = 0;
		}
		b.vx = 0;
		b.vz = 0;
		return;
	}
	if (actor.state_name === "hurt") b.state = "hit";
	else if (actor.state_name === "punching") {
		b.state = "atk";
		b.swing = 1;
	} else if (actor.state_name === "kicking") {
		b.state = "atk";
		b.swing = 3;
	} else if (!busy(b)) b.state = "free";
	const frame = frameOf(actor);
	if (!frame) {
		b.vx = 0;
		b.vz = 0;
		return;
	}
	const speedScale = b.kind === "player" ? sim.tune.moveSpeed / 6.4 : sim.tune.enemySpeed / 3.35;
	let factor = actor.facing_left ? -1 : 1;
	if (b.kind !== "player") factor *= .5;
	const dx = (frame.x_move ?? 0) * factor * YOKO_PX * speedScale;
	const dz = (frame.y_move ?? 0) * YOKO_PX * speedScale;
	b.vx = dx / YOKO_FRAME;
	b.vz = dz / YOKO_FRAME;
}
function applyFrame(sim, actor, prev) {
	const frame = frameOf(actor);
	const b = actor.body;
	if (!frame) return;
	if (frame.flip) actor.facing_left = !actor.facing_left;
	if (frame.jump_v && b.kind === "player" && actor.state_name !== prev) {
		b.vy = sim.tune.jumpV;
		b.grounded = false;
		sim.coyote = 0;
		sim.bufJump = 0;
		sim.sfx.push("jump");
	}
	if (frame.health_hit && actor.state_name !== prev) {
		actor.health -= frame.health_hit;
		const bites = b.kind === "player" ? 8 : 4;
		b.hp = Math.max(0, b.hp - b.maxHp / bites);
		sim.hitstop = Math.max(sim.hitstop, .04);
		sim.shake = Math.min(1, sim.shake + .32);
		sim.sfx.push(b.kind === "player" ? "hurt" : "hit");
		if (b.kind === "grunt") {
			const p = sim.bodies[0];
			if (p) p.meter = Math.min(100, p.meter + 8);
			sim.combo += 1;
			sim.comboT = 1.25;
			sim.landed = true;
		}
		if (b.hp <= 0) actor.health = 0;
	}
	if (frame.signals?.includes("disable_sender")) {
		actor.enabled = false;
		if (b.kind === "player") {
			actor.health = 8;
			actor.state_name = "standing";
			actor.frame_index = 0;
			b.yHealth = 8;
			b.hp = 0;
			b.state = "down";
			b.stateT = 1.05;
		} else {
			b.alive = false;
			b.hp = 0;
			b.state = "out";
			b.stateT = .7;
		}
	}
	if ((frame.attack ?? 0) > 0 && actor.state_name !== prev) {
		sim.sfx.push("swing");
		if (b.kind === "player") {
			const fx = actor.facing_left ? -1 : 1;
			sim.pulse = {
				x: b.x + fx * .85,
				z: b.z,
				r: 1.15
			};
		}
	}
}
function stepActors(sim, input) {
	const actors = actorsOf(sim);
	if (!actors.length) return;
	const requested = {};
	const pads = actors.map((actor) => ({
		id: actor.id,
		actor_type: actor.actor_type,
		enabled: actor.enabled,
		facing_left: actor.facing_left,
		position: actor.position
	}));
	for (const actor of actors) {
		if (!actor.enabled) {
			requested[actor.id] = [];
			continue;
		}
		if (actor.actor_type === "player") {
			const dirs = movementDirectionsFromUserInput(playerPad(sim, input), actor.facing_left);
			if ((input.jump || sim.bufJump > 0) && (actor.body.grounded || sim.coyote > 0)) dirs.unshift("jump");
			requested[actor.id] = dirs;
		} else requested[actor.id] = npcDirections(pads.find((row) => row.id === actor.id), pads, Math.random);
	}
	for (const actor of actors) {
		if (!actor.enabled) continue;
		let dirs = requested[actor.id] ?? [];
		if (actor.health <= 0) dirs = ["die"];
		else if (beingAttacked(actor, actors)) dirs = ["hurt"];
		const prev = actor.state_name;
		const next = nextActorState(YOKO_MODEL, actor, dirs);
		actor.state_name = next.state_name;
		actor.frame_index = next.frame_index;
		applyFrame(sim, actor, prev);
		writePose(sim, actor);
	}
}
function tickYokosukaBelt(sim, input, dt) {
	if (sim.mode !== "belt") return;
	sim.yokoClock += dt;
	let guard = 0;
	while (sim.yokoClock >= .1 && guard < 3) {
		sim.yokoClock -= YOKO_FRAME;
		stepActors(sim, input);
		guard += 1;
	}
}
function resetYoko(b) {
	b.yState = "standing";
	b.yFrame = 0;
	b.yHealth = b.kind === "player" ? 8 : 4;
	b.facingLeft = Math.sin(b.yaw) > 0;
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
		box(-26, 48, -26, -24, 3, "wall"),
		box(-26, 26, 24, 26, 3, "wall"),
		box(-26, -24, -26, 26, 3, "wall"),
		box(24, 26, -14.4, 24, 3, "wall"),
		box(16.4, 48, -14.9, -14.2, 2.4, "wall"),
		box(46, 48, -26, -14.2, 3, "wall"),
		box(-18, -13.5, -5.8, -5, 5.2, "wall"),
		box(-11.3, -7, -5.8, -5, 5.2, "wall"),
		box(-18, -7, -13, -12.2, 5.2, "wall"),
		box(-18, -17.2, -13, -5, 5.2, "wall"),
		box(-7.8, -7, -13, -5, 5.2, "wall"),
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
		box(12.2, 15.4, 19, 21, 2.2, "goal"),
		box(-16.7, -15.7, -6.7, -5.7, 1.15, "wall"),
		box(15.9, 16.9, -7, -5.8, 1.25, "wall"),
		box(16.8, 17.6, -16.7, -15.7, 2.2, "wall"),
		box(16.8, 17.6, -22.9, -21.9, 2.2, "wall"),
		box(22, 22.8, -22.7, -21.7, 1.1, "wall"),
		box(29.4, 30.6, -22.7, -21.7, .9, "wall"),
		box(34, 35, -16.9, -15.9, 1.25, "wall"),
		box(40.6, 41.4, -22.5, -21.5, .9, "wall"),
		box(25.4, 26.6, -17.1, -16.1, 1.05, "wall"),
		box(28, 29, -16.6, -15.8, 1.05, "wall"),
		box(36.5, 37.5, -22.8, -22, 1.05, "wall"),
		box(-4.4, -3.6, 7.6, 8.4, 2.4, "wall"),
		box(-15.1, -14.1, -7.9, -6.9, .7, "wall")
	];
}
function blankBody(sim, partial) {
	const grunt = partial.kind === "grunt";
	return {
		id: sim.nextId++,
		name: grunt ? NAMES[sim.nextId % NAMES.length] : "Ash",
		home: "plaza",
		arch: "brawler",
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
		facingLeft: false,
		yState: "standing",
		yFrame: 0,
		yHealth: grunt ? 4 : 8,
		weapon: "fist",
		wpn: 0,
		throwT: 0,
		pickupT: 0,
		wearT: 0,
		low: false,
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
		props: [],
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
		marketClear: false,
		style: "knight",
		martial: "",
		stance: "orthodox",
		stage: "ward",
		bout: "off",
		flow: 0,
		pair: "",
		pairT: 0,
		pairVx: 0,
		pairVy: 0,
		pairVz: 0,
		pairDmg: 0,
		story: false,
		mission: 0,
		wave: 1,
		waveMax: 1,
		missionClear: false,
		clearedMission: 0,
		leaseSpawned: false,
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
		foes: 0,
		yokoClock: 0,
		pulse: null,
		landed: false,
		sawHouse: false,
		sawMarket: false,
		scuffle: "",
		clearT: 0,
		phase: "walk",
		phaseStep: phaseCopy("walk").step,
		stickY: 0,
		stickX: 0
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
	resetYoko(p);
	sim.spawnX = p.x;
	sim.spawnZ = p.z;
	sim.spawnYaw = p.yaw;
	sim.camYaw = p.yaw;
	sim.orbit = 0;
}
function addGrunt(sim, x, z, y, home, arch) {
	const g = blankBody(sim, {
		kind: "grunt",
		x,
		z,
		y,
		home,
		homeX: x,
		homeZ: z,
		arch
	});
	if (arch === "brute") {
		g.hp = 120;
		g.maxHp = 120;
	} else if (arch === "runner") {
		g.hp = 44;
		g.maxHp = 44;
	} else if (arch === "hood") {
		g.hp = 56;
		g.maxHp = 56;
	} else if (arch === "hex") {
		g.hp = 72;
		g.maxHp = 72;
	}
	const p = sim.bodies[0];
	g.yaw = p ? yawFromDir(p.x - g.x, p.z - g.z) : 0;
	sim.bodies.push(g);
}
function addProp(sim, kind, x, y, z, hp, loot) {
	sim.props.push({
		id: sim.nextId++,
		kind,
		x,
		y,
		z,
		hp,
		alive: true,
		loot
	});
}
function spawnBodies(sim) {
	sim.bodies = [];
	sim.props = [];
	sim.grabId = -1;
	sim.pair = "";
	sim.pairT = 0;
	sim.cleared = false;
	sim.streetClear = false;
	sim.scaffoldClear = false;
	sim.plazaClear = false;
	sim.marketClear = false;
	sim.leaseSpawned = false;
	sim.sawHouse = false;
	sim.sawMarket = false;
	sim.scuffle = "";
	sim.clearT = 0;
	sim.phase = "walk";
	sim.phaseStep = phaseCopy("walk").step;
	sim.nextId = 1;
	sim.bodies.push(blankBody(sim, {
		kind: "player",
		x: 0,
		z: 2,
		yaw: 0,
		name: "Ash",
		home: "plaza"
	}));
	addGrunt(sim, 6, -4, 0, "plaza", "hood");
	addGrunt(sim, -8, 4, 0, "plaza", "runner");
	addGrunt(sim, 7, -1, 0, "plaza", "brute");
	addGrunt(sim, -16, -19, 0, "street", "brawler");
	addGrunt(sim, -7, -18.3, 0, "street", "runner");
	addGrunt(sim, 1.5, -19.6, 0, "street", "hex");
	addGrunt(sim, 9, -18.4, 0, "street", "brute");
	addGrunt(sim, -8.4, 20, 2.4, "scaffold", "hood");
	addGrunt(sim, 7.2, 20, 2.55, "scaffold", "brute");
	addGrunt(sim, 22, -19, 0, "market", "hex");
	addGrunt(sim, 31, -18.2, 0, "market", "runner");
	addGrunt(sim, 39, -20, 0, "market", "hood");
	addProp(sim, "pipe", -12.2, 1.02, -9, 1, "");
	addProp(sim, "crate", -15.4, 0, -8.2, 2, "");
	addProp(sim, "crate", 27.5, 0, -17.6, 2, "bottle");
	addProp(sim, "crate", 36.2, 0, -21.2, 2, "");
	placePlayer(sim, sim.mode);
	sim.foes = 12;
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
	if (mode === "belt") return "Yokosuka street. J punches. Down plus J kicks.";
	if (mode === "platform") return "Coil scaffolds. Jump to the brass pylon.";
	return "Cinder ward. North is the street. South is the scaffolds.";
}
function rematch(sim) {
	const mode = sim.mode;
	const clearedMission = sim.clearedMission;
	const style = sim.style;
	const martial = sim.martial;
	const stance = sim.stance;
	spawnBodies(sim);
	sim.mode = mode;
	sim.clearedMission = clearedMission;
	sim.style = style;
	sim.martial = martial;
	sim.stance = stance;
	sim.story = false;
	sim.bout = "off";
	sim.flow = 0;
	sim.missionClear = false;
	placePlayer(sim, mode);
	sim.banner = "Rematch";
	sim.bannerT = 1;
}
function startStory(sim, index) {
	const mission = missionAt(index);
	const clearedMission = sim.clearedMission;
	const style = sim.style;
	const martial = sim.martial;
	const stance = sim.stance;
	spawnBodies(sim);
	sim.mode = "roam";
	sim.clearedMission = clearedMission;
	sim.style = style;
	sim.martial = martial;
	sim.stance = stance;
	sim.story = true;
	sim.bout = "off";
	sim.flow = 0;
	sim.mission = Math.max(0, Math.min(MISSIONS.length - 1, index));
	sim.wave = 1;
	sim.waveMax = mission.waves;
	sim.missionClear = false;
	sim.running = true;
	sim.paused = false;
	placePlayer(sim, "roam");
	focusPack(sim);
	if (mission.boss) summonLease(sim);
	sim.banner = mission.title;
	sim.bannerT = 2.2;
	sim.stage = mission.stage;
}
function startBout(sim, kind, stage) {
	const clearedMission = sim.clearedMission;
	const style = sim.style;
	const martial = sim.martial;
	const stance = sim.stance;
	spawnBodies(sim);
	sim.mode = "roam";
	sim.clearedMission = clearedMission;
	sim.style = style;
	sim.martial = martial;
	sim.stance = stance;
	sim.story = false;
	sim.missionClear = false;
	sim.bout = kind;
	sim.flow = 0;
	sim.stage = stage;
	sim.running = true;
	sim.paused = false;
	const p = sim.bodies[0];
	p.x = 0;
	p.z = 2.2;
	p.y = 0;
	p.vx = 0;
	p.vz = 0;
	for (const b of sim.bodies) {
		if (b.kind !== "grunt") continue;
		b.alive = false;
		b.hp = 0;
		b.state = "out";
	}
	const foe = sim.bodies.find((b) => b.kind === "grunt" && b.arch === (kind === "practice" ? "hood" : "brute")) ?? sim.bodies.find((b) => b.kind === "grunt");
	if (foe) {
		foe.alive = true;
		foe.state = "free";
		foe.x = 0;
		foe.z = -2.2;
		foe.y = 0;
		foe.home = "plaza";
		foe.homeX = 0;
		foe.homeZ = -2.2;
		foe.vx = 0;
		foe.vz = 0;
		if (kind === "practice") {
			foe.name = "Bag";
			foe.hp = 400;
			foe.maxHp = 400;
		} else {
			foe.name = "The card";
			foe.hp = 160;
			foe.maxHp = 160;
		}
	}
	sim.banner = kind === "practice" ? "Practice. The bag does not swing." : "Exhibition.";
	sim.bannerT = 2;
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
	sim.pair = "";
	sim.pairT = 0;
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
	if (b.kind === "player") {
		sim.flow *= .35;
		if (sim.grabId >= 0) breakGrab(sim);
	}
	if (b.hp <= 0) {
		b.hp = 0;
		if (b.kind === "player") {
			b.state = "down";
			b.stateT = 1.05;
		} else if (b.name === "Bag") {
			b.hp = b.maxHp;
			b.poise = SPEC.poiseGrunt;
			b.state = "down";
			b.stateT = .4;
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
		const grounded = e.state === "down";
		const awayX = e.x - p.x;
		const awayZ = e.z - p.z;
		const al = Math.hypot(awayX, awayZ) || 1;
		if (hurt(sim, e, dmg, poise, (dirX * .7 + awayX / al * .3) * kb * (grounded ? 1.8 : 1), (dirZ * .7 + awayZ / al * .3) * kb * (grounded ? 1.8 : 1), grounded ? Math.max(lift, 4.3) : lift)) {
			any = true;
			p.meter = Math.min(100, p.meter + 8);
			sim.combo += 1;
			sim.comboT = 1.25;
			sim.flow = Math.min(100, sim.flow + (sim.flow > 40 ? 8 : 5));
		}
	}
	return any;
}
function hitProps(sim, x, z, radius) {
	let any = false;
	for (const prop of sim.props) {
		if (!prop.alive || prop.kind !== "crate") continue;
		if (Math.hypot(prop.x - x, prop.z - z) > radius + .4) continue;
		prop.hp -= 1;
		any = true;
		sim.sfx.push("hit");
		sim.shake = Math.min(1, sim.shake + .28);
		burst(sim, prop.x, .6, prop.z, 9067066);
		if (prop.hp > 0) continue;
		prop.alive = false;
		sim.banner = "Crate smashed";
		sim.bannerT = 1.2;
		if (prop.loot) addProp(sim, prop.loot, prop.x, .2, prop.z + .4, 1, "");
	}
	return any;
}
function wearWeapon(sim, p) {
	if (p.weapon === "fist" || p.wearT > 0) return;
	p.wearT = .36;
	p.wpn -= 1;
	const kind = p.weapon;
	if (p.wpn > 0) return;
	p.weapon = "fist";
	p.wpn = 0;
	sim.banner = kind === "bottle" ? "Bottle shattered" : "The pipe snapped";
	sim.bannerT = 1.3;
	sim.sfx.push("slam");
	burst(sim, p.x, p.y + 1, p.z, kind === "bottle" ? 6931394 : 10134445);
}
function tryPickup(sim, p) {
	if (p.weapon !== "fist" || p.state !== "free") return;
	for (const prop of sim.props) {
		if (!prop.alive || prop.kind === "crate") continue;
		if (Math.hypot(prop.x - p.x, prop.z - p.z) > .85 || Math.abs(prop.y - p.y) > 1.4) continue;
		prop.alive = false;
		p.weapon = prop.kind;
		p.wpn = prop.kind === "pipe" ? 8 : 3;
		p.pickupT = .4;
		sim.banner = prop.kind === "pipe" ? "Pipe. Run in and it lunges." : "Bottle. A few swings, then it breaks.";
		sim.bannerT = 1.6;
		sim.sfx.push("grab");
		return;
	}
}
function faceFlow(sim, p) {
	let best = null;
	let bestD = sim.flow > 45 ? 4.6 : 2.7;
	for (const e of sim.bodies) {
		if (e.kind !== "grunt" || !e.alive || e.state === "out" || e.state === "grab") continue;
		if (Math.abs(e.y - p.y) > 1.6) continue;
		const d = Math.hypot(e.x - p.x, e.z - p.z);
		if (d < bestD) {
			best = e;
			bestD = d;
		}
	}
	if (!best) return;
	p.yaw = yawFromDir(best.x - p.x, best.z - p.z);
	if (sim.flow > 55) {
		const f = forward(p.yaw);
		p.vx += f.x * 4;
		p.vz += f.z * 4;
	}
}
function tryCounter(sim, p) {
	let caught = false;
	for (const e of sim.bodies) {
		if (e.kind !== "grunt" || !e.alive || e.name === "Bag") continue;
		if (!(e.state === "windup" || e.state === "atk" && !e.swung) || Math.hypot(e.x - p.x, e.z - p.z) > 1.65) continue;
		e.state = "hit";
		e.stateT = .42;
		e.vx = (e.x - p.x) * 4;
		e.vz = (e.z - p.z) * 4;
		caught = true;
	}
	if (!caught) return;
	sim.flow = Math.min(100, sim.flow + 22);
	sim.banner = "Flow";
	sim.bannerT = .55;
	p.iframe = Math.max(p.iframe, .26);
	sim.sfx.push("hit");
}
function swingDur(swing) {
	if (swing >= 9) return .62;
	if (swing >= 8) return .48;
	if (swing >= 7) return .55;
	if (swing >= 6) return .5;
	if (swing >= 5) return .4;
	if (swing >= 4) return .42;
	return swing === 3 ? .44 : .32;
}
function beginSwing(sim, p) {
	if (sim.flow > 40 || Math.hypot(sim.aimX, sim.aimZ) < .35) faceFlow(sim, p);
	tryCounter(sim, p);
	const fast = Math.hypot(p.vx, p.vz) > 4.4;
	if (!p.grounded && p.y > .85 && !(p.comboWindow > 0 || p.queued)) {
		const f = forward(p.yaw);
		const back = sim.stickY > .35;
		const ahead = sim.stickY < -.35;
		if (Math.abs(sim.stickX) > .45 && !back && !ahead) {
			p.swing = 9;
			p.vx += f.x * 6;
			p.vz += f.z * 6;
			p.vy = Math.min(p.vy, -.4);
		} else if (back || sim.stance === "ginga" && !ahead) {
			p.swing = 7;
			p.vx *= .2;
			p.vz *= .2;
			p.vy = Math.min(p.vy, -1.4);
		} else if (ahead) {
			p.swing = 8;
			p.vx += f.x * 11;
			p.vz += f.z * 11;
			p.vy = Math.min(p.vy, -.6);
		} else {
			p.swing = 6;
			p.vx += f.x * 8;
			p.vz += f.z * 8;
			p.vy = Math.min(p.vy, .4);
		}
	} else if (p.low && !(p.comboWindow > 0 || p.queued)) p.swing = 5;
	else if (fast && !(p.comboWindow > 0 || p.queued)) p.swing = 4;
	else if (p.comboWindow > 0 || p.queued) p.swing = p.swing >= 3 ? 1 : p.swing + 1;
	else p.swing = sim.stance === "southpaw" ? 2 : 1;
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
	if (sim.bodies.some((e) => e.kind === "grunt" && e.alive && (e.state === "atk" || e.state === "windup") && Math.hypot(e.x - p.x, e.z - p.z) < 1.75)) {
		p.iframe = Math.max(p.iframe, .34);
		sim.banner = "Slipped it";
		sim.bannerT = .7;
	}
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
	const back = sim.stickY > .35;
	const ahead = sim.stickY < -.35;
	const art = sim.martial;
	let name = "Throw";
	let vx = dx * 12.5;
	let vz = dz * 12.5;
	let vy = 3.4;
	let dmg = SPEC.throwDamage;
	if (back && (art === "sambo" || art === "jiujitsu")) {
		name = "German suplex";
		vx = -dx * 7;
		vz = -dz * 7;
		vy = 6.4;
		dmg = 21;
	} else if (back) {
		name = "Neckbreaker";
		vx = -dx * 4.2;
		vz = -dz * 4.2;
		vy = 2.2;
		dmg = 19;
	} else if (ahead && (art === "wrestling" || art === "catch")) {
		name = "Brainbuster";
		vx = dx * 1.1;
		vz = dz * 1.1;
		vy = 8.4;
		dmg = 24;
	} else if (ahead) {
		name = "Chokeslam";
		vx = dx * .6;
		vz = dz * .6;
		vy = -2.4;
		dmg = 26;
	} else if (art === "wrestling" || art === "catch" || sim.stance === "collar") {
		name = art === "catch" && sim.stance !== "collar" ? "Fireman's carry" : "Powerbomb";
		vx = dx * (art === "catch" && sim.stance !== "collar" ? 5 : 3.4);
		vz = dz * (art === "catch" && sim.stance !== "collar" ? 5 : 3.4);
		vy = art === "catch" && sim.stance !== "collar" ? 6.2 : 7.6;
		dmg = art === "catch" && sim.stance !== "collar" ? 20 : 22;
	} else if (art === "sambo" || art === "jiujitsu") {
		name = "Suplex";
		vx = -dx * 9;
		vz = -dz * 9;
		vy = 7.2;
		dmg = 18;
	}
	const paired = name === "Chokeslam" ? "chokeslam" : name === "German suplex" ? "german" : name === "Suplex" ? "suplex" : name === "Neckbreaker" ? "ddt" : "";
	if (paired && motionReady() && motionDur(paired) > 0) {
		sim.pair = paired;
		sim.pairT = 2.1;
		sim.pairVx = vx;
		sim.pairVy = vy;
		sim.pairVz = vz;
		sim.pairDmg = dmg;
		p.throwT = 2.1;
		e.throwT = 2.1;
		e.iframe = 2.1;
		sim.banner = paired === "ddt" ? "DDT" : name;
		sim.bannerT = 2.1;
		sim.sfx.push("throw");
		sim.bufGrab = 0;
		return;
	}
	e.state = "throw";
	e.slam = true;
	e.iframe = .08;
	e.vx = vx;
	e.vz = vz;
	e.vy = vy;
	e.stateT = .48;
	e.hp -= dmg;
	p.meter = Math.min(100, p.meter + 10);
	p.state = "free";
	p.iframe = Math.max(p.iframe, .12);
	sim.grabId = -1;
	sim.bufGrab = 0;
	sim.sfx.push("throw");
	p.throwT = .42;
	sim.banner = name;
	sim.bannerT = .8;
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
	for (const prop of sim.props) {
		if (!prop.alive || prop.kind === "pipe" || prop.kind === "bottle") continue;
		const minX = prop.x - .55;
		const maxX = prop.x + .55;
		const minZ = prop.z - .55;
		const maxZ = prop.z + .55;
		if (b.y >= .9) continue;
		const cx = Math.min(Math.max(b.x, minX), maxX);
		const cz = Math.min(Math.max(b.z, minZ), maxZ);
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
	b.x = Math.min(b.z < -14.5 ? 45.6 : 24.2, Math.max(-24.2, b.x));
	b.z = Math.min(24.2, Math.max(-24.2, b.z));
	if (sim.bout !== "off") {
		const ring = Math.hypot(b.x, b.z);
		if (ring > 7.2) {
			b.x *= 7.2 / ring;
			b.z *= 7.2 / ring;
			b.vx *= -.15;
			b.vz *= -.15;
		}
	}
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
function inputLikeDown(sim) {
	return sim.stickY > .45;
}
function engaged(home, p) {
	if (home === "street") return p.z < -12.6 && p.x < 17;
	if (home === "market") return p.z < -14.2 && p.x > 16;
	if (home === "scaffold") return p.z > 14.2;
	return p.z > -12.8 && p.z < 14.6 && p.x < 23;
}
function updateEnemies(sim, dt) {
	const p = sim.bodies[0];
	for (const e of sim.bodies) {
		if (e.kind !== "grunt") continue;
		const yokoStreet = sim.mode === "belt" && e.home === "street";
		e.iframe = Math.max(0, e.iframe - dt);
		e.cd = Math.max(0, e.cd - dt);
		if (!e.alive) continue;
		if (e.state === "grab" || e.state === "throw") continue;
		if (e.state === "hit" || e.state === "down") {
			if (yokoStreet && (e.yState === "hurt" || e.yState === "dying")) {
				e.vx *= Math.exp(-6 * dt);
				e.vz *= Math.exp(-6 * dt);
				continue;
			}
			e.stateT -= dt;
			e.vx *= Math.exp(-6 * dt);
			e.vz *= Math.exp(-6 * dt);
			if (e.stateT <= 0) e.state = "free";
			continue;
		}
		if (e.name === "Bag") {
			if (e.state === "windup" || e.state === "atk") e.state = "free";
			e.vx *= .7;
			e.vz *= .7;
			continue;
		}
		if (yokoStreet) continue;
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
				const f = forward(e.yaw);
				const bite = e.arch === "brute" ? 14 : e.arch === "hex" ? 11 : e.arch === "hood" ? 8 : e.arch === "runner" ? 7 : 9;
				for (const target of sim.bodies) {
					if (target.kind === "grunt" || !target.alive) continue;
					if (target.iframe > 0 || target.state === "dash") continue;
					if (Math.hypot(target.x - e.x, target.z - e.z) > 1.22 || Math.abs(target.y - e.y) >= 1.2) continue;
					hurt(sim, target, bite, 10, f.x * 6.5, f.z * 6.5, e.arch === "brute" ? 2.4 : 1.2);
				}
			}
			if (e.stateT <= 0) {
				e.state = "free";
				e.cd = .9;
			}
			continue;
		}
		if (e.state !== "free") continue;
		const hot = engaged(e.home, p) || sim.scuffle === e.home && Math.hypot(p.x - e.homeX, p.z - e.homeZ) < 22;
		let ax = (hot ? p.x : e.homeX) - e.x;
		let az = (hot ? p.z : e.homeZ) - e.z;
		const d = Math.hypot(ax, az) || 1;
		if (hot && d < (e.arch === "hex" ? 2.3 : 1.22) && e.cd <= 0 && Math.abs(e.y - p.y) < 1.1 && p.state !== "down") {
			e.state = "windup";
			e.stateT = SPEC.enemyWindup * (e.arch === "runner" || e.arch === "hood" ? .62 : e.arch === "brute" || e.arch === "hex" ? 1.28 : 1);
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
		const archMul = e.arch === "runner" ? 1.38 : e.arch === "hood" ? 1.2 : e.arch === "brute" ? .72 : e.arch === "hex" ? .84 : 1;
		const sp = (!hot ? sim.tune.enemySpeed * .65 : d < 1.05 ? 0 : sim.tune.enemySpeed) * archMul;
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
		if (sim.mode === "belt" && p.state === "hit") return;
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
			if (hitProps(sim, p.x, p.z, 2.15)) wearWeapon(sim, p);
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
			sim.pair = "";
			sim.pairT = 0;
			p.state = "free";
			return;
		}
		if (sim.pairT > 0) {
			sim.pairT -= dt;
			p.throwT = Math.max(0, sim.pairT);
			e.throwT = Math.max(0, sim.pairT);
			if (sim.pairT > 0) return;
			e.vx = sim.pairVx;
			e.vz = sim.pairVz;
			e.vy = sim.pairVy;
			e.hp -= sim.pairDmg;
			e.slam = true;
			e.state = "throw";
			e.stateT = .48;
			p.state = "free";
			p.throwT = .2;
			sim.grabId = -1;
			sim.pair = "";
			if (e.hp <= 0) {
				e.hp = 0;
				e.alive = false;
				e.state = "out";
			}
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
		if (sim.mode === "belt") return;
		const dur = swingDur(p.swing);
		const startup = p.swing >= 5 ? .08 : p.swing >= 4 ? .09 : p.swing === 3 ? SPEC.launchStartup : p.swing === 2 ? SPEC.crossStartup : SPEC.jabStartup;
		const elapsed = dur - p.stateT;
		if (!p.swung && elapsed >= startup && elapsed < startup + SPEC.active) {
			p.swung = true;
			const f = forward(p.yaw);
			let lift = p.swing === 5 ? .3 : p.swing === 4 ? 2.8 : p.swing === 3 ? sim.tune.launcher : p.swing === 2 ? 2.4 : .2;
			let dmg = p.swing === 5 ? 11 : p.swing === 4 ? 15 : p.swing === 3 ? SPEC.launchDamage : p.swing === 2 ? SPEC.crossDamage : SPEC.jabDamage;
			let kb = p.swing === 5 ? 4.5 : p.swing === 4 ? 8 : p.swing === 3 ? 3.2 : p.swing === 2 ? 6.2 : 3.6;
			let call = "";
			if (p.swing >= 9) {
				lift = .4;
				dmg = 20;
				kb = 7;
				call = "450 splash";
				p.yaw += 14 * (1 / 60);
			} else if (p.swing >= 8) {
				lift = 1.15;
				dmg = 24;
				kb = 5;
				call = "Frog splash";
			} else if (p.swing >= 7) {
				lift = .15;
				dmg = 16;
				kb = 3.4;
				call = "Senton";
			} else if (p.swing >= 6) {
				lift = .2;
				dmg = 18;
				kb = 13;
				call = p.y > 2.1 ? "Crossbody" : "Flying clothesline";
			} else if (p.swing === 4 && (sim.martial === "wrestling" || sim.martial === "catch" || sim.martial === "savate" || sim.martial === "muaythai")) {
				lift = .55;
				kb = 11;
				call = "Clothesline";
			}
			if (p.weapon === "pipe") {
				dmg *= 1.35;
				kb *= 1.2;
			} else if (p.weapon === "bottle") {
				dmg *= 1.1;
				kb *= 1.05;
			}
			const poise = p.swing >= 8 ? 26 : p.swing === 5 ? sim.stance === "crane" ? 70 : 48 : p.swing >= 3 ? 18 : 11;
			const reach = p.swing === 9 || p.swing === 7 ? 1.85 : p.swing >= 6 ? 1.35 : p.swing >= 4 ? 1.05 : p.swing === 3 ? .95 : .78;
			const hit = hitGrunts(sim, p.swing === 9 || p.swing === 7 ? p.x : p.x + f.x * .85, p.swing === 9 || p.swing === 7 ? p.z : p.z + f.z * .85, reach, dmg, kb, lift, poise, f.x, f.z);
			const smashed = hitProps(sim, p.x + f.x * .7, p.z + f.z * .7, reach + .35);
			if (hit && call) {
				sim.banner = call;
				sim.bannerT = .75;
			}
			if (hit || smashed) wearWeapon(sim, p);
			p.vx += f.x * 2.4;
			p.vz += f.z * 2.4;
		}
		if (atk) {
			p.queued = true;
			sim.bufAtk = 0;
		}
		p.stateT -= dt;
		if (p.swing < 6) applyMove(sim, p, dt, .4);
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
		if (sim.mode !== "belt") {
			p.low = inputLikeDown(sim);
			beginSwing(sim, p);
			return;
		}
	}
	if (grab) {
		const e = nearestGrunt(sim, sim.tune.grapple * (sim.stance === "drunken" ? 1.35 : 1));
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
	if (jump && sim.coyote > 0 && sim.mode !== "belt") {
		p.vy = sim.tune.jumpV;
		p.grounded = false;
		sim.coyote = 0;
		sim.bufJump = 0;
		sim.sfx.push("jump");
	}
	tryPickup(sim, p);
	if (sim.mode !== "belt") applyMove(sim, p, dt, 1);
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
	resetYoko(p);
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
	if (sim.pair) {
		e.x = p.x;
		e.z = p.z;
		e.y = p.y;
		e.yaw = p.yaw;
		e.vx = 0;
		e.vy = 0;
		e.vz = 0;
		return;
	}
	const ahead = sim.stickY < -.35;
	const back = sim.stickY > .35;
	const grappler = sim.martial === "sambo" || sim.martial === "jiujitsu" || sim.martial === "wrestling" || sim.martial === "catch";
	if (ahead) {
		e.x = p.x + f.x * .45;
		e.z = p.z + f.z * .45;
		e.y = p.y + 2.2;
		e.yaw = p.yaw;
	} else if (back && (sim.martial === "sambo" || sim.martial === "jiujitsu")) {
		e.x = p.x - f.x * .2;
		e.z = p.z - f.z * .2;
		e.y = p.y + 1.45;
		e.yaw = p.yaw;
	} else if (back) {
		e.x = p.x - f.x * .15;
		e.z = p.z - f.z * .15;
		e.y = p.y + 1.05;
		e.yaw = p.yaw + Math.PI;
	} else if (grappler) {
		e.x = p.x;
		e.z = p.z;
		e.y = p.y + 1.35;
		e.yaw = p.yaw + Math.PI;
	} else {
		e.x = p.x + f.x * .85;
		e.z = p.z + f.z * .85;
		e.y = p.y;
		e.yaw = p.yaw + Math.PI;
	}
	e.vx = 0;
	e.vy = 0;
	e.vz = 0;
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
	if (sim.mode === "belt" && next !== "belt") {
		const p = sim.bodies[0];
		if (p && (p.state === "atk" || p.state === "hit")) p.state = "free";
		for (const b of sim.bodies) if (b.home === "street" && b.alive && (b.state === "atk" || b.state === "hit")) b.state = "free";
	}
	if (next === "belt") {
		sim.yokoClock = 0;
		for (const b of sim.bodies) {
			if (b.kind !== "player" && b.home !== "street") continue;
			b.vx = 0;
			b.vz = 0;
			if (b.kind === "player") resetYoko(b);
			else b.facingLeft = Math.sin(b.yaw) > 0;
		}
	}
	sim.mode = next;
	sim.orbit = 0;
	if (next === "roam") sim.camYaw = 0;
	sim.banner = next === "belt" ? "Yokosuka street. J punch, down+J kick." : next === "platform" ? "Coil scaffolds" : "Cinder ward";
	sim.bannerT = 1.5;
}
function living(sim, home) {
	return sim.bodies.some((b) => b.kind === "grunt" && b.home === home && b.alive && b.name !== "The Lease");
}
function updateAlly(sim, dt) {
	if (sim.mode === "belt") return;
	const p = sim.bodies[0];
	if (!p) return;
	for (const a of sim.bodies) {
		if (a.kind !== "ally" || !a.alive) continue;
		a.iframe = Math.max(0, a.iframe - dt);
		a.cd = Math.max(0, a.cd - dt);
		if (a.state === "hit" || a.state === "down" || a.state === "launch") {
			a.stateT -= dt;
			a.vx *= Math.exp(-6 * dt);
			a.vz *= Math.exp(-6 * dt);
			if (a.stateT <= 0) a.state = "free";
			continue;
		}
		if (a.state === "windup") {
			a.stateT -= dt;
			if (a.stateT <= 0) {
				a.state = "atk";
				a.stateT = .22;
				a.swung = false;
			}
			continue;
		}
		if (a.state === "atk") {
			a.stateT -= dt;
			if (!a.swung && a.stateT < .14) {
				a.swung = true;
				const f = forward(a.yaw);
				for (const foe of sim.bodies) {
					if (foe.kind !== "grunt" || !foe.alive) continue;
					if (Math.hypot(foe.x - a.x, foe.z - a.z) > 1.35) continue;
					hurt(sim, foe, 9, 12, f.x * 6, f.z * 6, 1.4);
				}
			}
			if (a.stateT <= 0) {
				a.state = "free";
				a.cd = .55;
			}
			continue;
		}
		let foe = null;
		let best = 14;
		for (const e of sim.bodies) {
			if (e.kind !== "grunt" || !e.alive) continue;
			const d = Math.hypot(e.x - a.x, e.z - a.z);
			if (d < best) {
				best = d;
				foe = e;
			}
		}
		const tx = foe ? foe.x : p.x + 1.3;
		const tz = foe ? foe.z : p.z + .4;
		const dx = tx - a.x;
		const dz = tz - a.z;
		const d = Math.hypot(dx, dz) || 1;
		if (foe && d < 1.25 && a.cd <= 0) {
			a.state = "windup";
			a.stateT = .28;
			a.yaw = yawFromDir(dx, dz);
			a.vx = 0;
			a.vz = 0;
			continue;
		}
		const speed = foe ? sim.tune.enemySpeed * 1.05 : sim.tune.moveSpeed * .92;
		const k = 1 - Math.exp(-8 * dt);
		a.vx += (dx / d * speed - a.vx) * k;
		a.vz += (dz / d * speed - a.vz) * k;
		if (d > .4) a.yaw = approachAngle(a.yaw, yawFromDir(dx, dz), 10, dt);
	}
}
function ensureCrew(sim) {
	const p = sim.bodies[0];
	if (!p || sim.bout !== "off") return;
	if ((sim.story ? sim.mission >= 1 : sim.plazaClear) && !sim.bodies.some((b) => b.kind === "ally")) {
		sim.bodies.push(blankBody(sim, {
			kind: "ally",
			name: "Rook",
			arch: "hood",
			x: p.x + 1.4,
			z: p.z,
			home: "plaza",
			hp: 90,
			maxHp: 90
		}));
		sim.banner = "Rook steps in";
		sim.bannerT = 1.6;
	}
	if (sim.story) return;
	if (!sim.leaseSpawned && sim.plazaClear && sim.streetClear && sim.scaffoldClear && sim.marketClear) summonLease(sim);
}
function summonLease(sim) {
	if (sim.leaseSpawned) return;
	sim.leaseSpawned = true;
	addGrunt(sim, .4, 3.2, 0, "plaza", "brute");
	const boss = sim.bodies[sim.bodies.length - 1];
	if (boss) {
		boss.name = "The Lease";
		boss.hp = 180;
		boss.maxHp = 180;
	}
	sim.banner = "The lease";
	sim.bannerT = 1.8;
}
function focusPack(sim) {
	const mission = missionAt(sim.mission);
	for (const b of sim.bodies) {
		if (b.kind !== "grunt" || b.name === "The Lease") continue;
		if (!(mission.home === "all" || b.home === mission.home)) {
			b.alive = false;
			b.hp = 0;
			b.state = "out";
			continue;
		}
		const base = b.arch === "brute" ? 120 : b.arch === "runner" ? 44 : b.arch === "hood" ? 56 : b.arch === "hex" ? 72 : 64;
		b.alive = true;
		b.state = "free";
		b.stateT = 0;
		b.x = b.homeX;
		b.z = b.homeZ;
		b.y = b.home === "scaffold" ? 2.4 : 0;
		b.vx = 0;
		b.vz = 0;
		b.maxHp = Math.round(base * mission.hp);
		b.hp = b.maxHp;
	}
}
function advanceStory(sim) {
	if (!sim.story || sim.missionClear) return;
	if (sim.bodies.some((b) => b.kind === "grunt" && b.alive)) return;
	if (sim.wave < sim.waveMax) {
		sim.wave += 1;
		focusPack(sim);
		sim.banner = `Wave ${sim.wave}`;
		sim.bannerT = 1.2;
		return;
	}
	sim.missionClear = true;
	sim.paused = true;
	sim.banner = "Job done";
	sim.bannerT = 2;
	const next = Math.min(MISSIONS.length, sim.mission + 1);
	if (next > sim.clearedMission) {
		sim.clearedMission = next;
		saveCleared(next);
	}
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
	sim.stickY = input.y;
	sim.stickX = input.x;
	updatePlayer(sim, dt, dashEdge);
	updateEnemies(sim, dt);
	updateAlly(sim, dt);
	tickYokosukaBelt(sim, input, dt);
	for (const b of sim.bodies) moveBody(sim, b, dt);
	for (let i = 0; i < sim.bodies.length; i++) {
		const a = sim.bodies[i];
		if (!a.alive || a.state === "out" || a.state === "grab" || a.state === "throw") continue;
		for (let j = i + 1; j < sim.bodies.length; j++) {
			const b = sim.bodies[j];
			if (!b.alive || b.state === "out" || b.state === "grab" || b.state === "throw") continue;
			let dx = b.x - a.x;
			let dz = b.z - a.z;
			const d = Math.hypot(dx, dz);
			if (d >= .72 || Math.abs(a.y - b.y) > 1.2) continue;
			if (d < 1e-4) {
				dx = 1;
				dz = 0;
			}
			const push = (.72 - d) / 2 / Math.max(d, 1e-4);
			a.x -= dx * push;
			a.z -= dz * push;
			b.x += dx * push;
			b.z += dz * push;
		}
	}
	glueGrab(sim);
	const p = sim.bodies[0];
	if (sim.pulse) {
		if (hitProps(sim, sim.pulse.x, sim.pulse.z, sim.pulse.r)) sim.landed = true;
		sim.pulse = null;
	}
	if (sim.landed) wearWeapon(sim, p);
	sim.landed = false;
	p.throwT = Math.max(0, p.throwT - dt);
	p.pickupT = Math.max(0, p.pickupT - dt);
	p.wearT = Math.max(0, p.wearT - dt);
	if (!sim.sawHouse && p.x < -7.6 && p.x > -17.4 && p.z < -5.5 && p.z > -12.2) {
		sim.sawHouse = true;
		sim.banner = "Noodle house. The pipe is on the table.";
		sim.bannerT = 2.1;
	}
	if (!sim.sawMarket && sim.streetClear && p.x > 18 && p.z < -15) {
		sim.sawMarket = true;
		sim.banner = "Night market.";
		sim.bannerT = 1.8;
	}
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
	refreshScuffle(sim, dt);
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
	sim.flow = Math.max(0, sim.flow - dt * 4);
	if (sim.bout === "exhibit" && foes === 0 && sim.running && !sim.paused) {
		sim.paused = true;
		sim.bout = "done";
		sim.banner = "Exhibition clear";
		sim.bannerT = 2;
	}
	sim.canGrab = p.state === "free" && nearestGrunt(sim, sim.tune.grapple * (sim.stance === "drunken" ? 1.35 : 1)) != null;
	const wasStreet = sim.streetClear;
	const wasPlaza = sim.plazaClear;
	sim.streetClear = !living(sim, "street");
	sim.plazaClear = !living(sim, "plaza");
	sim.marketClear = !living(sim, "market");
	ensureCrew(sim);
	advanceStory(sim);
	if (!sim.story && !sim.scaffoldClear && overlapGoal(p, sim.boxes)) {
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
	if (!sim.story && !sim.cleared && sim.streetClear && sim.plazaClear && sim.scaffoldClear) {
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
		tune: sim.tune,
		weapon: p?.weapon ?? "fist",
		area: areaOf(p),
		phase: sim.phase,
		phaseStep: sim.phaseStep,
		scuffle: sim.scuffle,
		marketClear: sim.marketClear,
		style: sim.style,
		job: jobNow({
			plazaClear: sim.plazaClear,
			streetClear: sim.streetClear,
			scaffoldClear: sim.scaffoldClear,
			marketClear: sim.marketClear,
			leaseDown: sim.leaseSpawned && !sim.bodies.some((b) => b.name === "The Lease" && b.alive)
		}).title,
		jobStep: jobNow({
			plazaClear: sim.plazaClear,
			streetClear: sim.streetClear,
			scaffoldClear: sim.scaffoldClear,
			marketClear: sim.marketClear,
			leaseDown: sim.leaseSpawned && !sim.bodies.some((b) => b.name === "The Lease" && b.alive)
		}).step,
		martial: sim.martial,
		stance: sim.stance,
		bout: sim.bout,
		flow: Math.round(sim.flow),
		story: sim.story,
		mission: sim.mission,
		missionTitle: sim.story ? missionAt(sim.mission).title : "",
		missionStep: sim.story ? missionAt(sim.mission).step : "",
		actName: sim.story ? missionAt(sim.mission).actName : "",
		wave: sim.wave,
		waveMax: sim.waveMax,
		missionClear: sim.missionClear,
		clearedMission: sim.clearedMission
	};
}
function refreshScuffle(sim, dt) {
	const p = sim.bodies[0];
	if (!p) return;
	const was = sim.scuffle;
	if (was && !living(sim, was)) {
		sim.scuffle = "";
		sim.clearT = 1.6;
		sim.banner = "Block's quiet";
		sim.bannerT = 1.5;
	} else if (!was) {
		for (const home of [
			"plaza",
			"street",
			"market",
			"scaffold"
		]) if (engaged(home, p) && living(sim, home)) {
			sim.scuffle = home;
			sim.banner = "Scuffle";
			sim.bannerT = 1.1;
			break;
		}
	}
	sim.clearT = Math.max(0, sim.clearT - dt);
	const copy = phaseCopy(sim.clearT > 0 && !sim.scuffle ? "clear" : resolvePhase({
		scuffle: sim.scuffle !== "",
		weapon: p.weapon,
		combo: sim.combo,
		canGrab: sim.canGrab
	}));
	sim.phase = copy.id;
	sim.phaseStep = copy.step;
}
function areaOf(p) {
	if (!p) return "plaza";
	if (p.x < -7.6 && p.x > -17.4 && p.z < -5.5 && p.z > -12.2) return "house";
	if (p.z < -14.4 && p.x > 16) return "market";
	if (p.z < -14.4) return "street";
	if (p.z > 15) return "scaffolds";
	return "plaza";
}
/**
* Contract for every fighter that comes in later.
* Face is +Z. The view adds PI of yaw because movement forward is -Z at yaw 0.
* Physics owns translation, so only root.position tracks are removed. Every clip stays.
* A new model joins by calling adoptRig with a moveset id. Unused clips stay on the mixer.
*/
var JOINTS = [
	"root",
	"hips",
	"spine",
	"chest",
	"upperarm.l",
	"lowerarm.l",
	"wrist.l",
	"hand.l",
	"handslot.l",
	"upperarm.r",
	"lowerarm.r",
	"wrist.r",
	"hand.r",
	"handslot.r",
	"head",
	"upperleg.l",
	"lowerleg.l",
	"foot.l",
	"toes.l",
	"upperleg.r",
	"lowerleg.r",
	"foot.r",
	"toes.r",
	"kneeIK.l",
	"control-toe-roll.l",
	"control-heel-roll.l",
	"control-foot-roll.l",
	"heelIK.l",
	"IK-foot.l",
	"IK-toe.l",
	"kneeIK.r",
	"control-toe-roll.r",
	"control-heel-roll.r",
	"control-foot-roll.r",
	"heelIK.r",
	"IK-foot.r",
	"IK-toe.r",
	"elbowIK.l",
	"handIK.l",
	"elbowIK.r",
	"handIK.r"
];
var TARGET_HEIGHT = 1.7;
var PROP_MESH = /sword|axe|shield|knife|crossbow|mug|throw|dagger|quiver|arrow|staff|wand|spell|badge/i;
var libraries = /* @__PURE__ */ new Map();
var MOVESETS = {
	drifter: {
		id: "drifter",
		show: [],
		clips: {
			idle: "Idle_Loop",
			walk: "Walk_Loop",
			run: "Sprint_Loop",
			back: "Walk_Formal_Loop",
			strafeL: "Jog_Fwd_Loop",
			strafeR: "Jog_Fwd_Loop",
			jump: "Jump_Start",
			fall: "Jump_Loop",
			jab: "Punch_Jab",
			cross: "Punch_Cross",
			launch: "Sword_Attack",
			sweep: "Punch_Enter",
			lunge: "Sword_Attack_RM",
			armedJab: "Sword_Attack",
			armedCross: "Sword_Attack_RM",
			armedLaunch: "Sword_Attack",
			armedSweep: "Punch_Enter",
			armedLunge: "Sword_Attack_RM",
			spin: "Spell_Simple_Shoot",
			hit: "Hit_Chest",
			dodge: "Roll",
			down: "Crouch_Idle_Loop",
			death: "Death01",
			pickup: "PickUp_Table",
			throw: "Punch_Cross",
			grab: "Interact",
			block: "Crouch_Idle_Loop",
			cheer: "Dance_Loop"
		}
	},
	knight: {
		id: "knight",
		show: [],
		clips: {
			idle: "Unarmed_Idle",
			walk: "Walking_A",
			run: "Running_A",
			back: "Walking_Backwards",
			strafeL: "Running_Strafe_Left",
			strafeR: "Running_Strafe_Right",
			jump: "Jump_Start",
			fall: "Jump_Idle",
			jab: "Unarmed_Melee_Attack_Punch_A",
			cross: "Unarmed_Melee_Attack_Punch_B",
			launch: "Unarmed_Melee_Attack_Kick",
			sweep: "1H_Melee_Attack_Slice_Diagonal",
			lunge: "Unarmed_Melee_Attack_Kick",
			armedJab: "1H_Melee_Attack_Slice_Horizontal",
			armedCross: "1H_Melee_Attack_Chop",
			armedLaunch: "1H_Melee_Attack_Stab",
			armedSweep: "1H_Melee_Attack_Slice_Diagonal",
			armedLunge: "1H_Melee_Attack_Slice_Diagonal",
			spin: "2H_Melee_Attack_Spin",
			hit: "Hit_A",
			dodge: "Dodge_Forward",
			down: "Lie_Idle",
			death: "Death_A",
			pickup: "PickUp",
			throw: "Throw",
			grab: "Interact",
			block: "Block",
			cheer: "Cheer"
		}
	},
	runner: {
		id: "runner",
		show: ["Knife", "Knife_Offhand"],
		clips: {
			idle: "Idle",
			walk: "Walking_B",
			run: "Running_B",
			back: "Walking_Backwards",
			strafeL: "Running_Strafe_Left",
			strafeR: "Running_Strafe_Right",
			jump: "Jump_Full_Short",
			fall: "Jump_Idle",
			jab: "Dualwield_Melee_Attack_Slice",
			cross: "Dualwield_Melee_Attack_Chop",
			launch: "Dualwield_Melee_Attack_Stab",
			sweep: "Unarmed_Melee_Attack_Kick",
			lunge: "Dualwield_Melee_Attack_Slice",
			armedJab: "Dualwield_Melee_Attack_Slice",
			armedCross: "Dualwield_Melee_Attack_Chop",
			armedLaunch: "Dualwield_Melee_Attack_Stab",
			armedSweep: "Unarmed_Melee_Attack_Kick",
			armedLunge: "Dualwield_Melee_Attack_Slice",
			spin: "2H_Melee_Attack_Spinning",
			hit: "Hit_A",
			dodge: "Dodge_Left",
			down: "Lie_Idle",
			death: "Death_A",
			pickup: "PickUp",
			throw: "Throw",
			grab: "Use_Item",
			block: "Block_Hit",
			cheer: "Cheer"
		}
	},
	brute: {
		id: "brute",
		show: ["2H_Axe"],
		clips: {
			idle: "2H_Melee_Idle",
			walk: "Walking_A",
			run: "Running_A",
			back: "Walking_Backwards",
			strafeL: "Running_Strafe_Left",
			strafeR: "Running_Strafe_Right",
			jump: "Jump_Start",
			fall: "Jump_Idle",
			jab: "2H_Melee_Attack_Chop",
			cross: "2H_Melee_Attack_Slice",
			launch: "2H_Melee_Attack_Stab",
			sweep: "2H_Melee_Attack_Chop",
			lunge: "2H_Melee_Attack_Slice",
			armedJab: "2H_Melee_Attack_Chop",
			armedCross: "2H_Melee_Attack_Slice",
			armedLaunch: "2H_Melee_Attack_Stab",
			armedSweep: "2H_Melee_Attack_Chop",
			armedLunge: "2H_Melee_Attack_Slice",
			spin: "2H_Melee_Attack_Spin",
			hit: "Hit_B",
			dodge: "Dodge_Backward",
			down: "Lie_Idle",
			death: "Death_B",
			pickup: "PickUp",
			throw: "Throw",
			grab: "Interact",
			block: "Block",
			cheer: "Cheer"
		}
	},
	hood: {
		id: "hood",
		show: ["Knife", "Knife_Offhand"],
		clips: {
			idle: "Idle",
			walk: "Walking_C",
			run: "Running_B",
			back: "Walking_Backwards",
			strafeL: "Running_Strafe_Left",
			strafeR: "Running_Strafe_Right",
			jump: "Jump_Full_Long",
			fall: "Jump_Idle",
			jab: "Dualwield_Melee_Attack_Chop",
			cross: "Dualwield_Melee_Attack_Stab",
			launch: "Dualwield_Melee_Attack_Slice",
			sweep: "Unarmed_Melee_Attack_Kick",
			lunge: "Dualwield_Melee_Attack_Chop",
			armedJab: "Dualwield_Melee_Attack_Chop",
			armedCross: "Dualwield_Melee_Attack_Stab",
			armedLaunch: "Dualwield_Melee_Attack_Slice",
			armedSweep: "Unarmed_Melee_Attack_Kick",
			armedLunge: "Dualwield_Melee_Attack_Chop",
			spin: "2H_Melee_Attack_Spinning",
			hit: "Hit_B",
			dodge: "Dodge_Right",
			down: "Lie_Idle",
			death: "Death_B",
			pickup: "PickUp",
			throw: "Throw",
			grab: "Use_Item",
			block: "Blocking",
			cheer: "Cheer"
		}
	},
	hex: {
		id: "hex",
		show: ["2H_Staff"],
		clips: {
			idle: "Idle",
			walk: "Walking_A",
			run: "Running_B",
			back: "Walking_Backwards",
			strafeL: "Running_Strafe_Left",
			strafeR: "Running_Strafe_Right",
			jump: "Jump_Start",
			fall: "Jump_Idle",
			jab: "Spellcast_Shoot",
			cross: "Spellcast_Raise",
			launch: "Spellcast_Long",
			sweep: "Spellcasting",
			lunge: "Spellcast_Long",
			armedJab: "Spellcast_Shoot",
			armedCross: "Spellcast_Raise",
			armedLaunch: "Spellcast_Long",
			armedSweep: "Spellcasting",
			armedLunge: "Spellcast_Long",
			spin: "Spellcasting",
			hit: "Hit_A",
			dodge: "Dodge_Backward",
			down: "Lie_Idle",
			death: "Death_A",
			pickup: "PickUp",
			throw: "Throw",
			grab: "Spellcast_Raise",
			block: "Block",
			cheer: "Cheer"
		}
	}
};
function equipStyle(id) {
	const src = MOVESETS[id] ?? MOVESETS.knight;
	MOVESETS.player = {
		id: "player",
		show: [...src.show],
		clips: { ...src.clips }
	};
}
function retargetSlot(id, slot, clip) {
	const row = MOVESETS[id];
	if (row) row.clips[slot] = clip;
}
var STYLES = [
	{
		id: "knight",
		label: "Punches",
		note: "Unarmed string. A pipe still changes the swings. Spin stays on L."
	},
	{
		id: "runner",
		label: "Knives",
		note: "Dual cuts and a left sidestep."
	},
	{
		id: "hood",
		label: "Hood",
		note: "The other knife order and a right sidestep."
	},
	{
		id: "brute",
		label: "Axe",
		note: "Two-hand chops and stabs."
	},
	{
		id: "hex",
		label: "Staff",
		note: "Spell casts instead of punches."
	},
	{
		id: "drifter",
		label: "Drifter",
		note: "CC0 mannequin. Jab, cross, sword swing, roll. KayKit bodies stay as they are."
	}
];
var ASSIGN_SLOTS = [
	"jab",
	"cross",
	"launch",
	"sweep",
	"lunge",
	"spin",
	"dodge",
	"hit",
	"grab",
	"cheer"
];
var CLIP_NAMES = [
	"1H_Melee_Attack_Chop",
	"1H_Melee_Attack_Slice_Diagonal",
	"1H_Melee_Attack_Slice_Horizontal",
	"1H_Melee_Attack_Stab",
	"1H_Ranged_Aiming",
	"1H_Ranged_Reload",
	"1H_Ranged_Shoot",
	"1H_Ranged_Shooting",
	"2H_Melee_Attack_Chop",
	"2H_Melee_Attack_Slice",
	"2H_Melee_Attack_Spin",
	"2H_Melee_Attack_Spinning",
	"2H_Melee_Attack_Stab",
	"2H_Melee_Idle",
	"2H_Ranged_Aiming",
	"2H_Ranged_Reload",
	"2H_Ranged_Shoot",
	"2H_Ranged_Shooting",
	"Block",
	"Block_Attack",
	"Block_Hit",
	"Blocking",
	"Cheer",
	"Death_A",
	"Death_A_Pose",
	"Death_B",
	"Death_B_Pose",
	"Dodge_Backward",
	"Dodge_Forward",
	"Dodge_Left",
	"Dodge_Right",
	"Dualwield_Melee_Attack_Chop",
	"Dualwield_Melee_Attack_Slice",
	"Dualwield_Melee_Attack_Stab",
	"Hit_A",
	"Hit_B",
	"Idle",
	"Interact",
	"Jump_Full_Long",
	"Jump_Full_Short",
	"Jump_Idle",
	"Jump_Land",
	"Jump_Start",
	"Lie_Down",
	"Lie_Idle",
	"Lie_Pose",
	"Lie_StandUp",
	"PickUp",
	"Running_A",
	"Running_B",
	"Running_Strafe_Left",
	"Running_Strafe_Right",
	"Sit_Chair_Down",
	"Sit_Chair_Idle",
	"Sit_Chair_Pose",
	"Sit_Chair_StandUp",
	"Sit_Floor_Down",
	"Sit_Floor_Idle",
	"Sit_Floor_Pose",
	"Sit_Floor_StandUp",
	"Spellcast_Long",
	"Spellcast_Raise",
	"Spellcast_Shoot",
	"Spellcasting",
	"T-Pose",
	"Throw",
	"Unarmed_Idle",
	"Unarmed_Melee_Attack_Kick",
	"Unarmed_Melee_Attack_Punch_A",
	"Unarmed_Melee_Attack_Punch_B",
	"Unarmed_Pose",
	"Use_Item",
	"Walking_A",
	"Walking_B",
	"Walking_Backwards",
	"Walking_C"
];
MOVESETS.player = {
	id: "player",
	show: [],
	clips: { ...MOVESETS.knight.clips }
};
function adoptRig(scene, animations, movesetId) {
	const moveset = MOVESETS[movesetId] ?? MOVESETS.knight;
	const family = rigFamily(scene);
	if (family === "other") console.warn(`rig ${movesetId} is not a KayKit or Rigify skeleton`);
	if (family === "kaykit") {
		const show = new Set(moveset.show);
		scene.traverse((obj) => {
			if (PROP_MESH.test(obj.name) && !show.has(obj.name)) obj.visible = false;
		});
	}
	for (const clip of animations) clip.tracks = clip.tracks.filter((track) => !track.name.endsWith("root.position") && !track.name.startsWith("root.position"));
	libraries.set(movesetId, animations.map((clip) => clip.name));
	return {
		scene,
		animations,
		moveset: moveset.id
	};
}
function rigFamily(root) {
	const names = /* @__PURE__ */ new Set();
	root.traverse((obj) => {
		if (obj.name) names.add(obj.name);
	});
	if (JOINTS.every((joint) => names.has(joint))) return "kaykit";
	if (names.has("DEF-hips")) return "rigify";
	return "other";
}
function slotFor(body) {
	const armed = body.weapon !== "fist";
	if (!body.alive || body.state === "out") return {
		slot: "death",
		loop: false
	};
	if (body.pickupT > 0) return {
		slot: "pickup",
		loop: false
	};
	if (body.kind === "player" && body.throwT > 0) return {
		slot: "throw",
		loop: false
	};
	if (body.state === "down") return {
		slot: "down",
		loop: true
	};
	if (body.state === "hit" || body.state === "launch") return {
		slot: "hit",
		loop: false
	};
	if (body.state === "dash") return {
		slot: "dodge",
		loop: false
	};
	if (body.state === "spin") return {
		slot: "spin",
		loop: true
	};
	if (body.state === "throw") return {
		slot: "hit",
		loop: false
	};
	if (body.state === "grab") return {
		slot: "grab",
		loop: true
	};
	if (body.state === "atk" || body.state === "windup") {
		if (body.swing >= 9) return {
			slot: "spin",
			loop: true
		};
		if (body.swing >= 8) return {
			slot: "launch",
			loop: false
		};
		if (body.swing >= 7) return {
			slot: "fall",
			loop: false
		};
		if (body.swing >= 6) return {
			slot: "lunge",
			loop: false
		};
		if (body.swing >= 5) return {
			slot: armed ? "armedSweep" : "sweep",
			loop: false
		};
		if (body.swing >= 4) return {
			slot: armed ? "armedLunge" : "lunge",
			loop: false
		};
		if (body.swing >= 3) return {
			slot: armed ? "armedLaunch" : "launch",
			loop: false
		};
		if (body.swing === 2) return {
			slot: armed ? "armedCross" : "cross",
			loop: false
		};
		return {
			slot: armed ? "armedJab" : "jab",
			loop: false
		};
	}
	if (!body.grounded) return {
		slot: body.vy > 1 ? "jump" : "fall",
		loop: body.vy <= 1
	};
	const speed = Math.hypot(body.vx, body.vz);
	const fx = -Math.sin(body.yaw);
	const fz = -Math.cos(body.yaw);
	const forward = fx * body.vx + fz * body.vz;
	const rx = Math.cos(body.yaw);
	const rz = -Math.sin(body.yaw);
	const side = rx * body.vx + rz * body.vz;
	if (speed > .45 && Math.abs(side) > Math.abs(forward) + .2) return {
		slot: side > 0 ? "strafeR" : "strafeL",
		loop: true
	};
	if (speed > 3.2) return {
		slot: "run",
		loop: true
	};
	if (speed > .45) return {
		slot: forward < -.35 ? "back" : "walk",
		loop: true
	};
	return {
		slot: "idle",
		loop: true
	};
}
function clipForMoveset(movesetId, slot, has) {
	const name = (MOVESETS[movesetId] ?? MOVESETS.knight).clips[slot];
	if (has(name)) return name;
	const fallback = MOVESETS.knight.clips[slot];
	if (has(fallback)) return fallback;
	if (has("Idle_Loop")) return "Idle_Loop";
	if (has("Unarmed_Idle")) return "Unarmed_Idle";
	return "Idle";
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
	scene.background = new Color(1185308);
	scene.fog = new Fog(1185308, 18, 78);
	const camera = new PerspectiveCamera(58, 1, .1, 120);
	camera.position.set(8, 14, 16);
	camera.lookAt(0, 1, 0);
	const hemi = new HemisphereLight(9348288, 1709080, .85);
	scene.add(hemi);
	const sun = new DirectionalLight(12964580, 1.05);
	sun.position.set(-8, 18, 6);
	scene.add(sun);
	const rim = new DirectionalLight(14964526, .28);
	rim.position.set(12, 6, -10);
	scene.add(rim);
	const groundMat = new MeshPhongMaterial({
		map: groundTex(),
		color: 16777215,
		shininess: 22,
		specular: 4018534
	});
	const ground = new Mesh(new PlaneGeometry(64, 64), groundMat);
	ground.rotation.x = -Math.PI / 2;
	scene.add(ground);
	const lane = new Mesh(new PlaneGeometry(46, 8.2), new MeshPhongMaterial({
		color: 1054238,
		shininess: 48,
		specular: 6980764
	}));
	lane.rotation.x = -Math.PI / 2;
	lane.position.set(0, .02, -19);
	scene.add(lane);
	const scaffold = new Mesh(new PlaneGeometry(46, 5.4), new MeshPhongMaterial({
		color: 1446938,
		shininess: 8,
		specular: 2236968
	}));
	scaffold.rotation.x = -Math.PI / 2;
	scaffold.position.set(-4, .021, 20);
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
	let knight = null;
	let rogue = null;
	let brute = null;
	let hood = null;
	let hex = null;
	let drifter = null;
	let rigKey = "";
	const loader = new GLTFLoader();
	const loadRig = (url, slot, moveset) => loader.loadAsync(url).then((gltf) => {
		const rig = adoptRig(gltf.scene, gltf.animations, moveset);
		if (slot === "knight") knight = rig;
		else if (slot === "rogue") rogue = rig;
		else if (slot === "brute") brute = rig;
		else if (slot === "hood") hood = rig;
		else if (slot === "drifter") drifter = rig;
		else hex = rig;
		rigKey = "";
	});
	loadRig("/models/kaykit/Knight.glb", "knight", "knight").then(() => {
		loadRig("/models/kaykit/Rogue.glb", "rogue", "runner");
		loadRig("/models/kaykit/Barbarian.glb", "brute", "brute");
		loadRig("/models/kaykit/Rogue_Hooded.glb", "hood", "hood");
		loadRig("/models/kaykit/Mage.glb", "hex", "hex");
		loadRig("/models/humanoid/drifter.glb", "drifter", "drifter");
	});
	loadMotionBank().then(() => {
		rigKey = "";
	});
	const boxMeshes = [];
	const propViews = [];
	let propKey = "";
	let kit = null;
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
	const flickers = [];
	const rain = makeRain(scene);
	let idle = .4;
	let built = false;
	let stageId = "";
	function applyStage(id) {
		if (id === stageId) return;
		stageId = id;
		const look = id === "dock" ? {
			fog: 791580,
			sky: 6983856,
			ground: 10203332,
			near: 14,
			far: 62
		} : id === "pit" ? {
			fog: 1708046,
			sky: 12615776,
			ground: 12886160,
			near: 12,
			far: 55
		} : id === "high" ? {
			fog: 1449e3,
			sky: 11583704,
			ground: 13160668,
			near: 16,
			far: 70
		} : id === "yard" ? {
			fog: 1712664,
			sky: 11059344,
			ground: 13030068,
			near: 20,
			far: 80
		} : id === "under" ? {
			fog: 461840,
			sky: 4876400,
			ground: 8427680,
			near: 10,
			far: 42
		} : {
			fog: 1185308,
			sky: 9348288,
			ground: 16777215,
			near: 18,
			far: 78
		};
		scene.background = new Color(look.fog);
		scene.fog = new Fog(look.fog, look.near, look.far);
		hemi.color.setHex(look.sky);
		groundMat.color.setHex(look.ground);
	}
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
		addUrban(flickers);
		addDress();
		addMarket();
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
		const color = box.kind === "gate" ? 14964526 : box.kind === "plat" ? 6968376 : wide ? 3949648 : h < 2 ? 3814446 : 2765116;
		const mat = new MeshLambertMaterial({
			color,
			transparent: box.kind === "gate",
			opacity: box.kind === "gate" ? .45 : 1
		});
		const mesh = new Mesh(geo, mat);
		mesh.position.set(midX, h / 2, midZ);
		mesh.userData.shell = box.kind === "wall" && h > 3 && !wide;
		scene.add(mesh);
		return mesh;
	}
	function addLamps() {
		for (const [x, z, color] of [
			[
				-14,
				-23.15,
				15774761
			],
			[
				-4,
				-23.15,
				15774761
			],
			[
				6,
				-23.15,
				8376575
			],
			[
				14,
				-23.15,
				15774761
			],
			[
				-8,
				-2,
				15774761
			],
			[
				8,
				2,
				15227565
			],
			[
				0,
				10,
				15774761
			],
			[
				-16,
				18,
				8376575
			]
		]) {
			const post = new Mesh(new CylinderGeometry(.07, .1, 3.4, 6), new MeshLambertMaterial({ color: 1711138 }));
			post.position.set(x, 1.7, z);
			const head = new Mesh(new BoxGeometry(.55, .12, .28), new MeshBasicMaterial({ color }));
			head.position.set(x, 3.35, z);
			scene.add(post, head);
			const light = new PointLight(color, color === 15774761 ? 1.15 : .85, 12, 1.4);
			light.position.set(x, 3.15, z);
			scene.add(light);
		}
	}
	function addSign() {
		const tex = signTex();
		const board = new Mesh(new PlaneGeometry(3.4, 1.5), new MeshBasicMaterial({ map: tex }));
		board.position.set(-6.92, 3.4, -4.88);
		board.rotation.y = 0;
		scene.add(board);
	}
	function addUrban(glows) {
		const sign = (text, fill, x, y, z, rotY, w, h, flicker) => {
			const tex = labelTex(text, fill);
			const mat = new MeshBasicMaterial({
				map: tex,
				transparent: true,
				opacity: .95
			});
			const board = new Mesh(new PlaneGeometry(w, h), mat);
			board.position.set(x, y, z);
			board.rotation.y = rotY;
			scene.add(board);
			if (flicker) glows.push({
				mat,
				rate: 2.2 + glows.length * .37
			});
			const light = new PointLight(fill === "#3ee0c5" ? 4120773 : fill === "#e85aad" ? 15227565 : 15774761, .55, 7, 1.6);
			light.position.set(x, y, z + (rotY === 0 ? .4 : -.4));
			scene.add(light);
		};
		sign("LATE", "#3ee0c5", -10, 3.15, -23.88, 0, 1.7, .48, true);
		sign("OPEN", "#e85aad", 2.2, 2.7, -23.88, 0, 1.35, .42, true);
		sign("24", "#f0b429", 11.5, 3.3, -23.88, 0, .7, .7, false);
		sign("NOODLE", "#e85aad", -12.2, 2.55, -4.88, 0, 2.1, .46, true);
		sign("COIL", "#3ee0c5", 11, 2.4, 5.12, Math.PI, 1.5, .42, false);
		const awning = (x, z, len, rotY, color) => {
			const mesh = new Mesh(new BoxGeometry(len, .08, .7), new MeshLambertMaterial({ color }));
			mesh.position.set(x, 2.35, z);
			mesh.rotation.y = rotY;
			scene.add(mesh);
		};
		awning(-10, -23.45, 2.4, 0, 1718848);
		awning(2.2, -23.45, 1.8, 0, 4857920);
		awning(-12.2, -5.28, 2.4, 0, 4857920);
		const pane = (x, y, z, color) => {
			const mat = new MeshBasicMaterial({
				color,
				transparent: true,
				opacity: .8
			});
			const mesh = new Mesh(new PlaneGeometry(.55, .7), mat);
			mesh.position.set(x, y, z);
			scene.add(mesh);
		};
		for (let i = 0; i < 9; i++) pane(-16 + i * 3.6, 3.5, -23.9, i % 2 ? 8376575 : 15778666);
		for (let i = 0; i < 4; i++) pane(-16 + i * 2.4, 2.6, -4.9, 15914914);
		for (let i = 0; i < 4; i++) pane(8.2 + i * 2.2, 2.5, -4.9, 10475519);
		const puddle = (x, z, rx, rz) => {
			const mesh = new Mesh(new CircleGeometry(1, 18), new MeshBasicMaterial({
				color: 2372166,
				transparent: true,
				opacity: .55
			}));
			mesh.rotation.x = -Math.PI / 2;
			mesh.position.set(x, .03, z);
			mesh.scale.set(rx, rz, 1);
			scene.add(mesh);
		};
		puddle(-6, -19.2, 1.4, .7);
		puddle(3.5, -18.4, 1.1, .55);
		puddle(8, -20.2, .8, .45);
		puddle(1.2, 1.4, 1.3, .6);
		puddle(-7, 6, .9, .5);
		for (let i = 0; i < 5; i++) {
			const bar = new Mesh(new PlaneGeometry(.28, 2.4), new MeshBasicMaterial({ color: 14015974 }));
			bar.rotation.x = -Math.PI / 2;
			bar.position.set(-1.6 + i * .7, .035, -16.2);
			scene.add(bar);
		}
	}
	function addMarket() {
		const floor = new Mesh(new PlaneGeometry(30, 9.2), new MeshPhongMaterial({
			color: 1054752,
			shininess: 36,
			specular: 6058888
		}));
		floor.rotation.x = -Math.PI / 2;
		floor.position.set(31, .025, -19.4);
		scene.add(floor);
		const tex = labelTex("MARKET", "#f0b429");
		const board = new Mesh(new PlaneGeometry(2.4, .55), new MeshBasicMaterial({
			map: tex,
			transparent: true
		}));
		board.position.set(20, 3.2, -23.88);
		scene.add(board);
	}
	function addDress() {
		Promise.all([
			"wall",
			"barrel_small",
			"barrel_large",
			"box_small",
			"box_large",
			"table_small",
			"table_medium",
			"pillar",
			"column",
			"floor_tile_large",
			"banner_red",
			"barrier",
			"stairs_wood",
			"stool",
			"torch_mounted",
			"wall_arched"
		].map((name) => loader.loadAsync(`/models/kaykit/props/${name}.gltf.glb`).then((gltf) => [name, gltf.scene]))).then((pairs) => {
			kit = Object.fromEntries(pairs);
			const root = new Group();
			const wall = kit.wall;
			if (wall) {
				for (const b of [
					{
						x0: -18,
						x1: -7,
						z0: -13,
						z1: -5,
						door: {
							x0: -13.7,
							x1: -11.1,
							z0: -6.3,
							z1: -4.3
						}
					},
					{
						x0: 7,
						x1: 18,
						z0: -13,
						z1: -5,
						door: null
					},
					{
						x0: -18,
						x1: -7,
						z0: 5,
						z1: 13,
						door: null
					},
					{
						x0: 7,
						x1: 18,
						z0: 5,
						z1: 13,
						door: null
					}
				]) {
					wallRun(root, wall, b.x0, b.z1, b.x1, b.z1, b.door);
					wallRun(root, wall, b.x1, b.z1, b.x1, b.z0, null);
					wallRun(root, wall, b.x1, b.z0, b.x0, b.z0, null);
					wallRun(root, wall, b.x0, b.z0, b.x0, b.z1, null);
				}
				wallRun(root, wall, -22, -23.6, 44, -23.6, null);
			}
			const drop = (name, x, z, yaw = 0) => {
				const src = kit?.[name];
				if (!src) return;
				const mesh = src.clone(true);
				mesh.position.set(x, 0, z);
				mesh.rotation.y = yaw;
				root.add(mesh);
			};
			drop("floor_tile_large", -12.5, -9);
			drop("table_small", -12.2, -9.2);
			drop("barrel_small", -16.2, -6.2);
			drop("barrel_large", 16.4, -6.4);
			drop("pillar", 17.2, -16.2);
			drop("pillar", 17.2, -22.4);
			drop("barrel_small", 22.4, -22.2);
			drop("table_small", 30, -22.2);
			drop("barrel_large", 34.5, -16.4);
			drop("box_small", 41, -22);
			drop("box_large", 26, -16.6);
			drop("banner_red", 24, -23.3);
			drop("barrier", 28.5, -16.2);
			drop("barrier", 37, -22.4);
			drop("stool", -14.6, -7.4);
			drop("table_medium", 32.5, -21.6);
			drop("torch_mounted", -10, -23.4);
			drop("torch_mounted", 8, -23.4);
			drop("stairs_wood", -16.2, 17.1);
			drop("column", -4, 8);
			drop("wall_arched", -12.4, -5.15, Math.PI);
			scene.add(root);
			for (const mesh of boxMeshes) if (mesh.userData.shell) mesh.visible = false;
			propKey = "";
		}).catch(() => {
			kit = null;
		});
	}
	function rigFor(b, sim) {
		if (!knight) return null;
		if (b.kind === "player") {
			if (sim.style === "runner") return rogue ?? knight;
			if (sim.style === "brute") return brute ?? knight;
			if (sim.style === "hood") return hood ?? knight;
			if (sim.style === "hex") return hex ?? knight;
			if (sim.style === "drifter") return drifter ?? knight;
			return knight;
		}
		if (b.kind === "ally") return hood ?? rogue ?? knight;
		if (b.arch === "brute") return brute;
		if (b.arch === "runner") return rogue;
		if (b.arch === "hood") return hood;
		if (b.arch === "hex") return hex;
		return b.id % 2 === 0 ? rogue : brute;
	}
	function syncFighters(sim) {
		const key = `${sim.style}|${sim.bodies.map((b) => b.id).join(",")}|${knight ? 1 : 0}${rogue ? 1 : 0}${brute ? 1 : 0}${hood ? 1 : 0}${hex ? 1 : 0}${drifter ? 1 : 0}`;
		if (key === rigKey && fighters.length === sim.bodies.length) return;
		rigKey = key;
		for (const f of fighters) {
			scene.remove(f.group);
			scene.remove(f.bar);
			f.mixer?.stopAllAction();
			for (const m of f.mats) m.dispose();
		}
		fighters.length = 0;
		for (const b of sim.bodies) {
			const rig = rigFor(b, sim);
			const made = rig ? makeRig(rig, b.kind === "player" ? 15774761 : 14964526, b.kind === "player" ? "player" : rig.moveset) : makeFighter(shared, b.kind === "player" ? PAL[0] : PAL[b.id % (PAL.length - 1) + 1]);
			made.id = b.id;
			scene.add(made.group);
			scene.add(made.bar);
			fighters.push(made);
		}
	}
	function syncProps(sim) {
		const key = `${sim.props.map((p) => p.id).join(",")}|${kit ? 1 : 0}`;
		if (key !== propKey) {
			propKey = key;
			for (const mesh of propViews) scene.remove(mesh);
			propViews.length = 0;
			for (const prop of sim.props) {
				const src = kit?.[prop.kind === "crate" ? "box_small" : prop.kind === "pipe" ? "pillar" : "barrel_small"];
				let mesh;
				if (src && prop.kind === "crate") mesh = src.clone(true);
				else if (prop.kind === "pipe") {
					mesh = new Mesh(new CylinderGeometry(.06, .06, .9, 6), new MeshLambertMaterial({ color: 10134445 }));
					mesh.rotation.z = Math.PI / 2;
				} else if (prop.kind === "bottle") mesh = new Mesh(new CylinderGeometry(.08, .1, .32, 6), new MeshLambertMaterial({ color: 6931394 }));
				else if (src) mesh = src.clone(true);
				else mesh = new Mesh(new BoxGeometry(.7, .7, .7), new MeshLambertMaterial({ color: 6968376 }));
				scene.add(mesh);
				propViews.push(mesh);
			}
		}
		sim.props.forEach((prop, i) => {
			const mesh = propViews[i];
			if (!mesh) return;
			mesh.visible = prop.alive;
			mesh.position.set(prop.x, prop.y + (prop.kind === "pipe" ? .15 : 0), prop.z);
		});
	}
	function render(sim, dt) {
		applyStage(sim.stage);
		ring.visible = sim.bout !== "off";
		ring.scale.set(7.2, 7.2, 7.2);
		ring.position.set(0, .06, 0);
		ensureWorld(sim);
		syncFighters(sim);
		syncProps(sim);
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
		const beat = sim.hitstop > 0 ? 1.8 : 1;
		rain.step(sim.reduced ? 0 : dt * beat, camera);
		for (const glow of flickers) glow.mat.opacity = sim.reduced ? .9 : .72 + Math.sin(sim.time * glow.rate) * .22;
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
		const dist = sim.scuffle ? 4.3 : 5.6;
		const cx = p.x - fx * dist;
		const cy = p.y + (sim.scuffle ? 2.1 : 2.45);
		const cz = p.z - fz * dist;
		const clipped = clipCam(p.x, p.y + 1.3, p.z, cx, cy, cz, sim.boxes);
		desired.set(clipped.x, clipped.y, clipped.z);
		target.set(p.x + fx * .4, p.y + 1.25, p.z + fz * .4);
	} else if (sim.mode === "belt") {
		const cz = Math.min(p.z + 5.15, -13.4);
		const close = cz - p.z < 3.4;
		desired.set(p.x, p.y + (close ? 7.2 : 3.45), cz);
		target.set(p.x, p.y + 1.2, p.z - .35);
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
		clip: "",
		gear: null,
		moveset: "knight"
	};
}
function poseFighter(f, b, sim, camera, dt) {
	const moving = b.grounded && Math.hypot(b.vx, b.vz) > .7 && (b.state === "free" || b.state === "atk");
	const pop = f.mixer ? 1 + Math.min(1.2, Math.max(0, b.y)) * .06 : 1 + Math.min(2.4, Math.max(0, b.y)) * .26;
	const sink = b.alive ? 1 : .55;
	const bulk = b.kind === "player" ? 1 : b.arch === "brute" ? 1.16 : b.arch === "runner" ? .92 : b.arch === "hood" ? .98 : b.arch === "hex" ? 1.04 : 1;
	f.group.visible = b.alive || b.y > -.7;
	f.group.position.set(b.x, b.y + (f.mixer || !moving ? 0 : Math.abs(Math.sin(sim.time * 12 + b.id)) * .05), b.z);
	f.group.rotation.y = b.yaw + Math.PI;
	f.group.scale.setScalar(Math.max(.05, bulk * pop * sink));
	if (f.mixer) {
		const want = resolveClip(f, b, sim);
		playClip(f, want.name, want.loop);
		if (motionNames().has(want.name)) {
			const action = f.actions[want.name];
			if (action) action.timeScale = Math.max(.75, action.getClip().duration / (sim.pair ? 2.1 : .7));
		}
		f.mixer.update(dt);
		if (f.gear) {
			f.gear.visible = b.alive && b.weapon !== "fist";
			f.gear.material.color.setHex(b.weapon === "bottle" ? 6931394 : 12042440);
		}
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
function makeRig(template, barColor, moveset = template.moveset) {
	const model = clone(template.scene);
	model.updateMatrixWorld(true);
	const bounds = new Box3().setFromObject(model);
	const scale = TARGET_HEIGHT / Math.max(.01, bounds.max.y - bounds.min.y);
	model.scale.setScalar(scale);
	model.position.y = -bounds.min.y * scale;
	const group = new Group();
	group.add(model);
	const mixer = new AnimationMixer(model);
	const actions = {};
	for (const clip of template.animations) actions[clip.name] = mixer.clipAction(clip);
	for (const clip of bakeMotion(model)) actions[clip.name] = mixer.clipAction(clip);
	const slots = [];
	model.traverse((obj) => {
		if (obj.name === "handslot.r") slots.push(obj);
	});
	const gear = new Mesh(new CylinderGeometry(.045, .05, .72, 6), new MeshLambertMaterial({ color: 12042440 }));
	gear.rotation.z = Math.PI / 3;
	gear.visible = false;
	const slot = slots[0];
	if (slot) slot.add(gear);
	else {
		gear.position.set(.28, 1.15, .2);
		group.add(gear);
	}
	const bar = new Mesh(new PlaneGeometry(.72, .08), new MeshBasicMaterial({ color: barColor }));
	const fighter = {
		id: 0,
		group,
		armL: group,
		armR: group,
		bar,
		mats: [bar.material, gear.material],
		mixer,
		actions,
		clip: "",
		gear,
		moveset
	};
	playClip(fighter, "Unarmed_Idle", true);
	return fighter;
}
function playClip(f, name, loop) {
	if (!f.mixer || f.clip === name) return;
	const next = f.actions[name] ?? f.actions.Unarmed_Idle ?? f.actions.Idle ?? f.actions.Idle_Loop;
	if (!next) return;
	const resolved = next.getClip().name;
	if (f.clip === resolved && name !== resolved) {
		f.clip = name;
		return;
	}
	const prev = f.clip ? f.actions[f.clip] : void 0;
	next.reset();
	next.setLoop(loop ? LoopRepeat : LoopOnce, loop ? Infinity : 1);
	next.clampWhenFinished = !loop;
	next.enabled = true;
	next.fadeIn(.1).play();
	if (prev && prev !== next) prev.fadeOut(.1);
	f.clip = resolved;
}
function resolveClip(f, b, sim) {
	if (sim.pair && (b.kind === "player" || b.id === sim.grabId)) {
		const id = b.kind === "player" ? sim.pair : `${sim.pair}:vic`;
		if (id in f.actions) return {
			name: id,
			loop: false
		};
	}
	const asked = slotFor(b);
	if (b.kind === "player" && (b.state === "atk" || b.state === "windup") && b.swing > 0 && b.swing < 6) {
		const id = b.swing === 3 && sim.martial === "capoeira" ? "hurricane" : b.swing === 1 ? "boxing" : b.swing === 2 ? "combo" : b.swing === 3 ? "knee" : b.swing === 4 ? "dropkick" : "elbow";
		if (id in f.actions) return {
			name: id,
			loop: false
		};
	}
	if ((b.state === "hit" || b.state === "launch") && "hit" in f.actions) return {
		name: "hit",
		loop: false
	};
	if (b.state === "down" && "flat" in f.actions) return {
		name: "flat",
		loop: false
	};
	if (b.kind === "player" && asked.slot === "idle" && sim.martial === "capoeira" && "ginga" in f.actions) return {
		name: "ginga",
		loop: true
	};
	if (b.kind === "player" && asked.slot === "idle" && sim.stance === "drunken" && "capoeira" in f.actions) return {
		name: "capoeira",
		loop: true
	};
	return {
		name: clipForMoveset(f.moveset, asked.slot, (clip) => clip in f.actions),
		loop: asked.loop
	};
}
function wallRun(root, template, x0, z0, x1, z1, gap) {
	const dx = x1 - x0;
	const dz = z1 - z0;
	const len = Math.hypot(dx, dz);
	if (len < .4) return;
	const yaw = Math.atan2(-dz, dx);
	let t = 0;
	while (t < len - .15) {
		const seg = Math.min(4, len - t);
		const mid = t + seg / 2;
		const x = x0 + dx / len * mid;
		const z = z0 + dz / len * mid;
		t += seg;
		if (gap && x > gap.x0 && x < gap.x1 && z > gap.z0 && z < gap.z1) continue;
		const mesh = template.clone(true);
		mesh.position.set(x, 0, z);
		mesh.rotation.y = yaw;
		mesh.scale.set(seg / 4, 1.2, 1);
		root.add(mesh);
	}
}
function makeRain(scene) {
	const n = 480;
	const pos = new Float32Array(n * 6);
	const vel = new Float32Array(n);
	for (let i = 0; i < n; i++) seedDrop(pos, vel, i, 0, 6, 2);
	const geo = new BufferGeometry();
	geo.setAttribute("position", new BufferAttribute(pos, 3));
	const mat = new LineBasicMaterial({
		color: 14017778,
		transparent: true,
		opacity: .42,
		depthWrite: false
	});
	const lines = new LineSegments(geo, mat);
	lines.frustumCulled = false;
	scene.add(lines);
	return { step(dt, cam) {
		lines.visible = dt > 0;
		if (dt <= 0) return;
		const attr = geo.getAttribute("position");
		const a = attr.array;
		for (let i = 0; i < n; i++) {
			const o = i * 6;
			const fall = vel[i] * dt;
			a[o + 1] -= fall;
			a[o + 4] -= fall;
			a[o] -= dt * 2.2;
			a[o + 3] -= dt * 2.2;
			const far = Math.abs(a[o] - cam.position.x) > 16 || Math.abs(a[o + 2] - cam.position.z) > 16;
			if (a[o + 1] < 0 || far) seedDrop(a, vel, i, cam.position.x, cam.position.y + 4, cam.position.z);
		}
		attr.needsUpdate = true;
	} };
}
function seedDrop(pos, vel, i, ox, oy, oz) {
	const x = ox + (Math.random() - .5) * 30;
	const y = oy + Math.random() * 12;
	const z = oz + (Math.random() - .5) * 30;
	const len = .45 + Math.random() * .55;
	const o = i * 6;
	pos[o] = x;
	pos[o + 1] = y;
	pos[o + 2] = z;
	pos[o + 3] = x + .18;
	pos[o + 4] = y - len;
	pos[o + 5] = z;
	vel[i] = 10 + Math.random() * 8;
}
function groundTex() {
	const c = document.createElement("canvas");
	c.width = 256;
	c.height = 256;
	const g = c.getContext("2d");
	if (!g) return null;
	g.fillStyle = "#1a212b";
	g.fillRect(0, 0, 256, 256);
	g.strokeStyle = "#2a3544";
	g.lineWidth = 2;
	for (let i = 0; i <= 256; i += 64) {
		g.beginPath();
		g.moveTo(i, 0);
		g.lineTo(i, 256);
		g.stroke();
		g.beginPath();
		g.moveTo(0, i);
		g.lineTo(256, i);
		g.stroke();
	}
	g.fillStyle = "rgba(90, 120, 150, 0.18)";
	for (let i = 0; i < 7; i++) {
		g.beginPath();
		g.ellipse(30 + i * 47 % 220, 20 + i * 61 % 210, 18 + i % 3 * 8, 8 + i % 2 * 4, .4, 0, Math.PI * 2);
		g.fill();
	}
	const tex = new CanvasTexture(c);
	tex.colorSpace = SRGBColorSpace;
	tex.wrapS = RepeatWrapping;
	tex.wrapT = RepeatWrapping;
	tex.repeat.set(8, 8);
	return tex;
}
function labelTex(text, fill) {
	const c = document.createElement("canvas");
	c.width = 256;
	c.height = 96;
	const g = c.getContext("2d");
	if (!g) return null;
	g.fillStyle = "#07080c";
	g.fillRect(0, 0, 256, 96);
	g.strokeStyle = fill;
	g.lineWidth = 8;
	g.strokeRect(6, 6, 244, 84);
	g.fillStyle = fill;
	g.font = "700 54px sans-serif";
	g.textAlign = "center";
	g.textBaseline = "middle";
	g.fillText(text, 128, 50);
	const tex = new CanvasTexture(c);
	tex.colorSpace = SRGBColorSpace;
	return tex;
}
function signTex() {
	const c = document.createElement("canvas");
	c.width = 512;
	c.height = 220;
	const g = c.getContext("2d");
	if (!g) return null;
	g.fillStyle = "#07080c";
	g.fillRect(0, 0, 512, 220);
	g.strokeStyle = "#3ee0c5";
	g.lineWidth = 14;
	g.strokeRect(12, 12, 488, 196);
	g.fillStyle = "#f0b429";
	g.font = "700 78px sans-serif";
	g.textAlign = "center";
	g.textBaseline = "middle";
	g.fillText("ASHLANE", 256, 118);
	const tex = new CanvasTexture(c);
	tex.colorSpace = SRGBColorSpace;
	return tex;
}
var MARTIAL = [
	{
		id: "kickboxing",
		label: "Kickboxing",
		note: "Hands, then a kick. Spin is still L.",
		clips: {
			jab: "Unarmed_Melee_Attack_Punch_A",
			cross: "Unarmed_Melee_Attack_Punch_B",
			launch: "Unarmed_Melee_Attack_Kick",
			sweep: "Unarmed_Melee_Attack_Kick",
			lunge: "Unarmed_Melee_Attack_Kick",
			spin: "2H_Melee_Attack_Spin"
		}
	},
	{
		id: "karate",
		label: "Karate",
		note: "Chop, stab, kick. Grab is still K.",
		clips: {
			jab: "1H_Melee_Attack_Chop",
			cross: "1H_Melee_Attack_Stab",
			launch: "Unarmed_Melee_Attack_Kick",
			sweep: "1H_Melee_Attack_Slice_Diagonal",
			lunge: "1H_Melee_Attack_Slice_Horizontal"
		}
	},
	{
		id: "capoeira",
		label: "Capoeira",
		note: "Kicks and spins. L is still the big spin.",
		clips: {
			jab: "Unarmed_Melee_Attack_Kick",
			cross: "2H_Melee_Attack_Spin",
			launch: "Unarmed_Melee_Attack_Kick",
			sweep: "1H_Melee_Attack_Slice_Diagonal",
			spin: "2H_Melee_Attack_Spinning",
			dodge: "Dodge_Left"
		}
	},
	{
		id: "drunken",
		label: "Drunken monkey",
		note: "Odd angles. A kick where they look for a hand.",
		clips: {
			jab: "Dualwield_Melee_Attack_Slice",
			cross: "Unarmed_Melee_Attack_Kick",
			launch: "2H_Melee_Attack_Spin",
			sweep: "Dodge_Backward",
			idle: "Walking_C",
			dodge: "Dodge_Right"
		}
	},
	{
		id: "mma",
		label: "MMA",
		note: "Punch, kick, clinch on grab.",
		clips: {
			jab: "Unarmed_Melee_Attack_Punch_A",
			cross: "Unarmed_Melee_Attack_Kick",
			launch: "Unarmed_Melee_Attack_Punch_B",
			sweep: "Unarmed_Melee_Attack_Kick",
			grab: "Interact"
		}
	},
	{
		id: "jiujitsu",
		label: "Jiu-jitsu",
		note: "Get the grab. Stick back is a neckbreaker. Stick forward is a brainbuster. Neutral is a suplex.",
		clips: {
			jab: "Interact",
			cross: "Throw",
			launch: "PickUp",
			sweep: "Unarmed_Melee_Attack_Kick",
			grab: "Throw"
		}
	},
	{
		id: "wrestling",
		label: "Wrestling",
		note: "Running hit is a clothesline. Grab, then K, is a powerbomb. Stick forward on the throw is a brainbuster. Stick back is a neckbreaker.",
		clips: {
			jab: "Throw",
			cross: "PickUp",
			launch: "2H_Melee_Attack_Stab",
			sweep: "Unarmed_Melee_Attack_Kick",
			grab: "Throw",
			spin: "2H_Melee_Attack_Spin"
		}
	},
	{
		id: "catch",
		label: "Catch wrestling",
		note: "Grab lifts them. K is a fireman's carry into the mat.",
		clips: {
			jab: "PickUp",
			cross: "Throw",
			launch: "2H_Melee_Attack_Chop",
			sweep: "Unarmed_Melee_Attack_Kick",
			grab: "PickUp"
		}
	},
	{
		id: "sambo",
		label: "Sambo",
		note: "Grab, then K, throws them back over you. That's the suplex.",
		clips: {
			jab: "Unarmed_Melee_Attack_Punch_A",
			cross: "Throw",
			launch: "Unarmed_Melee_Attack_Kick",
			sweep: "1H_Melee_Attack_Slice_Diagonal",
			grab: "Throw"
		}
	},
	{
		id: "muaythai",
		label: "Muay Thai",
		note: "Knees and kicks. A running hit still clotheslines.",
		clips: {
			jab: "Unarmed_Melee_Attack_Kick",
			cross: "Unarmed_Melee_Attack_Punch_A",
			launch: "Unarmed_Melee_Attack_Kick",
			sweep: "Unarmed_Melee_Attack_Kick",
			lunge: "Unarmed_Melee_Attack_Kick"
		}
	},
	{
		id: "savate",
		label: "Savate",
		note: "Kicks, and a running clothesline.",
		clips: {
			jab: "Unarmed_Melee_Attack_Kick",
			cross: "1H_Melee_Attack_Slice_Horizontal",
			launch: "Unarmed_Melee_Attack_Kick",
			sweep: "Dodge_Forward",
			lunge: "Unarmed_Melee_Attack_Kick"
		}
	},
	{
		id: "kenpo",
		label: "Kenpo",
		note: "Chops in a string. Grab is still there if you want the throw.",
		clips: {
			jab: "1H_Melee_Attack_Chop",
			cross: "1H_Melee_Attack_Slice_Diagonal",
			launch: "1H_Melee_Attack_Stab",
			sweep: "Unarmed_Melee_Attack_Kick"
		}
	},
	{
		id: "monkey",
		label: "Jumping monkey",
		note: "Get airborne. Hit on the way down and it dives.",
		clips: {
			jab: "Unarmed_Melee_Attack_Kick",
			cross: "Dodge_Forward",
			launch: "2H_Melee_Attack_Spin",
			sweep: "Unarmed_Melee_Attack_Kick",
			jump: "Jump_Full_Long",
			spin: "2H_Melee_Attack_Spinning"
		}
	},
	{
		id: "animals",
		label: "Five animals",
		note: "Crane chop, tiger claw, a kick. The spin is still L.",
		clips: {
			jab: "1H_Melee_Attack_Chop",
			cross: "Dualwield_Melee_Attack_Slice",
			launch: "Unarmed_Melee_Attack_Kick",
			sweep: "1H_Melee_Attack_Slice_Diagonal",
			spin: "2H_Melee_Attack_Spin"
		}
	}
];
var STANCES = [
	{
		id: "orthodox",
		label: "Orthodox",
		note: "Square. First hit is the jab.",
		idle: "Unarmed_Idle"
	},
	{
		id: "southpaw",
		label: "Southpaw",
		note: "Other lead. The first hit is the cross.",
		idle: "Idle"
	},
	{
		id: "ginga",
		label: "Ginga",
		note: "Capoeira sway. A dive with the stick neutral is a senton.",
		idle: "Walking_C"
	},
	{
		id: "drunken",
		label: "Drunken",
		note: "Loose. You can grab from farther away.",
		idle: "Walking_B"
	},
	{
		id: "crane",
		label: "Crane",
		note: "High guard. A low hit breaks poise harder.",
		idle: "Spellcasting"
	},
	{
		id: "collar",
		label: "Collar",
		note: "Wrestling posture. A neutral throw is a powerbomb.",
		idle: "2H_Melee_Idle"
	}
];
function applyStance(id) {
	retargetSlot("player", "idle", (STANCES.find((item) => item.id === id) ?? STANCES[0]).idle);
}
function applyMartial(id) {
	const row = MARTIAL.find((item) => item.id === id);
	if (!row) return;
	for (const [slot, clip] of Object.entries(row.clips)) if (clip) retargetSlot("player", slot, clip);
}
var KEY = "ashlane-fighter-v1";
function saveFighter(style, martial, stance) {
	localStorage.setItem(KEY, JSON.stringify({
		style,
		martial,
		stance,
		slots: MOVESETS.player?.clips ?? {}
	}));
}
function loadFighter() {
	try {
		const raw = JSON.parse(localStorage.getItem(KEY) || "null");
		if (!raw || typeof raw.style !== "string") return null;
		return {
			style: raw.style,
			martial: raw.martial || "",
			stance: raw.stance || "orthodox",
			slots: raw.slots ?? {}
		};
	} catch {
		return null;
	}
}
function applyFighter(style, martial, slots) {
	equipStyle(style);
	if (martial) applyMartial(martial);
	for (const [slot, clip] of Object.entries(slots)) if (clip) retargetSlot("player", slot, clip);
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
	sim.clearedMission = loadCleared();
	const fighter = loadFighter();
	if (fighter) {
		sim.style = fighter.style;
		sim.martial = fighter.martial;
		sim.stance = fighter.stance;
		applyFighter(fighter.style, fighter.martial, fighter.slots);
		applyStance(fighter.stance);
	}
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
		setStyle(id) {
			sim.style = id;
			equipStyle(id);
			if (sim.martial) applyMartial(sim.martial);
			applyStance(sim.stance);
			saveFighter(sim.style, sim.martial, sim.stance);
			push(snapshot(sim));
		},
		setMartial(id) {
			sim.martial = id;
			equipStyle(sim.style);
			applyMartial(id);
			applyStance(sim.stance);
			saveFighter(sim.style, sim.martial, sim.stance);
			push(snapshot(sim));
		},
		setStance(id) {
			sim.stance = id;
			applyStance(id);
			saveFighter(sim.style, sim.martial, sim.stance);
			push(snapshot(sim));
		},
		setStage(id) {
			sim.stage = id;
			push(snapshot(sim));
		},
		startBout(kind, stage) {
			unlock();
			startBout(sim, kind, stage);
			push(snapshot(sim));
		},
		startStory(index) {
			unlock();
			startStory(sim, index);
			push(snapshot(sim));
		},
		assignClip(slot, clip) {
			retargetSlot("player", slot, clip);
			saveFighter(sim.style, sim.martial, sim.stance);
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
var ARENAS = [
	{
		id: "ward",
		label: "Cinder ward",
		note: "The whole lane."
	},
	{
		id: "dock",
		label: "Dock",
		note: "Blue rain. You see less of the street."
	},
	{
		id: "pit",
		label: "Pit",
		note: "Warm lamps. The fog sits low."
	},
	{
		id: "high",
		label: "High line",
		note: "The coil. Dive from the scaffolds."
	},
	{
		id: "yard",
		label: "Yard",
		note: "Pale gravel. Open."
	},
	{
		id: "under",
		label: "Underpass",
		note: "Dark. They have to come in close."
	}
];
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
	const [suite, setSuite] = (0, import_react.useState)(false);
	const [menu, setMenu] = (0, import_react.useState)("main");
	const [arena, setArena] = (0, import_react.useState)("ward");
	const [slot, setSlot] = (0, import_react.useState)("jab");
	const [clip, setClip] = (0, import_react.useState)("Unarmed_Melee_Attack_Punch_A");
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
						playing && hud.flow > 8 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "pointer-events-none absolute right-4 top-10 font-display text-xs text-brass",
							children: ["FLOW ", hud.flow]
						}) : null,
						playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "pointer-events-none absolute bottom-3 left-4 max-w-[70%] text-sm text-cream-dim",
							children: objective(hud)
						}) : null,
						!hud.running ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "veil absolute inset-0 flex items-end justify-center p-4 sm:items-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "max-h-[78%] w-full max-w-md overflow-y-auto",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-display text-3xl text-cream",
										children: "Ashlane"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-2 text-sm leading-relaxed text-cream-dim",
										children: [MISSIONS.length, " jobs. Jump, then hit: stick forward is a frog splash, stick back is a senton, stick neutral is a flying clothesline. On a grab, stick forward is a brainbuster and stick back is a neckbreaker. Stances change how you stand. Spin stays on L."]
									}),
									menu === "main" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-4 flex flex-col gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "rounded-full bg-ember px-5 py-3 font-display text-sm text-ink",
												onClick: () => api.current?.startStory(Math.min(hud.clearedMission, MISSIONS.length - 1)),
												children: "Story"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "grid grid-cols-2 gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													className: "rounded-full border border-line bg-ink-2 px-3 py-3 text-sm",
													onClick: () => api.current?.startBout("exhibit", arena),
													children: "Exhibition"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													className: "rounded-full border border-line bg-ink-2 px-3 py-3 text-sm",
													onClick: () => api.current?.startBout("practice", arena),
													children: "Practice"
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "rounded-full border border-line bg-ink-2 px-5 py-3 text-sm text-cream",
												onClick: () => {
													api.current?.setStage("ward");
													begin("roam");
												},
												children: "Ward"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "grid grid-cols-3 gap-2",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														type: "button",
														className: "rounded-full border border-line bg-ink-2 px-3 py-3 text-sm",
														onClick: () => {
															api.current?.setStage("dock");
															begin("roam");
														},
														children: "Dock"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														type: "button",
														className: "rounded-full border border-line bg-ink-2 px-3 py-3 text-sm",
														onClick: () => {
															api.current?.setStage("pit");
															begin("roam");
														},
														children: "Pit"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														type: "button",
														className: "rounded-full border border-line bg-ink-2 px-3 py-3 text-sm",
														onClick: () => {
															api.current?.setStage("high");
															begin("platform");
														},
														children: "High line"
													})
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "grid grid-cols-3 gap-2",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														type: "button",
														className: "rounded-full border border-line bg-ink-2 px-3 py-3 text-sm",
														onClick: () => setMenu("arenas"),
														children: "Arenas"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														type: "button",
														className: "rounded-full border border-line bg-ink-2 px-3 py-3 text-sm",
														onClick: () => setMenu("story"),
														children: "Jobs"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														type: "button",
														className: "rounded-full border border-line bg-ink-2 px-3 py-3 text-sm",
														onClick: () => setMenu("style"),
														children: "Customize"
													})
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
											})
										]
									}) : null,
									menu === "arenas" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-4 flex flex-col gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-sm text-cream-dim",
												children: "Pick a look. Exhibition and Practice use a ring in the middle of it. Ward still walks the whole lane."
											}),
											ARENAS.map((place) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												className: "rounded-2xl border border-line bg-ink-2 px-4 py-3 text-left",
												onClick: () => setArena(place.id),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "font-display text-sm text-brass",
													children: [place.label, arena === place.id ? " · on" : ""]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "mt-1 block text-sm text-cream-dim",
													children: place.note
												})]
											}, place.id)),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "rounded-full bg-ember px-4 py-3 font-display text-sm text-ink",
												onClick: () => api.current?.startBout("exhibit", arena),
												children: "Exhibition here"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "rounded-full border border-line px-4 py-3 text-sm",
												onClick: () => api.current?.startBout("practice", arena),
												children: "Practice here"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "rounded-full border border-line px-4 py-3 text-sm",
												onClick: () => {
													api.current?.setStage(arena);
													begin(arena === "high" ? "platform" : "roam");
												},
												children: "Walk it"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "rounded-full border border-line px-4 py-3 text-sm",
												onClick: () => setMenu("main"),
												children: "Back"
											})
										]
									}) : null,
									menu === "story" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-4 flex flex-col gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "text-sm text-cream-dim",
												children: [
													"Cleared ",
													hud.clearedMission,
													" of ",
													MISSIONS.length,
													". Later jobs stay locked until the one before them is done."
												]
											}),
											MISSIONS.map((mission, index) => {
												const locked = index > hud.clearedMission;
												return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
													type: "button",
													disabled: locked,
													className: "rounded-2xl border border-line bg-ink-2 px-4 py-3 text-left disabled:opacity-40",
													onClick: () => api.current?.startStory(index),
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "font-display text-sm text-brass",
														children: [
															mission.n,
															". ",
															mission.title,
															index < hud.clearedMission ? " · done" : ""
														]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "mt-1 block text-sm text-cream-dim",
														children: [
															mission.step,
															" ",
															mission.waves,
															" waves."
														]
													})]
												}, mission.n);
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "rounded-full border border-line px-4 py-3 text-sm",
												onClick: () => setMenu("main"),
												children: "Back"
											})
										]
									}) : null,
									menu === "style" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-4 flex flex-col gap-2",
										children: [
											STYLES.map((style) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												className: "rounded-2xl border border-line bg-ink-2 px-4 py-3 text-left",
												onClick: () => api.current?.setStyle(style.id),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "font-display text-sm text-brass",
													children: [style.label, hud.style === style.id ? " · on" : ""]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "mt-1 block text-sm text-cream-dim",
													children: style.note
												})]
											}, style.id)),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "pt-2 font-display text-xs text-brass",
												children: "Fighting style"
											}),
											MARTIAL.map((style) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												className: "rounded-2xl border border-line bg-ink-2 px-4 py-3 text-left",
												onClick: () => api.current?.setMartial(style.id),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "font-display text-sm text-brass",
													children: [style.label, hud.martial === style.id ? " · on" : ""]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "mt-1 block text-sm text-cream-dim",
													children: style.note
												})]
											}, style.id)),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "pt-2 font-display text-xs text-brass",
												children: "Stance"
											}),
											STANCES.map((stance) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												className: "rounded-2xl border border-line bg-ink-2 px-4 py-3 text-left",
												onClick: () => api.current?.setStance(stance.id),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "font-display text-sm text-brass",
													children: [stance.label, hud.stance === stance.id ? " · on" : ""]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "mt-1 block text-sm text-cream-dim",
													children: stance.note
												})]
											}, stance.id)),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "rounded-full border border-line px-4 py-3 text-sm",
												onClick: () => setMenu("library"),
												children: "Assign a single clip"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "rounded-full border border-line px-4 py-3 text-sm",
												onClick: () => setMenu("main"),
												children: "Back"
											})
										]
									}) : null,
									menu === "library" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-4 flex flex-col gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "text-sm text-cream-dim",
												children: [CLIP_NAMES.length, " clips on this skeleton, kept on every body. Bannon's Mixamo bank uses different bone names, so those files are not in the phone build. Assign one of these instead."]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
												className: "text-xs text-cream-dim",
												children: ["Slot", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
													className: "mt-1 w-full rounded-xl border border-line bg-ink-2 px-3 py-3 text-sm text-cream",
													value: slot,
													onChange: (e) => setSlot(e.target.value),
													children: ASSIGN_SLOTS.map((name) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: name }, name))
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
												className: "text-xs text-cream-dim",
												children: ["Clip", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
													className: "mt-1 w-full rounded-xl border border-line bg-ink-2 px-3 py-3 text-sm text-cream",
													value: clip,
													onChange: (e) => setClip(e.target.value),
													children: CLIP_NAMES.map((name) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: name }, name))
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												className: "rounded-full bg-brass px-4 py-3 text-sm text-ink",
												onClick: () => api.current?.assignClip(slot, clip),
												children: [
													"Assign ",
													clip,
													" to ",
													slot
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "rounded-full border border-line px-4 py-3 text-sm",
												onClick: () => setMenu("main"),
												children: "Back"
											})
										]
									}) : null,
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
						suite && hud.running ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "veil absolute inset-0 flex items-end justify-center overflow-y-auto p-4 sm:items-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "max-h-[78%] w-full max-w-sm overflow-y-auto",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display text-xl",
									children: "Customize"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 flex flex-col gap-2",
									children: [
										STYLES.map((style) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "rounded-2xl border border-line bg-ink-2 px-4 py-3 text-left",
											onClick: () => api.current?.setStyle(style.id),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-display text-sm text-brass",
												children: [style.label, hud.style === style.id ? " · on" : ""]
											})
										}, style.id)),
										MARTIAL.map((style) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											className: "rounded-2xl border border-line bg-ink-2 px-4 py-3 text-left",
											onClick: () => api.current?.setMartial(style.id),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-display text-sm text-brass",
												children: [style.label, hud.martial === style.id ? " · on" : ""]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "mt-1 block text-sm text-cream-dim",
												children: style.note
											})]
										}, style.id)),
										STANCES.map((stance) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											className: "rounded-2xl border border-line bg-ink-2 px-4 py-3 text-left",
											onClick: () => api.current?.setStance(stance.id),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-display text-sm text-brass",
												children: [stance.label, hud.stance === stance.id ? " · on" : ""]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "mt-1 block text-sm text-cream-dim",
												children: stance.note
											})]
										}, stance.id)),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "rounded-full bg-ember px-4 py-3 font-display text-sm text-ink",
											onClick: () => setSuite(false),
											children: "Done"
										})
									]
								})]
							})
						}) : null,
						hud.running && hud.paused && hud.bout === "done" && !suite ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "veil absolute inset-0 flex items-end justify-center p-4 sm:items-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "w-full max-w-sm",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-display text-xl",
										children: "Exhibition clear"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 text-sm text-cream-dim",
										children: [
											"The card is down. Flow was ",
											hud.flow,
											"."
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-4 flex flex-col gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "rounded-full bg-ember px-4 py-3 font-display text-sm text-ink",
											onClick: () => api.current?.startBout("exhibit", arena),
											children: "Run it again"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "rounded-full border border-line px-4 py-3 text-sm",
											onClick: () => api.current?.startBout("practice", arena),
											children: "Practice"
										})]
									})
								]
							})
						}) : null,
						hud.running && hud.paused && hud.missionClear && hud.bout !== "done" && !suite ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "veil absolute inset-0 flex items-end justify-center p-4 sm:items-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "w-full max-w-sm",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-display text-xl",
										children: "Job done"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm text-cream-dim",
										children: hud.missionTitle
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-4 flex flex-col gap-2",
										children: [
											hud.mission + 1 < MISSIONS.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "rounded-full bg-ember px-4 py-3 font-display text-sm text-ink",
												onClick: () => api.current?.startStory(hud.mission + 1),
												children: "Next job"
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-sm text-cream-dim",
												children: "That's the end of the four chapters."
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "rounded-full border border-line px-4 py-3 text-sm",
												onClick: () => api.current?.startStory(hud.mission),
												children: "Run it again"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "rounded-full border border-line px-4 py-3 text-sm",
												onClick: () => setSuite(true),
												children: "Customize"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "rounded-full border border-line px-4 py-3 text-sm",
												onClick: () => api.current?.pause(false),
												children: "Stay in the ward"
											})
										]
									})
								]
							})
						}) : null,
						hud.running && hud.paused && !hud.missionClear && hud.bout !== "done" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
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
	if (hud.bout === "practice") return "Practice. The bag stays. Try the dives, the grabs, and the flow counter.";
	if (hud.bout === "exhibit" || hud.bout === "done") return "Exhibition. One card in the ring. Hit them as they swing and it counts as flow.";
	if (hud.story) return `${hud.missionTitle}. Wave ${hud.wave}/${hud.waveMax}. ${hud.missionStep}`;
	if (hud.scuffle || hud.phase === "clear") return `${hud.phase}. ${hud.phaseStep}`;
	if (hud.area === "house") return hud.weapon === "fist" ? "Noodle house. Take the pipe. Smash the crate." : "Pipe's in hand. Run and the swing lunges. It snaps.";
	return `${hud.job}. ${hud.jobStep}`;
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
