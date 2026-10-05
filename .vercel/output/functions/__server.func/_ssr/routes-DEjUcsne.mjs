import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { A as PlaneGeometry, B as SphereGeometry, C as LoopRepeat, D as MeshPhongMaterial, E as MeshLambertMaterial, F as QuaternionKeyframeTrack, H as TorusGeometry, I as RepeatWrapping, L as SRGBColorSpace, M as Points, N as PointsMaterial, O as MeshStandardMaterial, P as Quaternion, R as Scene, S as LoopOnce, T as MeshBasicMaterial, U as Vector3, V as TextureLoader, W as VectorKeyframeTrack, _ as Fog, a as AnimationClip, b as LineBasicMaterial, c as BoxGeometry, d as CanvasTexture, f as CapsuleGeometry, g as DirectionalLight, h as CylinderGeometry, i as WebGLRenderer, j as PointLight, k as PerspectiveCamera, l as BufferAttribute, m as Color, n as GLTFLoader, o as AnimationMixer, p as CircleGeometry, r as clone, s as Box3, t as MeshoptDecoder, u as BufferGeometry, v as Group, w as Mesh, x as LineSegments, y as HemisphereLight, z as ShaderMaterial } from "../_libs/three.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DEjUcsne.js
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
	face: "",
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
	martial: "wrestling",
	who: "Bannon",
	bio: "",
	cast: "",
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
	clearedMission: 0,
	purse: 0,
	xp: 0,
	level: 1,
	build: "full",
	crowd: "mix",
	height: 1,
	bulk: 1,
	head: 1,
	leg: 1,
	shoulder: 1,
	headDmg: 100,
	chestDmg: 100,
	legsDmg: 100
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
var MISSIONS = [
	{
		act: 1,
		actName: "The hire",
		title: "Warm the corner",
		step: "You were paid for the plaza. The people standing there are the job. Nobody else is coming.",
		home: "plaza",
		drop: "plaza",
		stage: "ward",
		waves: 1,
		hp: 1,
		boss: false,
		rule: "clear"
	},
	{
		act: 1,
		actName: "The hire",
		title: "Scrap street",
		step: "The next pay is south of the plaza. You start on the scrap street, not back at the corner.",
		home: "street",
		drop: "street",
		stage: "ward",
		waves: 1,
		hp: 1,
		boss: false,
		rule: "clear"
	},
	{
		act: 1,
		actName: "The hire",
		title: "Night sellers",
		step: "The market hired its own hands. You come in from the stalls.",
		home: "market",
		drop: "market",
		stage: "pit",
		waves: 1,
		hp: 1.05,
		boss: false,
		rule: "clear"
	},
	{
		act: 1,
		actName: "The hire",
		title: "Walk the lane",
		step: "Start at the corner. The fight is on the scrap street. Get there, then finish who is standing.",
		home: "street",
		drop: "plaza",
		stage: "ward",
		waves: 1,
		hp: 1.05,
		boss: false,
		rule: "reach"
	},
	{
		act: 2,
		actName: "High",
		title: "The coil",
		step: "They moved the stash onto the scaffolds. You start on the roofs.",
		home: "scaffold",
		drop: "scaffold",
		stage: "high",
		waves: 1,
		hp: 1.15,
		boss: false,
		rule: "clear"
	},
	{
		act: 2,
		actName: "High",
		title: "North roof",
		step: "The crane roof is the job. Climb is already behind you. You start at the top.",
		home: "crane",
		drop: "crane",
		stage: "high",
		waves: 1,
		hp: 1.2,
		boss: false,
		rule: "clear"
	},
	{
		act: 2,
		actName: "High",
		title: "Up the steps",
		step: "Start on the coil. The name you want is on the north roof. Walk it.",
		home: "crane",
		drop: "scaffold",
		stage: "high",
		waves: 1,
		hp: 1.2,
		boss: false,
		rule: "reach"
	},
	{
		act: 2,
		actName: "High",
		title: "One on the coil",
		step: "One fighter. The roof is the ring. No second crew.",
		home: "scaffold",
		drop: "scaffold",
		stage: "high",
		waves: 1,
		hp: 1.35,
		boss: true,
		rule: "rival"
	},
	{
		act: 3,
		actName: "Rooms",
		title: "The ropes",
		step: "East of the pier. The red ropes hold the fight. You start inside them.",
		home: "ring",
		drop: "ring",
		stage: "yard",
		waves: 1,
		hp: 1.25,
		boss: false,
		rule: "inside"
	},
	{
		act: 3,
		actName: "Rooms",
		title: "The grate",
		step: "West cage. You start in the mesh. Throw them into it.",
		home: "cage",
		drop: "cage",
		stage: "yard",
		waves: 1,
		hp: 1.3,
		boss: false,
		rule: "inside"
	},
	{
		act: 3,
		actName: "Rooms",
		title: "The paper",
		step: "The back room past the market. One name keeps the paper.",
		home: "office",
		drop: "office",
		stage: "pit",
		waves: 1,
		hp: 1.45,
		boss: true,
		rule: "rival"
	},
	{
		act: 3,
		actName: "Rooms",
		title: "Through the gap",
		step: "Start in the market. The room is through the east gap. Finish it there.",
		home: "office",
		drop: "market",
		stage: "pit",
		waves: 1,
		hp: 1.3,
		boss: false,
		rule: "reach"
	},
	{
		act: 4,
		actName: "Under",
		title: "The cut",
		step: "Under the ward. You start in the cut, not on the plaza.",
		home: "under",
		drop: "under",
		stage: "under",
		waves: 1,
		hp: 1.35,
		boss: false,
		rule: "clear"
	},
	{
		act: 4,
		actName: "Under",
		title: "The train",
		step: "South tunnel. You start on the platform. Stay off the track.",
		home: "subway",
		drop: "subway",
		stage: "under",
		waves: 1,
		hp: 1.4,
		boss: false,
		rule: "clear"
	},
	{
		act: 4,
		actName: "Under",
		title: "South",
		step: "Start in the cut. The platform is further south. The fight is there.",
		home: "subway",
		drop: "under",
		stage: "under",
		waves: 1,
		hp: 1.4,
		boss: false,
		rule: "reach"
	},
	{
		act: 4,
		actName: "Under",
		title: "One on the platform",
		step: "One fighter in the tunnel. The train still runs.",
		home: "subway",
		drop: "subway",
		stage: "under",
		waves: 1,
		hp: 1.55,
		boss: true,
		rule: "rival"
	},
	{
		act: 5,
		actName: "Ends",
		title: "The trucks",
		step: "The yard. You start between the trucks.",
		home: "yard",
		drop: "yard",
		stage: "yard",
		waves: 1,
		hp: 1.45,
		boss: false,
		rule: "clear"
	},
	{
		act: 5,
		actName: "Ends",
		title: "The pier",
		step: "The pier does not wait. You start on the water side.",
		home: "dock",
		drop: "dock",
		stage: "dock",
		waves: 1,
		hp: 1.5,
		boss: false,
		rule: "clear"
	},
	{
		act: 5,
		actName: "Ends",
		title: "They come back",
		step: "The only job that sends a second crew. Beat the pier, then the ones who fell back.",
		home: "dock",
		drop: "dock",
		stage: "dock",
		waves: 2,
		hp: 1.45,
		boss: false,
		rule: "second"
	},
	{
		act: 5,
		actName: "Ends",
		title: "The pier name",
		step: "One heavier fighter on the pier. The block hears who won.",
		home: "dock",
		drop: "dock",
		stage: "dock",
		waves: 1,
		hp: 1.7,
		boss: true,
		rule: "rival"
	},
	{
		act: 6,
		actName: "Both ends",
		title: "West name",
		step: "One name in the cage. You start inside the grate.",
		home: "cage",
		drop: "cage",
		stage: "yard",
		waves: 1,
		hp: 1.7,
		boss: true,
		rule: "rival"
	},
	{
		act: 6,
		actName: "Both ends",
		title: "Back on the ropes",
		step: "The ring again, later, with heavier hands. Still one fight.",
		home: "ring",
		drop: "ring",
		stage: "yard",
		waves: 1,
		hp: 1.6,
		boss: false,
		rule: "inside"
	},
	{
		act: 6,
		actName: "Both ends",
		title: "The room holds",
		step: "Back room. The door is the boundary. You start at the desk.",
		home: "office",
		drop: "office",
		stage: "pit",
		waves: 1,
		hp: 1.65,
		boss: false,
		rule: "inside"
	},
	{
		act: 6,
		actName: "Both ends",
		title: "The drop",
		step: "One name on the crane roof. A fall is part of the fight.",
		home: "crane",
		drop: "crane",
		stage: "high",
		waves: 1,
		hp: 1.75,
		boss: true,
		rule: "rival"
	},
	{
		act: 6,
		actName: "Both ends",
		title: "Across the ward",
		step: "Start in the yard. The pier is the job. Cross it, then finish them.",
		home: "dock",
		drop: "yard",
		stage: "dock",
		waves: 1,
		hp: 1.6,
		boss: false,
		rule: "reach"
	},
	{
		act: 6,
		actName: "Both ends",
		title: "Paper Quinn",
		step: "The last paper. You start in the back room. One name.",
		home: "office",
		drop: "office",
		stage: "pit",
		waves: 1,
		hp: 1.9,
		boss: true,
		rule: "rival"
	}
].map((job, i) => ({
	...job,
	n: i + 1
}));
var KEY$1 = "ashlane-campaign-v2";
function placeName(home) {
	if (home === "street") return "Scrap street";
	if (home === "scaffold") return "Coil roofs";
	if (home === "market") return "Night market";
	if (home === "yard") return "The yard";
	if (home === "dock") return "The pier";
	if (home === "under") return "Under the ward";
	if (home === "ring") return "The ring";
	if (home === "cage") return "The cage";
	if (home === "subway") return "The platform";
	if (home === "crane") return "The crane roof";
	if (home === "office") return "The back room";
	return "Cinder plaza";
}
function ruleLabel(rule) {
	if (rule === "rival") return "One name";
	if (rule === "inside") return "The room holds you";
	if (rule === "reach") return "Walk there, then finish it";
	if (rule === "second") return "They send one more crew";
	return "The people already standing";
}
function loadCleared() {
	try {
		const n = JSON.parse(localStorage.getItem(KEY$1) || "{}").cleared ?? 0;
		return Number.isFinite(n) ? Math.max(0, Math.min(MISSIONS.length, n)) : 0;
	} catch {
		return 0;
	}
}
function loadPurse() {
	try {
		const n = JSON.parse(localStorage.getItem(KEY$1) || "{}").purse ?? 0;
		return Number.isFinite(n) ? Math.max(0, n) : 0;
	} catch {
		return 0;
	}
}
function loadXp() {
	try {
		const n = JSON.parse(localStorage.getItem(KEY$1) || "{}").xp ?? 0;
		return Number.isFinite(n) ? Math.max(0, n) : 0;
	} catch {
		return 0;
	}
}
function saveCleared(cleared, purse = 0, xp = 0) {
	localStorage.setItem(KEY$1, JSON.stringify({
		cleared,
		purse,
		xp
	}));
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
var MIXAMO = {
	hips: "Hips",
	spine: "Spine",
	chest: "Spine2",
	head: "Head",
	upperArmL: "LeftArm",
	lowerArmL: "LeftForeArm",
	handL: "LeftHand",
	upperArmR: "RightArm",
	lowerArmR: "RightForeArm",
	handR: "RightHand",
	upperLegL: "LeftUpLeg",
	lowerLegL: "LeftLeg",
	footL: "LeftFoot",
	upperLegR: "RightUpLeg",
	lowerLegR: "RightLeg",
	footR: "RightFoot"
};
var MIXAMO_COLON = {
	hips: "mixamorig:Hips",
	spine: "mixamorig:Spine",
	chest: "mixamorig:Spine2",
	head: "mixamorig:Head",
	upperArmL: "mixamorig:LeftArm",
	lowerArmL: "mixamorig:LeftForeArm",
	handL: "mixamorig:LeftHand",
	upperArmR: "mixamorig:RightArm",
	lowerArmR: "mixamorig:RightForeArm",
	handR: "mixamorig:RightHand",
	upperLegL: "mixamorig:LeftUpLeg",
	lowerLegL: "mixamorig:LeftLeg",
	footL: "mixamorig:LeftFoot",
	upperLegR: "mixamorig:RightUpLeg",
	lowerLegR: "mixamorig:RightLeg",
	footR: "mixamorig:RightFoot"
};
var UE = {
	hips: "pelvis",
	spine: "spine_01",
	chest: "spine_03",
	head: "head",
	upperArmL: "upperarm_l",
	lowerArmL: "lowerarm_l",
	handL: "hand_l",
	upperArmR: "upperarm_r",
	lowerArmR: "lowerarm_r",
	handR: "hand_r",
	upperLegL: "thigh_l",
	lowerLegL: "calf_l",
	footL: "foot_l",
	upperLegR: "thigh_r",
	lowerLegR: "calf_r",
	footR: "foot_r"
};
var QUAT = {
	hips: "Hips",
	spine: "Abdomen",
	chest: "Torso",
	head: "Head",
	upperArmL: "UpperArmL",
	lowerArmL: "LowerArmL",
	handL: "FistL",
	upperArmR: "UpperArmR",
	lowerArmR: "LowerArmR",
	handR: "FistR",
	upperLegL: "UpperLegL",
	lowerLegL: "LowerLegL",
	footL: "FootL",
	upperLegR: "UpperLegR",
	lowerLegR: "LowerLegR",
	footR: "FootR"
};
function familyFor(rest) {
	if (rest.has("DEF-hips")) return RIGIFY;
	if (rest.has("hips") && rest.has("upperarm.l")) return KAYKIT;
	if (rest.has("mixamorig:Hips")) return MIXAMO_COLON;
	if (rest.has("mixamorigHips")) return {
		...MIXAMO,
		hips: "mixamorigHips",
		spine: "mixamorigSpine",
		chest: "mixamorigSpine2",
		head: "mixamorigHead",
		upperArmL: "mixamorigLeftArm",
		lowerArmL: "mixamorigLeftForeArm",
		handL: "mixamorigLeftHand",
		upperArmR: "mixamorigRightArm",
		lowerArmR: "mixamorigRightForeArm",
		handR: "mixamorigRightHand",
		upperLegL: "mixamorigLeftUpLeg",
		lowerLegL: "mixamorigLeftLeg",
		footL: "mixamorigLeftFoot",
		upperLegR: "mixamorigRightUpLeg",
		lowerLegR: "mixamorigRightLeg",
		footR: "mixamorigRightFoot"
	};
	if (rest.has("Hips") && rest.has("LeftArm")) return MIXAMO;
	if (rest.has("UpperArmL") && rest.has("FistL")) return QUAT;
	if (rest.has("pelvis") && rest.has("spine_01")) return UE;
	return KAYKIT;
}
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
	const map = familyFor(rest);
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
var UAL_BONE = {
	"DEF-hips": "mixamorigHips",
	"DEF-spine001": "mixamorigSpine",
	"DEF-spine002": "mixamorigSpine1",
	"DEF-spine003": "mixamorigSpine2",
	"DEF-neck": "mixamorigNeck",
	"DEF-head": "mixamorigHead",
	"DEF-shoulderL": "mixamorigLeftShoulder",
	"DEF-upper_armL": "mixamorigLeftArm",
	"DEF-forearmL": "mixamorigLeftForeArm",
	"DEF-handL": "mixamorigLeftHand",
	"DEF-thighL": "mixamorigLeftUpLeg",
	"DEF-shinL": "mixamorigLeftLeg",
	"DEF-footL": "mixamorigLeftFoot",
	"DEF-toeL": "mixamorigLeftToeBase",
	"DEF-shoulderR": "mixamorigRightShoulder",
	"DEF-upper_armR": "mixamorigRightArm",
	"DEF-forearmR": "mixamorigRightForeArm",
	"DEF-handR": "mixamorigRightHand",
	"DEF-thighR": "mixamorigRightUpLeg",
	"DEF-shinR": "mixamorigRightLeg",
	"DEF-footR": "mixamorigRightFoot",
	"DEF-toeR": "mixamorigRightToeBase"
};
var QUATERNIUS_UAL_BONE = {
	"pelvis": "mixamorigHips",
	"spine_01": "mixamorigSpine",
	"spine_02": "mixamorigSpine1",
	"spine_03": "mixamorigSpine2",
	"neck_01": "mixamorigNeck",
	"Head": "mixamorigHead",
	"clavicle_l": "mixamorigLeftShoulder",
	"clavicle_r": "mixamorigRightShoulder",
	"upperarm_l": "mixamorigLeftArm",
	"upperarm_r": "mixamorigRightArm",
	"lowerarm_l": "mixamorigLeftForeArm",
	"lowerarm_r": "mixamorigRightForeArm",
	"hand_l": "mixamorigLeftHand",
	"hand_r": "mixamorigRightHand",
	"thigh_l": "mixamorigLeftUpLeg",
	"thigh_r": "mixamorigRightUpLeg",
	"calf_l": "mixamorigLeftLeg",
	"calf_r": "mixamorigRightLeg",
	"foot_l": "mixamorigLeftFoot",
	"foot_r": "mixamorigRightFoot",
	"ball_l": "mixamorigLeftToeBase",
	"ball_r": "mixamorigRightToeBase",
	"thumb_01_l": "mixamorigLeftHandThumb1",
	"thumb_02_l": "mixamorigLeftHandThumb2",
	"thumb_03_l": "mixamorigLeftHandThumb3",
	"thumb_01_r": "mixamorigRightHandThumb1",
	"thumb_02_r": "mixamorigRightHandThumb2",
	"thumb_03_r": "mixamorigRightHandThumb3",
	"index_01_l": "mixamorigLeftHandIndex1",
	"index_02_l": "mixamorigLeftHandIndex2",
	"index_03_l": "mixamorigLeftHandIndex3",
	"index_01_r": "mixamorigRightHandIndex1",
	"index_02_r": "mixamorigRightHandIndex2",
	"index_03_r": "mixamorigRightHandIndex3",
	"middle_01_l": "mixamorigLeftHandMiddle1",
	"middle_02_l": "mixamorigLeftHandMiddle2",
	"middle_03_l": "mixamorigLeftHandMiddle3",
	"middle_01_r": "mixamorigRightHandMiddle1",
	"middle_02_r": "mixamorigRightHandMiddle2",
	"middle_03_r": "mixamorigRightHandMiddle3",
	"ring_01_l": "mixamorigLeftHandRing1",
	"ring_02_l": "mixamorigLeftHandRing2",
	"ring_03_l": "mixamorigLeftHandRing3",
	"ring_01_r": "mixamorigRightHandRing1",
	"ring_02_r": "mixamorigRightHandRing2",
	"ring_03_r": "mixamorigRightHandRing3",
	"pinky_01_l": "mixamorigLeftHandPinky1",
	"pinky_02_l": "mixamorigLeftHandPinky2",
	"pinky_03_l": "mixamorigLeftHandPinky3",
	"pinky_01_r": "mixamorigRightHandPinky1",
	"pinky_02_r": "mixamorigRightHandPinky2",
	"pinky_03_r": "mixamorigRightHandPinky3"
};
var ualRoot = null;
var ualClips = [];
function setUal(root, clips) {
	ualRoot = root;
	ualClips = clips;
}
function retargetUal(target) {
	if (!ualRoot || ualClips.length === 0) return [];
	const sourceRest = /* @__PURE__ */ new Map();
	ualRoot.traverse((obj) => {
		if (obj.name) sourceRest.set(obj.name, obj.quaternion.clone());
	});
	const targetRest = /* @__PURE__ */ new Map();
	target.traverse((obj) => {
		if (obj.name) targetRest.set(obj.name, obj.quaternion.clone());
	});
	const colonTarget = targetRest.has("mixamorig:Hips");
	const fixDest = (d) => colonTarget && d.startsWith("mixamorig") && !d.includes(":") ? d.replace("mixamorig", "mixamorig:") : d;
	const out = [];
	for (const clip of ualClips) {
		if (clip.name === "A_TPose") continue;
		const tracks = [];
		for (const track of clip.tracks) {
			if (!track.name.endsWith(".quaternion")) continue;
			const bone = track.name.slice(0, -11);
			const destRaw = UAL_BONE[bone] ?? QUATERNIUS_UAL_BONE[bone];
			const dest = destRaw ? fixDest(destRaw) : void 0;
			const qS = sourceRest.get(bone);
			const qT = dest ? targetRest.get(dest) : void 0;
			if (!dest || !qS || !qT) continue;
			const count = track.times.length;
			const next = new Float32Array(count * 4);
			const key = new Quaternion();
			const rel = new Quaternion();
			const inv = qS.clone().invert();
			const written = new Quaternion();
			for (let i = 0; i < count; i++) {
				key.fromArray(track.values, i * 4);
				rel.copy(inv).multiply(key);
				written.copy(qT).multiply(rel);
				written.toArray(next, i * 4);
			}
			tracks.push(new QuaternionKeyframeTrack(`${dest}.quaternion`, Array.from(track.times), Array.from(next)));
		}
		if (tracks.length) out.push(new AnimationClip(clip.name, clip.duration, tracks));
	}
	return out;
}
var a = (id, label, file) => ({
	id,
	label,
	file
});
var ROSTER = [
	{
		id: "bannon",
		name: "Bannon",
		martial: "wrestling",
		bio: "The physical nucleus and absolute force of the Bannon Engine. Driven by raw physics and unmatched grit.",
		attires: [a("muscle", "Muscular", "BANNON_muscular_skinned.glb")]
	},
	{
		id: "maime",
		name: "Maime",
		martial: "drunken",
		bio: "Marquis's chaotic alter-ego. Raw, unchecked, self-destructive momentum.",
		attires: [a("base", "Base", "MAIME_skinned.glb"), a("tattered", "Tattered", "MAIME_tattered_skinned.glb")]
	},
	{
		id: "brutus",
		name: "Brutus",
		martial: "boxing",
		bio: "Gritty cruiserweight with heavy iron hands. He wants the fight in close.",
		attires: [a("base", "Base", "BRUTUS.glb")]
	},
	{
		id: "cain",
		name: "Cain Elias",
		martial: "catch",
		bio: "Cold corporate enforcer. The throw plants them.",
		attires: [a("gear", "Gear", "CAIN_ELIAS_gear.glb"), a("snakeskin", "Snakeskin", "CAIN_ELIAS_snakeskin.glb")]
	},
	{
		id: "viper",
		name: "Viper",
		martial: "kickboxing",
		bio: "Cold long-range southpaw. A shoulder roll, then a kick with reach.",
		attires: [a("base", "Base", "VIPER.glb")]
	},
	{
		id: "titan",
		name: "Titan",
		martial: "catch",
		bio: "Every step is a tremor. The colossal powerhouse.",
		attires: [a("mask", "Masked", "TITAN.glb"), a("open", "Unmasked", "TITAN_unmasked.glb")]
	},
	{
		id: "stickup",
		name: "Stick-Up",
		martial: "muaythai",
		bio: "The system's weapon turned rebel. Takes momentum and gives it back as a teep.",
		attires: [a("base", "Base", "STICKUP.glb")]
	},
	{
		id: "finxsse",
		name: "Finxsse",
		martial: "lucha",
		bio: "Gravity is a suggestion. High-flying vanguard.",
		attires: [a("base", "Base", "NPC_FINXSSE.glb")]
	},
	{
		id: "tyneshia",
		name: "Queen Tyneshia",
		martial: "wrestling",
		bio: "A regal powerhouse. Commands the ring.",
		attires: [a("ring", "Ring", "TYNESHIA.glb"), a("street", "Street", "TYNESHIA_street.glb")]
	},
	{
		id: "onyx",
		name: "Onyx",
		martial: "mma",
		bio: "Onyx. Attires from the Brutal Fist set: base, corset, street, straightjacket.",
		attires: [
			a("base", "Base", "ONYX_skinned.glb"),
			a("corset", "Corset", "ONYX_corset_skinned.glb"),
			a("street", "Street", "ONYX_street.glb"),
			a("jacket", "Straightjacket", "ONYX_straightjacket.glb")
		]
	},
	{
		id: "cody",
		name: "Cody",
		martial: "wrestling",
		bio: "Cody. Attires from the Brutal Fist set: gear, sober, stressed.",
		attires: [
			a("gear", "Gear", "CODY_gear_skinned.glb"),
			a("sober", "Sober", "CODY_sober.glb"),
			a("stressed", "Stressed", "CODY_stressed.glb")
		]
	},
	{
		id: "cipher",
		name: "Cipher",
		martial: "kenpo",
		bio: "Cipher. The rigged body from the Brutal Fist set.",
		attires: [a("base", "Rigged", "CIPHER_rigged.glb")]
	},
	{
		id: "echo",
		name: "Echo",
		martial: "savate",
		bio: "Echo. Body from the Brutal Fist set.",
		attires: [a("base", "Base", "ECHO.glb")]
	},
	{
		id: "pablo",
		name: "Pablo",
		martial: "lucha",
		bio: "Pablo. Body from the Brutal Fist set.",
		attires: [a("base", "Base", "PABLO.glb")]
	},
	{
		id: "kobra",
		name: "Kobra",
		martial: "karate",
		bio: "Kobra. Body from the Brutal Fist set.",
		attires: [a("base", "Base", "KOBRA.glb")]
	},
	{
		id: "hollow",
		name: "Hollow",
		martial: "drunken",
		bio: "Hollow. Body from the Brutal Fist set.",
		attires: [a("base", "Base", "HOLLOW.glb")]
	},
	{
		id: "hall",
		name: "Hall Nighter",
		martial: "boxing",
		bio: "Hall Nighter. Body from the Brutal Fist set.",
		attires: [a("base", "Base", "HALL_NIGHTER.glb")]
	},
	{
		id: "edwin",
		name: "Edwin Kennedy",
		martial: "jeet",
		bio: "Edwin Kennedy. Body from the Brutal Fist set.",
		attires: [a("base", "Base", "EDWIN_KENNEDY.glb")]
	},
	{
		id: "aaron",
		name: "Aaron Ruben",
		martial: "kickboxing",
		bio: "Aaron Ruben. Body from the Brutal Fist set.",
		attires: [a("base", "Base", "AARON_RUBEN.glb")]
	},
	{
		id: "sensei",
		name: "Master Sensei",
		martial: "karate",
		bio: "Master Sensei. Body from the Brutal Fist set.",
		attires: [a("base", "Base", "MASTER_SENSEI.glb")]
	},
	{
		id: "toro",
		name: "El Toro de Oro",
		martial: "wrestling",
		bio: "El Toro de Oro. Body from the Brutal Fist set.",
		attires: [a("base", "Base", "EL_TORO_DE_ORO.glb")]
	},
	{
		id: "static",
		name: "Static",
		martial: "capoeira",
		bio: "Static. Body from the Brutal Fist set.",
		attires: [a("base", "Base", "STATIC.glb")]
	},
	{
		id: "stan",
		name: "Stan Combs",
		martial: "sambo",
		bio: "Stan Combs. Gear from the Brutal Fist set.",
		attires: [a("gear", "Gear", "STAN_COMBS_gear.glb")]
	},
	{
		id: "triplex",
		name: "Triple X",
		martial: "mma",
		bio: "Triple X. Body from the Brutal Fist set.",
		attires: [a("base", "Base", "TRIPLE_XXX.glb")]
	},
	{
		id: "wreck",
		name: "Wreck Patterson",
		martial: "catch",
		bio: "Wreck Patterson. Body from the Brutal Fist set.",
		attires: [a("base", "Base", "WRECK_PATTERSON.glb")]
	},
	{
		id: "devil",
		name: "Tarzanian Devil",
		martial: "lucha",
		bio: "Tarzanian Devil. Skinned body from the Brutal Fist set.",
		attires: [a("base", "Skinned", "TARZANIAN_DEVIL_skinned.glb")]
	},
	{
		id: "jager",
		name: "Jager",
		martial: "muaythai",
		bio: "Jager. Body from the Brutal Fist set.",
		attires: [a("base", "Base", "JAGER.glb")]
	},
	{
		id: "sombra_negra",
		name: "Sombra Negra",
		martial: "lucha",
		bio: "The Finisher Thief. Steals your finisher mid-match and beats you with it — your best self, turned.",
		attires: [a("main", "Main Attire", "SOMBRA_NEGRA_rigged.glb")]
	},
	{
		id: "quaternius_male",
		name: "Quaternius Male",
		martial: "street",
		bio: "CC0 modular base body (Quaternius). Hair, beard and brows swap in the forge — the customization-ready brawler.",
		attires: [a("base", "Base", "quaternius/Superhero_Male_FullBody.glb")]
	},
	{
		id: "quaternius_female",
		name: "Quaternius Female",
		martial: "street",
		bio: "CC0 modular base body (Quaternius). Hair, beard and brows swap in the forge — the customization-ready brawler.",
		attires: [a("base", "Base", "quaternius/Superhero_Female_FullBody.glb")]
	}
];
function fighterById(id) {
	return ROSTER.find((f) => f.id === id) ?? ROSTER[0];
}
function fighterByName(name) {
	return ROSTER.find((f) => f.name === name) ?? null;
}
var CAST_PICKS = ROSTER.flatMap((fighter) => fighter.attires.map((attire) => ({
	id: fighter.id,
	name: fighter.name,
	label: attire.label,
	file: attire.file,
	bio: fighter.bio
})));
var LEASE_NAME = "Paper Quinn";
var WARD = [
	{
		id: "soot",
		name: "Soot Calder",
		home: "plaza",
		arch: "hood",
		style: "pocket elbows",
		line: "First name on the plaza. Short work, close in."
	},
	{
		id: "moth",
		name: "Moth Ibarra",
		home: "plaza",
		arch: "runner",
		style: "in and out",
		line: "Leaves as soon as the hit lands."
	},
	{
		id: "kiln",
		name: "Kiln Duarte",
		home: "plaza",
		arch: "brute",
		style: "heavy hands",
		line: "The weight in the first pack."
	},
	{
		id: "vesper",
		name: "Vesper Cho",
		home: "plaza",
		arch: "hex",
		style: "odd angles",
		line: "Does not stand where you aimed."
	},
	{
		id: "latch",
		name: "Latch Okonkwo",
		home: "plaza",
		arch: "brawler",
		style: "straight pressure",
		line: "Walks in and does not give the step back."
	},
	{
		id: "piton",
		name: "Piton Reyes",
		home: "street",
		arch: "brawler",
		style: "long guard",
		line: "Holds the scrap street with the lead hand."
	},
	{
		id: "nim",
		name: "Nim Sato",
		home: "street",
		arch: "runner",
		style: "low line",
		line: "Lives under the punches."
	},
	{
		id: "hark",
		name: "Hark Bell",
		home: "street",
		arch: "hex",
		style: "counters",
		line: "Waits, then answers."
	},
	{
		id: "cinder",
		name: "Cinder Walsh",
		home: "street",
		arch: "brute",
		style: "shoulder first",
		line: "Clears space with the body."
	},
	{
		id: "ashen",
		name: "Ashen Pike",
		home: "scaffold",
		arch: "hood",
		style: "roof kicks",
		line: "Fights where the fall is the weapon."
	},
	{
		id: "bolt",
		name: "Bolt Ndiaye",
		home: "scaffold",
		arch: "brute",
		style: "drops",
		line: "Comes off the coil hard."
	},
	{
		id: "wren",
		name: "Wren Pell",
		home: "market",
		arch: "hex",
		style: "close and ugly",
		line: "Night market hands. Nothing pretty."
	},
	{
		id: "sable",
		name: "Sable Ortiz",
		home: "market",
		arch: "runner",
		style: "cuts the lane",
		line: "Uses the stalls."
	},
	{
		id: "gutter",
		name: "Gutter Ames",
		home: "market",
		arch: "hood",
		style: "bottle hands",
		line: "Will pick up whatever is on the table."
	},
	{
		id: "rasp",
		name: "Rasp Kovac",
		home: "yard",
		arch: "brute",
		style: "yard weight",
		line: "Works between the trucks."
	},
	{
		id: "flick",
		name: "Flick Danjuma",
		home: "yard",
		arch: "runner",
		style: "around the trucks",
		line: "Does not stand in the open."
	},
	{
		id: "hopper",
		name: "Hopper Lin",
		home: "yard",
		arch: "hood",
		style: "short hooks",
		line: "Stays in the pocket."
	},
	{
		id: "brine",
		name: "Brine Callahan",
		home: "dock",
		arch: "hex",
		style: "pier knees",
		line: "The pier is the ring."
	},
	{
		id: "hull",
		name: "Hull Ortega",
		home: "dock",
		arch: "brute",
		style: "anchor",
		line: "Does not get moved."
	},
	{
		id: "low",
		name: "Low Marrow",
		home: "under",
		arch: "brawler",
		style: "stays low",
		line: "Soot's kin. Learned it under the street."
	},
	{
		id: "drain",
		name: "Drain Peck",
		home: "under",
		arch: "hood",
		style: "dark elbows",
		line: "The underpass does not get brighter for a fight."
	},
	{
		id: "culvert",
		name: "Culvert Singh",
		home: "under",
		arch: "runner",
		style: "under the street",
		line: "Knows which wall is a door."
	},
	{
		id: "canvas",
		name: "Canvas Reed",
		home: "ring",
		arch: "brawler",
		style: "off the ropes",
		line: "Lives in the ring east of the pier."
	},
	{
		id: "aprons",
		name: "Apron Voss",
		home: "ring",
		arch: "hood",
		style: "rope run",
		line: "Uses the bounce."
	},
	{
		id: "mesh",
		name: "Mesh Calder",
		home: "cage",
		arch: "brute",
		style: "cage weight",
		line: "The west cage. Does not leave it."
	},
	{
		id: "grate",
		name: "Grate Pell",
		home: "cage",
		arch: "brawler",
		style: "into the mesh",
		line: "Throws you at the grate."
	},
	{
		id: "thirdrail",
		name: "Third Rail",
		home: "subway",
		arch: "runner",
		style: "off the platform",
		line: "South tunnel. Do not stand on the track."
	},
	{
		id: "token",
		name: "Token Ames",
		home: "subway",
		arch: "hood",
		style: "turnstile",
		line: "Fights in the narrow."
	},
	{
		id: "highbeam",
		name: "High Beam",
		home: "crane",
		arch: "hex",
		style: "the drop",
		line: "North roof. The edge is the move."
	},
	{
		id: "ledger",
		name: "Ledger Cho",
		home: "office",
		arch: "hex",
		style: "back room",
		line: "Keeps the paper past the market."
	}
];
var PARTNER = {
	name: "Rook Calder",
	style: "comes in after the plaza",
	line: "Not from the other book. Ash Lane's second."
};
var taken = /* @__PURE__ */ new Set();
function resetWard() {
	taken.clear();
}
function claimWard(home, arch) {
	const spare = WARD.find((f) => f.home === home && f.arch === arch && !taken.has(f.id)) ?? WARD.find((f) => f.arch === arch && !taken.has(f.id)) ?? WARD.find((f) => !taken.has(f.id)) ?? WARD[0];
	taken.add(spare.id);
	return spare;
}
function wardByName(name) {
	return WARD.find((f) => f.name === name) ?? null;
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
function createLockOn(maxRange = 15) {
	return {
		targetId: null,
		isLocked: false,
		candidates: [],
		index: -1,
		maxRange
	};
}
/** One lock-on press: grab nearest, or cycle/unlock if already locked. */
function lockOnPress(lock, player, bodies) {
	if (lock.isLocked) cycleOrUnlock(lock, bodies);
	else tryLockOn(lock, player, bodies);
}
function tryLockOn(lock, player, bodies) {
	const found = [];
	for (const b of bodies) {
		if (b.kind === "player" || b.kind === "ally" || !b.alive) continue;
		const dx = b.x - player.x, dz = b.z - player.z;
		const d = Math.sqrt(dx * dx + dz * dz);
		if (d < lock.maxRange) found.push({
			id: b.id,
			dist: d
		});
	}
	if (found.length === 0) return;
	found.sort((a, b) => a.dist - b.dist);
	lock.candidates = found.map((f) => f.id);
	lock.index = 0;
	applyTarget(lock, found[0].id, bodies);
}
function cycleOrUnlock(lock, bodies) {
	if (lock.candidates.length === 0) {
		clearLock(lock);
		return;
	}
	lock.index += 1;
	if (lock.index >= lock.candidates.length) clearLock(lock);
	else applyTarget(lock, lock.candidates[lock.index], bodies);
}
function applyTarget(lock, id, bodies) {
	const t = bodies.find((b) => b.id === id);
	if (!t || !t.alive) {
		clearLock(lock);
		return;
	}
	lock.targetId = id;
	lock.isLocked = true;
}
function clearLock(lock) {
	lock.targetId = null;
	lock.isLocked = false;
	lock.index = -1;
	lock.candidates = [];
}
/** Per-frame: drop lock if target died. Returns the target Body or null. */
function lockOnUpdate(lock, bodies) {
	if (!lock.isLocked || lock.targetId === null) return null;
	const t = bodies.find((b) => b.id === lock.targetId);
	if (!t || !t.alive) {
		clearLock(lock);
		return null;
	}
	return t;
}
/** Distance on the XZ plane. */
function dist(a, b) {
	const dx = b.x - a.x, dz = b.z - a.z;
	return Math.sqrt(dx * dx + dz * dz);
}
/**
* Pick the best target for a freeflow attack.
* - If the player is giving directional input (inputMag > 0.2), prefer the
*   enemy in that direction (cone check).
* - Otherwise pick the nearest living enemy.
* Mirrors CombatScript.AttackCheck().
*/
function pickFreeflowTarget(player, bodies, inputX, inputZ, inputMag, maxRange = 15) {
	const enemies = bodies.filter((b) => b.alive && b.kind !== "player" && b.kind !== "ally" && dist(player, b) < maxRange);
	if (enemies.length === 0) return null;
	if (inputMag > .2) {
		const ix = inputX / inputMag, iz = inputZ / inputMag;
		let best = null, bestDot = -2;
		for (const e of enemies) {
			const dx = e.x - player.x, dz = e.z - player.z;
			const d = Math.sqrt(dx * dx + dz * dz) || 1;
			const dot = dx / d * ix + dz / d * iz;
			if (dot > bestDot) {
				bestDot = dot;
				best = e;
			}
		}
		if (best && bestDot > .3) return best;
	}
	enemies.sort((a, b) => dist(player, a) - dist(player, b));
	return enemies[0];
}
/**
* Compute the "magnetic" lunge toward the target.
* Returns the XZ offset to apply over the attack's movement duration.
* Mirrors CombatScript.MoveTorwardsTarget() — stops 0.95 short of the target.
*/
function freeflowLunge(player, target) {
	const dx = target.x - player.x, dz = target.z - player.z;
	const d = Math.sqrt(dx * dx + dz * dz) || 1;
	const travel = Math.max(0, d - .95);
	return {
		dx: dx / d * travel,
		dz: dz / d * travel
	};
}
var MAX_ATTACKERS = 3;
/** Enemy requests permission to attack. Returns true if granted. */
function requestAttack(group, enemyId, bodies) {
	group.activeAttackers = group.activeAttackers.filter((id) => {
		const b = bodies.find((x) => x.id === id);
		return b && b.alive && (b.state === "atk" || b.state === "windup");
	});
	if (group.activeAttackers.length < MAX_ATTACKERS) {
		if (!group.activeAttackers.includes(enemyId)) group.activeAttackers.push(enemyId);
		return true;
	}
	return false;
}
/** Enemy leaves attack state — frees a slot. */
function releaseAttack(group, enemyId) {
	group.activeAttackers = group.activeAttackers.filter((id) => id !== enemyId);
}
function createWeather(startHour = 18) {
	return {
		timeOfDay: startHour,
		timeScale: 1 / 480,
		weather: startHour >= 6 && startHour < 19 ? "clear" : "clear-night",
		weatherBlend: 1,
		targetWeather: "clear",
		wetness: 0,
		windX: .3,
		windZ: .1,
		lightning: 0
	};
}
var RAINY = [
	"drizzle",
	"rain",
	"storm",
	"storm-night"
];
function updateWeather(w, dt) {
	w.timeOfDay = (w.timeOfDay + dt * w.timeScale) % 24;
	if (w.weather !== w.targetWeather) {
		w.weatherBlend = Math.min(1, w.weatherBlend + dt * .1);
		if (w.weatherBlend >= 1) w.weather = w.targetWeather;
	} else w.weatherBlend = Math.min(1, w.weatherBlend + dt * .1);
	const raining = RAINY.includes(w.weather);
	w.wetness = Math.max(0, Math.min(1, w.wetness + (raining ? dt * .08 : -dt * .02)));
	w.lightning = Math.max(0, w.lightning - dt * 3);
	if ((w.weather === "storm" || w.weather === "storm-night") && Math.random() < dt * .15) w.lightning = 1;
	w.windX += (Math.random() - .5) * dt * .4;
	w.windZ += (Math.random() - .5) * dt * .4;
	const mag = Math.hypot(w.windX, w.windZ) || 1;
	const target = raining ? 1.2 : .4;
	w.windX = w.windX / mag * target;
	w.windZ = w.windZ / mag * target;
}
/** 0..1 sun elevation; negative = night */
function sunElevation(w) {
	return Math.sin((w.timeOfDay - 6) / 12 * Math.PI);
}
function isNight(w) {
	return sunElevation(w) < .05;
}
/** Rain intensity 0..1 for particle systems */
function rainIntensity(w) {
	switch (w.weather) {
		case "drizzle": return .25;
		case "rain": return .6;
		case "storm":
		case "storm-night": return 1;
		default: return 0;
	}
}
/** Fog density 0..1 for the renderer */
function fogDensity(w) {
	return (w.weather === "fog" ? .8 : w.weather === "overcast" ? .3 : .08) + (isNight(w) ? .1 : 0);
}
var MAX_SPEED = 9;
var MIN_Y = 14;
var MAX_Y = 34;
function createFlock(n, cx, cy, cz, radius) {
	const birds = [];
	for (let i = 0; i < n; i++) {
		const a = Math.random() * Math.PI * 2;
		const r = Math.random() * radius;
		birds.push({
			x: cx + Math.cos(a) * r,
			y: cy + (Math.random() - .5) * 8,
			z: cz + Math.sin(a) * r,
			vx: (Math.random() - .5) * 6,
			vy: (Math.random() - .5) * 2,
			vz: (Math.random() - .5) * 6
		});
	}
	return {
		birds,
		cx,
		cy,
		cz,
		radius,
		scatter: 0
	};
}
/** Scatter the flock (called when a fight breaks out nearby) */
function scatterFlock(f) {
	f.scatter = 3 + Math.random() * 2;
}
function updateFlock(f, dt) {
	const n = f.birds.length;
	if (n === 0) return;
	if (f.scatter > 0) f.scatter -= dt;
	const sepW = f.scatter > 0 ? 3.2 : 1.6;
	const aliW = .9, cohW = .55;
	for (let i = 0; i < n; i++) {
		const b = f.birds[i];
		let sx = 0, sy = 0, sz = 0;
		let ax = 0, ay = 0, az = 0;
		let cx = 0, cy = 0, cz = 0;
		let na = 0;
		for (let j = 0; j < n; j++) {
			if (i === j) continue;
			const o = f.birds[j];
			const dx = b.x - o.x, dy = b.y - o.y, dz = b.z - o.z;
			const d2 = dx * dx + dy * dy + dz * dz;
			if (d2 > 196) continue;
			na++;
			ax += o.vx;
			ay += o.vy;
			az += o.vz;
			cx += o.x;
			cy += o.y;
			cz += o.z;
			if (d2 < 9 && d2 > 1e-4) {
				const d = Math.sqrt(d2);
				sx += dx / d / d;
				sy += dy / d / d;
				sz += dz / d / d;
			}
		}
		let fx = sx * sepW, fy = sy * sepW, fz = sz * sepW;
		if (na > 0) {
			fx += (ax / na - b.vx) * aliW;
			fy += (ay / na - b.vy) * aliW;
			fz += (az / na - b.vz) * aliW;
			fx += (cx / na - b.x) * cohW * .1;
			fy += (cy / na - b.y) * cohW * .1;
			fz += (cz / na - b.z) * cohW * .1;
		}
		fx += (f.cx - b.x) * .02;
		fz += (f.cz - b.z) * .02;
		fy += (f.cy - b.y) * .03;
		if (f.scatter > 0) {
			fx += (Math.random() - .5) * 30;
			fy += Math.random() * 14;
			fz += (Math.random() - .5) * 30;
		}
		b.vx += fx * dt;
		b.vy += fy * dt;
		b.vz += fz * dt;
		const sp = Math.hypot(b.vx, b.vy, b.vz) || 1;
		const max = f.scatter > 0 ? MAX_SPEED * 1.8 : MAX_SPEED;
		const cl = Math.min(sp, max) / sp;
		b.vx *= cl;
		b.vy *= cl;
		b.vz *= cl;
		b.x += b.vx * dt;
		b.y += b.vy * dt;
		b.z += b.vz * dt;
		if (b.y < MIN_Y) {
			b.y = MIN_Y;
			b.vy = Math.abs(b.vy);
		}
		if (b.y > MAX_Y) {
			b.y = MAX_Y;
			b.vy = -Math.abs(b.vy);
		}
	}
}
function createPedSystem() {
	return {
		peds: [],
		nextId: 1,
		screams: /* @__PURE__ */ new Map(),
		time: 0
	};
}
function spawnPed(s, x, z, seed) {
	const p = {
		id: s.nextId++,
		x,
		z,
		vx: 0,
		vz: 0,
		speed: 1.2 + Math.random() * .8,
		state: "wander",
		tx: x + (Math.random() - .5) * 40,
		tz: z + (Math.random() - .5) * 40,
		panicT: 0,
		screamCd: 0,
		chatterCd: 5 + Math.random() * 10,
		seed
	};
	s.peds.push(p);
	return p;
}
/**
* Alarm: a fight broke out at (x,z). Everyone in radius panics and runs away.
* Returns ids of peds that screamed (for audio).
*/
function pedAlarm(s, x, z, radius) {
	const screamers = [];
	for (const p of s.peds) {
		const dx = p.x - x, dz = p.z - z;
		const d = Math.hypot(dx, dz);
		if (d > radius) continue;
		p.state = "panic";
		p.panicT = 4 + Math.random() * 4;
		const inv = 1 / (d || 1);
		p.tx = p.x + dx * inv * (radius + 20);
		p.tz = p.z + dz * inv * (radius + 20);
		if (d < radius * .4 && p.screamCd <= 0) {
			const key = `${Math.round(x / 10)},${Math.round(z / 10)}`;
			const last = s.screams.get(key) ?? -99;
			if (s.time - last > 1.5) {
				s.screams.set(key, s.time);
				p.screamCd = 6 + Math.random() * 6;
				screamers.push(p.id);
			}
		}
	}
	return screamers;
}
function updatePeds(s, dt, onChatter) {
	s.time += dt;
	for (const p of s.peds) {
		p.screamCd = Math.max(0, p.screamCd - dt);
		p.chatterCd -= dt;
		if (p.state === "panic") {
			p.panicT -= dt;
			if (p.panicT <= 0) {
				p.state = "wander";
				pickWanderTarget(p);
			}
		} else if (p.state === "flee") {
			if (Math.hypot(p.tx - p.x, p.tz - p.z) < 2) {
				p.state = "wander";
				pickWanderTarget(p);
			}
		} else if (p.state === "wander") {
			if (Math.hypot(p.tx - p.x, p.tz - p.z) < 1.5) pickWanderTarget(p);
			if (p.chatterCd <= 0) {
				p.chatterCd = 20 + Math.random() * 30;
				onChatter?.(p.id);
			}
		}
		const wantSpeed = p.state === "panic" ? p.speed * 3.2 : p.state === "flee" ? p.speed * 2.2 : p.state === "cower" ? 0 : p.speed;
		const dx = p.tx - p.x, dz = p.tz - p.z;
		const d = Math.hypot(dx, dz);
		if (d > .01 && wantSpeed > 0) {
			const tx = dx / d * wantSpeed, tz = dz / d * wantSpeed;
			p.vx += (tx - p.vx) * Math.min(1, dt * 4);
			p.vz += (tz - p.vz) * Math.min(1, dt * 4);
		} else {
			p.vx *= 1 - Math.min(1, dt * 6);
			p.vz *= 1 - Math.min(1, dt * 6);
		}
		p.x += p.vx * dt;
		p.z += p.vz * dt;
	}
	const ps = s.peds;
	for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) {
		const a = ps[i], b = ps[j];
		const dx = a.x - b.x, dz = a.z - b.z;
		const d2 = dx * dx + dz * dz;
		if (d2 < 1 && d2 > 1e-4) {
			const d = Math.sqrt(d2);
			const push = (1 - d) * 2 * dt;
			a.x += dx / d * push;
			a.z += dz / d * push;
			b.x -= dx / d * push;
			b.z -= dz / d * push;
		}
	}
}
function pickWanderTarget(p) {
	p.tx = p.x + (Math.random() - .5) * 60;
	p.tz = p.z + (Math.random() - .5) * 60;
}
/** Cull peds beyond radius (naveenkcg/game pattern) — returns removed count */
function cullPeds(s, px, pz, radius) {
	const before = s.peds.length;
	s.peds = s.peds.filter((p) => Math.hypot(p.x - px, p.z - pz) < radius);
	return before - s.peds.length;
}
function objKey(step, oi) {
	return `${step.id}:${oi}`;
}
function currentStep(q, p) {
	return p.stepIndex < q.steps.length ? q.steps[p.stepIndex] : null;
}
/** Report an event; returns true if it advanced the quest. */
function questEvent(q, p, type, data = {}) {
	if (!p.started || p.complete || p.failed) return false;
	const step = currentStep(q, p);
	if (!step) return false;
	let advanced = false;
	step.objectives.forEach((obj, oi) => {
		if (obj.type !== type || obj.optional) return;
		if (obj.targetId && data.targetId !== obj.targetId) return;
		if (obj.faction && data.faction !== obj.faction) return;
		const key = objKey(step, oi);
		const cur = p.counts.get(key) ?? 0;
		p.counts.set(key, cur + (data.count ?? 1));
		advanced = true;
	});
	if (advanced && stepDone(step, p)) {
		p.stepIndex++;
		if (p.stepIndex >= q.steps.length) p.complete = true;
	}
	return advanced;
}
/** Timed objectives tick; returns "failed" | "advanced" | null */
function questTick(q, p, dt) {
	if (!p.started || p.complete || p.failed) return null;
	const step = currentStep(q, p);
	if (!step) return null;
	for (let oi = 0; oi < step.objectives.length; oi++) {
		const obj = step.objectives[oi];
		if (obj.type !== "survive" && obj.type !== "protect" && obj.type !== "timed_defeat") continue;
		const key = objKey(step, oi);
		const cur = p.counts.get(key) ?? 0;
		if (obj.type === "timed_defeat") {
			const left = (obj.seconds ?? 60) - cur - dt;
			p.counts.set(key, (obj.seconds ?? 60) - left);
			if (left <= 0 && !stepDone(step, p)) {
				p.failed = true;
				return "failed";
			}
		} else p.counts.set(key, cur + dt);
	}
	if (stepDone(step, p)) {
		p.stepIndex++;
		if (p.stepIndex >= q.steps.length) p.complete = true;
		return "advanced";
	}
	return null;
}
function stepDone(step, p) {
	const results = step.objectives.filter((o) => !o.optional).map((o, oi) => {
		const cur = p.counts.get(objKey(step, oi)) ?? 0;
		if (o.type === "survive" || o.type === "protect") return cur >= (o.seconds ?? 30);
		if (o.type === "reach" || o.type === "talk") return cur >= 1;
		return cur >= (o.count ?? 1);
	});
	return step.anyOf ? results.some(Boolean) : results.every(Boolean);
}
function packInput(i) {
	let b = 0;
	if (i.attack) b |= 1;
	if (i.grab) b |= 2;
	if (i.blast) b |= 4;
	if (i.jump) b |= 8;
	if (i.dash) b |= 16;
	if (i.use) b |= 32;
	if (i.lock) b |= 64;
	return b;
}
function createRecorder(seed, tickRate = 60) {
	return {
		replay: {
			version: 1,
			seed,
			frames: [],
			tickRate,
			result: ""
		},
		recording: true
	};
}
function recordFrame(r, packed, x, y) {
	if (!r.recording) return;
	r.replay.frames.push({
		input: packed,
		x: Math.round(x * 100) / 100,
		y: Math.round(y * 100) / 100
	});
}
function finishRecording(r, result) {
	r.recording = false;
	r.replay.result = result;
	return r.replay;
}
/** Serialize to a compact string for sharing/saving */
function serializeReplay(r) {
	const frames = r.frames.map((f) => `${f.input.toString(36)},${Math.round(f.x * 100)},${Math.round(f.y * 100)}`).join(";");
	return JSON.stringify({
		v: r.version,
		seed: r.seed,
		tick: r.tickRate,
		result: r.result,
		f: frames
	});
}
function createTouchState() {
	return {
		move: {
			x: 0,
			y: 0,
			active: false,
			touchId: null
		},
		buttons: {
			attack: false,
			grab: false,
			blast: false,
			jump: false,
			dash: false,
			use: false,
			lock: false,
			counter: false
		},
		camDX: 0,
		camDY: 0
	};
}
/** Convert touch state to a sim FrameInput */
function touchToInput(t) {
	return {
		x: t.move.x,
		y: t.move.y,
		attack: t.buttons.attack,
		grab: t.buttons.grab,
		blast: t.buttons.blast,
		jump: t.buttons.jump,
		dash: t.buttons.dash,
		use: t.buttons.use,
		lock: t.buttons.lock,
		counter: t.buttons.counter
	};
}
/** Update the movement stick from a touch point relative to stick center */
function stickMove(t, touchId, dx, dy, radius) {
	const len = Math.hypot(dx, dy) || 1;
	const cl = Math.min(len, radius) / len;
	t.move.x = dx * cl / radius;
	t.move.y = dy * cl / radius;
	t.move.active = true;
	t.move.touchId = touchId;
}
function stickRelease(t, touchId) {
	if (t.move.touchId === touchId) {
		t.move.x = 0;
		t.move.y = 0;
		t.move.active = false;
		t.move.touchId = null;
	}
}
/** Button layout: right-side cluster (forest-arena-game convention) */
var BUTTON_LAYOUT = {
	attack: {
		label: "ATK",
		row: 0,
		col: 1
	},
	grab: {
		label: "GRB",
		row: 0,
		col: 0
	},
	counter: {
		label: "CTR",
		row: 0,
		col: 2
	},
	jump: {
		label: "JMP",
		row: 1,
		col: 1
	},
	dash: {
		label: "DSH",
		row: 1,
		col: 0
	},
	blast: {
		label: "SPL",
		row: 1,
		col: 2
	},
	lock: {
		label: "LCK",
		row: 2,
		col: 1
	},
	use: {
		label: "USE",
		row: 2,
		col: 0
	}
};
/** Viewport helper: scale factor for touch targets on small screens */
function touchScale(viewportWidth) {
	if (viewportWidth < 400) return .85;
	if (viewportWidth < 700) return 1;
	return 1.15;
}
var DEFAULT_STREAM = {
	unloadRadius: 220,
	activeRadius: 120,
	lodDistance: 90
};
function createChunk(id, district, x, z, half) {
	return {
		id,
		district,
		x,
		z,
		half,
		state: "unloaded",
		lod: 1,
		refs: 0
	};
}
function createStreamSystem(config = DEFAULT_STREAM) {
	return {
		chunks: /* @__PURE__ */ new Map(),
		config,
		loadQueue: [],
		unloadQueue: []
	};
}
function updateStreaming(s, px, pz) {
	s.loadQueue.length = 0;
	s.unloadQueue.length = 0;
	const { unloadRadius, activeRadius, lodDistance } = s.config;
	for (const c of s.chunks.values()) {
		const d = Math.hypot(c.x - px, c.z - pz);
		c.lod = d > lodDistance ? 1 : 0;
		switch (c.state) {
			case "unloaded":
				if (d < unloadRadius) {
					c.state = "requested";
					s.loadQueue.push(c.id);
				}
				break;
			case "requested": break;
			case "loaded":
				if (d < activeRadius) c.state = "active";
				else if (d > unloadRadius) {
					c.state = "unloading";
					s.unloadQueue.push(c.id);
				}
				break;
			case "active": if (d > activeRadius && c.refs === 0) c.state = "loaded";
		}
	}
}
/**
* Step one spring bone. Call per chain from root to tip.
* parentMove = how far the parent joint moved this frame (world units).
*/
function stepSpringBone(b, dt, parentMoveX, parentMoveY, parentMoveZ) {
	const sub = Math.min(dt * 60, 2);
	for (let s = 0; s < sub; s++) {
		const h = dt / sub;
		const px = b.prev[0], py = b.prev[1], pz = b.prev[2];
		b.prev[0] = b.offset[0];
		b.prev[1] = b.offset[1];
		b.prev[2] = b.offset[2];
		const damp = 1 - b.drag;
		let nx = b.offset[0] + (b.offset[0] - px) * damp;
		let ny = b.offset[1] + (b.offset[1] - py) * damp;
		let nz = b.offset[2] + (b.offset[2] - pz) * damp;
		nx += (-b.offset[0] * b.stiffness - parentMoveX * 2.2) * h * 60 * .016;
		ny += (-b.offset[1] * b.stiffness - b.gravity * .12 - parentMoveY * 2.2) * h * 60 * .016;
		nz += (-b.offset[2] * b.stiffness - parentMoveZ * 2.2) * h * 60 * .016;
		const maxDef = .45;
		const d = Math.hypot(nx, ny, nz);
		if (d > maxDef) {
			nx = nx / d * maxDef;
			ny = ny / d * maxDef;
			nz = nz / d * maxDef;
		}
		b.offset[0] = nx;
		b.offset[1] = ny;
		b.offset[2] = nz;
	}
}
function createCounter() {
	return {
		active: 0,
		recovery: 0,
		cooldown: 0,
		count: 0
	};
}
/** Player pressed counter. Returns false if on cooldown/recovery. */
function tryCounter$1(c) {
	if (c.cooldown > 0 || c.recovery > 0 || c.active > 0) return false;
	c.active = 10;
	return true;
}
function updateCounter(c) {
	if (c.active > 0) c.active--;
	else if (c.recovery > 0) c.recovery--;
	if (c.cooldown > 0) c.cooldown--;
}
/**
* An attack with the given move data is about to hit the countering player.
* Returns "countered" | "traded" | "missed" (counter not active).
*
* Countered: attacker enters a long punishable stagger; counterer is free.
* Launchers and haymakers can't be countered — must be dodged/blocked.
*/
function resolveCounter(c, incoming) {
	if (c.active <= 0) return "missed";
	c.active = 0;
	if (incoming.launcher || incoming.id === "haymaker") {
		c.recovery = 12;
		c.cooldown = 45;
		return "traded";
	}
	c.count++;
	c.cooldown = 45;
	return "countered";
}
var MOVES = {
	jab: {
		id: "jab",
		startup: 6,
		active: 3,
		recovery: 10,
		damage: 6,
		hitstun: 12,
		blockstun: 8,
		hitstop: 3,
		range: 1.6,
		knockback: 2,
		launcher: false,
		antiAir: false
	},
	cross: {
		id: "cross",
		startup: 9,
		active: 3,
		recovery: 14,
		damage: 9,
		hitstun: 14,
		blockstun: 10,
		hitstop: 4,
		range: 1.7,
		knockback: 3,
		launcher: false,
		antiAir: false
	},
	hook: {
		id: "hook",
		startup: 12,
		active: 4,
		recovery: 18,
		damage: 13,
		hitstun: 18,
		blockstun: 12,
		hitstop: 5,
		range: 1.6,
		knockback: 5,
		launcher: false,
		antiAir: true
	},
	uppercut: {
		id: "uppercut",
		startup: 14,
		active: 4,
		recovery: 24,
		damage: 16,
		hitstun: 26,
		blockstun: 14,
		hitstop: 6,
		range: 1.5,
		knockback: 7,
		launcher: true,
		antiAir: true
	},
	kick_low: {
		id: "kick_low",
		startup: 10,
		active: 4,
		recovery: 16,
		damage: 10,
		hitstun: 14,
		blockstun: 10,
		hitstop: 4,
		range: 2,
		knockback: 3,
		launcher: false,
		antiAir: false
	},
	kick_high: {
		id: "kick_high",
		startup: 16,
		active: 4,
		recovery: 22,
		damage: 15,
		hitstun: 20,
		blockstun: 13,
		hitstop: 5,
		range: 2.2,
		knockback: 6,
		launcher: false,
		antiAir: false
	},
	elbow: {
		id: "elbow",
		startup: 8,
		active: 3,
		recovery: 12,
		damage: 8,
		hitstun: 13,
		blockstun: 9,
		hitstop: 3,
		range: 1.3,
		knockback: 2.5,
		launcher: false,
		antiAir: false
	},
	knee: {
		id: "knee",
		startup: 11,
		active: 3,
		recovery: 15,
		damage: 11,
		hitstun: 16,
		blockstun: 11,
		hitstop: 4,
		range: 1.4,
		knockback: 4,
		launcher: false,
		antiAir: false
	},
	sweep: {
		id: "sweep",
		startup: 15,
		active: 5,
		recovery: 20,
		damage: 12,
		hitstun: 24,
		blockstun: 12,
		hitstop: 5,
		range: 2.1,
		knockback: 4,
		launcher: false,
		antiAir: false
	},
	haymaker: {
		id: "haymaker",
		startup: 22,
		active: 5,
		recovery: 30,
		damage: 24,
		hitstun: 32,
		blockstun: 18,
		hitstop: 8,
		range: 1.8,
		knockback: 10,
		launcher: true,
		antiAir: false
	}
};
/** Combo damage scaling: each hit in a combo deals less (shoto-fighter pattern) */
function comboScale(hitIndex) {
	if (hitIndex <= 1) return 1;
	if (hitIndex === 2) return .9;
	if (hitIndex === 3) return .8;
	return Math.max(.5, .8 - (hitIndex - 3) * .07);
}
function parseDialogue(src) {
	const script = /* @__PURE__ */ new Map();
	const blocks = src.split(/^===\s*$/m);
	for (const block of blocks) {
		const lines = block.split("\n").map((l) => l.trimEnd()).filter((l) => l.trim());
		if (!lines.length) continue;
		const titleMatch = lines[0].match(/^===\s*(.+?)\s*===$/);
		if (!titleMatch) continue;
		const nodes = [];
		let i = 1;
		while (i < lines.length) {
			const line = lines[i];
			if (line.match(/^->\s*(.+)$/)) {
				const options = [];
				while (i < lines.length) {
					const m = lines[i].match(/^->\s*(.+)$/);
					if (!m) break;
					const label = m[1].trim();
					i++;
					const body = [];
					while (i < lines.length && /^\s{4}\S/.test(lines[i])) {
						body.push(parseLine(lines[i].trim()));
						i++;
					}
					const subName = `__opt_${nodes.length}_${options.length}`;
					script.set(subName, body);
					options.push({
						label,
						jump: subName
					});
				}
				nodes.push({ options });
				continue;
			}
			nodes.push(parseLine(line.trim()));
			i++;
		}
		script.set(titleMatch[1], nodes);
	}
	return script;
}
function parseLine(line) {
	const cmd = line.match(/^<<(.+)>>$/);
	if (cmd) {
		const parts = cmd[1].trim().split(/\s+/);
		return {
			command: parts[0],
			args: parts.slice(1)
		};
	}
	const sp = line.match(/^([^:]+):\s*(.+)$/);
	if (sp) return {
		speaker: sp[1].trim(),
		text: sp[2].trim()
	};
	return {
		speaker: "",
		text: line
	};
}
function startDialogue(script, node = "Start") {
	return {
		script,
		node,
		index: 0,
		vars: /* @__PURE__ */ new Map(),
		pendingOptions: null,
		done: false
	};
}
/** Advance one step. Returns what the UI should show/do. */
function dialogueNext(st) {
	if (st.done) return { kind: "end" };
	const nodes = st.script.get(st.node);
	if (!nodes || st.index >= nodes.length) {
		st.done = true;
		return { kind: "end" };
	}
	const node = nodes[st.index++];
	if ("options" in node) {
		st.pendingOptions = node.options;
		st.index--;
		return {
			kind: "options",
			options: node.options
		};
	}
	if ("command" in node) {
		applyCommand(st, node.command, node.args);
		return {
			kind: "command",
			command: node.command,
			args: node.args
		};
	}
	return {
		kind: "line",
		speaker: node.speaker,
		text: interpolate(st, node.text)
	};
}
/** Player picks a dialogue option (by index). */
function dialogueChoose(st, idx) {
	const opts = st.pendingOptions;
	if (!opts || idx < 0 || idx >= opts.length) return { kind: "end" };
	st.pendingOptions = null;
	st.node = opts[idx].jump;
	st.index = 0;
	return dialogueNext(st);
}
function applyCommand(st, cmd, args) {
	if (cmd === "set" && args.length >= 2) {
		const v = args[1] === "true" ? true : args[1] === "false" ? false : isNaN(Number(args[1])) ? args.slice(1).join(" ") : Number(args[1]);
		st.vars.set(args[0], v);
	} else if (cmd === "jump" && args.length >= 1) {
		st.node = args[0];
		st.index = 0;
	}
}
function interpolate(st, text) {
	return text.replace(/\{(\w+)\}/g, (_, k) => String(st.vars.get(k) ?? `{${k}}`));
}
function createDarts() {
	return {
		playerScore: 501,
		cpuScore: 501,
		darts: [],
		playerTurn: true
	};
}
/** Score a dart: segment 1-20 (25 = bull), ring 1=single 2=double 3=triple */
function dartScore(segment, ring) {
	return (segment === 25 ? 25 : segment) * (segment === 25 ? ring === 2 ? 2 : 1 : ring);
}
/** Throw with a skill value 0..1; returns the dart result */
function throwDart(skill, aimSegment, aimRing) {
	const err = (1 - skill) * 3;
	let segment = aimSegment + Math.round((Math.random() - .5) * 2 * err);
	if (segment < 1) segment = 20 + segment;
	if (segment > 20 && aimSegment !== 25) segment = segment - 20;
	const ringRoll = Math.random();
	const ring = ringRoll < skill * .3 ? aimRing : ringRoll < .6 ? 1 : aimRing === 1 ? 2 : 1;
	return {
		segment,
		ring
	};
}
/** CPU plays a 3-dart visit at the given skill */
function cpuDartsVisit(skill) {
	let total = 0;
	for (let i = 0; i < 3; i++) {
		const d = throwDart(skill, 20, 3);
		total += dartScore(d.segment, d.ring);
	}
	return total;
}
function makeDeck() {
	const ranks = [
		["A", 11],
		["2", 2],
		["3", 3],
		["4", 4],
		["5", 5],
		["6", 6],
		["7", 7],
		["8", 8],
		["9", 9],
		["10", 10],
		["J", 10],
		["Q", 10],
		["K", 10]
	];
	const deck = [];
	for (let s = 0; s < 4; s++) for (const [rank, value] of ranks) deck.push({
		rank,
		value
	});
	for (let i = deck.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[deck[i], deck[j]] = [deck[j], deck[i]];
	}
	return deck;
}
function handValue(hand) {
	let total = hand.reduce((a, c) => a + c.value, 0);
	let aces = hand.filter((c) => c.rank === "A").length;
	while (total > 21 && aces > 0) {
		total -= 10;
		aces--;
	}
	return total;
}
function dealBlackjack() {
	const deck = makeDeck();
	const st = {
		deck,
		player: [deck.pop(), deck.pop()],
		dealer: [deck.pop(), deck.pop()],
		phase: "play",
		result: ""
	};
	if (handValue(st.player) === 21) {
		st.phase = "done";
		st.result = "blackjack";
	}
	return st;
}
function bjHit(st) {
	if (st.phase !== "play") return;
	st.player.push(st.deck.pop());
	if (handValue(st.player) > 21) {
		st.phase = "done";
		st.result = "lose";
	}
}
function bjStand(st) {
	if (st.phase !== "play") return;
	while (handValue(st.dealer) < 17) st.dealer.push(st.deck.pop());
	const p = handValue(st.player), d = handValue(st.dealer);
	st.phase = "done";
	st.result = d > 21 || p > d ? "win" : p < d ? "lose" : "push";
}
function rackPool() {
	const balls = [{
		x: .25,
		y: .5,
		vx: 0,
		vy: 0,
		n: 0,
		sunk: false
	}];
	let n = 1;
	for (let row = 0; row < 5; row++) for (let k = 0; k <= row; k++) balls.push({
		x: .7 + row * .045,
		y: .5 + (k - row / 2) * .05,
		vx: 0,
		vy: 0,
		n: n++,
		sunk: false
	});
	return balls;
}
/** One physics step: friction + ball collisions (circle approx) */
function stepPool(balls, dt) {
	const R = .028, W = 1, H = .5;
	for (const b of balls) {
		if (b.sunk) continue;
		b.x += b.vx * dt;
		b.y += b.vy * dt;
		b.vx *= 1 - 1.6 * dt;
		b.vy *= 1 - 1.6 * dt;
		if (b.x < R) {
			b.x = R;
			b.vx = Math.abs(b.vx) * .8;
		}
		if (b.x > .972) {
			b.x = .972;
			b.vx = -Math.abs(b.vx) * .8;
		}
		if (b.y < R) {
			b.y = R;
			b.vy = Math.abs(b.vy) * .8;
		}
		if (b.y > .472) {
			b.y = .472;
			b.vy = -Math.abs(b.vy) * .8;
		}
		const pockets = [
			[0, 0],
			[W / 2, 0],
			[W, 0],
			[0, H],
			[W / 2, H],
			[W, H]
		];
		for (const [px, py] of pockets) if (Math.hypot(b.x - px, b.y - py) < R * 1.6) {
			b.sunk = true;
			b.vx = b.vy = 0;
		}
	}
	for (let i = 0; i < balls.length; i++) for (let j = i + 1; j < balls.length; j++) {
		const a = balls[i], b = balls[j];
		if (a.sunk || b.sunk) continue;
		const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy);
		if (d < R * 2 && d > 1e-4) {
			const nx = dx / d, ny = dy / d;
			const rel = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
			if (rel > 0) {
				a.vx -= rel * nx;
				a.vy -= rel * ny;
				b.vx += rel * nx;
				b.vy += rel * ny;
				const overlap = R * 2 - d;
				a.x -= nx * overlap / 2;
				a.y -= ny * overlap / 2;
				b.x += nx * overlap / 2;
				b.y += ny * overlap / 2;
			}
		}
	}
}
/** Tier for an attention value. */
function tierFor(v) {
	if (v >= 70) return "hunted";
	if (v >= 30) return "noticed";
	return "quiet";
}
var ENFORCERS = [
	{
		id: "grixf",
		name: "Grixf",
		canonName: "Grixf (\"The Grief Architect\" / \"The Prophet\")",
		title: "The Analyst",
		tierOrder: 0,
		minAttention: 70,
		style: "mma",
		archetype: "tricky",
		quirk: "true-believer",
		level: 4,
		backup: 1,
		bio: "Kennedy's true believer. An analyst who acts like a prophet — studies your fights, learns your habits, and shows up already knowing your favorite punch. Survived things that should have broken him; it made him certain.",
		behavior: "Patient opener: circles, reads, counters. Learns — after 30s in-fight, prioritizes counters against the player's most-used strike. Calls backup in when hurt."
	},
	{
		id: "coldFrost",
		name: "Cold Frost",
		canonName: "Dr. Cold Frost (\"The Technician\")",
		title: "The Technician",
		tierOrder: 1,
		minAttention: 78,
		style: "martial-arts",
		archetype: "balanced",
		quirk: "by-the-book",
		level: 4,
		backup: 2,
		bio: "Kennedy's surgeon. Cold, clinical, precise — dismantles people the way other men take apart engines. Doesn't trash-talk. Doesn't hurry. Every strike lands exactly where he meant it to.",
		behavior: "Surgical pressure: walks you down with fundamental strikes, targets whichever body region you've been hit in most (regional damage synergy). Never wastes a move; punishes whiffs hard."
	},
	{
		id: "machineTiger",
		name: "Machine Tiger",
		canonName: "Machine Tiger (Dynasty Asset)",
		title: "The Stiff",
		tierOrder: 2,
		minAttention: 85,
		style: "street",
		archetype: "bruiser",
		quirk: "counter",
		level: 5,
		backup: 2,
		bio: "A Dynasty asset on loan to Kennedy's operation. Doesn't flinch — broke a pool cue over his back once and threw the man through a merch stand. Stiff, mean, and patient enough to let you make the first mistake.",
		behavior: "Counter-specialist bruiser: baits attacks, punishes with heavy counters. High poise — doesn't get staggered by light hits. Loves the clinch; will trade to land the bigger shot."
	},
	{
		id: "cain",
		name: "Cain",
		canonName: "Cain Elias (\"The Executioner\")",
		title: "Kennedy's Final Answer",
		tierOrder: 3,
		minAttention: 92,
		style: "wrestling",
		archetype: "tank",
		quirk: "by-the-book",
		level: 5,
		backup: 0,
		bio: "Kennedy's most trusted enforcer. Never raises his voice — doesn't need to. Cold, vindictive, surgical. Takes people apart like he's filing paperwork. When Cain shows up alone, the message is: they don't think they need anyone else.",
		behavior: "Apex hunter: methodical takedowns into ground control. Walks through punches (high HP/poise). No backup — the fight is 1v1 and he likes it that way. Defeating Cain drops district attention hard."
	}
];
/** Attention floor per district key. */
var DISTRICT_ATTENTION_FLOOR = {
	warehouses: 15,
	strip: 10,
	alleys: 5,
	subway: 5,
	rooftops: 0,
	park: 0
};
/** Which faction's thugs show up in the "quiet" tier per district. */
var DISTRICT_THUG_FACTION = {
	strip: "unaffiliated",
	alleys: "ashes",
	warehouses: "combine",
	park: "unaffiliated",
	subway: "hollows",
	rooftops: "unaffiliated"
};
/** Attention gained per action (before district bias). */
var ATTENTION_GAIN = {
	publicBrawl: 14,
	propertyDamage: 7,
	combineDown: 18,
	enforcerDown: -25
};
/** District attention bias multipliers (from urban-mayhem districts.ts). */
var DISTRICT_ATTENTION_BIAS = {
	strip: 1,
	alleys: 1.25,
	warehouses: 1.15,
	park: .7,
	subway: 1.1,
	rooftops: .9
};
var AttentionDirector = class {
	/** Per-district attention 0-100. */
	meters = {};
	activeDistrict = "strip";
	/** Currently dispatched enforcer (hunt in progress). */
	activeEnforcer = null;
	/** Enforcer ids on cooldown (defeated recently — licking wounds). */
	enforcerCooldowns = {};
	/** Encounter cooldowns per kind (seconds). */
	encounterCooldown = 0;
	/** Time since last attention-raising action (seconds). */
	quietTime = 999;
	layingLow = false;
	events;
	constructor(events = {}) {
		this.events = events;
		for (const d of Object.keys(DISTRICT_ATTENTION_FLOOR)) this.meters[d] = DISTRICT_ATTENTION_FLOOR[d];
	}
	/** Current district the player is in. */
	get district() {
		return this.activeDistrict;
	}
	/** Attention for a district (defaults to active). */
	attentionFor(district = this.activeDistrict) {
		return this.meters[district] ?? 0;
	}
	/** Tier for a district (defaults to active). */
	tier(district = this.activeDistrict) {
		return tierFor(this.attentionFor(district));
	}
	/** The enforcer currently hunting the player, if any. */
	get hunting() {
		return this.activeEnforcer;
	}
	/**
	* Report an attention-raising action in the active district.
	* District bias multiplies gains — rough districts notice more.
	*/
	report(action, district = this.activeDistrict) {
		const bias = DISTRICT_ATTENTION_BIAS[district] ?? 1;
		const before = tierFor(this.attentionFor(district));
		const next = Math.max(0, Math.min(100, this.attentionFor(district) + ATTENTION_GAIN[action] * bias));
		this.meters[district] = next;
		if (action !== "enforcerDown") this.quietTime = 0;
		this.events.onAttention?.(action, district, next);
		const after = tierFor(next);
		if (after !== before) this.events.onTierChange?.(district, before, after, next);
	}
	/**
	* Player enters a new district. Corporate can't track you perfectly —
	* other districts' attention decays (they lose the trail), and the new
	* district applies its own meter + floor.
	*/
	enterDistrict(district) {
		if (district === this.activeDistrict) return;
		for (const d of Object.keys(this.meters)) if (d !== district) this.meters[d] = Math.max(0, this.meters[d] * .6);
		this.meters[district] = Math.max(this.meters[district] ?? 0, DISTRICT_ATTENTION_FLOOR[district] ?? 0);
		this.activeDistrict = district;
	}
	/** Player is deliberately keeping their head down (not fighting, not sprinting). */
	setLayingLow(layingLow) {
		this.layingLow = layingLow;
	}
	/** Tick decay, cooldowns, hunt logic. Call every frame with dt seconds. */
	update(dt) {
		this.quietTime += dt;
		this.encounterCooldown = Math.max(0, this.encounterCooldown - dt);
		for (const id of Object.keys(this.enforcerCooldowns)) this.enforcerCooldowns[id] = Math.max(0, this.enforcerCooldowns[id] - dt);
		const rate = this.quietTime > 5 ? this.layingLow ? 1.5 : .25 : 0;
		for (const d of Object.keys(this.meters)) {
			const floor = DISTRICT_ATTENTION_FLOOR[d] ?? 0;
			const before = tierFor(this.meters[d]);
			this.meters[d] = Math.max(floor, this.meters[d] - dt * rate);
			const after = tierFor(this.meters[d]);
			if (after !== before) this.events.onTierChange?.(d, before, after, this.meters[d]);
		}
		if (this.activeEnforcer && this.attentionFor() < 40) {
			const e = this.activeEnforcer;
			this.activeEnforcer = null;
			this.events.onHuntCalledOff?.(e, this.activeDistrict);
		}
	}
	/**
	* Ask the director for an encounter. Returns null if nothing is due
	* (cooldowns) or if the player already has an active hunt.
	* The game loop calls this periodically and spawns via char-gen.
	*/
	pollEncounter(nowSeed) {
		if (this.encounterCooldown > 0) return null;
		const district = this.activeDistrict;
		const value = this.attentionFor(district);
		const tier = tierFor(value);
		if (tier === "quiet") {
			this.encounterCooldown = 45;
			return {
				kind: "thugs",
				district,
				count: 2 + nowSeed % 2,
				faction: DISTRICT_THUG_FACTION[district] ?? "unaffiliated",
				seed: nowSeed,
				avoidable: true
			};
		}
		if (tier === "noticed") {
			this.encounterCooldown = 60;
			return {
				kind: "scouts",
				district,
				count: 2 + nowSeed % 3,
				seed: nowSeed,
				avoidable: false
			};
		}
		if (this.activeEnforcer) return null;
		const enforcer = this.pickEnforcer(value);
		if (!enforcer) return null;
		this.activeEnforcer = enforcer;
		this.encounterCooldown = 90;
		this.events.onEnforcerDispatched?.(enforcer, district);
		return {
			kind: "enforcer",
			district,
			enforcer,
			backup: enforcer.backup,
			seed: nowSeed
		};
	}
	/**
	* A named enforcer was defeated. The hunt ends, attention drops hard
	* (they back off — for now), and that enforcer won't come back soon.
	*/
	reportEnforcerDefeated(id) {
		if (this.activeEnforcer?.id === id) this.activeEnforcer = null;
		this.enforcerCooldowns[id] = 300;
		this.report("enforcerDown");
	}
	/** Pick the strongest available enforcer for the current attention. */
	pickEnforcer(value) {
		return ENFORCERS.filter((e) => value >= e.minAttention && (this.enforcerCooldowns[e.id] ?? 0) <= 0).sort((a, b) => b.tierOrder - a.tierOrder)[0] ?? null;
	}
	/** Serialize for saves. */
	toJSON() {
		return {
			meters: { ...this.meters },
			district: this.activeDistrict
		};
	}
	/** Restore from a save. */
	fromJSON(data) {
		this.meters = { ...data.meters };
		this.activeDistrict = data.district;
		this.activeEnforcer = null;
	}
	/** Full reset (new game). */
	reset() {
		for (const d of Object.keys(DISTRICT_ATTENTION_FLOOR)) this.meters[d] = DISTRICT_ATTENTION_FLOOR[d];
		this.activeDistrict = "strip";
		this.activeEnforcer = null;
		this.enforcerCooldowns = {};
		this.encounterCooldown = 0;
		this.quietTime = 999;
	}
};
var DISCIPLINES = {
	boxing: {
		range: 1,
		pressure: .78,
		counter: .76,
		grapple: .08,
		kicks: .1,
		preferred: [
			"jab",
			"cross",
			"hook"
		]
	},
	kickboxing: {
		range: 1.08,
		pressure: .8,
		counter: .52,
		grapple: .12,
		kicks: .82,
		preferred: [
			"jab",
			"low_kick",
			"hook",
			"heavy"
		]
	},
	muay_thai: {
		range: 1,
		pressure: .9,
		counter: .46,
		grapple: .48,
		kicks: .94,
		preferred: [
			"low_kick",
			"hook",
			"heavy"
		]
	},
	karate: {
		range: 1.12,
		pressure: .48,
		counter: .82,
		grapple: .12,
		kicks: .72,
		preferred: [
			"jab",
			"low_kick",
			"counter"
		]
	},
	taekwondo: {
		range: 1.18,
		pressure: .55,
		counter: .7,
		grapple: .05,
		kicks: 1,
		preferred: [
			"low_kick",
			"heavy",
			"counter"
		]
	},
	judo: {
		range: .82,
		pressure: .64,
		counter: .72,
		grapple: 1,
		kicks: .05,
		preferred: ["takedown", "counter"]
	},
	wrestling: {
		range: .82,
		pressure: .88,
		counter: .45,
		grapple: 1,
		kicks: .02,
		preferred: ["takedown", "heavy"]
	},
	bjj: {
		range: .72,
		pressure: .5,
		counter: .88,
		grapple: 1,
		kicks: .02,
		preferred: [
			"takedown",
			"submission",
			"ground_strike"
		]
	},
	sambo: {
		range: .82,
		pressure: .76,
		counter: .7,
		grapple: .92,
		kicks: .38,
		preferred: [
			"takedown",
			"low_kick",
			"submission"
		]
	},
	mma: {
		range: .94,
		pressure: .82,
		counter: .66,
		grapple: .88,
		kicks: .72,
		preferred: [
			"jab",
			"takedown",
			"ground_strike",
			"low_kick"
		]
	},
	street_boxing: {
		range: .94,
		pressure: .92,
		counter: .36,
		grapple: .3,
		kicks: .18,
		preferred: [
			"hook",
			"heavy",
			"jab"
		]
	},
	dirty_boxing: {
		range: .78,
		pressure: .96,
		counter: .3,
		grapple: .66,
		kicks: .04,
		preferred: [
			"hook",
			"heavy",
			"takedown"
		]
	},
	savate: {
		range: 1.16,
		pressure: .62,
		counter: .72,
		grapple: .08,
		kicks: .92,
		preferred: [
			"low_kick",
			"jab",
			"counter"
		]
	},
	capoeira: {
		range: 1.04,
		pressure: .58,
		counter: .76,
		grapple: .16,
		kicks: .98,
		preferred: [
			"low_kick",
			"heavy",
			"counter"
		]
	},
	combat_sambo: {
		range: .88,
		pressure: .9,
		counter: .62,
		grapple: .94,
		kicks: .48,
		preferred: [
			"takedown",
			"heavy",
			"submission"
		]
	},
	catch_wrestling: {
		range: .76,
		pressure: .74,
		counter: .8,
		grapple: 1,
		kicks: .02,
		preferred: ["takedown", "submission"]
	},
	sumo: {
		range: .72,
		pressure: 1,
		counter: .28,
		grapple: .82,
		kicks: 0,
		preferred: ["heavy", "takedown"]
	},
	silat: {
		range: .92,
		pressure: .78,
		counter: .78,
		grapple: .62,
		kicks: .76,
		preferred: [
			"low_kick",
			"counter",
			"takedown"
		]
	},
	wing_chun: {
		range: .76,
		pressure: .86,
		counter: .82,
		grapple: .26,
		kicks: .2,
		preferred: [
			"jab",
			"cross",
			"counter"
		]
	},
	krav_maga: {
		range: .86,
		pressure: .94,
		counter: .5,
		grapple: .58,
		kicks: .52,
		preferred: [
			"heavy",
			"low_kick",
			"takedown"
		]
	},
	aikido: {
		range: .82,
		pressure: .22,
		counter: .96,
		grapple: .86,
		kicks: .02,
		preferred: [
			"counter",
			"takedown",
			"submission"
		]
	},
	jeet_kune_do: {
		range: 1.02,
		pressure: .74,
		counter: .86,
		grapple: .34,
		kicks: .62,
		preferred: [
			"jab",
			"counter",
			"low_kick"
		]
	},
	panantukan: {
		range: .82,
		pressure: .88,
		counter: .68,
		grapple: .5,
		kicks: .08,
		preferred: [
			"hook",
			"counter",
			"takedown"
		]
	},
	luta_livre: {
		range: .76,
		pressure: .68,
		counter: .82,
		grapple: .98,
		kicks: .05,
		preferred: [
			"takedown",
			"submission",
			"ground_strike"
		]
	}
};
var MODIFIERS = {
	pressure: {
		pressure: .18,
		counter: -.08,
		risk: .16,
		speed: .06
	},
	counter_striker: {
		pressure: -.08,
		counter: .18,
		risk: -.1,
		speed: .03
	},
	grinder: {
		pressure: .08,
		grapple: .14,
		risk: .05
	},
	rangy: {
		range: .16,
		counter: .1,
		risk: -.04,
		speed: .08
	},
	brawler: {
		pressure: .2,
		counter: -.14,
		risk: .22,
		speed: .02
	},
	defensive: {
		pressure: -.18,
		counter: .22,
		risk: -.18
	},
	submission_hunter: {
		grapple: .22,
		risk: .02,
		speed: -.02
	},
	tactical: {
		counter: .14,
		risk: -.08,
		speed: .04
	}
};
Object.keys(DISCIPLINES);
Object.keys(MODIFIERS);
var clamp01 = (v, lo = 0, hi = 1.25) => Math.max(lo, Math.min(hi, v));
var assignments = /* @__PURE__ */ new Map();
/** Assign a style to an actor. Returns the style id (discipline_modifier). */
function assignStyle(actorId, discipline = "mma", modifier = "tactical", skill = .5) {
	if (!DISCIPLINES[discipline]) discipline = "mma";
	if (!MODIFIERS[modifier]) modifier = "tactical";
	const id = `${discipline}_${modifier}`;
	assignments.set(actorId, {
		id,
		discipline,
		modifier,
		skill: clamp01(skill, 0, 1)
	});
	return id;
}
/** Create a fresh NPC state. */
function makeNpc(id, opts = {}) {
	return {
		id,
		brain: "wander",
		brainT: 0,
		faction: "civilian",
		alert: 0,
		aggro: 0,
		brave: .3,
		meleeSkill: .2,
		style: "street",
		hp: 100,
		alive: true,
		pursueId: null,
		investigateX: 0,
		investigateZ: 0,
		lastKnownX: 0,
		lastKnownZ: 0,
		lastKnownT: 0,
		searchT: 0,
		...opts
	};
}
function createServices() {
	const stream = createStreamSystem();
	for (const [name, x, z] of [
		[
			"strip",
			0,
			0
		],
		[
			"alleys",
			-60,
			40
		],
		[
			"warehouses",
			70,
			-50
		],
		[
			"park",
			-40,
			-70
		],
		[
			"subway",
			30,
			70
		],
		[
			"rooftops",
			90,
			60
		]
	]) stream.chunks.set(name, createChunk(name, name, x, z, 55));
	return {
		weather: createWeather(18),
		flock: createFlock(9, 0, 24, 0, 40),
		peds: createPedSystem(),
		recorder: createRecorder(Math.random() * 4294967295 >>> 0),
		touch: createTouchState(),
		stream,
		attention: new AttentionDirector({ onTierChange: (d, from, to, v) => {} }),
		quest: null,
		questProgress: null,
		dialogue: null,
		counters: /* @__PURE__ */ new Map(),
		styles: /* @__PURE__ */ new Map(),
		npcBrains: /* @__PURE__ */ new Map(),
		springs: /* @__PURE__ */ new Map(),
		darts: null,
		blackjack: null,
		pool: null,
		pendingEncounter: null,
		encounterT: 5,
		pedT: 0,
		lastFoeCount: -1,
		lastCombo: 0,
		briefStep: -1
	};
}
/** Framedata for a named move; falls back to jab. */
function moveData(id) {
	return MOVES[id] ?? MOVES.jab;
}
/** Combo damage multiplier for the current sim.combo count. */
function comboDamageScale(combo) {
	return comboScale(combo);
}
/** Get (or create) the parry state for a body. */
function counterFor(s, bodyId) {
	let c = s.counters.get(bodyId);
	if (!c) {
		c = createCounter();
		s.counters.set(bodyId, c);
	}
	return c;
}
/** Attempt a parry for a body. Returns true if the parry window opened. */
function tryParry(s, bodyId) {
	return tryCounter$1(counterFor(s, bodyId));
}
/**
* Resolve an incoming hit against a defender's parry window.
* Returns "countered" | "traded" | "missed".
*/
function resolveParry(s, bodyId, moveId) {
	const c = s.counters.get(bodyId);
	if (!c) return "missed";
	return resolveCounter(c, moveData(moveId));
}
/** Tick all parry states (called each sim step). */
function tickCounters(s) {
	for (const c of s.counters.values()) updateCounter(c);
}
/** Assign an urban-mayhem fighting style to a body (192 discipline x modifier combos). */
function styleFor(s, bodyId, discipline, modifier) {
	const existing = s.styles.get(bodyId);
	if (existing) return existing;
	const id = assignStyle(String(bodyId), discipline, modifier);
	s.styles.set(bodyId, id);
	return id;
}
function reportAttention(s, action, district) {
	s.attention.report(action, district);
}
function questObjective(s, type, data) {
	if (!s.quest || !s.questProgress) return false;
	return questEvent(s.quest, s.questProgress, type, data ?? {});
}
function openDialogue(s, src, node = "Start") {
	s.dialogue = startDialogue(parseDialogue(src), node);
	return dialogueNext(s.dialogue);
}
function advanceDialogue(s) {
	if (!s.dialogue) return { kind: "end" };
	const ev = dialogueNext(s.dialogue);
	if (ev.kind === "end") s.dialogue = null;
	return ev;
}
function chooseDialogue(s, idx) {
	if (!s.dialogue) return { kind: "end" };
	const ev = dialogueChoose(s.dialogue, idx);
	if (ev.kind === "end") s.dialogue = null;
	return ev;
}
function recordSimInput(s, input) {
	recordFrame(s.recorder, packInput(input), input.x, input.y);
}
function touchInput(s) {
	return touchToInput(s.touch);
}
function replayJSON(s, result) {
	return serializeReplay(finishRecording(s.recorder, result));
}
function openDarts(s) {
	s.darts = createDarts();
	return s.darts;
}
function openBlackjack(s) {
	s.blackjack = dealBlackjack();
	return s.blackjack;
}
function openPool(s) {
	s.pool = rackPool();
	return s.pool;
}
/** Scatter peds when a fight breaks out (also scatters the bird flock). */
function alarmPeds(s, x, z, radius = 18) {
	const screamers = pedAlarm(s.peds, x, z, radius);
	scatterFlock(s.flock);
	return screamers;
}
/**
* Tick every service once per sim step. Pure additive logic — safe to call
* with services attached or skipped entirely when null.
*/
function tickSimServices(sim, input, dt) {
	const s = sim.services;
	if (!s) return;
	const p = sim.bodies[0];
	updateWeather(s.weather, dt);
	s.attention.update(dt);
	s.encounterT -= dt;
	if (s.encounterT <= 0) {
		s.encounterT = 7;
		const enc = s.attention.pollEncounter(Math.random() * 4294967295 >>> 0);
		if (enc && !s.pendingEncounter) {
			s.pendingEncounter = enc;
			if (enc.kind === "enforcer") {
				sim.banner = `${enc.enforcer.name} is hunting you`;
				sim.bannerT = 2.5;
			} else if (enc.kind === "scouts") {
				sim.banner = "Combine scouts sweeping the area";
				sim.bannerT = 2;
			}
		}
	}
	if (p && sim.combo > 0 && s.lastCombo === 0) {
		reportAttention(s, "publicBrawl");
		alarmPeds(s, p.x, p.z);
	}
	s.lastCombo = sim.combo;
	if (s.quest && s.questProgress) {
		const res = questTick(s.quest, s.questProgress, dt);
		if (res === "failed") {
			sim.banner = "Mission failed";
			sim.bannerT = 2;
		} else if (res === "advanced" && s.questProgress.complete) {
			sim.banner = "Mission complete";
			sim.bannerT = 2.5;
		}
		let foes = 0;
		for (const b of sim.bodies) if (b.kind === "grunt" && b.alive) foes++;
		if (s.lastFoeCount >= 0 && foes < s.lastFoeCount) questObjective(s, "defeat", { count: s.lastFoeCount - foes });
		s.lastFoeCount = foes;
	}
	if (p) {
		s.pedT -= dt;
		if (s.pedT <= 0) {
			s.pedT = 1;
			cullPeds(s.peds, p.x, p.z, 90);
			let want = 14;
			if (sunElevation(s.weather) < .05) want = 8;
			let guard = 0;
			while (s.peds.peds.length < want && guard++ < 6) {
				const a = Math.random() * Math.PI * 2;
				const r = 25 + Math.random() * 40;
				const ped = spawnPed(s.peds, p.x + Math.cos(a) * r, p.z + Math.sin(a) * r, Math.random() * 1e9 | 0);
				s.npcBrains.set(ped.id, makeNpc(`ped-${ped.id}`, { faction: "civilian" }));
			}
		}
		updatePeds(s.peds, dt);
		const fighting = sim.combo > 0;
		for (const ped of s.peds.peds) {
			const brain = s.npcBrains.get(ped.id);
			if (!brain) continue;
			const d = Math.hypot(ped.x - p.x, ped.z - p.z);
			if (fighting && d < 14 && brain.brain !== "flee") {
				brain.brain = "flee";
				ped.state = "flee";
				ped.tx = ped.x + (ped.x - p.x) * 2;
				ped.tz = ped.z + (ped.z - p.z) * 2;
			} else if (!fighting && brain.brain === "flee" && ped.state === "wander") brain.brain = "wander";
		}
	}
	updateFlock(s.flock, dt);
	tickCounters(s);
	recordSimInput(s, input);
	if (p) updateStreaming(s.stream, p.x, p.z);
}
var R = .42;
var STREET = [
	"Cinder",
	"Bolt",
	"Moth",
	"Vesper",
	"Kiln",
	"Ashen",
	"Piton",
	"Rook",
	"Soot",
	"Latch",
	"Nim",
	"Hark"
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
function box(minX, maxX, minZ, maxZ, h, kind, hp = 0, role = "") {
	return {
		minX,
		maxX,
		minY: 0,
		maxY: h,
		minZ,
		maxZ,
		kind,
		hp,
		role
	};
}
function buildBoxes() {
	return [
		box(-26, -2, -26, -24, 3, "wall"),
		box(4, 48, -26, -24, 3, "wall"),
		box(-26, -6, 24, 26, 3, "wall"),
		box(-1, 26, 24, 26, 3, "wall"),
		box(-26, -24, -26, -1, 3, "wall"),
		box(-26, -24, 5, 26, 3, "wall"),
		box(-48, -46, -14, -3, 3, "wall"),
		box(-48, -46, 3, 14, 3, "wall"),
		box(-48, -24, -14, -12, 3, "wall"),
		box(-48, -24, 12, 14, 3, "wall"),
		box(-40, -37.2, -4, -1.2, 1.5, "wall"),
		box(-34.2, -32, 3.4, 6.6, 1.7, "wall"),
		box(-44.4, -42.2, 1.2, 5.4, 2.1, "wall"),
		box(-10, -8, 24, 46, 2.4, "wall"),
		box(6, 8, 24, 46, 2.4, "wall"),
		box(-10, -3, 44, 46, 2.6, "wall"),
		box(3, 8, 44, 46, 2.6, "wall"),
		box(-4.2, -3, 31.6, 33.2, 1.5, "wall"),
		box(1.6, 2.8, 37.4, 39, 1.5, "wall"),
		box(-8, -6, -46, -24, 3, "wall"),
		box(6, 8, -46, -24, 3, "wall"),
		box(-8, -3, -48, -46, 3, "wall"),
		box(3, 8, -48, -46, 3, "wall"),
		box(-1.2, .4, -34.4, -33, 2.6, "wall"),
		box(1.8, 3.4, -40.6, -39.2, 2.6, "wall"),
		box(24, 26, -14.4, -2, 3, "wall"),
		box(24, 26, -2, 4, 3, "wall", 4, "weak"),
		box(24, 26, 4, 24, 3, "wall"),
		box(16.4, 48, -14.9, -14.2, 2.4, "wall"),
		box(46, 48, -26, -22, 3, "wall"),
		box(46, 48, -16, -14.2, 3, "wall"),
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
		box(-15.1, -14.1, -7.9, -6.9, .7, "wall"),
		box(21.4, 22.3, -19.2, -18.1, 1.15, "plat"),
		box(21.4, 22.3, -19.2, -18.1, 2.3, "plat"),
		box(21.4, 22.3, -19.2, -18.1, 3.4, "plat"),
		box(48, 62, 26, 28, 3, "wall"),
		box(48, 62, 36, 38, 3, "wall"),
		box(62, 78, 26, 27.5, 1.15, "rope"),
		box(62, 78, 36.5, 38, 1.15, "rope"),
		box(76.5, 78, 26, 38, 1.15, "rope"),
		box(62, 63.4, 26, 30.4, 1.15, "rope"),
		box(62, 63.4, 33.6, 38, 1.15, "rope"),
		box(62, 63.2, 26, 27.4, 3, "wall"),
		box(76.8, 78, 26, 27.4, 3, "wall"),
		box(62, 63.2, 36.6, 38, 3, "wall"),
		box(76.8, 78, 36.6, 38, 3, "wall"),
		box(-62, -48, -8, -6, 3, "wall"),
		box(-62, -48, 6, 8, 3, "wall"),
		box(-78, -76.4, -8, 8, 3.2, "wall", 8, "cage"),
		box(-78, -62, -8, -6.6, 3.2, "wall"),
		box(-78, -62, 6.6, 8, 3.2, "wall"),
		box(-63.4, -62, -8, -1.6, 3.2, "wall", 6, "cage"),
		box(-63.4, -62, 1.6, 8, 3.2, "wall", 6, "cage"),
		box(-14, -6, -78, -48, 3, "wall"),
		box(6, 14, -78, -48, 3, "wall"),
		box(-14, 14, -80, -78, 3, "wall"),
		box(-8, 8, 48, 54, .55, "plat"),
		box(-8, 8, 54, 58, 1.15, "plat"),
		box(-8, 8, 58, 62, 1.8, "plat"),
		box(-8, 8, 62, 66, 2.5, "plat"),
		box(-8, 8, 66, 78, 3.4, "plat"),
		box(-10, -8, 64, 78, 3.6, "wall"),
		box(8, 10, 64, 78, 3.6, "wall"),
		box(-8, -2, 76.4, 78, 3.6, "wall"),
		box(2, 8, 76.4, 78, 3.6, "wall"),
		box(48, 66, -22, -20, 3, "wall"),
		box(48, 66, -16, -14, 3, "wall"),
		box(66, 82, -36, -34, 3, "wall"),
		box(66, 82, -14, -12, 3, "wall"),
		box(80, 82, -36, -12, 3, "wall"),
		box(66, 68, -34, -22, 3, "wall"),
		box(66, 68, -20, -14, 3, "wall")
	];
}
function blankBody(sim, partial) {
	const grunt = partial.kind === "grunt";
	return {
		id: sim.nextId++,
		name: grunt ? STREET[sim.nextId % STREET.length] : sim.who || "Bannon",
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
		stopT: 0,
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
		air: 0,
		splat: 0,
		tech: 0,
		stun: partial.stun ?? 0,
		...partial,
		head: partial.head ?? 100,
		chest: partial.chest ?? 100,
		legs: partial.legs ?? 100,
		wake: partial.wake ?? 0,
		landed: partial.landed ?? false,
		prone: partial.prone ?? false,
		route: partial.route ?? "n",
		link: partial.link ?? 0
	};
}
function prefersReduced() {
	try {
		return typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
	} catch {
		return false;
	}
}
function loadShape() {
	const base = {
		build: "full",
		crowd: "mix",
		height: 1,
		bulk: 1,
		head: 1,
		leg: 1,
		shoulder: 1
	};
	try {
		const raw = JSON.parse(localStorage.getItem("ashlane-shape-v2") || "{}");
		const num = (value, min, max, fallback) => typeof value === "number" && value >= min && value <= max ? value : fallback;
		return {
			build: raw.build === "chibi" ? "chibi" : "full",
			crowd: raw.crowd === "chibi" || raw.crowd === "full" || raw.crowd === "mix" ? raw.crowd : "mix",
			height: num(raw.height, .86, 1.18, 1),
			bulk: num(raw.bulk, .8, 1.25, 1),
			head: num(raw.head, .75, 1.3, 1),
			leg: num(raw.leg, .82, 1.22, 1),
			shoulder: num(raw.shoulder, .82, 1.22, 1)
		};
	} catch {
		return base;
	}
}
function saveShape(sim) {
	localStorage.setItem("ashlane-shape-v2", JSON.stringify({
		build: sim.build,
		crowd: sim.crowd,
		height: sim.height,
		bulk: sim.bulk,
		head: sim.head,
		leg: sim.leg,
		shoulder: sim.shoulder
	}));
}
function callRook(sim, rook) {
	const foe = nearestGrunt(sim, 8);
	if (!foe) {
		sim.sfx.push("deny");
		return;
	}
	const clip = motionDur("suplex") > 0 ? "suplex" : motionDur("backdrop") > 0 ? "backdrop" : motionDur("german") > 0 ? "german" : "";
	if (clip) {
		const span = Math.min(2.4, motionDur(clip));
		const face = forward(foe.yaw);
		sim.pair = clip;
		sim.pairT = span;
		sim.pairLen = span;
		sim.pairAtk = rook.id;
		sim.pairVic = foe.id;
		sim.pairVx = face.x * 8;
		sim.pairVy = 4;
		sim.pairVz = face.z * 8;
		sim.pairDmg = 16;
		rook.state = "grab";
		rook.stateT = span;
		rook.throwT = span;
		rook.x = foe.x + face.x * .7;
		rook.z = foe.z + face.z * .7;
		rook.y = foe.y;
		rook.yaw = yawFromDir(foe.x - rook.x, foe.z - rook.z);
		rook.vx = 0;
		rook.vz = 0;
		foe.state = "grab";
		foe.throwT = span;
		foe.iframe = span;
		foe.vx = 0;
		foe.vz = 0;
		sim.banner = "Tag throw";
		sim.bannerT = span;
		sim.sfx.push("throw");
		return;
	}
	rook.x = foe.x;
	rook.z = foe.z + .8;
	rook.yaw = yawFromDir(foe.x - rook.x, foe.z - rook.z);
	rook.state = "atk";
	rook.stateT = .22;
	rook.swung = false;
	const f = forward(rook.yaw);
	hurt(sim, foe, 12, 14, f.x * 7, f.z * 7, 2.2);
	sim.banner = "Rook";
	sim.bannerT = .7;
	sim.sfx.push("hit");
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
		martial: "wrestling",
		who: "Bannon",
		bio: fighterById("bannon").bio,
		cast: "BANNON_muscular_skinned.glb",
		stance: "orthodox",
		stage: "ward",
		venueX: 0,
		venueZ: 0,
		venueR: 0,
		backupT: 0,
		backups: 0,
		door: 0,
		doorHits: 0,
		doorBroke: false,
		rearLock: false,
		xp: 0,
		level: 1,
		grip: 0,
		squeezeT: 0,
		bout: "off",
		flow: 0,
		pair: "",
		pairT: 0,
		pairAtk: -1,
		pairVic: -1,
		pairLen: 0,
		lockArm: 0,
		group: { activeAttackers: [] },
		lock: createLockOn(),
		bufLock: 0,
		prevLock: false,
		rush: false,
		chain: false,
		chains: 0,
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
		purse: 0,
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
		prevUse: false,
		prevCounter: false,
		bufUse: 0,
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
		stickX: 0,
		guard: false,
		lowGuard: false,
		guardT: 0,
		block: 0,
		services: null,
		...loadShape()
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
	g.name = claimWard(home, arch).name;
	sim.bodies.push(g);
	if (sim.services) {
		const disc = arch === "brute" ? "wrestling" : arch === "runner" ? "kickboxing" : arch === "hood" ? "street_boxing" : arch === "hex" ? "muay_thai" : "mma";
		styleFor(sim.services, g.id, disc);
	}
}
/**
* Spawn a grunt for an attention-system encounter (thugs / scouts / enforcer
* backup). Exported for services.ts / mount.ts consumers.
*/
function addAttentionGrunt(sim, x, z, arch, name, hp) {
	addGrunt(sim, x, z, 0, "street", arch);
	const g = sim.bodies[sim.bodies.length - 1];
	if (name) g.name = name;
	if (hp !== void 0) {
		g.hp = hp;
		g.maxHp = hp;
	}
}
function addProp(sim, kind, x, y, z, hp, loot) {
	sim.props.push({
		id: sim.nextId++,
		kind,
		x,
		y,
		z,
		hp,
		maxHp: hp,
		crush: 0,
		alive: true,
		loot
	});
}
function carTop(prop) {
	return 1.15 * (1 - prop.crush * .72);
}
function dentCar(sim, prop, amount, fromSlam) {
	if (prop.kind !== "car" || !prop.alive) return;
	const before = prop.hp;
	prop.hp -= amount;
	sim.sfx.push(fromSlam ? "slam" : "hit");
	sim.shake = Math.min(1, sim.shake + (fromSlam ? .55 : .2));
	burst(sim, prop.x + (Math.random() - .5) * 2, .7 + Math.random() * .5, prop.z, before > prop.maxHp * .55 ? 10473696 : 9080984);
	const mid = prop.maxHp * .66;
	const low = prop.maxHp * .33;
	if (before > 0 && prop.hp <= 0) sim.banner = "The car caves in";
	else if (before > low && prop.hp <= low) sim.banner = "Roof caves";
	else if (before > mid && prop.hp <= mid) sim.banner = "Hood buckles";
	else if (fromSlam) sim.banner = "Slammed on the car";
	else sim.banner = "Dent";
	sim.bannerT = 1;
	if (prop.hp <= -8) {
		prop.alive = false;
		prop.hp = -8;
		sim.banner = "Scrapped";
		sim.bannerT = 1.3;
		burst(sim, prop.x, .4, prop.z, 7218224);
	}
}
function spawnBodies(sim) {
	sim.bodies = [];
	sim.props = [];
	resetWard();
	sim.grabId = -1;
	sim.group.activeAttackers = [];
	clearLock(sim.lock);
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
		name: "Bannon",
		home: "plaza"
	}));
	addGrunt(sim, 6, -4, 0, "plaza", "hood");
	addGrunt(sim, -8, 4, 0, "plaza", "runner");
	addGrunt(sim, 7, -1, 0, "plaza", "brute");
	addGrunt(sim, 2, 6, 0, "plaza", "hex");
	addGrunt(sim, -3, -6, 0, "plaza", "brawler");
	addGrunt(sim, -16, -19, 0, "street", "brawler");
	addGrunt(sim, -7, -18.3, 0, "street", "runner");
	addGrunt(sim, 1.5, -19.6, 0, "street", "hex");
	addGrunt(sim, 9, -18.4, 0, "street", "brute");
	addGrunt(sim, -8.4, 20, 2.4, "scaffold", "hood");
	addGrunt(sim, 7.2, 20, 2.55, "scaffold", "brute");
	addGrunt(sim, 22, -19, 0, "market", "hex");
	addGrunt(sim, 31, -18.2, 0, "market", "runner");
	addGrunt(sim, 39, -20, 0, "market", "hood");
	addGrunt(sim, -36, 2, 0, "yard", "brute");
	addGrunt(sim, -42, -6, 0, "yard", "runner");
	addGrunt(sim, -30, 7, 0, "yard", "hood");
	addGrunt(sim, -2, 32, 0, "dock", "hex");
	addGrunt(sim, 2, 38, 0, "dock", "brute");
	addGrunt(sim, 0, -32, 0, "under", "brawler");
	addGrunt(sim, -2, -40, 0, "under", "hood");
	addGrunt(sim, 3, -36, 0, "under", "runner");
	addGrunt(sim, 70, 32, 0, "ring", "brawler");
	addGrunt(sim, 74, 34, 0, "ring", "hood");
	addGrunt(sim, -70, 0, 0, "cage", "brute");
	addGrunt(sim, -66, -3, 0, "cage", "brawler");
	addGrunt(sim, 0, -68, 0, "subway", "runner");
	addGrunt(sim, -3, -64, 0, "subway", "hood");
	addGrunt(sim, 0, 72, 3.4, "crane", "hex");
	addGrunt(sim, 74, -26, 0, "office", "hex");
	addProp(sim, "spear", 66, .2, 30, 7, "");
	addProp(sim, "blade", -60, .2, 2, 6, "");
	addProp(sim, "crate", -15.4, 0, -8.2, 2, "");
	addProp(sim, "crate", 27.5, 0, -17.6, 2, "bottle");
	addProp(sim, "crate", 36.2, 0, -21.2, 2, "");
	addProp(sim, "table", -13.6, 0, -9.1, 2, "");
	addProp(sim, "chair", -11.2, 0, -8.2, 1, "");
	addProp(sim, "chair", -15.2, 0, -10.2, 1, "");
	addProp(sim, "table", 32.4, 0, -19.4, 2, "");
	addProp(sim, "chair", 30.2, 0, -18.2, 1, "");
	addProp(sim, "car", 11, 0, -21, 18, "");
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
	const dropped = sim.bodies[0];
	const spot = dropFor(mission.drop);
	if (dropped) {
		dropped.x = spot[0];
		dropped.z = spot[1];
		dropped.y = standY(mission.drop);
		sim.spawnX = dropped.x;
		sim.spawnZ = dropped.z;
		sim.camYaw = dropped.yaw;
	}
	const fight = dropFor(mission.home);
	sim.venueX = fight[0];
	sim.venueZ = fight[1];
	sim.venueR = mission.rule === "inside" ? 7.2 : 0;
	sim.backupT = 0;
	sim.backups = 0;
	focusPack(sim);
	if (mission.boss && mission.home === "office") {
		summonLease(sim);
		const boss = sim.bodies.find((b) => b.name === LEASE_NAME);
		const room = dropFor("office");
		if (boss) {
			boss.x = room[0] + 1.4;
			boss.z = room[1];
			boss.y = 0;
			boss.home = "office";
			boss.homeX = boss.x;
			boss.homeZ = boss.z;
		}
	}
	sim.banner = `${mission.title}. ${placeName(mission.drop)}`;
	sim.bannerT = 2.4;
	sim.stage = mission.stage;
}
function standY(home) {
	if (home === "scaffold") return 2.4;
	if (home === "crane") return 3.4;
	return 0;
}
function dropFor(home) {
	if (home === "yard") return [-34, 0];
	if (home === "dock") return [0, 32];
	if (home === "under") return [0, -36];
	if (home === "street") return [-4, -18];
	if (home === "market") return [28, -18];
	if (home === "scaffold") return [0, 18];
	if (home === "ring") return [70, 32];
	if (home === "cage") return [-70, 0];
	if (home === "subway") return [0, -64];
	if (home === "crane") return [0, 70];
	if (home === "office") return [74, -24];
	return [0, 2];
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
function grantXp(sim, n) {
	const before = 1 + Math.floor(sim.xp / 100);
	sim.xp += n;
	const after = 1 + Math.floor(sim.xp / 100);
	sim.level = after;
	if (after > before) {
		const p = sim.bodies[0];
		if (p) {
			p.maxHp += 8;
			p.hp = Math.min(p.maxHp, p.hp + 8);
		}
		sim.banner = `Rank ${after}`;
		sim.bannerT = 1.2;
		saveCleared(sim.clearedMission, sim.purse, sim.xp);
	}
}
function breakGrab(sim) {
	if (sim.grabId < 0 && sim.bodies[0]?.state !== "grab") return;
	const p = sim.bodies[0];
	const e = sim.bodies.find((b) => b.id === sim.grabId);
	if (p?.state === "grab") p.state = "free";
	if (e && e.state === "grab") e.state = "hit";
	sim.grabId = -1;
	sim.group.activeAttackers = [];
	clearLock(sim.lock);
	sim.pair = "";
	sim.pairT = 0;
	sim.rearLock = false;
	sim.grip = 0;
}
function hurt(sim, b, dmg, poiseDmg, kx, kz, lift, tag = "mid") {
	if (!b.alive || b.iframe > 0 || b.state === "out") return false;
	if (b.kind === "player" && sim.martial === "capoeira" && b.state === "atk" && b.swing === 3 && tag === "high") {
		sim.banner = "Handstand";
		sim.bannerT = .4;
		return false;
	}
	if (b.kind === "player" && sim.martial === "capoeira" && b.state === "free" && tag !== "low" && Math.random() < .2) {
		sim.banner = "Ginga";
		sim.bannerT = .45;
		return false;
	}
	if (b.state === "grab") return false;
	if (b.kind === "player" && !b.grounded && b.y > .35 && tag === "low") {
		sim.banner = "Hopped the low";
		sim.bannerT = .4;
		return false;
	}
	if (b.kind === "player" && b.state === "dash") {
		if (b.stateT > .08) {
			for (const e of sim.bodies) {
				if (e.kind !== "grunt" || !e.alive || e.state !== "atk" && e.state !== "windup") continue;
				if (Math.hypot(e.x - b.x, e.z - b.z) > 1.8) continue;
				e.state = "hit";
				e.stateT = .7;
				e.poise = 0;
				e.vx = (e.x - b.x) * 2.2;
				e.vz = (e.z - b.z) * 2.2;
			}
			b.iframe = Math.max(b.iframe, .16);
			sim.banner = "Just frame";
			sim.bannerT = .55;
			sim.sfx.push("hit");
			return false;
		}
		dmg *= 1.5;
		sim.banner = "Counter hit";
		sim.bannerT = .55;
	}
	if (b.kind === "player" && b.state === "atk" && b.swing === 5 && tag === "high") {
		sim.banner = "Ducked it";
		sim.bannerT = .4;
		return false;
	}
	if (b.kind === "player" && sim.services) {
		const res = resolveParry(sim.services, b.id, "jab");
		if (res === "countered") {
			for (const e of sim.bodies) {
				if (e.kind !== "grunt" || !e.alive || e.state !== "atk" && e.state !== "windup") continue;
				if (Math.hypot(e.x - b.x, e.z - b.z) > 2.2) continue;
				e.state = "hit";
				e.stateT = .8;
				e.poise = 0;
				e.vx = (e.x - b.x) * 2.6;
				e.vz = (e.z - b.z) * 2.6;
			}
			b.iframe = Math.max(b.iframe, .25);
			b.meter = Math.min(100, (b.meter ?? 0) + 20);
			sim.banner = "Counter!";
			sim.bannerT = .6;
			sim.sfx.push("hit");
			sim.flow = Math.min(100, sim.flow + 12);
			return false;
		}
		if (res === "traded") {
			dmg *= .4;
			sim.banner = "Traded";
			sim.bannerT = .4;
		}
	}
	const f = forward(b.yaw);
	const kl = Math.hypot(kx, kz) || 1;
	const facing = kx / kl * f.x + kz / kl * f.z;
	if (b.kind === "player" && sim.guard && b.state === "free" && facing < -.2) {
		const covers = sim.lowGuard ? tag !== "high" : tag !== "low";
		if (covers && sim.guardT > 0) {
			for (const e of sim.bodies) {
				if (e.kind !== "grunt" || !e.alive || e.state !== "atk" && e.state !== "windup") continue;
				if (Math.hypot(e.x - b.x, e.z - b.z) > 1.8) continue;
				e.state = "hit";
				e.stateT = .62;
				e.poise = 0;
				e.vx = (e.x - b.x) * 2.4;
				e.vz = (e.z - b.z) * 2.4;
			}
			b.iframe = Math.max(b.iframe, .22);
			sim.guardT = 0;
			sim.banner = sim.lowGuard && tag === "low" ? "Low parry" : "Parry";
			sim.bannerT = .6;
			sim.sfx.push("hit");
			sim.flow = Math.min(100, sim.flow + 14);
			return false;
		}
		if (covers) {
			const broken = sim.block >= 4;
			sim.block = broken ? 0 : sim.block + 1;
			b.hp -= dmg * (broken ? .35 : .08);
			b.vx = kx * .12;
			b.vz = kz * .12;
			b.iframe = .1;
			sim.sfx.push("hit");
			sim.flow = Math.min(100, sim.flow + 4);
			sim.banner = broken ? "Guard break" : sim.lowGuard ? "Low block" : "Block";
			sim.bannerT = .4;
			if (!sim.pair) {
				sim.pair = "defender";
				sim.pairT = .16;
			}
			if (broken) {
				b.state = "hit";
				b.stateT = .28;
			}
			if (b.hp <= 0) {
				b.hp = 0;
				b.state = "down";
				b.stateT = 1.05;
			}
			return true;
		}
		sim.banner = tag === "low" ? "Low" : "High";
		sim.bannerT = .35;
	}
	const mass = b.arch === "brute" || b.arch === "hex" ? 1.45 : b.arch === "hood" || b.arch === "runner" ? .75 : 1;
	b.hp -= markRegion(sim, b, tag, dmg);
	b.stun = Math.max(b.stun, tag === "high" ? 1.5 : tag === "low" ? .9 : 1.1);
	b.poise -= poiseDmg;
	b.vx = kx / mass;
	b.vz = kz / mass;
	b.vy = Math.max(b.vy, lift / mass);
	b.iframe = b.kind === "player" ? .38 : .14;
	b.stopT = Math.max(b.stopT, lift > 4 ? .06 : .04);
	sim.shake = Math.min(1, sim.shake + (lift > 4 ? .55 : .32));
	sim.sfx.push(b.kind === "player" ? "hurt" : "hit");
	burst(sim, b.x, b.y + 1, b.z, b.kind === "player" ? 14964526 : 15774761);
	if (b.kind === "player") {
		sim.flow *= .35;
		if (sim.grabId >= 0) breakGrab(sim);
		if (!sim.pair && facing > .45) {
			sim.pair = "hitback";
			sim.pairT = .45;
		} else if (!sim.pair && Math.abs(facing) < .35) {
			sim.pair = "hitside";
			sim.pairT = .4;
		}
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
	if (!b.grounded && b.y > .4 && b.state !== "down") {
		b.air = Math.min(6, b.air + 1);
		b.state = "launch";
		b.stateT = .28;
		if (b.air >= 4) {
			b.vy = Math.min(b.vy, 1.2);
			b.vx *= .55;
			b.vz *= .55;
			if (b.kind !== "player") {
				sim.banner = "Dropped";
				sim.bannerT = .55;
			}
		} else {
			b.vy = Math.max(b.vy, Math.max(lift, 3.2) * (1 - b.air * .1));
			if (b.kind !== "player" && b.air > 1) {
				sim.banner = `Juggle ${b.air}`;
				sim.bannerT = .45;
			}
		}
		return true;
	}
	if (b.poise <= 0) {
		b.poise = b.kind === "player" ? SPEC.poisePlayer : SPEC.poiseGrunt;
		b.state = "down";
		b.air = 0;
		b.stateT = 1.45;
		sim.sfx.push("crumple");
		sim.banner = "Crumple";
		sim.bannerT = .6;
		return true;
	}
	if (lift > 4) {
		b.state = "launch";
		b.stateT = .2;
		b.air = Math.max(1, b.air);
		return true;
	}
	b.state = "hit";
	b.stateT = sim.tune.hitstun * (b.head < 35 ? 1.45 : 1) * (b.kind === "player" && sim.banner === "Counter hit" ? 1.55 : 1);
	return true;
}
function markRegion(sim, b, tag, dmg) {
	const key = tag === "high" ? "head" : tag === "low" ? "legs" : "chest";
	const before = b[key];
	b[key] = Math.max(0, before - 16);
	if (before >= 35 && b[key] < 35) {
		sim.banner = key === "head" ? "Head's gone" : key === "legs" ? "Leg's gone" : "Body's gone";
		sim.bannerT = .8;
	}
	return b[key] < 35 ? dmg * 1.45 : dmg;
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
function hitGrunts(sim, hx, hz, radius, dmg, kb, lift, poise, dirX, dirZ, tag = "mid") {
	const p = sim.bodies[0];
	let any = false;
	for (const e of sim.bodies) {
		if (e.kind !== "grunt" || !e.alive || e.state === "grab") continue;
		if (Math.abs(e.y + .7 - (p.y + .8)) > 1.35) continue;
		if (Math.hypot(e.x - hx, e.z - hz) > radius) continue;
		const laying = e.state === "down" && e.grounded;
		const waking = laying && e.stateT < .34;
		const awayX = e.x - p.x;
		const awayZ = e.z - p.z;
		const al = Math.hypot(awayX, awayZ) || 1;
		const airborne = !e.grounded && e.y > .4;
		const scale = airborne ? Math.max(.3, 1 - e.air * .17) : 1;
		const shove = airborne ? 1 + e.air * .28 : 1;
		const stomp = laying && sim.stickY > .45;
		const popUp = laying && !stomp && sim.stickY < -.28;
		const kx = (dirX * .7 + awayX / al * .3) * kb * (laying ? popUp ? 1.15 : .35 : 1) * shove;
		const kz = (dirZ * .7 + awayZ / al * .3) * kb * (laying ? popUp ? 1.15 : .35 : 1) * shove;
		const pop = laying ? popUp ? 6.2 : .05 : lift;
		let dealt = dmg * scale * (sim.services ? comboDamageScale(sim.combo + 1) : 1);
		let liftHit = pop;
		if (e.splat > 0 && !laying) {
			dealt *= 1.3;
			liftHit = Math.max(liftHit, 5.4);
			e.splat = 0;
			sim.banner = "Wall follow";
			sim.bannerT = .6;
		}
		const heat = e.state === "hit" && e.poise <= 8 && !laying;
		if (heat) {
			dealt *= 1.45;
			liftHit = Math.max(liftHit, 4.2);
			sim.banner = "Heat";
			sim.bannerT = .55;
		}
		if (hurt(sim, e, dealt, poise, kx, kz, liftHit, stomp ? "low" : tag)) {
			any = true;
			p.meter = Math.min(100, p.meter + 8);
			sim.combo += 1;
			sim.comboT = 1.25;
			grantXp(sim, heat ? 6 : 2);
			sim.flow = Math.min(100, sim.flow + (sim.flow > 40 ? 8 : 5));
			if (stomp && e.alive && e.state !== "out") {
				e.state = "down";
				e.vy = 0;
				e.air = 0;
				e.stateT = 1.15;
				sim.banner = "Stomp";
				sim.bannerT = .55;
			} else if (laying && !popUp && e.alive && e.state !== "out") {
				e.state = "down";
				e.vy = 0;
				e.air = 0;
				e.stateT = waking ? .85 : 1.25;
				e.tech = waking ? 1 : 0;
				sim.banner = waking ? "Meaty" : "Ground";
				sim.bannerT = .55;
			} else if (laying && popUp) {
				sim.banner = "Ground launch";
				sim.bannerT = .55;
			}
		}
	}
	if (any) p.stopT = Math.max(p.stopT, .04);
	return any;
}
function hitProps(sim, x, z, radius) {
	let any = false;
	for (const prop of sim.props) {
		if (prop.kind === "car") {
			if (!prop.alive) continue;
			const dx = Math.max(Math.abs(x - prop.x) - 2.05, 0);
			const dz = Math.max(Math.abs(z - prop.z) - .9, 0);
			if (Math.hypot(dx, dz) > radius) continue;
			dentCar(sim, prop, 1, false);
			any = true;
			continue;
		}
		if (prop.kind !== "crate" && prop.kind !== "chair" && prop.kind !== "table") continue;
		if (Math.hypot(prop.x - x, prop.z - z) > radius + .4) continue;
		prop.hp -= 1;
		any = true;
		sim.sfx.push("hit");
		sim.shake = Math.min(1, sim.shake + .28);
		burst(sim, prop.x, .6, prop.z, 9067066);
		if (prop.hp > 0) continue;
		prop.alive = false;
		if (prop.kind === "table") addProp(sim, "board", prop.x, .2, prop.z + .35, 5, "");
		sim.banner = prop.kind === "chair" ? "Chair broke" : prop.kind === "table" ? "Table broke" : "Crate smashed";
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
	sim.banner = kind === "bottle" ? "Bottle shattered" : kind === "board" ? "Board split" : kind === "blade" ? "The blade snaps" : kind === "spear" ? "The spear snaps" : "The pipe snapped";
	sim.bannerT = 1.3;
	sim.sfx.push("slam");
	burst(sim, p.x, p.y + 1, p.z, kind === "bottle" ? 6931394 : 10134445);
}
function tryUse(sim, p) {
	if (p.state !== "free" && p.state !== "down") return;
	if (p.weapon !== "fist") {
		const f = forward(p.yaw);
		addProp(sim, p.weapon, p.x + f.x * .7, .2, p.z + f.z * .7, Math.max(1, p.wpn), "");
		p.weapon = "fist";
		p.wpn = 0;
		p.pickupT = .25;
		sim.banner = "Dropped";
		sim.bannerT = .8;
		sim.sfx.push("grab");
		return;
	}
	tryPickup(sim, p);
}
function tryPickup(sim, p) {
	if (p.weapon !== "fist" || p.state !== "free") return;
	for (const prop of sim.props) {
		if (!prop.alive || prop.kind === "crate" || prop.kind === "chair" || prop.kind === "table" || prop.kind === "car") continue;
		if (Math.hypot(prop.x - p.x, prop.z - p.z) > .85 || Math.abs(prop.y - p.y) > 1.4) continue;
		prop.alive = false;
		p.weapon = prop.kind;
		p.wpn = prop.kind === "pipe" ? 8 : prop.kind === "spear" ? 7 : prop.kind === "blade" ? 6 : prop.kind === "board" ? 5 : 3;
		p.pickupT = .4;
		sim.banner = prop.kind === "pipe" ? "Pipe. Run in and it lunges." : prop.kind === "spear" ? "Spear. It reaches." : prop.kind === "blade" ? "Blade. Short cuts." : prop.kind === "board" ? "Board. Short, heavy swings." : "Bottle. A few swings, then it breaks.";
		sim.bannerT = 1.6;
		sim.sfx.push("grab");
		return;
	}
	sim.banner = "Nothing in reach";
	sim.bannerT = .6;
}
function commitFacing(sim, p) {
	const foe = nearestGrunt(sim, 3.4);
	if (foe) p.yaw = yawFromDir(foe.x - p.x, foe.z - p.z);
	p.vx = 0;
	p.vz = 0;
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
function stickRoute(sim) {
	if (sim.stickY > .4) return "d";
	if (sim.stickY < -.4) return "u";
	if (sim.stickX > .4) return "r";
	if (sim.stickX < -.4) return "l";
	return "n";
}
var STRINGS = {
	n: [
		1,
		2,
		11,
		12,
		3
	],
	r: [
		2,
		12,
		4,
		3
	],
	l: [
		11,
		1,
		12,
		5
	],
	u: [
		3,
		12,
		4
	],
	d: [
		5,
		12,
		1
	]
};
function swingDur(swing) {
	if (swing === 11 || swing === 12) return .34;
	if (swing >= 10) return .55;
	if (swing >= 9) return .62;
	if (swing >= 8) return .48;
	if (swing >= 7) return .55;
	if (swing >= 6) return .5;
	if (swing >= 5) return .4;
	if (swing >= 4) return .42;
	return swing === 3 ? .44 : .32;
}
function beginSwing(sim, p) {
	const diving = !p.grounded && p.y > .85 && !(p.comboWindow > 0 || p.queued);
	const fast = Math.hypot(p.vx, p.vz) > 4.4;
	let ffDone = false;
	if (!diving) {
		const stickMag = Math.hypot(sim.stickX, sim.stickY);
		let ffT = null;
		const locked = lockOnUpdate(sim.lock, sim.bodies);
		if (locked && Math.hypot(locked.x - p.x, locked.z - p.z) < 15) ffT = locked;
		if (!ffT) ffT = pickFreeflowTarget(p, sim.bodies, sim.stickX, sim.stickY, stickMag);
		if (ffT) {
			p.yaw = yawFromDir(ffT.x - p.x, ffT.z - p.z);
			const lg = freeflowLunge(p, ffT);
			const LUNGE_T = .14;
			const LUNGE_MAX = 10;
			let lvx = lg.dx / LUNGE_T;
			let lvz = lg.dz / LUNGE_T;
			const lsp = Math.hypot(lvx, lvz);
			if (lsp > LUNGE_MAX) {
				lvx = lvx / lsp * LUNGE_MAX;
				lvz = lvz / lsp * LUNGE_MAX;
			}
			p.vx = 0;
			p.vz = 0;
			p.vx += lvx;
			p.vz += lvz;
			ffDone = true;
		}
	}
	if (!ffDone) {
		if (!diving) commitFacing(sim, p);
		else if (sim.flow > 40) faceFlow(sim, p);
	}
	tryCounter(sim, p);
	if (diving) {
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
	else if (fast && stickRoute(sim) === "n" && !(p.comboWindow > 0 || p.queued)) p.swing = 4;
	else {
		const route = stickRoute(sim);
		const seq = STRINGS[route];
		if ((p.comboWindow > 0 || p.queued) && route === p.route) p.link = Math.min(seq.length - 1, p.link + 1);
		else {
			p.route = route;
			p.link = 0;
		}
		p.swing = seq[p.link];
		const hitName = p.swing === 12 ? "Hook" : p.swing === 11 ? "Elbow" : p.swing === 5 ? "Sweep" : p.swing === 4 ? "Step-in" : p.swing === 3 ? "Launcher" : p.swing === 2 ? "Cross" : "Jab";
		sim.banner = `${route === "l" ? "Left " : route === "r" ? "Right " : route === "u" ? "High " : route === "d" ? "Low " : ""}${hitName}`;
		sim.bannerT = .4;
	}
	p.queued = false;
	p.comboWindow = 0;
	p.landed = false;
	p.state = "atk";
	p.swung = false;
	p.stateT = swingDur(p.swing);
	sim.bufAtk = 0;
	sim.sfx.push("swing");
	if (p.grounded && p.swing === 4) {
		const f = forward(p.yaw);
		p.vx = f.x * 6.5;
		p.vz = f.z * 6.5;
	}
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
	const face = forward(p.yaw);
	const into = dx * face.x + dz * face.z;
	const lateral = Math.abs(dx * face.z - dz * face.x);
	p.state = "dash";
	p.stateT = .16;
	if (into < -.45 && lateral < .55) {
		p.vx = dx * SPEC.dashSpeed * .28;
		p.vz = dz * SPEC.dashSpeed * .28;
		sim.banner = "Sway";
		sim.bannerT = .4;
		sim.bufGrab = 0;
		sim.sfx.push("dash");
		return;
	}
	p.vx = dx * SPEC.dashSpeed;
	p.vz = dz * SPEC.dashSpeed;
	const along = Math.abs(dx * face.x + dz * face.z);
	if (Math.abs(dx * face.z - dz * face.x) > along + .2) {
		p.iframe = Math.max(p.iframe, sim.martial === "boxing" ? .32 : .26);
		sim.banner = sim.martial === "boxing" ? "Weave" : "Sidestep";
		sim.bannerT = .45;
	}
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
	const face = forward(e.yaw);
	const behind = face.x * (p.x - e.x) + face.z * (p.z - e.z) < -.2;
	let name = "Throw";
	let vx = dx * 12.5;
	let vz = dz * 12.5;
	let vy = 3.4;
	let dmg = SPEC.throwDamage;
	if (sim.rearLock) {
		if (Math.abs(sim.stickX) > .45) {
			const right = {
				x: -Math.cos(p.yaw),
				z: Math.sin(p.yaw)
			};
			const dir = sim.stickX > 0 ? 1 : -1;
			name = "Pendulum";
			vx = right.x * dir * 11;
			vz = right.z * dir * 11;
			vy = 3.2;
			dmg = 16;
		} else if (ahead) {
			name = "German suplex";
			vx = -dx * 7;
			vz = -dz * 7;
			vy = 6.4;
			dmg = 21;
		} else if (back) {
			name = "Dragon suplex";
			vx = dx * 2.2;
			vz = dz * 2.2;
			vy = 7.4;
			dmg = 22;
		} else {
			name = "Bulldog";
			vx = dx * 8;
			vz = dz * 8;
			vy = 2.4;
			dmg = 18;
		}
	} else if (behind) {
		name = "Back throw";
		vx = dx * 3.2;
		vz = dz * 3.2;
		vy = 5.4;
		dmg = 24;
	} else if (Math.abs(sim.stickX) > .45) {
		const right = {
			x: -Math.cos(p.yaw),
			z: Math.sin(p.yaw)
		};
		const dir = sim.stickX > 0 ? 1 : -1;
		name = "Whip";
		vx = right.x * dir * 16;
		vz = right.z * dir * 16;
		vy = 1.1;
		dmg = 12;
	} else if (sim.stickY > .62 && motionReady() && motionDur("takedown") > 0) {
		name = "Takedown";
		vx = dx * 2.4;
		vz = dz * 2.4;
		vy = 1.2;
		dmg = 16;
	} else if (back && (art === "sambo" || art === "jiujitsu")) {
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
		name = "Powerbomb";
		vx = dx * 1.1;
		vz = dz * 1.1;
		vy = 6.2;
		dmg = 22;
	} else if (ahead) {
		name = "Chokeslam";
		vx = dx * .6;
		vz = dz * .6;
		vy = -2.4;
		dmg = 26;
	} else if (art === "wrestling" || art === "catch" || sim.stance === "collar") {
		name = "Toss";
		vx = dx * 7;
		vz = dz * 7;
		vy = 2.1;
		dmg = 12;
	} else if (art === "sambo" || art === "jiujitsu") {
		name = "Suplex";
		vx = -dx * 9;
		vz = -dz * 9;
		vy = 7.2;
		dmg = 18;
	}
	if (art === "boxing" && !sim.rearLock) {
		name = ahead ? "Uppercut" : "Shove";
		dmg = ahead ? 14 : 8;
		vx = dx * (ahead ? 7 : 14);
		vz = dz * (ahead ? 7 : 14);
		vy = ahead ? 2.4 : 1.1;
	} else if (art === "muaythai" && !sim.rearLock && !back && !ahead && Math.abs(sim.stickX) < .45) {
		name = "Teep";
		dmg = 9;
		vx = dx * 16;
		vz = dz * 16;
		vy = 1.4;
	} else if (art === "savate" && !sim.rearLock && Math.abs(sim.stickX) < .45 && !back && !ahead) {
		name = "Hip toss";
		dmg = 11;
		vx = dx * 14;
		vz = dz * 14;
		vy = 3.2;
	} else if (art === "kenpo" && (sim.rearLock || behind)) {
		dmg = Math.round(dmg * 1.5);
		if (name === "Throw" || name === "Back throw" || name === "Bulldog") name = "Back take";
	} else if (art === "capoeira" && !sim.rearLock && !back && !ahead) {
		name = "Sweep toss";
		dmg = 13;
		vy = 2.2;
		vx = dx * 8;
		vz = dz * 8;
	}
	if (e.tech === 3) {
		dmg = Math.round(dmg * 1.35);
		if (name === "Throw") name = "Stun throw";
		e.tech = 0;
	}
	if (sim.grip >= 2) {
		dmg = Math.round(dmg * 1.3);
		if (name === "Throw") name = "Chain throw";
	}
	sim.grip = 0;
	if (sim.rush && (art === "capoeira" || art === "monkey" || art === "lucha")) {
		name = "Hurricanrana";
		dmg = Math.round(dmg * 1.35);
		vy = 6.5;
	} else if (sim.rush && motionDur("feral") > 0) name = "Feral";
	const extra = sim.bodies.find((o) => o !== e && o.kind === "grunt" && o.alive && (o.stun > .15 || o.state === "hit" || o.state === "launch") && Math.hypot(o.x - e.x, o.z - e.z) < 1.8);
	const paired = !!extra && e.stun > .15 && (extra.stun > .15 || extra.state === "hit") ? "" : name === "Chokeslam" ? "chokeslam" : name === "German suplex" ? "german" : name === "Suplex" ? "suplex" : name === "Takedown" ? "takedown" : name === "Neckbreaker" ? "ddt" : name === "Brainbuster" ? "brainbuster" : name === "Feral" ? "feral" : name === "Throw" ? "backdrop" : "";
	if (paired && motionReady() && motionDur(paired) > 0) {
		const span = Math.min(2.2, motionDur(paired));
		sim.pair = paired;
		sim.pairT = span;
		sim.pairAtk = p.id;
		sim.pairVic = e.id;
		sim.pairLen = span;
		sim.rush = false;
		sim.pairVx = vx;
		sim.pairVy = vy;
		sim.pairVz = vz;
		sim.pairDmg = dmg;
		p.throwT = span;
		e.throwT = span;
		e.iframe = span;
		sim.banner = paired === "ddt" ? "DDT" : name;
		sim.bannerT = 2.1;
		sim.sfx.push("throw");
		sim.bufGrab = 0;
		sim.rearLock = false;
		grantXp(sim, 12);
		return;
	}
	sim.rearLock = false;
	grantXp(sim, 12);
	e.state = "throw";
	e.slam = true;
	e.iframe = .08;
	e.vx = vx;
	e.vz = vz;
	e.vy = vy;
	e.stateT = .48;
	e.hp -= dmg;
	if (extra) {
		extra.hp -= Math.round(dmg * .6);
		extra.vx = vx * .8;
		extra.vz = vz * .8;
		extra.vy = vy;
		extra.state = "throw";
		extra.stateT = .4;
		name = "Double throw";
		if (extra.hp <= 0) {
			extra.hp = 0;
			extra.alive = false;
			extra.state = "out";
		}
	}
	p.meter = Math.min(100, p.meter + 10);
	e.yaw = name === "Powerbomb" ? p.yaw : p.yaw + Math.PI;
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
	const bounced = b.splat > 0;
	b.splat = .7;
	b.air = Math.max(1, b.air);
	b.hp -= sim.tune.wallBonus;
	b.head = Math.max(0, b.head - 15);
	b.chest = Math.max(0, b.chest - 8);
	b.vx *= -.28;
	b.vz *= -.28;
	b.vy = bounced ? 6.4 : 4.2;
	sim.shake = Math.min(1, sim.shake + .75);
	sim.hitstop = Math.max(sim.hitstop, .07);
	sim.sfx.push("slam");
	burst(sim, b.x, b.y + .8, b.z, 15984340);
	sim.banner = bounced ? "Wall bounce" : "Wall";
	sim.bannerT = .6;
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
function crack(sim, box) {
	if (!box || box.hp <= 0 || box.kind === "open") return;
	box.hp -= box.role === "cage" ? 1 : box.role === "door" ? 2 : 1.5;
	if (box.hp > 0) {
		sim.banner = box.role === "door" ? "Door buckles" : box.role === "cage" ? "Cage dents" : "Wall cracks";
		sim.bannerT = .6;
		return;
	}
	box.kind = "open";
	box.maxY = 0;
	sim.banner = box.role === "door" ? "Door's down" : box.role === "cage" ? "Cage's down" : "Wall's open";
	sim.bannerT = 1.1;
	sim.sfx.push("slam");
}
function nearestHard(sim, b) {
	let best = null;
	let bestD = .9;
	for (const box of sim.boxes) {
		if (box.kind === "plat" || box.kind === "spring" || box.kind === "goal" || box.kind === "open" || box.kind === "rope") continue;
		if (box.kind === "gate" && sim.streetClear) continue;
		if (box.role === "door" && (sim.doorBroke || sim.door > .45)) continue;
		const cx = Math.min(Math.max(b.x, box.minX), box.maxX);
		const cz = Math.min(Math.max(b.z, box.minZ), box.maxZ);
		const d = Math.hypot(b.x - cx, b.z - cz);
		if (d < bestD) {
			best = box;
			bestD = d;
		}
	}
	return best;
}
function resolveXZ(sim, b) {
	let touch = "";
	for (const box of sim.boxes) {
		if (box.kind === "spring" || box.kind === "goal" || box.kind === "plat" || box.kind === "open") continue;
		if (box.kind === "gate" && sim.streetClear) continue;
		if (box.role === "door" && (sim.doorBroke || sim.door > .45)) continue;
		if (b.y >= box.maxY - .08) continue;
		if (b.y + 1.45 < box.minY) continue;
		const cx = Math.min(Math.max(b.x, box.minX), box.maxX);
		const cz = Math.min(Math.max(b.z, box.minZ), box.maxZ);
		let dx = b.x - cx;
		let dz = b.z - cz;
		let d2 = dx * dx + dz * dz;
		if (d2 >= R * R) continue;
		if (touch !== "hard") touch = box.kind === "rope" ? "rope" : "hard";
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
	if (!sim.doorBroke && sim.door < .45 && b.y < 2.15 && b.x > -13.6 && b.x < -11.2 && b.z > -6.05 && b.z < -4.95) {
		b.z = b.z > -5.5 ? -4.88 : -6.12;
		b.vz = 0;
		if (b.splat < .15 && (b.state === "throw" && b.slam || (b.state === "hit" || b.state === "launch") && Math.hypot(b.vx, b.vz) > 6)) {
			sim.doorHits += 1;
			if (sim.doorHits >= 2) {
				sim.doorBroke = true;
				sim.door = 1;
				sim.banner = "Door's down";
			} else sim.banner = "Door buckles";
			sim.bannerT = .8;
			wallSlam(sim, b);
			return "hard";
		}
	}
	for (const prop of sim.props) {
		if (!prop.alive || prop.kind === "pipe" || prop.kind === "bottle" || prop.kind === "board" || prop.kind === "blade" || prop.kind === "spear") continue;
		const car = prop.kind === "car";
		if (car && prop.crush > .92) continue;
		const top = car ? carTop(prop) : prop.kind === "table" ? .7 : prop.kind === "crate" ? .62 : prop.kind === "chair" ? .42 : .9;
		if (b.y >= top - (car ? .02 : 0)) continue;
		const hx = car ? 2.05 : .55;
		const hz = car ? .9 : .55;
		const minX = prop.x - hx;
		const maxX = prop.x + hx;
		const minZ = prop.z - hz;
		const maxZ = prop.z + hz;
		const cx = Math.min(Math.max(b.x, minX), maxX);
		const cz = Math.min(Math.max(b.z, minZ), maxZ);
		let dx = b.x - cx;
		let dz = b.z - cz;
		let d2 = dx * dx + dz * dz;
		if (d2 >= R * R) continue;
		if (!touch) touch = "soft";
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
	eject(sim, b);
	return touch;
}
function eject(sim, b) {
	for (const box of sim.boxes) {
		if (box.kind === "spring" || box.kind === "goal" || box.kind === "plat" || box.kind === "open") continue;
		if (box.kind === "gate" && sim.streetClear) continue;
		if (box.role === "door" && (sim.doorBroke || sim.door > .45)) continue;
		if (b.y >= box.maxY - .05) continue;
		if (b.x <= box.minX || b.x >= box.maxX || b.z <= box.minZ || b.z >= box.maxZ) continue;
		const left = b.x - box.minX;
		const right = box.maxX - b.x;
		const south = b.z - box.minZ;
		const north = box.maxZ - b.z;
		const m = Math.min(left, right, south, north);
		if (m === left) {
			b.x = box.minX - R;
			b.vx = Math.min(0, b.vx);
		} else if (m === right) {
			b.x = box.maxX + R;
			b.vx = Math.max(0, b.vx);
		} else if (m === south) {
			b.z = box.minZ - R;
			b.vz = Math.min(0, b.vz);
		} else {
			b.z = box.maxZ + R;
			b.vz = Math.max(0, b.vz);
		}
	}
}
function resolveY(sim, b, prevY) {
	b.grounded = false;
	if (b.y < 0) {
		b.y = 0;
		if (b.vy < 0) b.vy = 0;
		b.grounded = true;
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
	for (const prop of sim.props) {
		if (prop.kind !== "car" || !prop.alive && prop.crush > .98) continue;
		if (Math.abs(b.x - prop.x) > 2.05 || Math.abs(b.z - prop.z) > .9) continue;
		const top = carTop(prop);
		if (prevY >= top - .08 && b.y < top && b.vy <= 0) {
			b.y = top;
			b.vy = 0;
			b.grounded = true;
		}
	}
	for (const prop of sim.props) {
		if (!prop.alive || prop.kind !== "table" && prop.kind !== "crate" && prop.kind !== "chair") continue;
		const top = prop.kind === "table" ? .7 : prop.kind === "crate" ? .62 : .42;
		const hx = prop.kind === "table" ? .5 : .32;
		const hz = prop.kind === "table" ? .32 : .32;
		if (Math.abs(b.x - prop.x) > hx || Math.abs(b.z - prop.z) > hz) continue;
		if (prevY >= top - .08 && b.y < top && b.vy <= 0) {
			b.y = top;
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
	b.splat = Math.max(0, b.splat - dt);
	b.vy -= sim.tune.gravity * dt;
	b.y += b.vy * dt;
	const dist = Math.hypot(b.vx, b.vz) * dt;
	const steps = Math.max(1, Math.ceil(dist / .12));
	const h = dt / steps;
	for (let i = 0; i < steps; i++) {
		b.x += b.vx * h;
		b.z += b.vz * h;
		const touch = resolveXZ(sim, b);
		if (touch === "rope" && b.state === "throw" && b.slam) {
			b.slam = false;
			b.vx *= -1.25;
			b.vz *= -1.25;
			b.vy = 2.6;
			b.state = "hit";
			b.stateT = .45;
			b.hp -= 8;
			sim.banner = "Off the ropes";
			sim.bannerT = .7;
			sim.sfx.push("slam");
			break;
		}
		if (touch && b.state === "throw" && b.slam) {
			if (touch === "soft") {
				const furn = sim.props.find((prop) => {
					if (!prop.alive) return false;
					if (prop.kind === "car") return Math.abs(prop.x - b.x) < 2.3 && Math.abs(prop.z - b.z) < 1.3;
					return (prop.kind === "chair" || prop.kind === "table" || prop.kind === "crate") && Math.hypot(prop.x - b.x, prop.z - b.z) < 1.1;
				});
				b.slam = false;
				b.vx = 0;
				b.vz = 0;
				b.vy = 0;
				b.state = "hit";
				b.stateT = 1;
				if (furn?.kind === "car") {
					dentCar(sim, furn, 5, true);
					b.hp -= 16;
				} else if (furn) {
					furn.hp -= 2;
					b.hp -= 10;
					sim.banner = furn.kind === "table" ? "Through the table" : furn.kind === "chair" ? "Through the chair" : "Through the crate";
					if (furn.hp <= 0) {
						furn.alive = false;
						if (furn.kind === "table") addProp(sim, "board", furn.x, .2, furn.z, 1, "");
					}
				} else sim.banner = "Stalled";
				sim.bannerT = .7;
			} else {
				crack(sim, nearestHard(sim, b));
				wallSlam(sim, b);
			}
			break;
		}
		const speed = Math.hypot(b.vx, b.vz);
		if (touch === "hard" && b.splat < .15 && (b.state === "hit" || b.state === "launch") && speed > 6) {
			crack(sim, nearestHard(sim, b));
			wallSlam(sim, b);
			break;
		}
	}
	if (b.state === "throw" && b.kind !== "player") for (const o of sim.bodies) {
		if (o === b || o.kind !== "grunt" || !o.alive || o.state === "throw" || o.state === "hit" || o.state === "grab") continue;
		if (Math.hypot(o.x - b.x, o.z - b.z) > .75) continue;
		o.vx = b.vx * .4;
		o.vz = b.vz * .4;
		o.vy = 2.2;
		o.state = "hit";
		o.stateT = .55;
		o.hp -= 8;
		sim.banner = "Carried into them";
		sim.bannerT = .6;
		break;
	}
	b.x = Math.min(84, Math.max(-84, b.x));
	b.z = Math.min(84, Math.max(-84, b.z));
	if (sim.bout !== "off") {
		const ring = Math.hypot(b.x, b.z);
		if (ring > 7.2) {
			b.x *= 7.2 / ring;
			b.z *= 7.2 / ring;
			b.vx *= -.15;
			b.vz *= -.15;
		}
	}
	if (sim.story && sim.venueR > 1) {
		const dx = b.x - sim.venueX;
		const dz = b.z - sim.venueZ;
		const ring = Math.hypot(dx, dz);
		if (ring > sim.venueR) {
			b.x = sim.venueX + dx / ring * sim.venueR;
			b.z = sim.venueZ + dz / ring * sim.venueR;
			b.vx *= -.12;
			b.vz *= -.12;
		}
	}
	resolveY(sim, b, prevY);
	if (b.kind === "player") trySpring(sim, b);
	const cycle = sim.time % 8;
	if (cycle < .45 && b.z < -60 && b.z > -78 && Math.abs(b.x) < 5 && b.y < 1.3) {
		b.hp -= 80 * dt;
		b.vx *= .9;
		if (cycle < .08) {
			sim.banner = "The train";
			sim.bannerT = .8;
			sim.sfx.push("slam");
			sim.shake = Math.min(1, sim.shake + .4);
		}
		if (b.hp <= 0) {
			b.hp = 0;
			b.alive = false;
			b.state = "out";
		}
	}
	if (b.grounded && prevY > 3.3) {
		b.hp -= 12;
		sim.banner = "Dropped";
		sim.bannerT = .7;
		sim.sfx.push("slam");
		if (b.hp <= 0) {
			b.hp = 0;
			b.alive = false;
			b.state = "out";
		}
	}
	if ((b.state === "launch" || b.state === "throw") && b.grounded) {
		const car = sim.props.find((prop) => prop.kind === "car" && prop.alive && Math.abs(prop.x - b.x) < 2.15 && Math.abs(prop.z - b.z) < 1.05 && b.y > .2);
		if (car) {
			dentCar(sim, car, 5, true);
			b.hp -= 16;
			b.slam = false;
		}
		const face = forward(b.yaw);
		const fellForward = b.vx * face.x + b.vz * face.z > .15;
		b.vx *= .25;
		b.vz *= .25;
		if (!b.alive || b.hp <= 0) {
			b.state = "out";
			b.alive = false;
		} else {
			const teching = b.kind === "player" && sim.prevDash;
			const foe = sim.bodies[0];
			const enemyTech = b.kind !== "player" && foe && b.tech <= 0 && Math.random() < .2;
			if ((teching || enemyTech) && b.tech <= 0) {
				b.state = "free";
				b.air = 0;
				b.iframe = b.kind === "player" ? .3 : .18;
				if (teching) {
					const m = Math.hypot(sim.aimX, sim.aimZ) || 1;
					b.vx = sim.aimX / m * 8;
					b.vz = sim.aimZ / m * 8;
					sim.banner = "Tech";
					sim.bannerT = .5;
					if (!sim.pair) {
						sim.pair = "esquiva";
						sim.pairT = .4;
					}
				} else if (foe) {
					const dx = b.x - foe.x;
					const dz = b.z - foe.z;
					const m = Math.hypot(dx, dz) || 1;
					b.vx = dx / m * 6;
					b.vz = dz / m * 6;
				}
			} else {
				b.state = "down";
				b.prone = fellForward;
				b.air = 0;
				b.stateT = b.kind === "player" ? .75 : 1.4;
				if (b.kind !== "player" && sim.bannerT < .25) {
					sim.banner = fellForward ? "Face down" : "Face up";
					sim.bannerT = .7;
				}
			}
			b.tech = 0;
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
function holdingBack(sim, p) {
	const m = Math.hypot(sim.aimX, sim.aimZ);
	if (m < .35) return false;
	const f = forward(p.yaw);
	return sim.aimX / m * f.x + sim.aimZ / m * f.z < -.35;
}
function engaged(home, p) {
	if (home === "ring") return p.x > 58 && p.z > 20 && p.z < 46;
	if (home === "cage") return p.x < -58;
	if (home === "subway") return p.z < -50;
	if (home === "crane") return p.z > 56 && Math.abs(p.x) < 16;
	if (home === "office") return p.x > 64 && p.z < -12 && p.z > -38;
	if (home === "yard") return p.x < -26 && p.x > -52;
	if (home === "dock") return p.z > 26 && p.z < 50 && p.x < 20;
	if (home === "under") return p.z < -26 && p.z > -48;
	if (home === "street") return p.z < -12.6 && p.x < 17;
	if (home === "market") return p.z < -14.2 && p.z > -26 && p.x > 16 && p.x < 48;
	if (home === "scaffold") return p.z > 14.2 && p.z < 46;
	return p.z > -12.8 && p.z < 14.6 && p.x < 23 && p.x > -26;
}
function updateEnemies(sim, dt) {
	const p = sim.bodies[0];
	for (const e of sim.bodies) {
		if (e.kind !== "grunt") continue;
		if (e.stopT > 0) {
			e.stopT -= dt;
			continue;
		}
		const yokoStreet = sim.mode === "belt" && e.home === "street";
		e.iframe = Math.max(0, e.iframe - dt);
		e.cd = Math.max(0, e.cd - dt);
		e.stun = Math.max(0, e.stun - dt);
		if (!e.alive) continue;
		if (e.state === "grab" || e.state === "throw") continue;
		if (e.state === "hit" || e.state === "down") {
			if (e.state === "down" && e.name !== "Bag" && p) {
				e.wake = Math.hypot(e.x - p.x, e.z - p.z) < 1.2 ? e.wake + dt : Math.max(0, e.wake - dt);
				if (e.wake > 2) {
					e.wake = 0;
					e.state = "atk";
					e.swing = 5;
					e.swung = false;
					e.stateT = .32;
					e.yaw = yawFromDir(p.x - e.x, p.z - e.z);
					sim.banner = "Wake-up sweep";
					sim.bannerT = .6;
					continue;
				}
			}
			if (e.id === sim.grabId) {
				e.vx = 0;
				e.vz = 0;
				continue;
			}
			if (yokoStreet && (e.yState === "hurt" || e.yState === "dying")) {
				e.vx *= Math.exp(-6 * dt);
				e.vz *= Math.exp(-6 * dt);
				continue;
			}
			e.stateT -= dt;
			e.vx *= Math.exp(-6 * dt);
			e.vz *= Math.exp(-6 * dt);
			if (e.stateT <= 0) {
				const close = Math.hypot(e.x - p.x, e.z - p.z) < 1.7;
				if (e.state === "down" && close && Math.random() < .38) {
					e.state = "windup";
					e.stateT = .18;
					e.yaw = yawFromDir(p.x - e.x, p.z - e.z);
				} else e.state = "free";
			}
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
			if (e.arch !== "brute" && e.stateT < .08 && p) e.yaw = yawFromDir(p.x - e.x, p.z - e.z);
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
				const bite = (e.arch === "brute" ? 14 : e.arch === "hex" ? 11 : e.arch === "hood" ? 8 : e.arch === "runner" ? 7 : 9) * (e.chest < 35 ? .65 : 1);
				const tag = e.swing === 5 || e.arch === "runner" ? "low" : e.arch === "brute" ? "high" : "mid";
				for (const target of sim.bodies) {
					if (target.kind === "grunt" || !target.alive) continue;
					if (target.iframe > 0) continue;
					if (Math.hypot(target.x - e.x, target.z - e.z) > 1.22 || Math.abs(target.y - e.y) >= 1.2) continue;
					if (hurt(sim, target, bite, 10, f.x * 6.5, f.z * 6.5, e.swing === 5 ? .25 : e.arch === "brute" ? 2.4 : 1.2, tag)) e.stopT = Math.max(e.stopT, .04);
				}
			}
			if (e.stateT <= 0) {
				releaseAttack(sim.group, e.id);
				e.state = "free";
				const f = forward(e.yaw);
				e.vx = -f.x * 2.2;
				e.vz = -f.z * 2.2;
				e.cd = e.arch === "runner" || e.arch === "hood" ? .42 : e.arch === "brute" ? 1.15 : .7;
			}
			continue;
		}
		if (e.state !== "free") continue;
		const hot = engaged(e.home, p) || sim.scuffle === e.home && Math.hypot(p.x - e.homeX, p.z - e.homeZ) < 22;
		let rank = 0;
		if (hot && p) {
			const mine = Math.hypot(e.x - p.x, e.z - p.z);
			for (const o of sim.bodies) {
				if (o === e || o.kind !== "grunt" || !o.alive || o.state === "down" || o.state === "out") continue;
				if (Math.hypot(o.x - p.x, o.z - p.z) < mine - .05) rank += 1;
			}
		}
		const pressing = rank === 0 || rank === 1 && p && p.state === "atk" && p.swung;
		const swinging = sim.bodies.some((o) => o !== e && o.kind === "grunt" && o.alive && (o.state === "windup" || o.state === "atk") && p && Math.hypot(o.x - p.x, o.z - p.z) < 2.2);
		let ax = (hot && p ? p.x : e.homeX) - e.x;
		let az = (hot && p ? p.z : e.homeZ) - e.z;
		const d = Math.hypot(ax, az) || 1;
		const playerOpen = p && p.state === "atk" && p.swung && p.stateT < .16;
		const playerThreat = p && p.state === "atk" && !p.swung;
		if (hot && p && pressing && !swinging && e.cd <= 0 && Math.abs(e.y - p.y) < 1.1 && d < (playerOpen ? 2.5 : e.arch === "hex" ? 2.3 : 1.35)) {
			if (!requestAttack(sim.group, e.id, sim.bodies)) continue;
			e.swing = p.state === "down" || e.arch === "runner" ? 5 : 0;
			e.state = "windup";
			e.stateT = (playerOpen ? .12 : SPEC.enemyWindup) * (e.arch === "runner" || e.arch === "hood" ? .62 : e.arch === "brute" || e.arch === "hex" ? 1.28 : 1);
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
		if (hot && p && !pressing) {
			const orbit = e.id * .9 + sim.time * .45;
			ax = p.x + Math.sin(orbit) * 2.55 - e.x;
			az = p.z + Math.cos(orbit) * 2.55 - e.z;
		} else if (hot && p && playerThreat && e.arch !== "brute" && d < 2.1) {
			ax = e.x - p.x;
			az = e.z - p.z;
		}
		const steer = Math.hypot(ax, az) || 1;
		ax /= steer;
		az /= steer;
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
		const heat = sim.story ? 1 + sim.mission * .012 : 1;
		const retreat = hot && p && playerThreat && e.arch !== "brute" && d < 2.1;
		const sp = (!hot ? sim.tune.enemySpeed * .65 : retreat ? sim.tune.enemySpeed * .8 : !pressing ? sim.tune.enemySpeed * .75 : d < 1.05 ? sim.tune.enemySpeed * .35 : sim.tune.enemySpeed) * archMul * heat * (e.legs < 35 ? .55 : 1);
		e.vx = ax / m * sp;
		e.vz = az / m * sp;
		if (sp > 0 && p) e.yaw = approachAngle(e.yaw, yawFromDir(hot ? p.x - e.x : e.vx, hot ? p.z - e.z : e.vz), 10, dt);
	}
}
function updatePlayer(sim, dt, dashEdge, counterEdge) {
	const p = sim.bodies[0];
	p.iframe = Math.max(0, p.iframe - dt);
	if (p.stopT > 0) {
		p.stopT -= dt;
		return;
	}
	if (counterEdge && sim.services && p.state === "free") tryParry(sim.services, p.id);
	if (sim.bufLock > 0) {
		sim.bufLock = 0;
		const was = sim.lock.isLocked;
		lockOnPress(sim.lock, p, sim.bodies);
		if (sim.lock.isLocked && !was) {
			sim.banner = "Locked on";
			sim.bannerT = .4;
		}
	}
	lockOnUpdate(sim.lock, sim.bodies);
	const atk = sim.bufAtk > 0;
	const grab = sim.bufGrab > 0;
	const blast = sim.bufBlast > 0;
	const jump = sim.bufJump > 0;
	if (sim.bufUse > 0 && (p.state === "free" || p.state === "down")) {
		sim.bufUse = 0;
		tryUse(sim, p);
	}
	const blocking = p.state === "free" && p.grounded && holdingBack(sim, p) && !atk && !grab && !jump;
	if (blocking && !sim.guard) sim.guardT = .13;
	sim.guard = blocking;
	sim.lowGuard = blocking && sim.stickY > .32;
	if (sim.guard) sim.guardT = Math.max(0, sim.guardT - dt);
	else sim.block = Math.max(0, sim.block - dt * 1.4);
	if (sim.pair && p.state !== "grab") {
		sim.pairT -= dt;
		const atk = sim.bodies.find((b) => b.id === sim.pairAtk);
		const vic = sim.bodies.find((b) => b.id === sim.pairVic);
		if (atk && vic && sim.pairT > 0) {
			atk.throwT = sim.pairT;
			vic.throwT = sim.pairT;
		}
		if (sim.pairAtk === p.id) p.throwT = Math.max(0, sim.pairT);
		if (sim.pairT <= 0) {
			if (vic && vic.alive && sim.pairAtk !== p.id) {
				vic.vx = sim.pairVx;
				vic.vz = sim.pairVz;
				vic.vy = sim.pairVy;
				vic.hp -= sim.pairDmg;
				vic.slam = true;
				vic.state = vic.hp <= 0 ? "out" : "throw";
				vic.alive = vic.hp > 0;
				vic.stateT = .48;
			}
			if (atk && atk.kind !== "player" && atk.state === "grab") atk.state = "free";
			sim.pair = "";
			sim.pairAtk = -1;
			sim.pairVic = -1;
			sim.pairLen = 0;
		}
	}
	if (p.state === "down" || p.state === "hit") {
		if (p.state === "down" && p.hp > 0) {
			if (dashEdge) {
				const f = forward(p.yaw);
				const rx = Math.cos(p.yaw);
				const rz = -Math.sin(p.yaw);
				const along = sim.aimX * f.x + sim.aimZ * f.z;
				const side = sim.aimX * rx + sim.aimZ * rz;
				p.state = "free";
				p.prone = false;
				if (Math.abs(side) > Math.abs(along) + .12) {
					const dir = side >= 0 ? 1 : -1;
					p.vx = rx * dir * 7.2;
					p.vz = rz * dir * 7.2;
					p.iframe = .32;
					sim.banner = "Side roll";
				} else if (along > .2) {
					p.vx = f.x * 8;
					p.vz = f.z * 8;
					p.iframe = .28;
					sim.banner = "Forward roll";
				} else {
					p.vx = -f.x * 8;
					p.vz = -f.z * 8;
					p.iframe = .28;
					sim.banner = "Back roll";
				}
				sim.bannerT = .5;
				return;
			}
			const stay = sim.stickY > .62;
			const back = sim.stickY > .35;
			const ahead = sim.stickY < -.35;
			if (atk && stay) {
				sim.bufAtk = 0;
				p.stateT += .75;
				sim.banner = "Stay down";
				sim.bannerT = .5;
				return;
			}
			if (atk && back) {
				sim.bufAtk = 0;
				const f = forward(p.yaw);
				p.state = "free";
				p.iframe = .42;
				p.vx = -f.x * 9;
				p.vz = -f.z * 9;
				sim.banner = "Roll";
				sim.bannerT = .55;
				sim.sfx.push("dash");
				return;
			}
			if (atk && !stay && !back && !ahead) {
				const foe = nearestGrunt(sim, 1.35);
				if (foe) {
					sim.bufAtk = 0;
					const f = forward(p.yaw);
					hurt(sim, foe, 12, 22, f.x * 4, f.z * 4, 3.4, "low");
					p.state = "free";
					p.iframe = .2;
					sim.banner = "Wake-up sweep";
					sim.bannerT = .6;
					return;
				}
			}
			if (atk && ahead) {
				sim.bufAtk = 0;
				p.iframe = .18;
				p.state = "free";
				beginSwing(sim, p);
				p.swing = 4;
				p.stateT = swingDur(4);
				sim.banner = sim.martial === "drunken" ? "From the floor" : "Rising strike";
				if (sim.martial === "drunken") p.vy = Math.max(p.vy, 4.2);
				sim.bannerT = .6;
				return;
			}
			if (atk && p.stateT < .42) {
				sim.bufAtk = 0;
				p.iframe = .12;
				p.state = "free";
				beginSwing(sim, p);
				p.swing = 2;
				p.stateT = swingDur(2);
				sim.banner = "While rising";
				sim.bannerT = .6;
				return;
			}
			if (atk) {
				sim.bufAtk = 0;
				sim.pair = sim.martial === "capoeira" ? "corkscrew" : "kip";
				sim.pairT = .9;
				p.state = "free";
				p.iframe = .55;
				p.vy = Math.max(p.vy, 3.4);
				sim.banner = sim.pair === "corkscrew" ? "Corkscrew kip" : "Kip up";
				sim.bannerT = .8;
				sim.sfx.push("jump");
				return;
			}
		}
		if (p.state === "hit" && atk && p.stateT > .16) {
			sim.bufAtk = 0;
			p.state = "free";
			p.stateT = 0;
			p.iframe = .32;
			sim.pair = "block";
			sim.pairT = .4;
			sim.flow = Math.min(100, sim.flow + 16);
			sim.banner = "Reversal";
			sim.bannerT = .6;
			const foe = nearestGrunt(sim, 2.2);
			if (foe) {
				const f = forward(p.yaw);
				foe.state = "hit";
				foe.stateT = .42;
				foe.vx = f.x * 7;
				foe.vz = f.z * 7;
			}
			return;
		}
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
		const e = sim.bodies.find((b) => b.id === sim.grabId);
		if (!e || !e.alive) {
			sim.grabId = -1;
			sim.pair = "";
			sim.pairT = 0;
			p.state = "free";
			return;
		}
		if (dashEdge && sim.pair !== "mount" && sim.pairT <= 0) {
			if (Math.abs(sim.stickX) > .4) {
				sim.rearLock = !sim.rearLock;
				p.yaw += Math.PI;
				p.stateT = 1;
				sim.banner = sim.rearLock ? "Around to the back" : "Around to the front";
				sim.bannerT = .6;
				return;
			}
			const f = forward(p.yaw);
			e.state = "hit";
			e.stateT = .4;
			e.vx = -f.x * 7;
			e.vz = -f.z * 7;
			e.vy = 0;
			p.state = "free";
			sim.grabId = -1;
			sim.pair = "";
			sim.banner = "Broke the hold";
			sim.bannerT = .6;
			return;
		}
		if (sim.pair !== "mount") {
			const f = forward(p.yaw);
			e.x = p.x + f.x * .52;
			e.z = p.z + f.z * .52;
			e.y = Math.max(0, p.y);
			e.yaw = sim.rearLock ? p.yaw : p.yaw + Math.PI;
			e.vx = 0;
			e.vz = 0;
			e.vy = 0;
			e.state = "grab";
		}
		if (sim.pair === "mount") {
			e.state = "down";
			e.vx = 0;
			e.vz = 0;
			e.vy = 0;
			e.stateT = Math.max(e.stateT, .45);
			if (!e.alive || e.hp <= 0) {
				sim.grabId = -1;
				sim.pair = "";
				p.state = "free";
				return;
			}
			if (grab && Math.abs(sim.stickX) > .45 && (sim.martial === "wrestling" || sim.martial === "catch")) {
				sim.bufGrab = 0;
				const spin = sim.stickX > 0 ? 1 : -1;
				e.hp -= 16;
				e.legs = Math.max(0, e.legs - 18);
				e.vx = Math.cos(p.yaw) * spin * 13;
				e.vz = -Math.sin(p.yaw) * spin * 13;
				e.vy = 3.2;
				e.slam = true;
				e.state = "throw";
				e.stateT = .5;
				for (const o of sim.bodies) {
					if (o === e || o.kind !== "grunt" || !o.alive) continue;
					if (Math.hypot(o.x - e.x, o.z - e.z) > 1.8) continue;
					o.hp -= 10;
					o.vx = e.vx * .5;
					o.vz = e.vz * .5;
					o.vy = 2;
					o.state = "hit";
					o.stateT = .5;
					if (o.hp <= 0) {
						o.hp = 0;
						o.alive = false;
						o.state = "out";
					}
				}
				p.state = "free";
				sim.grabId = -1;
				sim.pair = "";
				sim.banner = "Giant swing";
				sim.bannerT = .8;
				sim.sfx.push("throw");
				if (e.hp <= 0) {
					e.hp = 0;
					e.alive = false;
					e.state = "out";
				}
				return;
			}
			if (grab && sim.stickY > .3) {
				sim.bufGrab = 0;
				sim.grabId = -1;
				sim.pair = "";
				p.state = "free";
				sim.banner = "Stand";
				sim.bannerT = .4;
				return;
			}
			if (atk) {
				sim.bufAtk = 0;
				const side = Math.abs(sim.stickX) > .45;
				const heavy = sim.stickY < -.3;
				e.hp -= heavy ? 14 : side ? 7 : 9;
				e.poise = Math.max(0, e.poise - 6);
				p.meter = Math.min(100, p.meter + 5);
				sim.hitstop = .04;
				sim.sfx.push("hit");
				sim.combo += 1;
				sim.comboT = 1.1;
				e.state = "down";
				e.stateT = 1.2;
				sim.banner = heavy ? "Ground and pound" : side ? "Side control" : "Mount";
				sim.bannerT = .55;
				if (e.hp <= 0) {
					e.hp = 0;
					e.alive = false;
					e.state = "out";
					sim.grabId = -1;
					sim.pair = "";
					p.state = "free";
				}
			}
			p.stateT -= dt;
			if (p.stateT <= 0) {
				e.state = "free";
				p.state = "free";
				sim.grabId = -1;
				sim.pair = "";
			}
			return;
		}
		p.stateT -= dt;
		sim.lockArm = Math.max(0, sim.lockArm - dt);
		if (sim.bufUse > 0) {
			sim.bufUse = 0;
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
			e.vx = dx * 12;
			e.vz = dz * 12;
			e.vy = 1.1;
			e.slam = true;
			e.state = "throw";
			e.stateT = .35;
			p.state = "free";
			sim.grabId = -1;
			sim.pair = "";
			sim.banner = "Shove";
			sim.bannerT = .6;
			return;
		}
		if (sim.prevGrab && (sim.martial === "jiujitsu" || sim.martial === "sambo" || sim.martial === "wrestling")) {
			sim.squeezeT -= dt;
			if (sim.squeezeT <= 0) {
				sim.squeezeT = .28;
				e.hp -= 4;
				sim.banner = "Squeeze";
				sim.bannerT = .35;
				sim.sfx.push("hit");
				if (e.hp <= 0) {
					e.hp = 0;
					e.alive = false;
					e.state = "out";
					p.state = "free";
					sim.grabId = -1;
					sim.grip = 0;
					return;
				}
			}
		}
		if (sim.pairT > 0) {
			sim.pairT -= dt;
			if (grab && (sim.martial === "wrestling" || sim.martial === "catch" || sim.martial === "jiujitsu" || sim.martial === "sambo")) sim.chain = true;
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
			sim.pairAtk = -1;
			sim.pairVic = -1;
			sim.pairLen = 0;
			if (sim.chain && sim.chains < 3 && e.alive && (sim.martial === "wrestling" || sim.martial === "catch" || sim.martial === "jiujitsu" || sim.martial === "sambo")) {
				sim.chain = false;
				sim.chains += 1;
				e.state = "grab";
				p.state = "grab";
				sim.grabId = e.id;
				sim.lockArm = 0;
				sim.banner = "Chain";
				throwEnemy(sim, e);
				return;
			}
			sim.chains = 0;
			if (e.hp <= 0) {
				e.hp = 0;
				e.alive = false;
				e.state = "out";
			}
			return;
		}
		if (grab && sim.lockArm <= 0 && sim.pairT <= 0) throwEnemy(sim, e);
		else if (atk) {
			sim.bufAtk = 0;
			sim.grip += 1;
			let dmg = sim.grip >= 3 ? 12 : sim.grip === 2 ? 9 : 7;
			let name = sim.grip >= 3 ? "Headbutt" : sim.grip === 2 ? "Elbow" : "Knee";
			if (sim.martial === "boxing") name = sim.grip >= 2 ? "Hook" : "Uppercut";
			if (sim.martial === "muaythai") name = sim.grip >= 2 ? "Elbow" : "Knee";
			if (sim.martial === "muaythai" && sim.grip >= 4) {
				e.state = "hit";
				e.stateT = .35;
				p.state = "free";
				sim.grabId = -1;
				sim.grip = 0;
				sim.banner = "Clinch breaks";
				sim.bannerT = .5;
				return;
			}
			if (sim.martial === "capoeira") name = "Meia lua";
			if (p.weapon === "pipe" || p.weapon === "blade" || p.weapon === "spear") {
				dmg = p.weapon === "blade" ? 13 : p.weapon === "spear" ? 12 : 14;
				name = p.weapon === "blade" ? "Cut" : p.weapon === "spear" ? "Spear jab" : "Club";
				wearWeapon(sim, p);
			} else if (p.weapon === "board") {
				dmg = 12;
				name = "Board";
				wearWeapon(sim, p);
			} else if (p.weapon === "bottle") {
				dmg = 11;
				name = "Bottle to the head";
				p.weapon = "fist";
				p.wpn = 0;
			}
			e.hp -= dmg;
			e.poise -= 7;
			p.meter = Math.min(100, p.meter + 6);
			p.stateT = Math.max(p.stateT, .7);
			sim.hitstop = .035;
			sim.sfx.push("hit");
			burst(sim, e.x, e.y + 1, e.z, 15774761);
			sim.banner = name;
			sim.bannerT = .45;
			if (e.hp <= 0) {
				e.hp = 0;
				e.alive = false;
				e.state = "out";
				p.state = "free";
				sim.grabId = -1;
				sim.grip = 0;
			}
		} else if (p.stateT <= 0) {
			e.state = "free";
			e.iframe = .2;
			p.state = "free";
			sim.grabId = -1;
			sim.banner = "Slipped the lock";
			sim.bannerT = .6;
		}
		return;
	}
	if (p.state === "atk") {
		if (sim.mode === "belt") return;
		const dur = swingDur(p.swing);
		let startup = p.swing >= 5 ? .08 : p.swing >= 4 ? .09 : p.swing === 3 ? SPEC.launchStartup : p.swing === 2 ? SPEC.crossStartup : SPEC.jabStartup;
		if (sim.martial === "boxing" && p.swing <= 2) startup = Math.max(.03, startup - .045);
		if (sim.martial === "drunken") startup += .09;
		const elapsed = dur - p.stateT;
		const recovery = elapsed >= (p.landed ? startup + SPEC.active : startup + SPEC.active + .18);
		if (recovery && dashEdge) {
			startDash(sim, p);
			return;
		}
		if (recovery && (atk || sim.bufAtk > 0)) {
			beginSwing(sim, p);
			return;
		}
		if (!p.swung && elapsed >= startup && elapsed < startup + SPEC.active) {
			p.swung = true;
			const f = forward(p.yaw);
			let lift = p.swing === 5 ? .3 : p.swing === 4 ? 2.8 : p.swing === 3 ? sim.tune.launcher : p.swing === 2 ? 2.4 : .2;
			let dmg = p.swing === 5 ? 11 : p.swing === 4 ? 15 : p.swing === 3 ? SPEC.launchDamage : p.swing === 2 ? SPEC.crossDamage : SPEC.jabDamage;
			let kb = p.swing === 5 ? 4.5 : p.swing === 4 ? 8 : p.swing === 3 ? 3.2 : p.swing === 2 ? 6.2 : 3.6;
			let call = "";
			if (p.swing === 12) {
				lift = 1.1;
				dmg = 13;
				kb = 5.5;
			} else if (p.swing === 11) {
				lift = .35;
				dmg = 10;
				kb = 4.2;
			} else if (p.swing >= 10) {
				lift = 1.3;
				dmg = 14;
				kb = 6.5;
				call = "Au";
			} else if (p.swing >= 9) {
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
			} else if ((sim.martial === "kenpo" || sim.martial === "jeet") && p.swing === 2) {
				kb = 16;
				call = "Inch punch";
			} else if (p.swing === 2 && sim.martial === "muaythai") {
				kb = 14;
				dmg = 8;
				call = "Teep";
			} else if (p.swing === 3 && sim.martial === "karate" && sim.combo >= 2) {
				dmg += 6;
				call = "Chain";
			} else if (p.swing === 4 && (sim.martial === "wrestling" || sim.martial === "catch" || sim.martial === "savate" || sim.martial === "muaythai")) {
				lift = .55;
				kb = 11;
				call = "Clothesline";
			}
			if (p.weapon === "pipe" || p.weapon === "blade" || p.weapon === "spear") {
				dmg *= p.weapon === "blade" ? 1.28 : p.weapon === "spear" ? 1.16 : 1.35;
				kb *= p.weapon === "spear" ? 1.25 : 1.2;
			} else if (p.weapon === "bottle") {
				dmg *= 1.1;
				kb *= 1.05;
			} else if (p.weapon === "board") {
				dmg *= 1.22;
				kb *= 1.15;
			}
			const poise = p.swing >= 8 ? 26 : p.swing === 5 ? sim.stance === "crane" ? 70 : 48 : p.swing >= 3 ? 18 : 11;
			const reach = p.swing === 11 || p.swing === 12 ? .85 : p.swing === 10 ? 1.5 : (sim.martial === "kenpo" || sim.martial === "jeet") && p.swing === 5 ? 2.15 : sim.martial === "capoeira" && p.swing === 3 ? 1.85 : p.swing === 9 || p.swing === 7 ? 1.85 : p.swing >= 6 ? 1.35 : p.swing >= 4 ? 1.05 : p.swing === 3 ? .95 : .78;
			const hx = sim.martial === "capoeira" && p.swing === 3 ? p.x : p.swing === 9 || p.swing === 7 ? p.x : p.x + f.x * .85;
			const hz = sim.martial === "capoeira" && p.swing === 3 ? p.z : p.swing === 9 || p.swing === 7 ? p.z : p.z + f.z * .85;
			if (sim.martial === "capoeira" && p.swing === 3) call = call || "Windmill";
			if ((sim.martial === "kenpo" || sim.martial === "jeet") && p.swing === 5) call = call || "Dragon tail";
			const tag = p.swing === 5 ? "low" : p.swing === 11 || p.swing === 12 ? "mid" : p.swing === 3 || p.swing >= 6 ? "high" : "mid";
			const hit = hitGrunts(sim, hx, hz, reach + (p.weapon === "spear" ? .45 : p.weapon === "blade" ? .12 : 0), dmg, kb, lift, poise, f.x, f.z, tag);
			if (hit) p.landed = true;
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
		if (p.stateT <= 0) {
			if (p.queued) beginSwing(sim, p);
			else {
				p.state = "free";
				p.comboWindow = .58;
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
		const downed = nearestDown(sim, 1.35);
		if (downed) {
			if (downed.prone) {
				downed.state = "hit";
				downed.stateT = .95;
				downed.prone = false;
				downed.vx = 0;
				downed.vz = 0;
				sim.bufGrab = 0;
				sim.banner = "Drag up";
				sim.bannerT = .7;
				sim.sfx.push("grab");
				return;
			}
			p.state = "grab";
			p.stateT = 2.6;
			downed.state = "down";
			downed.stateT = 2.6;
			downed.vx = 0;
			downed.vz = 0;
			downed.vy = 0;
			sim.grabId = downed.id;
			sim.pair = "mount";
			sim.pairT = 0;
			sim.bufGrab = 0;
			sim.banner = "Mount";
			sim.bannerT = .7;
			sim.sfx.push("grab");
			return;
		}
		const e = nearestGrunt(sim, sim.tune.grapple * (sim.stance === "drunken" ? 1.35 : 1));
		if (e && (e.state === "launch" || e.y > .75)) {
			const f = forward(p.yaw);
			e.hp -= 16;
			e.vx = f.x * 2;
			e.vz = f.z * 2;
			e.vy = -7;
			e.state = "down";
			e.stateT = .9;
			e.grounded = false;
			sim.bufGrab = 0;
			sim.banner = "Air slam";
			sim.bannerT = .7;
			sim.sfx.push("slam");
			if (e.hp <= 0) {
				e.hp = 0;
				e.alive = false;
				e.state = "out";
			}
			return;
		}
		if (e) {
			const look = forward(e.yaw);
			sim.rearLock = look.x * (p.x - e.x) + look.z * (p.z - e.z) < -.35 && e.state !== "windup" && e.state !== "atk";
			if (e.stun > .15) e.tech = 3;
			sim.rush = Math.hypot(p.vx, p.vz) > 4.2;
			sim.grip = 0;
			sim.squeezeT = .2;
			sim.lockArm = .28;
			commitFacing(sim, p);
			p.state = "grab";
			p.stateT = 1.5;
			e.tech = e.state === "hit" || e.state === "launch" ? 3 : 0;
			e.state = "grab";
			e.vx = 0;
			e.vz = 0;
			e.vy = 0;
			sim.grabId = e.id;
			sim.bufGrab = 0;
			sim.banner = e.stun > .15 ? "Stun lock" : sim.rearLock ? "Rear lock" : "Lock";
			sim.bannerT = .6;
			sim.sfx.push("grab");
		} else startDash(sim, p);
		return;
	}
	if (blast) {
		sim.bufBlast = 0;
		if (p.meter < SPEC.meterCost) {
			const rook = sim.bodies.find((a) => a.kind === "ally" && a.alive);
			if (rook) callRook(sim, rook);
			else sim.sfx.push("deny");
		} else {
			p.meter -= SPEC.meterCost;
			p.state = "spin";
			p.stateT = .56;
			sim.spinPulse = 0;
			sim.sfx.push("blast");
			return;
		}
	}
	if (jump && sim.coyote > 0 && sim.mode !== "belt") {
		if (Math.abs(sim.stickX) > .55 && Math.abs(sim.stickY) < .35) {
			startAu(sim, p);
			return;
		}
		p.vy = sim.tune.jumpV;
		p.grounded = false;
		sim.coyote = 0;
		sim.bufJump = 0;
		sim.sfx.push("jump");
	}
	if (sim.mode !== "belt") applyMove(sim, p, dt, sim.guard ? .4 : 1);
}
function startAu(sim, p) {
	const side = sim.stickX >= 0 ? 1 : -1;
	const f = forward(p.yaw);
	p.state = "atk";
	p.swing = 10;
	p.swung = false;
	p.queued = false;
	p.comboWindow = 0;
	p.stateT = swingDur(10);
	p.vx = f.z * side * 8;
	p.vz = -f.x * side * 8;
	p.vy = 2.4;
	p.grounded = false;
	sim.coyote = 0;
	sim.bufJump = 0;
	sim.banner = "Au";
	sim.bannerT = .6;
	sim.sfx.push("swing");
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
function nearestDown(sim, maxDist) {
	const p = sim.bodies[0];
	let best = null;
	let bestD = maxDist;
	for (const e of sim.bodies) {
		if (e.kind !== "grunt" || !e.alive || e.state !== "down") continue;
		if (e.y > .6) continue;
		const d = Math.hypot(e.x - p.x, e.z - p.z);
		if (d <= bestD) {
			best = e;
			bestD = d;
		}
	}
	return best;
}
function glueGrab(sim) {
	if (sim.grabId < 0) return;
	const p = sim.bodies[0];
	const e = sim.bodies.find((b) => b.id === sim.grabId);
	if (!e || p.state !== "grab") return;
	const f = forward(p.yaw);
	if (sim.pair === "mount") {
		e.x = p.x + f.x * .2;
		e.z = p.z + f.z * .2;
		e.y = 0;
		e.yaw = p.yaw + Math.PI;
		e.vx = 0;
		e.vy = 0;
		e.vz = 0;
		p.y = Math.min(p.y, .2);
		return;
	}
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
		const wobble = Math.sin(sim.time * 17) * .035;
		pullHold(e, p.x + f.x * .62 + wobble, p.y, p.z + f.z * .62, p.yaw + Math.PI);
	}
	e.vx = 0;
	e.vy = 0;
	e.vz = 0;
}
function pullHold(e, x, y, z, yaw) {
	e.x += (x - e.x) * .42;
	e.y += (y - e.y) * .42;
	e.z += (z - e.z) * .42;
	e.yaw += Math.atan2(Math.sin(yaw - e.yaw), Math.cos(yaw - e.yaw)) * .42;
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
function stickPair(sim) {
	if (sim.pairT <= 0 || sim.pairAtk < 0) return;
	const atk = sim.bodies.find((b) => b.id === sim.pairAtk);
	const vic = sim.bodies.find((b) => b.id === sim.pairVic);
	if (!atk || !vic) return;
	const face = forward(atk.yaw);
	atk.vx = 0;
	atk.vz = 0;
	vic.x = atk.x + face.x * .78;
	vic.z = atk.z + face.z * .78;
	vic.y = atk.y;
	vic.yaw = atk.yaw + Math.PI;
	vic.vx = 0;
	vic.vz = 0;
	vic.vy = 0;
}
function living(sim, home) {
	return sim.bodies.some((b) => b.kind === "grunt" && b.home === home && b.alive && b.name !== "Paper Quinn");
}
function updateAlly(sim, dt) {
	if (sim.mode === "belt") return;
	const p = sim.bodies[0];
	if (!p) return;
	for (const a of sim.bodies) {
		if (a.kind !== "ally" || !a.alive) continue;
		a.iframe = Math.max(0, a.iframe - dt);
		a.cd = Math.max(0, a.cd - dt);
		if (a.state === "grab") {
			a.vx = 0;
			a.vz = 0;
			continue;
		}
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
		const side = foe ? 0 : 1;
		const tx = foe ? foe.x : p.x + Math.cos(p.yaw) * 1.5 * side;
		const tz = foe ? foe.z : p.z - Math.sin(p.yaw) * 1.5;
		const dx = tx - a.x;
		const dz = tz - a.z;
		const d = Math.hypot(dx, dz) || 1;
		if (foe && a.cd <= 0 && (d < 1.25 || foe.state === "launch" && d < 2.4)) {
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
		const gap = Math.hypot(a.x - p.x, a.z - p.z);
		if (gap < .9 && gap > .001) {
			a.vx += (a.x - p.x) / gap * 3;
			a.vz += (a.z - p.z) / gap * 3;
		}
	}
}
function ensureCrew(sim) {
	const p = sim.bodies[0];
	if (!p || sim.bout !== "off") return;
	if ((sim.story ? sim.mission >= 1 : sim.plazaClear) && !sim.bodies.some((b) => b.kind === "ally")) {
		sim.bodies.push(blankBody(sim, {
			kind: "ally",
			name: PARTNER.name,
			arch: "hood",
			x: p.x + 1.4,
			z: p.z,
			home: "plaza",
			hp: 90,
			maxHp: 90
		}));
		sim.banner = "Rook Calder steps in";
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
		boss.name = LEASE_NAME;
		boss.hp = 180;
		boss.maxHp = 180;
	}
	sim.banner = "Paper Quinn";
	sim.bannerT = 1.8;
}
function focusPack(sim) {
	const mission = missionAt(sim.mission);
	for (const b of sim.bodies) {
		if (b.kind !== "grunt" || b.name === "Paper Quinn") continue;
		if (!(b.home === mission.home)) {
			b.alive = false;
			b.hp = 0;
			b.state = "out";
			continue;
		}
		if (mission.rule === "rival" && sim.bodies.some((o) => o.kind === "grunt" && o.alive && o.id < b.id && o.home === mission.home)) {
			b.alive = false;
			b.hp = 0;
			b.state = "out";
			continue;
		}
		b.alive = true;
		b.state = "free";
		b.stateT = 0;
		b.y = standY(b.home);
		b.vx = 0;
		b.vz = 0;
		if (mission.rule === "inside") {
			const ang = b.id;
			const rad = 3.2;
			b.x = sim.venueX + Math.cos(ang) * rad;
			b.z = sim.venueZ + Math.sin(ang) * rad;
			b.homeX = b.x;
			b.homeZ = b.z;
		} else if (sim.wave > 1) {
			b.x = b.homeX + 3;
			b.z = b.homeZ + 3;
		}
		const base = b.arch === "brute" ? 120 : b.arch === "runner" ? 44 : b.arch === "hood" ? 56 : b.arch === "hex" ? 72 : 64;
		b.maxHp = Math.round(base * mission.hp * (mission.rule === "rival" ? 2.2 : 1));
		b.hp = b.maxHp;
	}
}
function advanceStory(sim) {
	if (!sim.story || sim.missionClear) return;
	const job = missionAt(sim.mission);
	const p = sim.bodies[0];
	if (job.rule === "reach" && p) {
		const goal = dropFor(job.home);
		if (Math.hypot(p.x - goal[0], p.z - goal[1]) > 7) return;
	}
	if (sim.bodies.some((b) => b.kind === "grunt" && b.alive)) return;
	if (sim.wave < sim.waveMax) {
		sim.wave += 1;
		focusPack(sim);
		sim.banner = `They fell back. Wave ${sim.wave} of ${sim.waveMax}`;
		sim.bannerT = 1.4;
		return;
	}
	const pay = 40 + sim.mission * 8 + (job.boss ? 80 : 0) + (job.rule === "rival" ? 50 : job.rule === "reach" ? 30 : 0);
	sim.purse += pay;
	grantXp(sim, 40);
	sim.missionClear = true;
	sim.paused = true;
	sim.banner = `Paid ${pay}. Purse ${sim.purse}`;
	sim.bannerT = 2;
	const next = Math.min(MISSIONS.length, sim.mission + 1);
	if (next > sim.clearedMission) {
		sim.clearedMission = next;
		saveCleared(next, sim.purse, sim.xp);
	} else saveCleared(sim.clearedMission, sim.purse, sim.xp);
	openCity(sim, job.home);
}
function openCity(sim, quiet) {
	for (const b of sim.bodies) {
		if (b.kind !== "grunt" || b.name === "Paper Quinn" || b.home === quiet) continue;
		b.alive = true;
		b.state = "free";
		b.stateT = 0;
		b.hp = b.maxHp;
		b.x = b.homeX;
		b.z = b.homeZ;
		b.y = b.home === "scaffold" ? 2.4 : 0;
		b.vx = 0;
		b.vz = 0;
	}
}
function step(sim, input, dt) {
	sim.sfx.length = 0;
	sim.time += dt;
	for (const prop of sim.props) {
		if (prop.kind !== "car") continue;
		const target = !prop.alive ? 1 : 1 - Math.max(0, prop.hp) / prop.maxHp;
		prop.crush += (target - prop.crush) * Math.min(1, dt * .85);
	}
	const atkEdge = input.attack && !sim.prevAtk;
	const grabEdge = input.grab && !sim.prevGrab;
	const blastEdge = input.blast && !sim.prevBlast;
	const jumpEdge = input.jump && !sim.prevJump;
	const dashEdge = input.dash && !sim.prevDash;
	const useEdge = input.use && !sim.prevUse;
	const lockEdge = !!input.lock && !sim.prevLock;
	const counterEdge = !!input.counter && !sim.prevCounter;
	sim.prevAtk = input.attack;
	sim.prevGrab = input.grab;
	sim.prevBlast = input.blast;
	sim.prevJump = input.jump;
	sim.prevDash = input.dash;
	sim.prevUse = input.use;
	sim.prevLock = !!input.lock;
	sim.prevCounter = !!input.counter;
	if (atkEdge) sim.bufAtk = .16;
	else sim.bufAtk = Math.max(0, sim.bufAtk - dt);
	if (grabEdge) sim.bufGrab = .16;
	else sim.bufGrab = Math.max(0, sim.bufGrab - dt);
	if (blastEdge) sim.bufBlast = .16;
	else sim.bufBlast = Math.max(0, sim.bufBlast - dt);
	if (jumpEdge) sim.bufJump = .14;
	else sim.bufJump = Math.max(0, sim.bufJump - dt);
	if (useEdge) sim.bufUse = .2;
	else sim.bufUse = Math.max(0, sim.bufUse - dt);
	if (lockEdge) sim.bufLock = .2;
	else sim.bufLock = Math.max(0, sim.bufLock - dt);
	if (!sim.running || sim.paused) return;
	if (sim.services) tickSimServices(sim, input, dt);
	if (sim.hitstop > 0) {
		sim.hitstop -= dt;
		sim.shake *= Math.exp(-8 * dt);
		return;
	}
	steer(sim, input);
	sim.stickY = input.y;
	sim.stickX = input.x;
	updatePlayer(sim, dt, dashEdge, counterEdge);
	updateEnemies(sim, dt);
	updateAlly(sim, dt);
	tickYokosukaBelt(sim, input, dt);
	for (const b of sim.bodies) {
		if (b.stopT > 0) continue;
		moveBody(sim, b, dt);
	}
	stickPair(sim);
	for (let i = 0; i < sim.bodies.length; i++) {
		const a = sim.bodies[i];
		if (!a.alive || a.state === "out" || a.state === "grab" || a.state === "throw") continue;
		if (a.stopT > 0) continue;
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
	const holder = sim.bodies[0];
	const held = holder && holder.state === "grab" ? sim.bodies.find((b) => b.id === sim.grabId) : void 0;
	if (holder && held && sim.pair !== "mount") {
		held.vx = 0;
		held.vz = 0;
		held.vy = 0;
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
	updateDoor(sim, dt);
	sim.comboT -= dt;
	if (sim.comboT <= 0) sim.combo = 0;
	sim.bannerT -= dt;
	if (sim.bannerT <= 0) sim.banner = "";
	sim.shake *= Math.exp(-3.2 * dt);
	refreshZone(sim);
	refreshScuffle(sim, dt);
	callBackup(sim, dt);
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
		face: (() => {
			const foe = nearestGrunt(sim, 7);
			if (!foe) return "";
			const card = wardByName(foe.name);
			return card ? `${foe.name} · ${card.style}` : foe.name;
		})(),
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
			leaseDown: sim.leaseSpawned && !sim.bodies.some((b) => b.name === "Paper Quinn" && b.alive)
		}).title,
		jobStep: jobNow({
			plazaClear: sim.plazaClear,
			streetClear: sim.streetClear,
			scaffoldClear: sim.scaffoldClear,
			marketClear: sim.marketClear,
			leaseDown: sim.leaseSpawned && !sim.bodies.some((b) => b.name === "Paper Quinn" && b.alive)
		}).step,
		martial: sim.martial,
		who: sim.who,
		bio: sim.bio,
		cast: sim.cast,
		stance: sim.stance,
		bout: sim.bout,
		flow: Math.round(sim.flow),
		story: sim.story,
		mission: sim.mission,
		missionTitle: sim.story ? missionAt(sim.mission).title : "",
		missionStep: sim.story ? `${missionAt(sim.mission).step} ${placeName(missionAt(sim.mission).home)}.` : "",
		actName: sim.story ? missionAt(sim.mission).actName : "",
		wave: sim.wave,
		waveMax: sim.waveMax,
		missionClear: sim.missionClear,
		clearedMission: sim.clearedMission,
		purse: sim.purse,
		xp: sim.xp,
		level: sim.level,
		build: sim.build,
		crowd: sim.crowd,
		height: sim.height,
		bulk: sim.bulk,
		head: sim.head,
		leg: sim.leg,
		shoulder: sim.shoulder,
		headDmg: p?.head ?? 100,
		chestDmg: p?.chest ?? 100,
		legsDmg: p?.legs ?? 100
	};
}
function updateDoor(sim, dt) {
	const p = sim.bodies[0];
	if (!p) return;
	if (sim.doorBroke) {
		sim.door = 1;
		return;
	}
	sim.door = Math.hypot(p.x + 12.4, p.z + 5.5) < 2.15 ? Math.min(1, sim.door + dt * 2.6) : Math.max(0, sim.door - dt * 1.5);
}
function callBackup(sim, dt) {
	if (!sim.bodies.some((e) => e.kind === "grunt" && e.alive && (e.state === "windup" || e.state === "atk" || e.state === "hit"))) {
		sim.backupT = 0;
		return;
	}
	sim.backupT += dt;
	if (sim.backupT < 8 || sim.backups >= 2) return;
	if (sim.bodies.filter((e) => e.kind === "grunt" && e.alive).length >= 3) return;
	const dead = sim.bodies.find((e) => e.kind === "grunt" && !e.alive && e.name !== "Paper Quinn");
	if (!dead) return;
	const p = sim.bodies[0];
	if (!p) return;
	sim.backupT = 0;
	sim.backups += 1;
	const f = forward(p.yaw);
	dead.alive = true;
	dead.hp = Math.max(20, Math.round(dead.maxHp * .65));
	dead.state = "free";
	dead.stateT = 0;
	dead.x = p.x - f.x * 6.5;
	dead.z = p.z - f.z * 6.5;
	dead.y = 0;
	dead.vx = f.x * 3;
	dead.vz = f.z * 3;
	sim.banner = "Another one";
	sim.bannerT = 1;
}
function refreshScuffle(sim, dt) {
	const p = sim.bodies[0];
	if (!p) return;
	const was = sim.scuffle;
	if (was && !living(sim, was)) {
		sim.scuffle = "";
		sim.clearT = 1.6;
		if (!sim.story || sim.missionClear) {
			sim.purse += 20;
			sim.banner = "Camp quiet. +20";
		} else sim.banner = "Block's quiet";
		sim.bannerT = 1.5;
	} else if (!was) {
		for (const home of [
			"plaza",
			"street",
			"market",
			"scaffold",
			"yard",
			"dock",
			"under",
			"ring",
			"cage",
			"subway",
			"crane",
			"office"
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
	if (p.x > 60 && p.z < -18) return "office";
	if (p.x > 58) return "ring";
	if (p.x < -58) return "cage";
	if (p.z < -50) return "subway";
	if (p.z > 58) return "crane";
	if (p.x < -26) return "yard";
	if (p.z > 26) return "docks";
	if (p.z < -26) return "underpass";
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
var PROP_MESH = /sword|axe|shield|knife|crossbow|mug|throw|dagger|quiver|arrow|staff|wand|spell|badge/i;
var libraries = /* @__PURE__ */ new Map();
var MOVESETS = {
	drifter: {
		id: "drifter",
		show: [],
		clips: {
			idle: "Idle_Loop",
			walk: "Jog_Fwd_Loop",
			run: "Sprint_Loop",
			back: "Jog_Fwd_Loop",
			strafeL: "Jog_Fwd_Loop",
			strafeR: "Jog_Fwd_Loop",
			jump: "Jump_Start",
			fall: "Jump_Loop",
			jab: "Punch_Jab",
			cross: "Punch_Cross",
			launch: "Punch_Cross",
			sweep: "Punch_Enter",
			lunge: "Punch_Enter",
			armedJab: "Punch_Jab",
			armedCross: "Punch_Cross",
			armedLaunch: "Punch_Cross",
			armedSweep: "Punch_Enter",
			armedLunge: "Punch_Enter",
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
			sweep: "Dualwield_Melee_Attack_Slice",
			lunge: "2H_Melee_Attack_Chop",
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
		show: [],
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
		show: [],
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
		show: [],
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
		show: [],
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
	},
	{
		id: "skeleton",
		label: "Bone warrior",
		note: "CC0 KayKit skeleton. Same clips as the knight, different skin."
	},
	{
		id: "bones",
		label: "Bone rogue",
		note: "CC0 KayKit skeleton rogue. Same rig, lighter skin."
	},
	{
		id: "mannequin",
		label: "Mannequin",
		note: "Stripped Mixamo skeleton. The motion bank plays on Hips and LeftArm, not a likeness."
	},
	{
		id: "skull",
		label: "Bone mage",
		note: "CC0 KayKit skeleton mage. Same rig as the knight."
	},
	{
		id: "minion",
		label: "Bone minion",
		note: "CC0 KayKit skeleton minion."
	},
	{
		id: "rain",
		label: "Rain dye",
		note: "The knight, dyed for the wet ward."
	},
	{
		id: "ash",
		label: "Ash dye",
		note: "The rogue, greyed out."
	},
	{
		id: "pit",
		label: "Pit dye",
		note: "The brute, dyed for the pit."
	},
	{
		id: "soldier",
		label: "Soldier",
		note: "CC0 full-size body, about 1.8m. Walk, punch, roll, and the motion bank."
	},
	{
		id: "soldierf",
		label: "Second soldier",
		note: "Same full-size rig, other body."
	},
	{
		id: "zombie",
		label: "Shambler",
		note: "CC0 full-size body. Same skeleton as the soldiers."
	},
	{
		id: "zombief",
		label: "Second shambler",
		note: "CC0 full-size body, other mesh."
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
MOVESETS.skeleton = {
	id: "skeleton",
	show: [],
	clips: { ...MOVESETS.knight.clips }
};
MOVESETS.bones = {
	id: "bones",
	show: [],
	clips: { ...MOVESETS.knight.clips }
};
MOVESETS.skull = {
	id: "skull",
	show: [],
	clips: { ...MOVESETS.knight.clips }
};
MOVESETS.minion = {
	id: "minion",
	show: [],
	clips: { ...MOVESETS.knight.clips }
};
MOVESETS.rain = {
	id: "rain",
	show: [],
	clips: { ...MOVESETS.knight.clips }
};
MOVESETS.ash = {
	id: "ash",
	show: [...MOVESETS.runner.show],
	clips: { ...MOVESETS.runner.clips }
};
MOVESETS.pit = {
	id: "pit",
	show: [...MOVESETS.brute.show],
	clips: { ...MOVESETS.brute.clips }
};
var SOLDIER = {
	id: "soldier",
	show: [],
	clips: {
		idle: "Idle",
		walk: "Walk",
		run: "Run",
		back: "Walk",
		strafeL: "Walk",
		strafeR: "Walk",
		jump: "Jump",
		fall: "Jump",
		jab: "Punch",
		cross: "Punch",
		launch: "SwordSlash",
		sweep: "Punch",
		lunge: "SwordSlash",
		armedJab: "SwordSlash",
		armedCross: "Shoot_OneHanded",
		armedLaunch: "SwordSlash",
		armedSweep: "Punch",
		armedLunge: "SwordSlash",
		spin: "SwordSlash",
		hit: "RecieveHit",
		dodge: "Roll",
		down: "Defeat",
		death: "Death",
		pickup: "PickUp",
		throw: "Punch",
		grab: "PickUp",
		block: "Idle",
		cheer: "Victory"
	}
};
MOVESETS.soldier = SOLDIER;
MOVESETS.soldierf = {
	id: "soldierf",
	show: [],
	clips: { ...SOLDIER.clips }
};
MOVESETS.zombie = {
	id: "zombie",
	show: [],
	clips: { ...SOLDIER.clips }
};
MOVESETS.zombief = {
	id: "zombief",
	show: [],
	clips: { ...SOLDIER.clips }
};
MOVESETS.mannequin = {
	id: "mannequin",
	show: [],
	clips: {
		idle: "boxidle",
		walk: "ginga",
		run: "gingaside",
		back: "drunkidle",
		strafeL: "gingaside",
		strafeR: "gingaside",
		jump: "bigjump",
		fall: "crossjump",
		jab: "boxing",
		cross: "jabcross",
		launch: "knee",
		sweep: "bodyblow",
		lunge: "dropkick",
		armedJab: "elbow",
		armedCross: "jabcross",
		armedLaunch: "knee",
		armedSweep: "bodyblow",
		armedLunge: "dropkick",
		spin: "hurricane",
		hit: "hit",
		dodge: "esquiva",
		down: "fallflat",
		death: "fallflat",
		pickup: "boxing1",
		throw: "suplex",
		grab: "boxing",
		block: "defender",
		cheer: "capoeira"
	}
};
var CAST_STYLES = [
	{
		idle: "Idle_Loop",
		walk: "Walk_Loop",
		run: "Jog_Fwd_Loop",
		back: "Walk_Formal_Loop",
		strafeL: "Walk_Loop",
		strafeR: "Walk_Formal_Loop",
		jump: "Jump_Start",
		fall: "Jump_Loop",
		jab: "Punch_Jab",
		cross: "Punch_Cross",
		launch: "Sword_Attack",
		sweep: "bodyblow",
		lunge: "Punch_Cross",
		armedJab: "Sword_Attack",
		armedCross: "Sword_Attack_RM",
		armedLaunch: "Punch_Cross",
		armedSweep: "bodyblow",
		armedLunge: "Punch_Jab",
		spin: "Dance_Loop",
		hit: "Hit_Chest",
		dodge: "Roll",
		down: "fallflat",
		death: "Death01",
		pickup: "Jump_Land",
		throw: "suplex",
		grab: "Punch_Enter",
		block: "guardhigh",
		cheer: "Idle_Talking_Loop"
	},
	{
		idle: "Idle_Talking_Loop",
		walk: "Walk_Formal_Loop",
		run: "Sprint_Loop",
		back: "Walk_Loop",
		strafeL: "Walk_Formal_Loop",
		strafeR: "Walk_Loop",
		jump: "Jump_Start",
		fall: "Jump_Loop",
		jab: "Punch_Jab",
		cross: "Punch_Cross",
		launch: "Sword_Attack",
		sweep: "crouch",
		lunge: "Punch_Cross",
		armedJab: "Punch_Jab",
		armedCross: "Punch_Cross",
		armedLaunch: "Sword_Attack",
		armedSweep: "bodyblow",
		armedLunge: "Punch_Cross",
		spin: "capoeira",
		hit: "Hit_Head",
		dodge: "Roll",
		down: "fallflat",
		death: "Death01",
		pickup: "Sitting_Exit",
		throw: "german",
		grab: "Punch_Enter",
		block: "guardlow",
		cheer: "Idle_Loop"
	},
	{
		idle: "Sword_Idle",
		walk: "Walk_Loop",
		run: "Jog_Fwd_Loop",
		back: "Walk_Formal_Loop",
		strafeL: "Roll",
		strafeR: "Walk_Formal_Loop",
		jump: "Jump_Start",
		fall: "Jump_Loop",
		jab: "Sword_Attack",
		cross: "Punch_Cross",
		launch: "Sword_Attack_RM",
		sweep: "bodyblow",
		lunge: "Punch_Jab",
		armedJab: "Sword_Attack",
		armedCross: "Sword_Attack_RM",
		armedLaunch: "Punch_Cross",
		armedSweep: "crouch",
		armedLunge: "Sword_Attack",
		spin: "hurricane",
		hit: "Hit_Chest",
		dodge: "Roll",
		down: "fallflat",
		death: "Death01",
		pickup: "Jump_Land",
		throw: "chokeslam",
		grab: "defender",
		block: "guardhigh",
		cheer: "Sword_Idle"
	},
	{
		idle: "Idle_Loop",
		walk: "Jog_Fwd_Loop",
		run: "Sprint_Loop",
		back: "Walk_Formal_Loop",
		strafeL: "Walk_Loop",
		strafeR: "Walk_Loop",
		jump: "Jump_Start",
		fall: "Jump_Loop",
		jab: "Punch_Cross",
		cross: "Punch_Jab",
		launch: "Sword_Attack",
		sweep: "bodyblow",
		lunge: "Punch_Cross",
		armedJab: "Punch_Cross",
		armedCross: "Sword_Attack",
		armedLaunch: "Punch_Jab",
		armedSweep: "crouch",
		armedLunge: "Punch_Cross",
		spin: "Dance_Loop",
		hit: "hit",
		dodge: "evade",
		down: "fallflat",
		death: "Death01",
		pickup: "rise",
		throw: "ddt",
		grab: "Punch_Enter",
		block: "guardhigh",
		cheer: "Idle_Talking_Loop"
	},
	{
		idle: "Idle_Talking_Loop",
		walk: "Walk_Loop",
		run: "Jog_Fwd_Loop",
		back: "Walk_Formal_Loop",
		strafeL: "Walk_Formal_Loop",
		strafeR: "Walk_Loop",
		jump: "Jump_Start",
		fall: "Jump_Loop",
		jab: "Punch_Jab",
		cross: "Sword_Attack",
		launch: "Punch_Cross",
		sweep: "crouch",
		lunge: "Punch_Jab",
		armedJab: "Sword_Attack",
		armedCross: "Punch_Jab",
		armedLaunch: "Sword_Attack_RM",
		armedSweep: "bodyblow",
		armedLunge: "Punch_Cross",
		spin: "au",
		hit: "Hit_Head",
		dodge: "Roll",
		down: "fallflat",
		death: "Death01",
		pickup: "kip",
		throw: "brainbuster",
		grab: "defender",
		block: "guardlow",
		cheer: "Dance_Loop"
	},
	{
		idle: "Sword_Idle",
		walk: "Walk_Formal_Loop",
		run: "Sprint_Loop",
		back: "Walk_Loop",
		strafeL: "Walk_Loop",
		strafeR: "Walk_Formal_Loop",
		jump: "Jump_Start",
		fall: "Jump_Loop",
		jab: "Punch_Jab",
		cross: "Punch_Cross",
		launch: "Sword_Attack",
		sweep: "bodyblow",
		lunge: "Sword_Attack",
		armedJab: "Sword_Attack",
		armedCross: "Sword_Attack_RM",
		armedLaunch: "Punch_Cross",
		armedSweep: "crouch",
		armedLunge: "Sword_Attack",
		spin: "hurricane",
		hit: "Hit_Chest",
		dodge: "Roll",
		down: "fallflat",
		death: "Death01",
		pickup: "Jump_Land",
		throw: "backdrop",
		grab: "Punch_Enter",
		block: "block",
		cheer: "Sword_Idle"
	},
	{
		idle: "Idle_Loop",
		walk: "Walk_Formal_Loop",
		run: "Jog_Fwd_Loop",
		back: "Walk_Loop",
		strafeL: "Walk_Formal_Loop",
		strafeR: "Walk_Formal_Loop",
		jump: "Jump_Start",
		fall: "Jump_Loop",
		jab: "Punch_Cross",
		cross: "Punch_Jab",
		launch: "Punch_Cross",
		sweep: "bodyblow",
		lunge: "Punch_Jab",
		armedJab: "Punch_Jab",
		armedCross: "Punch_Cross",
		armedLaunch: "Sword_Attack",
		armedSweep: "crouch",
		armedLunge: "Punch_Cross",
		spin: "capoeira",
		hit: "hitbody",
		dodge: "esquiva",
		down: "fallflat",
		death: "Death01",
		pickup: "rise",
		throw: "takedown",
		grab: "defender",
		block: "guardhigh",
		cheer: "Idle_Loop"
	},
	{
		idle: "Idle_Talking_Loop",
		walk: "Walk_Loop",
		run: "Sprint_Loop",
		back: "Walk_Formal_Loop",
		strafeL: "Walk_Loop",
		strafeR: "Walk_Loop",
		jump: "Jump_Start",
		fall: "Jump_Loop",
		jab: "Punch_Jab",
		cross: "Punch_Cross",
		launch: "Sword_Attack_RM",
		sweep: "crouch",
		lunge: "Punch_Cross",
		armedJab: "Sword_Attack",
		armedCross: "Punch_Cross",
		armedLaunch: "Sword_Attack",
		armedSweep: "bodyblow",
		armedLunge: "Punch_Jab",
		spin: "Dance_Loop",
		hit: "Hit_Head",
		dodge: "Roll",
		down: "fallflat",
		death: "Death01",
		pickup: "Sitting_Exit",
		throw: "suplex",
		grab: "Punch_Enter",
		block: "guardlow",
		cheer: "Idle_Talking_Loop"
	}
];
function castMoveset(file) {
	const id = `cast:${file}`;
	if (MOVESETS[id]) return id;
	let n = 0;
	for (let i = 0; i < file.length; i++) n = n * 33 + file.charCodeAt(i) >>> 0;
	const clips = { ...CAST_STYLES[n % CAST_STYLES.length] };
	const throws = [
		"suplex",
		"german",
		"chokeslam",
		"ddt",
		"brainbuster",
		"backdrop",
		"takedown"
	];
	clips.throw = throws[n % throws.length];
	MOVESETS[id] = {
		id,
		show: [],
		clips
	};
	return id;
}
function adoptRig(scene, animations, movesetId) {
	const moveset = MOVESETS[movesetId] ?? MOVESETS.knight;
	const family = rigFamily(scene);
	if (family === "other") console.warn(`rig ${movesetId} is not a KayKit or Rigify skeleton`);
	if (family === "kaykit" || family === "other" || family === "rigify" || family === "quat" || family === "mixamo") {
		const show = new Set(moveset.show);
		scene.traverse((obj) => {
			if (PROP_MESH.test(obj.name) && !show.has(obj.name)) obj.visible = false;
		});
	}
	for (const clip of animations) clip.tracks = clip.tracks.filter((track) => {
		const bone = track.name.split(".")[0];
		return bone !== "root" && bone !== "Bone" && bone !== "Armature";
	});
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
	if (names.has("Hips") && names.has("LeftArm")) return "mixamo";
	if (names.has("UpperArmL") && names.has("FistL")) return "quat";
	if (names.has("mixamorig:Hips") || names.has("mixamorigHips")) return "mixamo";
	if (names.has("pelvis") && names.has("spine_01")) return "ue";
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
		if (body.swing === 12) return {
			slot: armed ? "armedCross" : "cross",
			loop: false
		};
		if (body.swing === 11) return {
			slot: armed ? "armedJab" : "jab",
			loop: false
		};
		if (body.swing >= 9) return {
			slot: armed ? "armedLunge" : "lunge",
			loop: false
		};
		if (body.swing >= 8) return {
			slot: armed ? "armedLaunch" : "launch",
			loop: false
		};
		if (body.swing >= 7) return {
			slot: armed ? "armedSweep" : "sweep",
			loop: false
		};
		if (body.swing >= 6) return {
			slot: armed ? "armedLunge" : "lunge",
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
function mat(color, map) {
	return new MeshLambertMaterial({
		color,
		map
	});
}
function put(g, x, y, z, yaw = 0) {
	g.position.set(x, y, z);
	g.rotation.y = yaw;
	return g;
}
function forgeDumpster(rust) {
	const g = new Group();
	const body = new Mesh(new BoxGeometry(1.6, 1.05, .9), mat(4025157, rust));
	body.position.y = .62;
	const lid = new Mesh(new BoxGeometry(1.64, .08, .92), mat(2902578, rust));
	lid.position.y = 1.18;
	lid.rotation.x = -.4;
	g.add(body, lid);
	return g;
}
function forgeCrate(wood) {
	const g = new Group();
	const box = new Mesh(new BoxGeometry(.7, .7, .7), mat(12887412, wood));
	box.position.y = .35;
	const slat = new Mesh(new BoxGeometry(.74, .06, .08), mat(9070660, null));
	slat.position.set(0, .55, .32);
	g.add(box, slat);
	return g;
}
function forgeBollard(wood) {
	const g = new Group();
	const post = new Mesh(new CylinderGeometry(.12, .14, .9, 8), mat(9074016, wood));
	post.position.y = .45;
	const cap = new Mesh(new SphereGeometry(.16, 8, 6), mat(7233100, null));
	cap.position.y = .92;
	g.add(post, cap);
	return g;
}
function forgeSign(face) {
	const g = new Group();
	const pole = new Mesh(new CylinderGeometry(.05, .06, 2.2, 6), mat(1843238, null));
	pole.position.y = 1.1;
	const board = new Mesh(new BoxGeometry(1.1, .7, .06), mat(16777215, face));
	board.position.y = 1.9;
	g.add(pole, board);
	return g;
}
function forgeLamp(metal) {
	const g = new Group();
	const pole = new Mesh(new CylinderGeometry(.06, .09, 3.2, 6), mat(2764856, metal));
	pole.position.y = 1.6;
	const arm = new Mesh(new BoxGeometry(.7, .06, .06), mat(2764856, metal));
	arm.position.set(.3, 3.15, 0);
	const head = new Mesh(new BoxGeometry(.42, .16, .28), mat(16769696, null));
	head.position.set(.62, 3.02, 0);
	g.add(pole, arm, head);
	return g;
}
function forgeBench(wood) {
	const g = new Group();
	const seat = new Mesh(new BoxGeometry(1.4, .08, .42), mat(11569512, wood));
	seat.position.y = .48;
	const back = new Mesh(new BoxGeometry(1.4, .4, .06), mat(11569512, wood));
	back.position.set(0, .74, -.18);
	for (const x of [-.55, .55]) {
		const leg = new Mesh(new BoxGeometry(.08, .48, .36), mat(3817544, null));
		leg.position.set(x, .24, 0);
		g.add(leg);
	}
	g.add(seat, back);
	return g;
}
function forgeHydrant() {
	const g = new Group();
	const body = new Mesh(new CylinderGeometry(.14, .16, .55, 8), mat(12729134, null));
	body.position.y = .36;
	const cap = new Mesh(new CylinderGeometry(.1, .12, .16, 8), mat(14603980, null));
	cap.position.y = .7;
	const side = new Mesh(new CylinderGeometry(.05, .05, .22, 6), mat(10104872, null));
	side.rotation.z = Math.PI / 2;
	side.position.set(.16, .4, 0);
	g.add(body, cap, side);
	return g;
}
function forgeFence(metal) {
	const g = new Group();
	const rail = new Mesh(new BoxGeometry(2.2, .06, .06), mat(9279393, metal));
	rail.position.y = .9;
	const rail2 = rail.clone();
	rail2.position.y = .45;
	for (let i = 0; i < 5; i++) {
		const bar = new Mesh(new BoxGeometry(.04, 1.05, .04), mat(9279393, metal));
		bar.position.set(-.9 + i * .45, .52, 0);
		g.add(bar);
	}
	g.add(rail, rail2);
	return g;
}
function forgePallet(wood) {
	const g = new Group();
	for (let i = 0; i < 4; i++) {
		const board = new Mesh(new BoxGeometry(1.1, .04, .16), mat(12887412, wood));
		board.position.set(0, .16, -.28 + i * .18);
		g.add(board);
	}
	for (const x of [-.4, .4]) {
		const skid = new Mesh(new BoxGeometry(.1, .12, .9), mat(9070660, null));
		skid.position.set(x, .06, 0);
		g.add(skid);
	}
	return g;
}
function forgeVent(metal) {
	const g = new Group();
	const box = new Mesh(new BoxGeometry(.9, .55, .7), mat(12042440, metal));
	box.position.y = .28;
	const fan = new Mesh(new CylinderGeometry(.18, .18, .08, 8), mat(2764856, null));
	fan.position.set(0, .6, 0);
	g.add(box, fan);
	return g;
}
function forgeLadder(metal) {
	const g = new Group();
	for (const x of [-.22, .22]) {
		const rail = new Mesh(new BoxGeometry(.05, 2.4, .05), mat(10134445, metal));
		rail.position.set(x, 1.2, 0);
		g.add(rail);
	}
	for (let i = 0; i < 6; i++) {
		const rung = new Mesh(new BoxGeometry(.44, .04, .04), mat(10134445, metal));
		rung.position.set(0, .3 + i * .36, 0);
		g.add(rung);
	}
	return g;
}
function forgeBin(face) {
	const g = new Group();
	const body = new Mesh(new CylinderGeometry(.28, .24, .8, 8), mat(3104646, face));
	body.position.y = .4;
	const lid = new Mesh(new CylinderGeometry(.3, .3, .08, 8), mat(1916248, null));
	lid.position.y = .84;
	g.add(body, lid);
	return g;
}
function forgeAwning(cloth) {
	const g = new Group();
	const top = new Mesh(new BoxGeometry(2.2, .06, 1.1), mat(9318191, cloth));
	top.position.set(0, 2.2, .4);
	top.rotation.x = .25;
	for (const x of [-1, 1]) {
		const arm = new Mesh(new BoxGeometry(.05, .5, .05), mat(2764856, null));
		arm.position.set(x, 1.95, .15);
		g.add(arm);
	}
	g.add(top);
	return g;
}
function forgeStreet(skins) {
	return [
		put(forgeDumpster(skins.asphalt), -38, 0, 4),
		put(forgeLamp(skins.asphalt), -40, 0, -6),
		put(forgeBench(skins.dock), -34, 0, 8, .4),
		put(forgeFence(skins.asphalt), -42, 0, 10, 1.2),
		put(forgeBollard(skins.dock), 4, 0, 36),
		put(forgeBollard(skins.dock), -4, 0, 36),
		put(forgePallet(skins.dock), 8, 0, 38),
		put(forgeCrate(skins.dock), 8.2, .16, 38.1),
		put(forgeSign(skins.brick), -2, 0, -38),
		put(forgeHydrant(), 6, 0, -34),
		put(forgeVent(skins.asphalt), -8, 0, -40),
		put(forgeLadder(skins.asphalt), 10, 0, -36, .2),
		put(forgeBin(skins.pit), 34, 0, -18),
		put(forgeAwning(skins.brick), 30, 0, -22, Math.PI),
		put(forgeCrate(skins.dock), 36, 0, -16)
	];
}
function forgeCar() {
	const g = new Group();
	const paint = mat(8004659, null);
	const dark = mat(1711136, null);
	const glass = mat(10473696, null);
	glass.transparent = true;
	glass.opacity = .45;
	const chrome = mat(12963028, null);
	const shell = new Mesh(new BoxGeometry(4.2, .48, 1.72), paint);
	shell.name = "shell";
	shell.position.y = .48;
	const cabin = new Mesh(new BoxGeometry(1.9, .62, 1.52), paint);
	cabin.name = "cabin";
	cabin.position.set(-.15, .95, 0);
	const hood = new Mesh(new BoxGeometry(1.25, .1, 1.62), paint);
	hood.name = "hood";
	hood.position.set(1.35, .74, 0);
	const trunk = new Mesh(new BoxGeometry(.9, .14, 1.55), paint);
	trunk.name = "trunk";
	trunk.position.set(-1.55, .72, 0);
	const win = new Mesh(new BoxGeometry(1.7, .4, 1.38), glass);
	win.name = "glass";
	win.position.set(-.15, 1.05, 0);
	const bumper = new Mesh(new BoxGeometry(.12, .18, 1.55), chrome);
	bumper.position.set(2.12, .42, 0);
	g.add(shell, cabin, hood, trunk, win, bumper);
	for (const [x, z] of [
		[1.35, .78],
		[1.35, -.78],
		[-1.35, .78],
		[-1.35, -.78]
	]) {
		const wheel = new Mesh(new CylinderGeometry(.28, .28, .18, 8), dark);
		wheel.rotation.x = Math.PI / 2;
		wheel.position.set(x, .28, z);
		g.add(wheel);
	}
	return g;
}
function poseCar(g, crush) {
	const c = Math.min(1, Math.max(0, crush));
	const shell = g.getObjectByName("shell");
	const cabin = g.getObjectByName("cabin");
	const hood = g.getObjectByName("hood");
	const trunk = g.getObjectByName("trunk");
	const win = g.getObjectByName("glass");
	if (shell) {
		shell.scale.y = 1 - c * .22;
		shell.position.y = .48 - c * .16;
	}
	if (cabin) {
		cabin.scale.y = Math.max(.08, 1 - c * .9);
		cabin.position.y = .95 - c * .5;
	}
	if (hood) {
		hood.rotation.z = -c * .7;
		hood.position.y = .74 - c * .28;
	}
	if (trunk) {
		trunk.rotation.z = c * .45;
		trunk.position.y = .72 - c * .22;
	}
	if (win) {
		win.scale.y = Math.max(.02, 1 - c * 1.4);
		win.position.y = 1.05 - c * .55;
		win.material.opacity = Math.max(0, .45 - c);
	}
}
/**
* Universal skeleton retargeter for AshLane.
*
* Goal: drop ANY animation in, it plays on ANY model. No manual per-clip work.
*
* How it works:
*  1. Every supported skeleton family maps to CANONICAL slots (Mixamo stripped
*     names, e.g. "Hips", "LeftArm"). N families need 2N maps, not N^2.
*  2. Source family is auto-detected from bone names (+ joint count as a hint).
*  3. Target family is auto-detected from the live THREE.Object3D.
*  4. Rotation transfer is rest-pose-relative:
*        out = targetRest * inv(sourceRest) * key
*     so clips authored on one rest pose land correctly on another.
*  5. BVH text can be parsed straight to a THREE.AnimationClip, then retargeted.
*
* Families: mixamo-colon (AshLane cast, 58j), mixamo-packed, mixamo-stripped,
*           quaternius (65j UE-style), rigify, kaykit, bannon-pos (positional).
*/
/** Canonical slots — Mixamo stripped names. */
var CANONICAL_SLOTS = [
	"Hips",
	"Spine",
	"Spine1",
	"Spine2",
	"Neck",
	"Head",
	"HeadTop_End",
	"LeftShoulder",
	"LeftArm",
	"LeftForeArm",
	"LeftHand",
	"LeftHandThumb1",
	"LeftHandThumb2",
	"LeftHandThumb3",
	"LeftHandIndex1",
	"LeftHandIndex2",
	"LeftHandIndex3",
	"LeftHandMiddle1",
	"LeftHandMiddle2",
	"LeftHandMiddle3",
	"LeftHandRing1",
	"LeftHandRing2",
	"LeftHandRing3",
	"LeftHandPinky1",
	"LeftHandPinky2",
	"LeftHandPinky3",
	"RightShoulder",
	"RightArm",
	"RightForeArm",
	"RightHand",
	"RightHandThumb1",
	"RightHandThumb2",
	"RightHandThumb3",
	"RightHandIndex1",
	"RightHandIndex2",
	"RightHandIndex3",
	"RightHandMiddle1",
	"RightHandMiddle2",
	"RightHandMiddle3",
	"RightHandRing1",
	"RightHandRing2",
	"RightHandRing3",
	"RightHandPinky1",
	"RightHandPinky2",
	"RightHandPinky3",
	"LeftUpLeg",
	"LeftLeg",
	"LeftFoot",
	"LeftToeBase",
	"LeftToe_End",
	"RightUpLeg",
	"RightLeg",
	"RightFoot",
	"RightToeBase",
	"RightToe_End"
];
/**
* Family bone name -> canonical slot. Families handled by prefix-strip rules
* (mixamo-colon / mixamo-packed / mixamo-stripped) need no table.
*/
var FAMILY_TO_CANONICAL = {
	quaternius: {
		pelvis: "Hips",
		spine_01: "Spine",
		spine_02: "Spine1",
		spine_03: "Spine2",
		neck_01: "Neck",
		Head: "Head",
		clavicle_l: "LeftShoulder",
		clavicle_r: "RightShoulder",
		upperarm_l: "LeftArm",
		upperarm_r: "RightArm",
		lowerarm_l: "LeftForeArm",
		lowerarm_r: "RightForeArm",
		hand_l: "LeftHand",
		hand_r: "RightHand",
		thumb_01_l: "LeftHandThumb1",
		thumb_02_l: "LeftHandThumb2",
		thumb_03_l: "LeftHandThumb3",
		thumb_01_r: "RightHandThumb1",
		thumb_02_r: "RightHandThumb2",
		thumb_03_r: "RightHandThumb3",
		index_01_l: "LeftHandIndex1",
		index_02_l: "LeftHandIndex2",
		index_03_l: "LeftHandIndex3",
		index_01_r: "RightHandIndex1",
		index_02_r: "RightHandIndex2",
		index_03_r: "RightHandIndex3",
		middle_01_l: "LeftHandMiddle1",
		middle_02_l: "LeftHandMiddle2",
		middle_03_l: "LeftHandMiddle3",
		middle_01_r: "RightHandMiddle1",
		middle_02_r: "RightHandMiddle2",
		middle_03_r: "RightHandMiddle3",
		ring_01_l: "LeftHandRing1",
		ring_02_l: "LeftHandRing2",
		ring_03_l: "LeftHandRing3",
		ring_01_r: "RightHandRing1",
		ring_02_r: "RightHandRing2",
		ring_03_r: "RightHandRing3",
		pinky_01_l: "LeftHandPinky1",
		pinky_02_l: "LeftHandPinky2",
		pinky_03_l: "LeftHandPinky3",
		pinky_01_r: "RightHandPinky1",
		pinky_02_r: "RightHandPinky2",
		pinky_03_r: "RightHandPinky3",
		thigh_l: "LeftUpLeg",
		thigh_r: "RightUpLeg",
		calf_l: "LeftLeg",
		calf_r: "RightLeg",
		foot_l: "LeftFoot",
		foot_r: "RightFoot",
		ball_l: "LeftToeBase",
		ball_r: "RightToeBase"
	},
	rigify: {
		"DEF-hips": "Hips",
		"DEF-spine": "Spine",
		"DEF-spine001": "Spine1",
		"DEF-spine002": "Spine2",
		"DEF-spine003": "Spine2",
		"DEF-neck": "Neck",
		"DEF-head": "Head",
		"DEF-shoulderL": "LeftShoulder",
		"DEF-shoulderR": "RightShoulder",
		"DEF-upper_armL": "LeftArm",
		"DEF-upper_armR": "RightArm",
		"DEF-forearmL": "LeftForeArm",
		"DEF-forearmR": "RightForeArm",
		"DEF-handL": "LeftHand",
		"DEF-handR": "RightHand",
		"DEF-thighL": "LeftUpLeg",
		"DEF-thighR": "RightUpLeg",
		"DEF-shinL": "LeftLeg",
		"DEF-shinR": "RightLeg",
		"DEF-footL": "LeftFoot",
		"DEF-footR": "RightFoot",
		"DEF-toeL": "LeftToeBase",
		"DEF-toeR": "RightToeBase"
	},
	kaykit: {
		hips: "Hips",
		spine: "Spine",
		chest: "Spine2",
		head: "Head",
		"upperarm.l": "LeftArm",
		"upperarm.r": "RightArm",
		"lowerarm.l": "LeftForeArm",
		"lowerarm.r": "RightForeArm",
		"hand.l": "LeftHand",
		"hand.r": "RightHand",
		"upperleg.l": "LeftUpLeg",
		"upperleg.r": "RightUpLeg",
		"lowerleg.l": "LeftLeg",
		"lowerleg.r": "RightLeg",
		"foot.l": "LeftFoot",
		"foot.r": "RightFoot"
	},
	"bannon-pos": {
		pelvis: "Hips",
		spineLow: "Spine",
		spineMid: "Spine1",
		chest: "Spine2",
		neck: "Neck",
		head: "Head",
		clavL: "LeftShoulder",
		clavR: "RightShoulder",
		shL: "LeftArm",
		shR: "RightArm",
		elL: "LeftForeArm",
		elR: "RightForeArm",
		haL: "LeftHand",
		haR: "RightHand",
		hipL: "LeftUpLeg",
		hipR: "RightUpLeg",
		knL: "LeftLeg",
		knR: "RightLeg",
		ftL: "LeftFoot",
		ftR: "RightFoot"
	}
};
/** Canonical slot -> family bone name, built lazily per family. */
var canonicalToFamilyCache = /* @__PURE__ */ new Map();
function reverseMap(family) {
	let m = canonicalToFamilyCache.get(family);
	if (m) return m;
	m = /* @__PURE__ */ new Map();
	const fwd = FAMILY_TO_CANONICAL[family];
	if (fwd) {
		for (const [bone, slot] of Object.entries(fwd)) if (!m.has(slot)) m.set(slot, bone);
	}
	canonicalToFamilyCache.set(family, m);
	return m;
}
/** Auto-detect the skeleton family from a set of bone names. */
function detectFamily(boneNames) {
	const names = new Set(boneNames);
	const has = (...ns) => ns.some((n) => names.has(n));
	if (has("mixamorig:Hips")) return "mixamo-colon";
	if (has("mixamorigHips")) return "mixamo-packed";
	if (has("shL", "haL", "elL") && has("pelvis")) return "bannon-pos";
	if (has("DEF-hips")) return "rigify";
	if (has("hips") && has("upperarm.l")) return "kaykit";
	if (has("pelvis", "spine_01") && has("upperarm_l", "thigh_l")) return "quaternius";
	if (has("Hips") && has("LeftArm", "RightUpLeg")) return "mixamo-stripped";
	if (has("Hips") && has("Spine", "Spine1")) return "mixamo-stripped";
	return "unknown";
}
/** Map one bone name to its canonical slot (or undefined if unmapped). */
function toCanonical(boneName, family) {
	switch (family) {
		case "mixamo-colon": return boneName.startsWith("mixamorig:") ? boneName.slice(10) : void 0;
		case "mixamo-packed": return boneName.startsWith("mixamorig") ? boneName.slice(9) : void 0;
		case "mixamo-stripped": return CANONICAL_SLOTS.includes(boneName) ? boneName : void 0;
		default: return FAMILY_TO_CANONICAL[family]?.[boneName];
	}
}
/** Map a canonical slot to the target family's bone name (or undefined). */
function fromCanonical(slot, family) {
	switch (family) {
		case "mixamo-colon": return `mixamorig:${slot}`;
		case "mixamo-packed": return `mixamorig${slot}`;
		case "mixamo-stripped": return slot;
		default: return reverseMap(family).get(slot);
	}
}
/** Collect rest-pose quaternions + bone names from any Object3D hierarchy. */
function collectRest(root) {
	const quats = /* @__PURE__ */ new Map();
	const names = [];
	root.traverse((obj) => {
		if (obj.name) {
			names.push(obj.name);
			quats.set(obj.name, obj.quaternion.clone());
		}
	});
	return {
		quats,
		names,
		family: detectFamily(names)
	};
}
/**
* Retarget any THREE.AnimationClip onto any THREE.Object3D skeleton.
* Returns null when nothing could be mapped.
*/
function retargetClip(clip, sourceRest, sourceBoneNames, target, opts = {}) {
	const sourceFamily = detectFamily(sourceBoneNames);
	if (sourceFamily === "unknown") return null;
	const { quats: targetRest, names: targetNames } = collectRest(target);
	const targetSet = new Set(targetNames);
	const targetFamily = detectFamily(targetNames);
	if (targetFamily === "unknown") return null;
	const posScale = opts.positionScale ?? 1;
	const outTracks = [];
	const tmpQ = new Quaternion();
	const tmpRel = new Quaternion();
	const tmpOut = new Quaternion();
	const sameFamily = sourceFamily === targetFamily;
	for (const track of clip.tracks) {
		const dot = track.name.lastIndexOf(".");
		if (dot < 0) continue;
		const boneName = track.name.slice(0, dot);
		const prop = track.name.slice(dot + 1);
		let destBone;
		let slot;
		if (sameFamily && targetSet.has(boneName)) {
			destBone = boneName;
			slot = toCanonical(boneName, sourceFamily);
		} else {
			slot = toCanonical(boneName, sourceFamily);
			if (!slot) continue;
			destBone = fromCanonical(slot, targetFamily);
			if (!destBone || !targetSet.has(destBone)) continue;
		}
		if (prop === "quaternion" && track instanceof QuaternionKeyframeTrack) {
			const qS = sourceRest.get(boneName);
			const qT = targetRest.get(destBone);
			if (!qS || !qT) continue;
			const inv = qS.clone().invert();
			const count = track.times.length;
			const next = new Float32Array(count * 4);
			for (let i = 0; i < count; i++) {
				tmpQ.fromArray(track.values, i * 4);
				tmpRel.copy(inv).multiply(tmpQ);
				tmpOut.copy(qT).multiply(tmpRel);
				tmpOut.toArray(next, i * 4);
			}
			outTracks.push(new QuaternionKeyframeTrack(`${destBone}.quaternion`, Array.from(track.times), Array.from(next)));
		} else if (prop === "position" && track instanceof VectorKeyframeTrack) {
			if (slot !== "Hips") continue;
			const count = track.times.length;
			const next = new Float32Array(count * 3);
			for (let i = 0; i < count; i++) {
				next[i * 3] = track.values[i * 3] * posScale;
				next[i * 3 + 1] = track.values[i * 3 + 1] * posScale;
				next[i * 3 + 2] = track.values[i * 3 + 2] * posScale;
			}
			outTracks.push(new VectorKeyframeTrack(`${destBone}.position`, Array.from(track.times), Array.from(next)));
		}
	}
	if (outTracks.length === 0) return null;
	return new AnimationClip(opts.keepName === false ? `${clip.name}@retarget` : clip.name, clip.duration, outTracks);
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
var critters = [];
var swordTpl = null;
var spearTpl = null;
function createView(canvas) {
	const phone = window.matchMedia("(pointer: coarse)").matches;
	const renderer = new WebGLRenderer({
		canvas,
		antialias: !phone,
		alpha: false,
		powerPreference: "high-performance"
	});
	renderer.outputColorSpace = SRGBColorSpace;
	renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, phone ? 1 : 1.5));
	const scene = new Scene();
	scene.background = new Color(1185308);
	scene.fog = new Fog(1185308, 18, 78);
	const camera = new PerspectiveCamera(58, 1, .1, 240);
	camera.position.set(8, 14, 16);
	camera.lookAt(0, 1, 0);
	const skyMat = new ShaderMaterial({
		side: 1,
		depthWrite: false,
		fog: false,
		uniforms: { uDay: { value: .65 } },
		vertexShader: "varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
		fragmentShader: "uniform float uDay; varying vec3 vP; void main(){ vec3 d = normalize(vP); float h = d.y; vec3 night = vec3(0.02, 0.025, 0.07); vec3 noon = mix(vec3(0.55, 0.72, 0.9), vec3(0.78, 0.88, 0.98), smoothstep(0.0, 0.55, h)); vec3 dusk = vec3(0.86, 0.42, 0.22); float day = smoothstep(0.08, 0.62, uDay); vec3 col = mix(night, noon, day); float belt = (1.0 - smoothstep(0.18, 0.48, uDay)) * smoothstep(0.02, 0.22, uDay); col = mix(col, dusk, belt * smoothstep(-0.15, 0.25, h)); gl_FragColor = vec4(col, 1.0); }"
	});
	const sky = new Mesh(new SphereGeometry(120, 20, 14), skyMat);
	sky.frustumCulled = false;
	scene.add(sky);
	const starGeo = new BufferGeometry();
	const starPos = /* @__PURE__ */ new Float32Array(540);
	for (let i = 0; i < 180; i++) {
		const th = Math.random() * Math.PI * 2;
		const ph = Math.random() * .9 + .15;
		const r = 90;
		starPos[i * 3] = Math.cos(th) * Math.sin(ph) * r;
		starPos[i * 3 + 1] = Math.cos(ph) * r;
		starPos[i * 3 + 2] = Math.sin(th) * Math.sin(ph) * r;
	}
	starGeo.setAttribute("position", new BufferAttribute(starPos, 3));
	const stars = new Points(starGeo, new PointsMaterial({
		color: 16249309,
		size: .55,
		sizeAttenuation: false,
		transparent: true,
		opacity: 0
	}));
	scene.add(stars);
	const clouds = [];
	for (let i = 0; i < 5; i++) {
		const cloud = new Mesh(new PlaneGeometry(28 + i * 6, 8), new MeshBasicMaterial({
			color: 16777215,
			transparent: true,
			opacity: .28,
			depthWrite: false,
			fog: false
		}));
		cloud.rotation.x = Math.PI / 2;
		cloud.position.set((i - 2) * 18, 46, i % 2 === 0 ? -10 : 14);
		scene.add(cloud);
		clouds.push(cloud);
	}
	const sunOrb = new Mesh(new SphereGeometry(2.2, 12, 10), new MeshBasicMaterial({
		color: 16773572,
		fog: false
	}));
	scene.add(sunOrb);
	const door = new Mesh(new BoxGeometry(2.2, 2.35, .16), new MeshLambertMaterial({ color: 7027240 }));
	door.position.set(-12.4, 1.18, -5.5);
	scene.add(door);
	const lamps = [];
	const hemi = new HemisphereLight(14017780, 2761768, 1.45);
	scene.add(hemi);
	const sun = new DirectionalLight(16774372, 1.55);
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
	const ground = new Mesh(new PlaneGeometry(180, 180), groundMat);
	ground.rotation.x = -Math.PI / 2;
	scene.add(ground);
	const texLoader = new TextureLoader();
	const loadSkin = (file, rx, ry) => {
		const tex = texLoader.load(`/textures/${file}`);
		tex.colorSpace = SRGBColorSpace;
		tex.wrapS = RepeatWrapping;
		tex.wrapT = RepeatWrapping;
		tex.repeat.set(rx, ry);
		return tex;
	};
	const asphalt = loadSkin("asphalt.jpg", 16, 16);
	const brick = loadSkin("brick.jpg", 2, 2);
	const dockSkin = loadSkin("dock.jpg", 5, 5);
	const pitSkin = loadSkin("pit.jpg", 5, 5);
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
	const slab = (x, z, w, d, color, y = .018) => {
		const mesh = new Mesh(new PlaneGeometry(w, d), new MeshPhongMaterial({
			color,
			shininess: 10,
			specular: 2240568
		}));
		mesh.rotation.x = -Math.PI / 2;
		mesh.position.set(x, y, z);
		scene.add(mesh);
	};
	slab(-37, 0, 22, 26, 3818546);
	slab(-1, 35, 14, 22, 2372672);
	slab(16, 36, 16, 20, 1057840, -.06);
	slab(1, -36, 14, 22, 1316378);
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
	pit.visible = false;
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
	let skel = null;
	let bones = null;
	let mannequin = null;
	let skull = null;
	let minion = null;
	let soldier = null;
	let soldierf = null;
	let zombie = null;
	let zombief = null;
	let rigKey = "";
	const loader = new GLTFLoader();
	loader.setMeshoptDecoder(MeshoptDecoder);
	Promise.all([
		"/motion/ual/AnimationLibrary_Godot_Standard.gltf",
		"/motion/ual/UAL1_Standard.glb",
		"/motion/ual/UAL2_Standard.glb"
	].map((url) => loader.loadAsync(url).catch(() => null))).then((gltfs) => {
		const valid = gltfs.filter((g) => g !== null);
		if (valid.length === 0) return;
		const allClips = valid.flatMap((g) => g.animations);
		setUal(valid[0].scene, allClips);
		rigKey = "";
	});
	const castRigs = /* @__PURE__ */ new Map();
	const castLoading = /* @__PURE__ */ new Set();
	function ensureCast(file) {
		if (!file || castRigs.has(file) || castLoading.has(file)) return;
		castLoading.add(file);
		loader.loadAsync(`/models/cast/${file}`).then((gltf) => {
			castRigs.set(file, adoptRig(gltf.scene, gltf.animations, castMoveset(file)));
			castLoading.delete(file);
			rigKey = "";
		}).catch(() => {
			castLoading.delete(file);
		});
	}
	const loadRig = (url, slot, moveset) => loader.loadAsync(url).then((gltf) => {
		const rig = adoptRig(gltf.scene, gltf.animations, moveset);
		if (slot === "knight") knight = rig;
		else if (slot === "rogue") rogue = rig;
		else if (slot === "brute") brute = rig;
		else if (slot === "hood") hood = rig;
		else if (slot === "drifter") drifter = rig;
		else if (slot === "skel") skel = rig;
		else if (slot === "bones") bones = rig;
		else if (slot === "mannequin") mannequin = rig;
		else if (slot === "skull") skull = rig;
		else if (slot === "minion") minion = rig;
		else if (slot === "soldier") soldier = rig;
		else if (slot === "soldierf") soldierf = rig;
		else if (slot === "zombie") zombie = rig;
		else if (slot === "zombief") zombief = rig;
		else hex = rig;
		rigKey = "";
	});
	Promise.all([
		loadRig("/models/humanoid/Soldier_Male.glb", "soldier", "soldier"),
		loadRig("/models/humanoid/Soldier_Female.glb", "soldierf", "soldierf"),
		loadRig("/models/humanoid/Zombie_Male.glb", "zombie", "zombie"),
		loadRig("/models/humanoid/Zombie_Female.glb", "zombief", "zombief"),
		loadRig("/models/humanoid/mannequin.glb", "mannequin", "mannequin")
	]).then(() => {
		loadRig("/models/kaykit/Knight.glb", "knight", "knight");
		loadRig("/models/kaykit/Rogue.glb", "rogue", "runner");
		loadRig("/models/kaykit/Barbarian.glb", "brute", "brute");
		loadRig("/models/kaykit/Rogue_Hooded.glb", "hood", "hood");
		loadRig("/models/kaykit/Mage.glb", "hex", "hex");
		loadRig("/models/humanoid/drifter.glb", "drifter", "drifter");
		loadRig("/models/kaykit/Skeleton_Warrior.glb", "skel", "skeleton");
		loadRig("/models/kaykit/Skeleton_Rogue.glb", "bones", "bones");
		loadRig("/models/kaykit/Skeleton_Mage.glb", "skull", "skull");
		loadRig("/models/kaykit/Skeleton_Minion.glb", "minion", "minion");
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
	const birdGeo = new BufferGeometry();
	birdGeo.setAttribute("position", new BufferAttribute(new Float32Array([
		-.5,
		0,
		0,
		0,
		.12,
		.18,
		0,
		0,
		-.18,
		.5,
		0,
		0,
		0,
		0,
		-.18,
		0,
		.12,
		.18
	]), 3));
	const birdMat = new MeshBasicMaterial({
		color: 1843494,
		side: 2
	});
	const birdMeshes = [];
	for (let i = 0; i < 9; i++) {
		const m = new Mesh(birdGeo, birdMat);
		m.frustumCulled = false;
		scene.add(m);
		birdMeshes.push(m);
	}
	const pedGeo = new CapsuleGeometry(.28, .9, 3, 8);
	const pedMats = [
		9075306,
		6056819,
		7227962,
		3819100,
		7829384
	].map((c) => new MeshLambertMaterial({ color: c }));
	const pedMeshes = [];
	for (let i = 0; i < 40; i++) {
		const m = new Mesh(pedGeo, pedMats[i % pedMats.length]);
		m.visible = false;
		m.frustumCulled = false;
		scene.add(m);
		pedMeshes.push(m);
	}
	let idle = .4;
	let built = false;
	const curb = new Mesh(new TorusGeometry(1, .045, 5, 48), new MeshBasicMaterial({ color: 1316892 }));
	curb.rotation.x = Math.PI / 2;
	curb.position.y = .04;
	curb.visible = false;
	scene.add(curb);
	let stageId = "";
	function applyStage(id) {
		if (id === stageId) return;
		stageId = id;
		const look = id === "dock" ? {
			fog: 1454148,
			sky: 12047594,
			near: 16,
			far: 70
		} : id === "pit" ? {
			fog: 6961704,
			sky: 15909018,
			near: 14,
			far: 62
		} : id === "high" ? {
			fog: 9348286,
			sky: 16251903,
			near: 24,
			far: 96
		} : id === "yard" ? {
			fog: 4018736,
			sky: 14151600,
			near: 18,
			far: 80
		} : id === "under" ? {
			fog: 1714224,
			sky: 8361636,
			near: 12,
			far: 52
		} : {
			fog: 2371652,
			sky: 14149368,
			near: 22,
			far: 90
		};
		scene.background = new Color(look.fog);
		scene.fog = new Fog(look.fog, look.near, look.far);
		hemi.color.setHex(look.sky);
		hemi.intensity = 1.45;
		sun.intensity = id === "under" ? 1.15 : 1.55;
		groundMat.map = id === "dock" ? dockSkin : id === "pit" ? pitSkin : asphalt;
		groundMat.color.setHex(16777215);
		groundMat.needsUpdate = true;
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
		for (const model of forgeStreet({
			asphalt,
			brick,
			dock: dockSkin,
			pit: pitSkin
		})) scene.add(model);
		const train = new Mesh(new BoxGeometry(3.4, 2.2, 12), new MeshLambertMaterial({ color: 12963542 }));
		train.position.set(0, 1.2, -90);
		scene.add(train);
		train.name = "train";
		for (const [file, x, z, height, yaw] of [
			[
				"low-detail-building-a.glb",
				78,
				-8,
				7,
				.4
			],
			[
				"low-detail-building-b.glb",
				78,
				52,
				8,
				-.6
			],
			[
				"low-detail-building-c.glb",
				-78,
				22,
				7,
				1.2
			],
			[
				"low-detail-building-wide-a.glb",
				-78,
				-28,
				6,
				.2
			],
			[
				"building-a.glb",
				24,
				76,
				9,
				0
			],
			[
				"building-skyscraper-a.glb",
				-28,
				-76,
				16,
				.3
			]
		]) plantBuilding(sim, file, x, z, height, yaw);
		for (const [url, x, z, height, solid] of [
			[
				"/models/kenney/nature/grass.glb",
				-40,
				6,
				.55,
				false
			],
			[
				"/models/kenney/nature/grass_large.glb",
				-36,
				-4,
				.7,
				false
			],
			[
				"/models/kenney/nature/grass.glb",
				12,
				38,
				.55,
				false
			],
			[
				"/models/kenney/nature/flower_redA.glb",
				-38,
				4,
				.4,
				false
			],
			[
				"/models/kenney/nature/plant_bush.glb",
				-42,
				-2,
				.85,
				false
			],
			[
				"/models/kenney/nature/tree_oak.glb",
				-44,
				12,
				4.2,
				true
			],
			[
				"/models/kenney/nature/tree_default.glb",
				16,
				40,
				3.4,
				true
			],
			[
				"/models/kenney/nature/rock_largeA.glb",
				-46,
				-8,
				.8,
				true
			],
			[
				"/models/kenney/nature/fence_simple.glb",
				18,
				36,
				1.15,
				true
			],
			[
				"/models/kenney/pets/animal-dog.glb",
				-40,
				-6,
				.7,
				false
			],
			[
				"/models/kenney/pets/animal-cat.glb",
				40,
				-16,
				.42,
				false
			]
		]) dropPiece(sim, url, x, z, height, solid);
		loader.loadAsync("/models/kenney/arms/weapon-sword.glb").then((gltf) => {
			swordTpl = gltf.scene;
			propKey = "";
		});
		loader.loadAsync("/models/kenney/arms/weapon-spear.glb").then((gltf) => {
			spearTpl = gltf.scene;
			propKey = "";
		});
		loader.loadAsync("/models/gen/cart.glb").then((gltf) => {
			const mesh = gltf.scene;
			const steel = document.createElement("canvas");
			steel.width = 128;
			steel.height = 128;
			const paint = steel.getContext("2d");
			if (paint) {
				paint.fillStyle = "#8d969e";
				paint.fillRect(0, 0, 128, 128);
				for (let i = 0; i < 500; i++) {
					paint.fillStyle = i % 17 === 0 ? "#7a3e2a" : i % 2 === 0 ? "#d5dde2" : "#6a737a";
					paint.fillRect(Math.random() * 128, Math.random() * 128, 2, 1);
				}
			}
			const map = new CanvasTexture(steel);
			map.colorSpace = SRGBColorSpace;
			map.wrapS = RepeatWrapping;
			map.wrapT = RepeatWrapping;
			map.repeat.set(4, 4);
			mesh.traverse((obj) => {
				const part = obj;
				if (!part.isMesh) return;
				const geo = part.geometry;
				geo.computeVertexNormals();
				const pos = geo.getAttribute("position");
				geo.computeBoundingBox();
				const bb = geo.boundingBox;
				if (pos && bb) {
					const uv = new Float32Array(pos.count * 2);
					const sx = bb.max.x - bb.min.x || 1;
					const sy = bb.max.y - bb.min.y || 1;
					for (let i = 0; i < pos.count; i++) {
						uv[i * 2] = (pos.getX(i) - bb.min.x) / sx;
						uv[i * 2 + 1] = (pos.getY(i) - bb.min.y) / sy;
					}
					geo.setAttribute("uv", new BufferAttribute(uv, 2));
				}
				part.material = new MeshStandardMaterial({
					map,
					color: 14147300,
					metalness: .72,
					roughness: .42
				});
			});
			const size = new Box3().setFromObject(mesh).getSize(new Vector3());
			const span = Math.max(size.x, size.y, size.z) || 1;
			mesh.scale.setScalar(1.15 / span);
			mesh.position.set(38, 0, -20);
			const grounded = new Box3().setFromObject(mesh);
			mesh.position.y -= grounded.min.y;
			scene.add(mesh);
		});
	}
	function soften(mesh) {
		mesh.traverse((obj) => {
			const part = obj;
			if (!part.isMesh) return;
			const mat = part.material;
			if (mat && "metalness" in mat) mat.metalness = 0;
		});
	}
	function dropPiece(sim, url, x, z, height, solid) {
		loader.loadAsync(url).then((gltf) => {
			const mesh = gltf.scene;
			soften(mesh);
			const size = new Box3().setFromObject(mesh).getSize(new Vector3());
			mesh.scale.setScalar(height / (size.y || 1));
			mesh.position.set(x, 0, z);
			const grounded = new Box3().setFromObject(mesh);
			mesh.position.y -= grounded.min.y;
			scene.add(mesh);
			if (url.includes("animal")) critters.push(mesh);
			if (!solid) return;
			const placed = new Box3().setFromObject(mesh);
			sim.boxes.push({
				minX: placed.min.x + .2,
				maxX: placed.max.x - .2,
				minY: 0,
				maxY: Math.max(.8, placed.max.y * .7),
				minZ: placed.min.z + .2,
				maxZ: placed.max.z - .2,
				kind: "wall",
				hp: 0,
				role: ""
			});
		});
	}
	function plantBuilding(sim, file, x, z, height, yaw) {
		loader.loadAsync(`/models/kenney/${file}`).then((gltf) => {
			const mesh = gltf.scene;
			mesh.rotation.y = yaw;
			const span = new Box3().setFromObject(mesh).getSize(new Vector3()).y || 1;
			mesh.scale.setScalar(height / span);
			mesh.position.set(x, 0, z);
			const grounded = new Box3().setFromObject(mesh);
			mesh.position.y -= grounded.min.y;
			const placed = new Box3().setFromObject(mesh);
			scene.add(mesh);
			sim.boxes.push({
				minX: placed.min.x + .35,
				maxX: placed.max.x - .35,
				minY: 0,
				maxY: Math.max(2.2, placed.max.y - .2),
				minZ: placed.min.z + .35,
				maxZ: placed.max.z - .35,
				kind: "wall",
				hp: 0,
				role: ""
			});
		});
	}
	function buildBox(box) {
		const midX = (box.minX + box.maxX) / 2;
		const midZ = (box.minZ + box.maxZ) / 2;
		if (box.kind === "rope") {
			const mesh = new Mesh(new BoxGeometry(box.maxX - box.minX, box.maxY, box.maxZ - box.minZ), new MeshLambertMaterial({ color: 12729134 }));
			mesh.position.set(midX, box.maxY / 2, midZ);
			scene.add(mesh);
			return mesh;
		}
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
		const plaza = box.maxX > -28 && box.minX < 26 && box.maxZ > -28 && box.minZ < 26;
		const pick = Math.abs(Math.round(midX * 3 + midZ * 7)) % 4;
		const skin = box.kind === "wall" && !plaza && h > 2 ? pick === 1 ? brick : pick === 2 ? dockSkin : pick === 3 ? asphalt : null : null;
		const mat = new MeshLambertMaterial({
			color: skin ? 16777215 : color,
			map: skin,
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
			lamps.push(light);
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
			const pieces = [
				"barrel_small",
				"barrel_large",
				"box_small",
				"box_large",
				"pillar",
				"barrier",
				"stool",
				"torch_mounted",
				"column",
				"table_small"
			];
			const spots = [
				[-40, 1],
				[-36, -7],
				[-33, 6],
				[-44, -3],
				[-30, -4],
				[-42, 8],
				[-38, 4],
				[-4, 30],
				[1, 33],
				[-2, 39],
				[3, 36],
				[0, 42],
				[-3, -31],
				[1, -35],
				[2, -41],
				[-1, -44],
				[3, -38],
				[11, -17.5],
				[-9, -17.2],
				[5, 9],
				[-1, 11],
				[20, -17]
			];
			let seed = 20261004;
			const roll = () => {
				seed = Math.imul(1664525, seed) + 1013904223 >>> 0;
				return seed / 4294967296;
			};
			for (const [x, z] of spots) drop(pieces[Math.floor(roll() * pieces.length)], x + (roll() - .5) * .5, z + (roll() - .5) * .5, roll() * 6.28);
			scene.add(root);
			for (const mesh of boxMeshes) if (mesh.userData.shell) mesh.visible = false;
			propKey = "";
		}).catch(() => {
			kit = null;
		});
	}
	function people() {
		return [
			soldier,
			soldierf,
			drifter,
			knight,
			rogue,
			hood,
			brute,
			hex
		].filter((rig) => rig !== null);
	}
	function mixed() {
		const extra = [
			skel,
			bones,
			skull,
			minion,
			zombie,
			zombief,
			mannequin
		].filter((rig) => rig !== null);
		return [...people(), ...extra];
	}
	function rigFor(b, sim) {
		const humans = people();
		const all = sim.crowd === "chibi" ? [
			knight,
			rogue,
			hood,
			brute,
			hex,
			skel,
			bones,
			skull,
			minion
		].filter((rig) => rig !== null) : mixed();
		if (!humans.length && !all.length && !knight) return null;
		if (b.kind === "player") {
			if (sim.cast && castRigs.has(sim.cast)) return castRigs.get(sim.cast) ?? null;
			if (sim.style === "soldier") return soldier ?? humans[0] ?? knight;
			if (sim.style === "soldierf") return soldierf ?? humans[0] ?? knight;
			if (sim.style === "zombie") return zombie ?? humans[0] ?? knight;
			if (sim.style === "zombief") return zombief ?? humans[0] ?? knight;
			if (sim.style === "mannequin") return mannequin ?? humans[0] ?? knight;
			if (sim.style === "drifter") return drifter ?? humans[0] ?? knight;
			if (sim.style === "runner" || sim.style === "ash") return sim.build === "chibi" ? rogue ?? knight : soldierf ?? rogue ?? humans[0] ?? knight;
			if (sim.style === "brute" || sim.style === "pit") return sim.build === "chibi" ? brute ?? knight : soldier ?? brute ?? humans[0] ?? knight;
			if (sim.style === "hood") return sim.build === "chibi" ? hood ?? knight : soldierf ?? hood ?? knight;
			if (sim.style === "hex") return sim.build === "chibi" ? hex ?? knight : soldier ?? hex ?? knight;
			if (sim.style === "skeleton") return skel ?? knight;
			if (sim.style === "bones") return bones ?? knight;
			if (sim.style === "skull") return skull ?? knight;
			if (sim.style === "minion") return minion ?? knight;
			if (sim.build === "chibi") return knight;
			return soldier ?? soldierf ?? drifter ?? humans[0] ?? knight;
		}
		if (b.kind === "ally") return soldierf ?? hood ?? rogue ?? knight;
		const pool = sim.crowd === "full" ? humans : all;
		if (pool.length) return pool[b.id % pool.length];
		return knight;
	}
	function syncFighters(sim) {
		if (sim.cast) ensureCast(sim.cast);
		const key = `${sim.cast}|${castRigs.has(sim.cast) ? 1 : 0}|${sim.style}|${sim.build}|${sim.crowd}|${sim.height}|${sim.bulk}|${sim.head}|${sim.leg}|${sim.shoulder}|${sim.bodies.map((b) => b.id).join(",")}|${knight ? 1 : 0}${rogue ? 1 : 0}${brute ? 1 : 0}${hood ? 1 : 0}${hex ? 1 : 0}${drifter ? 1 : 0}${skel ? 1 : 0}${bones ? 1 : 0}${mannequin ? 1 : 0}${skull ? 1 : 0}${minion ? 1 : 0}${soldier ? 1 : 0}${soldierf ? 1 : 0}${zombie ? 1 : 0}${zombief ? 1 : 0}`;
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
			const cast = b.kind === "player" && rig?.moveset.startsWith("cast:");
			const native = !!rig && (rig.moveset === "soldier" || rig.moveset === "soldierf" || rig.moveset === "zombie" || rig.moveset === "zombief" || rig.moveset === "drifter" || rig.moveset === "mannequin");
			const made = rig ? makeRig(rig, b.kind === "player" ? 15774761 : 14964526, cast ? rig.moveset : b.kind === "player" && !native ? "player" : rig.moveset, b.kind === "player" && !native && !cast ? DYE[sim.style] ?? 0 : 0, b.kind === "player" ? sim.height : 1, b.kind === "player" ? sim.bulk : 1, b.kind === "player" ? sim.head : 1, b.kind === "player" ? sim.leg : 1, b.kind === "player" ? sim.shoulder : 1) : makeFighter(shared, b.kind === "player" ? PAL[0] : PAL[b.id % (PAL.length - 1) + 1]);
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
				else if (prop.kind === "chair") mesh = new Mesh(new BoxGeometry(.46, .42, .46), new MeshLambertMaterial({ color: 9067058 }));
				else if (prop.kind === "table") mesh = new Mesh(new BoxGeometry(1.15, .7, .7), new MeshLambertMaterial({ color: 6964008 }));
				else if (prop.kind === "board") mesh = new Mesh(new BoxGeometry(.7, .08, .28), new MeshLambertMaterial({ color: 10840892 }));
				else if (prop.kind === "car") mesh = forgeCar();
				else if (prop.kind === "blade" && swordTpl) {
					mesh = swordTpl.clone(true);
					mesh.scale.setScalar(.55);
				} else if (prop.kind === "spear" && spearTpl) {
					mesh = spearTpl.clone(true);
					mesh.scale.setScalar(.7);
				} else if (prop.kind === "blade") mesh = new Mesh(new BoxGeometry(.08, .08, .7), new MeshLambertMaterial({ color: 14147300 }));
				else if (prop.kind === "spear") mesh = new Mesh(new CylinderGeometry(.03, .03, 1.4, 5), new MeshLambertMaterial({ color: 9067058 }));
				else if (src) mesh = src.clone(true);
				else mesh = new Mesh(new BoxGeometry(.7, .7, .7), new MeshLambertMaterial({ color: 6968376 }));
				scene.add(mesh);
				propViews.push(mesh);
			}
		}
		sim.props.forEach((prop, i) => {
			const mesh = propViews[i];
			if (!mesh) return;
			mesh.visible = prop.kind === "car" || prop.alive;
			mesh.position.set(prop.x, prop.y + (prop.kind === "pipe" || prop.kind === "spear" || prop.kind === "blade" ? .2 : 0), prop.z);
			if (prop.kind === "car") poseCar(mesh, prop.crush);
		});
	}
	function render(sim, dt) {
		const p = sim.bodies[0];
		applyStage(sim.story ? sim.stage : p && p.x < -26 ? "yard" : p && p.z > 26 ? "dock" : p && p.z < -26 ? "under" : sim.stage);
		const day = (Math.sin(sim.time * .045) + 1) / 2;
		skyMat.uniforms.uDay.value = day;
		sky.position.copy(camera.position);
		stars.position.copy(camera.position);
		stars.material.opacity = Math.max(0, .9 - day * 1.6);
		sun.position.set(Math.cos(sim.time * .045) * 40, -8 + day * 46, Math.sin(sim.time * .045) * 18);
		sun.intensity = .35 + day * 1.25;
		sun.color.setHex(day < .35 ? 16756858 : 16774372);
		hemi.intensity = .72 + day * .75;
		sunOrb.position.copy(sun.position);
		sunOrb.visible = day > .08;
		for (let i = 0; i < clouds.length; i++) {
			clouds[i].position.x += dt * (1.2 + i * .3);
			if (clouds[i].position.x > 70) clouds[i].position.x = -70;
			clouds[i].material.opacity = .12 + day * .22;
		}
		for (const lamp of lamps) lamp.intensity = .45 + (1 - day) * 1.35;
		door.position.x = -12.4 - sim.door * 1.7;
		const train = scene.getObjectByName("train");
		if (train) {
			const cycle = sim.time % 8;
			train.visible = cycle < 1.3;
			train.position.z = -80 + cycle / 1.2 * 26;
		}
		for (const critter of critters) {
			if (critter.userData.ox === void 0) {
				critter.userData.ox = critter.position.x;
				critter.userData.oz = critter.position.z;
			}
			critter.position.x = critter.userData.ox + Math.sin(sim.time * .6 + critter.position.z) * .8;
			critter.rotation.y = Math.sin(sim.time * .6) > 0 ? .4 : -2.4;
		}
		if (sim.story && sim.venueR > 1) {
			curb.visible = true;
			curb.position.x = sim.venueX;
			curb.position.z = sim.venueZ;
			curb.scale.set(sim.venueR, sim.venueR, 1);
		} else curb.visible = false;
		ring.visible = false;
		ensureWorld(sim);
		syncFighters(sim);
		syncProps(sim);
		for (let i = 0; i < sim.boxes.length; i++) {
			const box = sim.boxes[i];
			const mesh = boxMeshes[i];
			if (!mesh) continue;
			if (box.kind === "open") mesh.visible = false;
			else if (box.kind === "gate") mesh.visible = !sim.streetClear;
			else mesh.visible = true;
			if (box.hp > 0 && box.kind !== "open") {
				const mat = mesh.material;
				if (mat && mat.color) mat.color.setHex(box.role === "cage" ? 10135474 : box.role === "door" ? 9067058 : 7164740);
			}
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
		placeCamera(sim, dt, camera, _desired, _target, () => {
			idle += dt;
			return idle;
		});
		const beat = sim.hitstop > 0 ? 1.8 : 1;
		const svcs = sim.services;
		if (svcs) {
			const w = svcs.weather;
			const rainI = rainIntensity(w);
			rain.step(sim.reduced || rainI <= 0 ? 0 : dt * beat, camera);
			const fog = scene.fog;
			if (fog) {
				const d = fogDensity(w);
				fog.near = 24 - d * 14;
				fog.far = 90 - d * 55;
			}
			if (w.lightning > .02) {
				sun.intensity += w.lightning * 3;
				hemi.intensity += w.lightning * 1.5;
			}
			const birds = svcs.flock.birds;
			for (let i = 0; i < birdMeshes.length; i++) {
				const b = birds[i % birds.length];
				const m = birdMeshes[i];
				m.position.set(b.x, b.y, b.z);
				m.rotation.y = Math.atan2(b.vx, b.vz);
				m.visible = !sim.reduced;
			}
			if (p) updateStreaming(svcs.stream, p.x, p.z);
			{
				const peds = svcs.peds.peds;
				for (let i = 0; i < pedMeshes.length; i++) {
					const m = pedMeshes[i];
					const ped = peds[i];
					if (!ped || sim.reduced) {
						m.visible = false;
						continue;
					}
					m.visible = true;
					m.position.set(ped.x, .75, ped.z);
					m.rotation.y = Math.atan2(ped.vx, ped.vz);
					const hop = ped.state === "panic" ? Math.abs(Math.sin(sim.time * 9 + ped.id)) * .25 : 0;
					m.position.y = .75 + hop;
					m.scale.y = ped.state === "cower" ? .7 : 1;
				}
			}
			for (const chains of svcs.springs.values()) for (const chain of chains) for (const bone of chain.bones) stepSpringBone(bone, dt, 0, 0, 0);
		} else rain.step(sim.reduced ? 0 : dt * beat, camera);
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
		moveset: "knight",
		baseY: 0,
		lockL: null,
		lockR: null
	};
}
function poseFighter(f, b, sim, camera, dt) {
	const sink = b.alive ? 1 : .55;
	const bulk = b.kind === "player" ? 1 : b.arch === "brute" ? 1.16 : b.arch === "runner" ? .92 : b.arch === "hood" ? .98 : b.arch === "hex" ? 1.04 : 1;
	f.group.visible = b.alive || b.y > -.7;
	f.group.position.set(b.x, b.y, b.z);
	f.group.rotation.y = b.yaw + Math.PI;
	if (b.kind !== "player" && Math.hypot(b.x - camera.position.x, b.z - camera.position.z) > 26) {
		f.group.visible = false;
		f.bar.visible = false;
		return;
	}
	if (!f.mixer) f.group.scale.setScalar(Math.max(.05, bulk * sink));
	if (f.mixer) {
		const want = resolveClip(f, b, sim);
		playClip(f, want.name, want.loop);
		const speed = Math.hypot(b.vx, b.vz);
		const action = f.actions[f.clip];
		if (action && b.grounded && b.state === "free" && speed > .45 && !motionNames().has(f.clip)) action.timeScale = Math.min(1.65, Math.max(.7, speed / 2.15));
		f.mixer.update(dt);
		if (action && sim.pairAtk >= 0 && (b.id === sim.pairAtk || b.id === sim.pairVic) && sim.pairT > 0) {
			const len = sim.pairLen > 0 ? sim.pairLen : action.getClip().duration;
			action.timeScale = 1;
			action.time = Math.max(0, Math.min(action.getClip().duration - .001, len - sim.pairT));
		}
		if (b.kind === "player" && b.alive && b.grounded && b.state === "free") settleFeet(f);
		if (f.gear) {
			const want = b.alive && (b.weapon === "blade" || b.weapon === "spear") ? b.weapon : "";
			const src = want === "blade" ? swordTpl : want === "spear" ? spearTpl : null;
			if (f.gear.userData.held !== want) {
				const old = f.gear.getObjectByName("held");
				if (old) f.gear.remove(old);
				f.gear.userData.held = want;
				if (src) {
					const held = src.clone(true);
					held.name = "held";
					held.scale.setScalar(want === "spear" ? .45 : .35);
					held.rotation.x = Math.PI / 2;
					f.gear.add(held);
				}
			}
			const held = f.gear.getObjectByName("held");
			if (held) held.visible = !!want;
			f.gear.visible = b.alive && b.weapon !== "fist";
			const mat = f.gear.material;
			if (!want) mat.color.setHex(b.weapon === "bottle" ? 6931394 : b.weapon === "board" ? 10840892 : 12042440);
			mat.opacity = want ? 0 : 1;
			mat.transparent = !!want;
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
function settleFeet(f) {
	const model = f.group.children[0];
	if (!model) return;
	model.position.y = f.baseY;
	model.updateWorldMatrix(true, true);
	let lowest = Infinity;
	const spot = new Vector3();
	model.traverse((obj) => {
		if (obj.name !== "foot.l" && obj.name !== "foot.r" && obj.name !== "FootL" && obj.name !== "FootR" && obj.name !== "LeftFoot" && obj.name !== "RightFoot" && obj.name !== "mixamorigLeftFoot" && obj.name !== "mixamorigRightFoot") return;
		obj.getWorldPosition(spot);
		lowest = Math.min(lowest, spot.y);
	});
	if (!Number.isFinite(lowest) || lowest >= -.02) return;
	model.position.y = f.baseY + (.02 - lowest);
}
function makeRig(template, barColor, moveset = template.moveset, dye = 0, heightMul = 1, bulk = 1, head = 1, leg = 1, shoulder = 1) {
	const model = clone(template.scene);
	model.updateMatrixWorld(true);
	const bounds = new Box3().setFromObject(model);
	const full = template.moveset.startsWith("cast:") || template.moveset === "soldier" || template.moveset === "soldierf" || template.moveset === "zombie" || template.moveset === "zombief" || template.moveset === "mannequin" || template.moveset === "drifter";
	const tall = Math.max(.01, bounds.max.y - bounds.min.y);
	const scale = (full ? 1.92 : 1.5) / tall;
	const yScale = scale * heightMul * (.9 + leg * .1);
	const xz = scale * bulk * (.9 + shoulder * .1);
	model.scale.set(xz, yScale, xz);
	model.position.y = -bounds.min.y * yScale;
	if (template.moveset.startsWith("cast:")) model.rotation.y = -Math.PI / 2;
	model.traverse((obj) => {
		if (PROP_MESH.test(obj.name)) obj.visible = false;
		if (obj.name === "head" || obj.name === "Head" || obj.name === "DEF-head") obj.scale.setScalar(.85 + head * .15);
	});
	const dyed = [];
	if (dye) {
		const tint = new Color(dye);
		model.traverse((obj) => {
			const mesh = obj;
			if (!mesh.isMesh || !mesh.material) return;
			const next = (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).map((mat) => {
				const copy = mat.clone();
				const colored = copy;
				if (colored.color) colored.color.lerp(tint, .62);
				dyed.push(copy);
				return copy;
			});
			mesh.material = Array.isArray(mesh.material) ? next : next[0];
		});
	}
	const group = new Group();
	group.add(model);
	const mixer = new AnimationMixer(model);
	const actions = {};
	for (const clip of template.animations) actions[clip.name] = mixer.clipAction(clip);
	for (const clip of bakeMotion(model)) actions[clip.name] = mixer.clipAction(clip);
	if (template.moveset.startsWith("cast:")) for (const clip of retargetUal(model)) actions[clip.name] = mixer.clipAction(clip);
	{
		const srcRest = collectRest(template.scene);
		for (const clip of template.animations) {
			if (clip.name in actions) continue;
			const mapped = retargetClip(clip, srcRest.quats, srcRest.names, model);
			if (mapped) actions[clip.name] = mixer.clipAction(mapped);
		}
	}
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
		mats: [
			bar.material,
			gear.material,
			...dyed
		],
		mixer,
		actions,
		clip: "",
		gear,
		moveset,
		baseY: model.position.y,
		lockL: null,
		lockR: null
	};
	playClip(fighter, "Unarmed_Idle", true);
	return fighter;
}
var DYE = {
	rain: 6983856,
	ash: 12038824,
	pit: 12872250
};
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
	next.fadeIn(0).play();
	if (prev && prev !== next) {
		if (name.endsWith(":vic") || motionNames().has(name)) prev.stop();
		else prev.fadeOut(.08);
	}
	f.clip = resolved;
}
function firstClip(actions, names) {
	for (const name of names) if (name in actions) return name;
	return "";
}
function resolveClip(f, b, sim) {
	if (sim.pair && sim.pairAtk >= 0) {
		const vic = `${sim.pair}:vic`;
		if (b.id === sim.pairVic && vic in f.actions) return {
			name: vic,
			loop: false
		};
		if (b.id === sim.pairAtk && sim.pair in f.actions) return {
			name: sim.pair,
			loop: false
		};
		if (b.id === sim.pairAtk || b.id === sim.pairVic) {
			const asked = slotFor(b);
			return {
				name: clipForMoveset(f.moveset, asked.slot, (clip) => clip in f.actions),
				loop: false
			};
		}
	}
	if (sim.pair && sim.pair !== "mount" && sim.pairAtk < 0) {
		const vic = `${sim.pair}:vic`;
		if (b.kind !== "player" && b.state === "grab" && vic in f.actions) return {
			name: vic,
			loop: false
		};
		if (b.kind === "player" && (b.throwT > 0 || b.state === "grab") && sim.pair in f.actions) return {
			name: sim.pair,
			loop: false
		};
	}
	if (sim.grabId === b.id && b.state === "grab" && sim.pairT <= 0) {
		const hold = sim.rearLock ? firstClip(f.actions, [
			"hitback",
			"Hit_Chest",
			"defender"
		]) : firstClip(f.actions, [
			"defender",
			"Punch_Enter",
			"Interact",
			"boxidle"
		]);
		if (hold) return {
			name: hold,
			loop: true
		};
	}
	if (b.state === "grab" && b.kind !== "player") {
		const held = firstClip(f.actions, [
			"Hit_Chest",
			"defender",
			"hitbody",
			"Idle_Loop"
		]);
		if (held) return {
			name: held,
			loop: true
		};
	}
	if (b.kind === "player" && b.state === "free" && b.grounded) {
		if (sim.guard) {
			const pose = sim.lowGuard ? firstClip(f.actions, [
				"guardlow",
				"Crouch_Idle_Loop",
				"stancecrouch"
			]) : firstClip(f.actions, [
				"guardhigh",
				"block",
				"defender"
			]);
			if (pose) return {
				name: pose,
				loop: true
			};
		}
	}
	const asked = slotFor(b);
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
	const n = window.matchMedia("(pointer: coarse)").matches ? 140 : 280;
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
new Vector3();
new Vector3();
new Vector3();
new Vector3();
new Vector3();
new Vector3();
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
	},
	{
		id: "lucha",
		label: "Lucha",
		note: "Run, then Grab. That is a hurricanrana.",
		clips: {
			jab: "Unarmed_Melee_Attack_Kick",
			cross: "Dodge_Forward",
			launch: "Jump_Full_Long",
			sweep: "Unarmed_Melee_Attack_Kick",
			jump: "Jump_Full_Long"
		}
	},
	{
		id: "jeet",
		label: "Jeet kune do",
		note: "A short cross throws them straight back. A low hit reaches the pack.",
		clips: {
			jab: "Unarmed_Melee_Attack_Punch_A",
			cross: "Unarmed_Melee_Attack_Punch_B",
			launch: "1H_Melee_Attack_Chop",
			sweep: "1H_Melee_Attack_Slice_Horizontal"
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
		idle: "Unarmed_Idle"
	},
	{
		id: "drunken",
		label: "Drunken",
		note: "Loose. You can grab from farther away.",
		idle: "Idle"
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
function applyFighter(style, martial, _slots) {
	equipStyle(style);
	if (martial) applyMartial(martial);
}
var STEPS = 32;
var STEPS_PER_BAR = 16;
var MINOR_PENT = [
	0,
	3,
	5,
	7,
	10,
	12,
	15
];
var DORIAN_COLOR = [2, 9];
var PROGRESSIONS = [
	[
		0,
		8,
		3,
		10
	],
	[
		0,
		10,
		8,
		7
	],
	[
		0,
		3,
		10,
		8
	],
	[
		0,
		8,
		10,
		7
	]
];
function hashStr(s) {
	let h = 1779033703 ^ s.length;
	for (let i = 0; i < s.length; i++) {
		h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
		h = h << 13 | h >>> 19;
	}
	return h >>> 0;
}
function mulberry32(seed) {
	let a = seed >>> 0;
	return () => {
		a |= 0;
		a = a + 1831565813 | 0;
		let t = Math.imul(a ^ a >>> 15, 1 | a);
		t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
}
function makeRng(seed) {
	const rand = mulberry32(hashStr(seed));
	return {
		rand,
		chance: (p) => rand() < p,
		pick: (arr) => arr[Math.floor(rand() * arr.length)],
		pickN: (arr, n) => {
			const copy = [...arr];
			const out = [];
			for (let i = 0; i < n && copy.length; i++) out.push(copy.splice(Math.floor(rand() * copy.length), 1)[0]);
			return out;
		}
	};
}
var INTENSITY_CFG = {
	calm: {
		bpm: 82,
		drums: "sparse",
		bass: "soft",
		melody: "sparse",
		pad: true,
		swing: .14,
		energy: .3
	},
	tense: {
		bpm: 90,
		drums: "boombap",
		bass: "driving",
		melody: "riff",
		pad: false,
		swing: .08,
		energy: .65
	},
	hype: {
		bpm: 96,
		drums: "doubletime",
		bass: "hard",
		melody: "aggressive",
		pad: false,
		swing: .04,
		energy: 1
	}
};
function generateBeat(seed, intensity) {
	const cfg = INTENSITY_CFG[intensity];
	const r = makeRng(`${seed}:${intensity}`);
	const root = 45;
	const progression = r.pick(PROGRESSIONS);
	const kick = /* @__PURE__ */ new Set();
	for (let bar = 0; bar < 2; bar++) {
		const b = bar * 16;
		kick.add(b);
		if (cfg.drums === "sparse") {
			if (r.chance(.5)) kick.add(b + 10);
		} else {
			const n = cfg.drums === "doubletime" ? 3 : 2;
			for (const s of r.pickN([
				7,
				10,
				6,
				11,
				14
			], n)) kick.add(b + s);
		}
	}
	const snare = [];
	if (cfg.drums !== "sparse") for (let bar = 0; bar < 2; bar++) {
		const b = bar * 16;
		snare.push(b + 4, b + 12);
		if (cfg.drums === "doubletime" && r.chance(.6)) snare.push(b + 15);
	}
	const clap = cfg.drums === "doubletime" ? [...snare] : [];
	const hat = [];
	const openHat = [];
	const density = cfg.drums === "sparse" ? .35 : cfg.drums === "boombap" ? .8 : 1;
	for (let s = 0; s < STEPS; s++) if (s % 2 === 0) {
		if (r.chance(density)) hat.push(s);
	} else if (cfg.drums === "doubletime" && r.chance(.7)) hat.push(s);
	if (cfg.drums !== "sparse" && r.chance(.8)) openHat.push(14);
	if (cfg.drums === "doubletime") {
		for (let s = 28; s < 32; s++) if (!hat.includes(s)) hat.push(s);
	}
	hat.sort((a, b) => a - b);
	const bass = [];
	for (const k of [...kick].sort((a, b) => a - b)) {
		let midi = 33 + progression[Math.floor(k / 16) % progression.length];
		if (cfg.bass === "hard" && r.chance(.25)) midi += 12;
		bass.push({
			step: k,
			midi,
			len: cfg.bass === "soft" ? 6 : 3
		});
	}
	if (cfg.bass === "soft") bass.push({
		step: 16,
		midi: 33 + progression[2],
		len: 8
	});
	const melDensity = {
		sparse: .12,
		riff: .3,
		aggressive: .5
	}[cfg.melody];
	const melody = [];
	for (let s = 0; s < STEPS; s++) {
		if (s % 4 === 0 || !r.chance(melDensity)) continue;
		const deg = r.pick(MINOR_PENT) + (r.chance(.12) ? r.pick(DORIAN_COLOR) : 0);
		melody.push({
			step: s,
			midi: 57 + deg,
			len: r.chance(.3) ? 2 : 1,
			vel: .5 + r.rand() * .5
		});
	}
	const chords = [0, 1].map((bar) => {
		const cr = progression[bar * 2 % progression.length];
		return [
			root + cr,
			root + cr + 3,
			root + cr + 7
		];
	});
	return {
		seed,
		intensity,
		bpm: cfg.bpm,
		root,
		kick: [...kick].sort((a, b) => a - b),
		snare: snare.sort((a, b) => a - b),
		clap,
		hat,
		openHat,
		bass,
		melody,
		chords,
		swing: cfg.swing,
		energy: cfg.energy
	};
}
function midiHz(m) {
	return 440 * Math.pow(2, (m - 69) / 12);
}
function kickVoice(c, out, t, amp) {
	const o = c.createOscillator();
	const g = c.createGain();
	o.frequency.setValueAtTime(150, t);
	o.frequency.exponentialRampToValueAtTime(48, t + .12);
	g.gain.setValueAtTime(amp, t);
	g.gain.exponentialRampToValueAtTime(1e-4, t + .24);
	o.connect(g).connect(out);
	o.start(t);
	o.stop(t + .26);
}
function noiseBurst(c, out, t, dur, amp, filterType, freq, q = 1) {
	const len = Math.max(1, Math.floor(c.sampleRate * dur));
	const buf = c.createBuffer(1, len, c.sampleRate);
	const d = buf.getChannelData(0);
	for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
	const src = c.createBufferSource();
	src.buffer = buf;
	const f = c.createBiquadFilter();
	f.type = filterType;
	f.frequency.value = freq;
	f.Q.value = q;
	const g = c.createGain();
	g.gain.setValueAtTime(amp, t);
	g.gain.exponentialRampToValueAtTime(1e-4, t + dur);
	src.connect(f).connect(g).connect(out);
	src.start(t);
}
function snareVoice(c, out, t, amp) {
	noiseBurst(c, out, t, .18, amp, "highpass", 1800);
	const o = c.createOscillator();
	const g = c.createGain();
	o.type = "triangle";
	o.frequency.setValueAtTime(210, t);
	o.frequency.exponentialRampToValueAtTime(120, t + .09);
	g.gain.setValueAtTime(amp * .7, t);
	g.gain.exponentialRampToValueAtTime(1e-4, t + .11);
	o.connect(g).connect(out);
	o.start(t);
	o.stop(t + .13);
}
function hatVoice(c, out, t, amp, open) {
	noiseBurst(c, out, t, open ? .32 : .045, amp, "highpass", 7500);
}
function bass808(c, out, t, midi, dur, amp) {
	const o = c.createOscillator();
	const g = c.createGain();
	const f = c.createBiquadFilter();
	o.type = "sine";
	o.frequency.setValueAtTime(midiHz(midi) * 1.02, t);
	o.frequency.exponentialRampToValueAtTime(midiHz(midi), t + .03);
	f.type = "lowpass";
	f.frequency.value = 300;
	g.gain.setValueAtTime(1e-4, t);
	g.gain.exponentialRampToValueAtTime(amp, t + .015);
	g.gain.exponentialRampToValueAtTime(1e-4, t + dur);
	o.connect(f).connect(g).connect(out);
	o.start(t);
	o.stop(t + dur + .02);
}
function pluckVoice(c, out, t, midi, dur, amp) {
	const o = c.createOscillator();
	const g = c.createGain();
	const f = c.createBiquadFilter();
	o.type = "sawtooth";
	o.frequency.value = midiHz(midi);
	f.type = "lowpass";
	f.frequency.setValueAtTime(3200, t);
	f.frequency.exponentialRampToValueAtTime(700, t + dur);
	g.gain.setValueAtTime(1e-4, t);
	g.gain.exponentialRampToValueAtTime(amp, t + .008);
	g.gain.exponentialRampToValueAtTime(1e-4, t + dur);
	o.connect(f).connect(g).connect(out);
	o.start(t);
	o.stop(t + dur + .02);
}
function padVoice(c, out, t, midi, dur, amp) {
	const o = c.createOscillator();
	const g = c.createGain();
	o.type = "sine";
	o.frequency.value = midiHz(midi);
	g.gain.setValueAtTime(1e-4, t);
	g.gain.linearRampToValueAtTime(amp, t + .4);
	g.gain.setValueAtTime(amp, t + Math.max(.41, dur - .5));
	g.gain.linearRampToValueAtTime(1e-4, t + dur);
	o.connect(g).connect(out);
	o.start(t);
	o.stop(t + dur + .02);
}
var MusicEngine = class {
	ctx = null;
	master = null;
	musicBus = null;
	timer = null;
	step = 0;
	nextTime = 0;
	beat;
	pendingIntensity = null;
	playing = false;
	enabled = true;
	constructor(seed = "ashlane", intensity = "calm") {
		this.beat = generateBeat(seed, intensity);
	}
	setEnabled(on) {
		this.enabled = on;
	}
	/** Request an intensity change — takes effect at the next bar line. */
	setIntensity(i) {
		if (i === this.beat.intensity && !this.pendingIntensity) return;
		this.pendingIntensity = i;
	}
	getIntensity() {
		return this.pendingIntensity ?? this.beat.intensity;
	}
	ensureCtx() {
		if (!this.enabled) return null;
		try {
			if (!this.ctx) {
				const AC = window.AudioContext || window.webkitAudioContext;
				this.ctx = new AC();
				this.master = this.ctx.createGain();
				this.master.gain.value = .5;
				const limiter = this.ctx.createDynamicsCompressor();
				limiter.threshold.value = -16;
				limiter.ratio.value = 6;
				this.master.connect(limiter).connect(this.ctx.destination);
				this.musicBus = this.ctx.createGain();
				this.musicBus.gain.value = .8;
				this.musicBus.connect(this.master);
			}
			if (this.ctx.state === "suspended") this.ctx.resume();
			return this.ctx;
		} catch {
			return null;
		}
	}
	start() {
		const c = this.ensureCtx();
		if (!c || this.playing) return;
		this.playing = true;
		this.step = 0;
		this.nextTime = c.currentTime + .08;
		this.timer = window.setInterval(() => this.schedule(), 25);
	}
	stop() {
		this.playing = false;
		if (this.timer !== null) {
			window.clearInterval(this.timer);
			this.timer = null;
		}
	}
	get isPlaying() {
		return this.playing;
	}
	stepDur() {
		return 30 / this.beat.bpm;
	}
	schedule() {
		const c = this.ctx;
		const bus = this.musicBus;
		if (!c || !bus || !this.playing) return;
		while (this.nextTime < c.currentTime + .12) {
			if (this.pendingIntensity && this.step % STEPS_PER_BAR === 0) {
				this.beat = generateBeat(this.beat.seed, this.pendingIntensity);
				this.pendingIntensity = null;
			}
			const t = this.nextTime + (this.step % 2 === 1 ? this.stepDur() * this.beat.swing : 0);
			this.playStep(c, bus, this.step, t);
			this.nextTime += this.stepDur();
			this.step = (this.step + 1) % STEPS;
		}
	}
	playStep(c, bus, step, t) {
		const b = this.beat;
		const e = b.energy;
		if (b.kick.includes(step)) kickVoice(c, bus, t, .5 + e * .3);
		if (b.snare.includes(step)) snareVoice(c, bus, t, .32 + e * .2);
		if (b.clap.includes(step)) noiseBurst(c, bus, t + .012, .09, .14, "bandpass", 2400, 1.4);
		if (b.hat.includes(step)) hatVoice(c, bus, t, .07 + e * .05, false);
		if (b.openHat.includes(step)) hatVoice(c, bus, t, .1, true);
		for (const n of b.bass) if (n.step === step) bass808(c, bus, t, n.midi, this.stepDur() * n.len, .34 + e * .2);
		for (const n of b.melody) if (n.step === step) pluckVoice(c, bus, t, n.midi, this.stepDur() * n.len, .05 + n.vel * .06);
		if (step % STEPS_PER_BAR === 0 && b.chords.length) {
			const bar = Math.floor(step / STEPS_PER_BAR) % b.chords.length;
			for (const midi of b.chords[bar]) padVoice(c, bus, t, midi, this.stepDur() * STEPS_PER_BAR, .028);
		}
	}
	/** Duck music briefly (e.g. under dialogue). */
	duck(amount = .35, ms = 400) {
		const bus = this.musicBus;
		const c = this.ctx;
		if (!bus || !c) return;
		const t = c.currentTime;
		bus.gain.cancelScheduledValues(t);
		bus.gain.setValueAtTime(bus.gain.value, t);
		bus.gain.linearRampToValueAtTime(amount, t + .08);
		bus.gain.linearRampToValueAtTime(.8, t + ms / 1e3);
	}
};
/** Singleton for the game. */
var engine = null;
function getMusic(seed = "ashlane") {
	if (!engine) engine = new MusicEngine(seed, "calm");
	return engine;
}
/**
* combat-sfx.ts — Procedural combat sound effects for AshLane.
*
* All synthesized with the Web Audio API. Zero audio files.
* Complements src/game3d/menu-sfx.ts (UI sounds); this file covers
* fight sounds: impacts, blocks, whooshes, knockdowns, crowd.
*
* Voice recipes use standard synthesis building blocks:
*  - impact thump: sine pitch-bend (150→55 Hz), cf. LoopSmith kick
*  - snap/crack: filtered noise burst
*  - whoosh: band-passed noise sweep
*  - crowd bed: looped filtered noise with slow LFO
*/
var ctx$1 = null;
var enabled$1 = true;
var crowdNodes = null;
function ac$1() {
	if (!enabled$1) return null;
	try {
		if (!ctx$1) ctx$1 = new (window.AudioContext || window.webkitAudioContext)();
		if (ctx$1.state === "suspended") ctx$1.resume();
		return ctx$1;
	} catch {
		return null;
	}
}
/** Short low thump: the "body" of a punch/kick. */
function thump(t, amp, startHz = 160, endHz = 50, dur = .14) {
	const c = ac$1();
	if (!c) return;
	const o = c.createOscillator();
	const g = c.createGain();
	o.frequency.setValueAtTime(startHz, t);
	o.frequency.exponentialRampToValueAtTime(endHz, t + dur * .7);
	g.gain.setValueAtTime(amp, t);
	g.gain.exponentialRampToValueAtTime(1e-4, t + dur);
	o.connect(g).connect(c.destination);
	o.start(t);
	o.stop(t + dur + .02);
}
/** Filtered noise snap: the "crack" of glove on jaw. */
function snap(t, amp, freq = 2800, dur = .07, type = "bandpass") {
	const c = ac$1();
	if (!c) return;
	const len = Math.max(1, Math.floor(c.sampleRate * dur));
	const buf = c.createBuffer(1, len, c.sampleRate);
	const d = buf.getChannelData(0);
	for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
	const src = c.createBufferSource();
	src.buffer = buf;
	const f = c.createBiquadFilter();
	f.type = type;
	f.frequency.value = freq;
	f.Q.value = 1.2;
	const g = c.createGain();
	g.gain.setValueAtTime(amp, t);
	g.gain.exponentialRampToValueAtTime(1e-4, t + dur);
	src.connect(f).connect(g).connect(c.destination);
	src.start(t);
}
/** Punch impact: snap + thump. `heavy` for haymakers/finishers. */
function sfxPunch(heavy = false) {
	const c = ac$1();
	if (!c) return;
	const t = c.currentTime;
	snap(t, heavy ? .5 : .32, heavy ? 2200 : 2800, heavy ? .1 : .07);
	thump(t, heavy ? .55 : .34, heavy ? 130 : 160, 48, heavy ? .2 : .14);
}
/** Kick impact: deeper thump, duller snap. */
function sfxKick(heavy = false) {
	const c = ac$1();
	if (!c) return;
	const t = c.currentTime;
	snap(t, heavy ? .4 : .26, 1400, .09, "lowpass");
	thump(t, heavy ? .6 : .4, 110, 42, heavy ? .24 : .16);
}
/** Knockout bell + impact. */
function sfxKnockout() {
	sfxPunch(true);
	const c = ac$1();
	if (!c) return;
	const t = c.currentTime + .05;
	for (const [mult, amp] of [
		[1, .22],
		[2.76, .1],
		[5.4, .05]
	]) {
		const o = c.createOscillator();
		const g = c.createGain();
		o.type = "sine";
		o.frequency.value = 880 * mult;
		g.gain.setValueAtTime(amp, t);
		g.gain.exponentialRampToValueAtTime(1e-4, t + 1.1);
		o.connect(g).connect(c.destination);
		o.start(t);
		o.stop(t + 1.15);
	}
}
/** Crowd ambience bed: looped brown-ish noise, swells with excitement 0..1. */
function startCrowd(excitement = .4) {
	const c = ac$1();
	if (!c || crowdNodes) return;
	const len = c.sampleRate * 2;
	const buf = c.createBuffer(1, len, c.sampleRate);
	const d = buf.getChannelData(0);
	let last = 0;
	for (let i = 0; i < len; i++) {
		const white = Math.random() * 2 - 1;
		last = (last + .02 * white) / 1.02;
		d[i] = last * 3.2;
	}
	const src = c.createBufferSource();
	src.buffer = buf;
	src.loop = true;
	const f = c.createBiquadFilter();
	f.type = "bandpass";
	f.frequency.value = 900;
	f.Q.value = .6;
	const g = c.createGain();
	g.gain.value = .02 + excitement * .09;
	const lfo = c.createOscillator();
	lfo.frequency.value = .13;
	const lfoGain = c.createGain();
	lfoGain.gain.value = .012;
	lfo.connect(lfoGain).connect(g.gain);
	src.connect(f).connect(g).connect(c.destination);
	src.start();
	lfo.start();
	crowdNodes = {
		src,
		gain: g
	};
}
function stopCrowd() {
	if (!crowdNodes) return;
	try {
		crowdNodes.src.stop();
	} catch {}
	crowdNodes = null;
}
function buildTouchOverlay(parent, svcs, sim) {
	if (!window.matchMedia("(pointer: coarse)").matches) return;
	const t = svcs.touch;
	const s = touchScale(window.innerWidth);
	const layer = document.createElement("div");
	layer.style.cssText = `position:absolute;inset:0;pointer-events:none;z-index:20;touch-action:none;`;
	parent.style.position = "relative";
	parent.appendChild(layer);
	const stickBase = document.createElement("div");
	const R = 60 * s;
	stickBase.style.cssText = `position:absolute;left:16px;bottom:16px;width:${R * 2}px;height:${R * 2}px;border-radius:50%;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.25);pointer-events:auto;`;
	const knob = document.createElement("div");
	knob.style.cssText = `position:absolute;left:50%;top:50%;width:${R * .9}px;height:${R * .9}px;border-radius:50%;background:rgba(255,255,255,.28);transform:translate(-50%,-50%);`;
	stickBase.appendChild(knob);
	layer.appendChild(stickBase);
	let stickId = null;
	const setKnob = (dx, dy) => {
		knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
	};
	stickBase.addEventListener("touchstart", (e) => {
		e.preventDefault();
		const tc = e.changedTouches[0];
		stickId = tc.identifier;
		const r = stickBase.getBoundingClientRect();
		const dx = tc.clientX - (r.left + r.width / 2);
		const dy = tc.clientY - (r.top + r.height / 2);
		stickMove(t, stickId, dx, dy, R);
		setKnob(t.move.x * R * .6, t.move.y * R * .6);
	}, { passive: false });
	stickBase.addEventListener("touchmove", (e) => {
		e.preventDefault();
		for (const tc of Array.from(e.changedTouches)) {
			if (tc.identifier !== stickId) continue;
			const r = stickBase.getBoundingClientRect();
			const dx = tc.clientX - (r.left + r.width / 2);
			const dy = tc.clientY - (r.top + r.height / 2);
			stickMove(t, stickId, dx, dy, R);
			setKnob(t.move.x * R * .6, t.move.y * R * .6);
		}
	}, { passive: false });
	const endStick = (e) => {
		for (const tc of Array.from(e.changedTouches)) if (tc.identifier === stickId) {
			stickRelease(t, stickId);
			stickId = null;
			setKnob(0, 0);
		}
	};
	stickBase.addEventListener("touchend", endStick);
	stickBase.addEventListener("touchcancel", endStick);
	let camId = null;
	let camX = 0;
	layer.addEventListener("touchstart", (e) => {
		for (const tc of Array.from(e.changedTouches)) if (tc.clientX > window.innerWidth * .45 && camId === null) {
			camId = tc.identifier;
			camX = tc.clientX;
		}
	}, { passive: true });
	layer.addEventListener("touchmove", (e) => {
		for (const tc of Array.from(e.changedTouches)) if (tc.identifier === camId) {
			t.camDX += tc.clientX - camX;
			camX = tc.clientX;
		}
	}, { passive: true });
	const endCam = (e) => {
		for (const tc of Array.from(e.changedTouches)) if (tc.identifier === camId) camId = null;
	};
	layer.addEventListener("touchend", endCam);
	layer.addEventListener("touchcancel", endCam);
	const btnSize = 56 * s;
	const gap = 8 * s;
	const cluster = document.createElement("div");
	cluster.style.cssText = `position:absolute;right:16px;bottom:16px;pointer-events:auto;`;
	layer.appendChild(cluster);
	for (const [name, lay] of Object.entries(BUTTON_LAYOUT)) {
		const b = document.createElement("div");
		b.textContent = lay.label;
		b.style.cssText = `position:absolute;width:${btnSize}px;height:${btnSize}px;border-radius:50%;background:rgba(20,20,24,.55);border:1px solid rgba(255,255,255,.35);color:#fff;display:flex;align-items:center;justify-content:center;font:700 ${13 * s}px system-ui;user-select:none;-webkit-user-select:none;left:${lay.col * (btnSize + gap)}px;top:${lay.row * (btnSize + gap)}px;`;
		const key = name;
		b.addEventListener("touchstart", (e) => {
			e.preventDefault();
			e.stopPropagation();
			t.buttons[key] = true;
			b.style.background = "rgba(240,180,41,.6)";
		}, { passive: false });
		const off = (e) => {
			e.preventDefault();
			t.buttons[key] = false;
			b.style.background = "rgba(20,20,24,.55)";
		};
		b.addEventListener("touchend", off);
		b.addEventListener("touchcancel", off);
		cluster.appendChild(b);
	}
}
function createDialogueUI(svcs) {
	const panel = document.createElement("div");
	panel.style.cssText = `position:absolute;left:50%;bottom:24px;transform:translateX(-50%);width:min(560px,92%);background:rgba(12,12,16,.92);border:1px solid rgba(240,180,41,.5);border-radius:10px;padding:14px 16px;color:#f3e6d4;font:15px/1.45 system-ui;display:none;z-index:30;cursor:pointer;`;
	document.body.appendChild(panel);
	let current = null;
	function render(ev) {
		current = ev;
		if (ev.kind === "line") {
			panel.innerHTML = `<div style="color:#f0b429;font-weight:700;margin-bottom:4px">${esc(ev.speaker)}</div><div>${esc(ev.text)}</div><div style="opacity:.5;font-size:12px;margin-top:8px">tap / Enter ▸</div>`;
			panel.style.display = "block";
		} else if (ev.kind === "options") {
			panel.innerHTML = ev.options.map((o, i) => `<div data-i="${i}" style="padding:8px;border:1px solid rgba(255,255,255,.25);border-radius:6px;margin-top:6px;cursor:pointer">▸ ${esc(o.label)}</div>`).join("");
			panel.style.display = "block";
			panel.querySelectorAll("[data-i]").forEach((el) => {
				el.addEventListener("click", (e) => {
					e.stopPropagation();
					render(chooseDialogue(svcs, Number(el.dataset.i)));
				});
			});
		} else if (ev.kind === "command") render(advanceDialogue(svcs));
		else {
			panel.style.display = "none";
			current = null;
		}
	}
	function esc(s) {
		return s.replace(/[&<>"]/g, (c) => ({
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			"\"": "&quot;"
		})[c]);
	}
	panel.addEventListener("click", () => {
		if (current?.kind === "line") render(advanceDialogue(svcs));
	});
	window.addEventListener("keydown", (e) => {
		if (panel.style.display !== "block") return;
		if (e.code === "Enter" || e.code === "Space") {
			if (current?.kind === "line") {
				e.preventDefault();
				render(advanceDialogue(svcs));
			}
		}
	});
	return {
		show: (ev) => render(ev),
		sync: () => {
			if (!svcs.dialogue && panel.style.display !== "none") {
				panel.style.display = "none";
				current = null;
			}
		},
		visible: () => panel.style.display !== "none"
	};
}
function createMinigameUI(svcs) {
	const modal = document.createElement("div");
	modal.style.cssText = `position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.72);z-index:40;`;
	document.body.appendChild(modal);
	const card = document.createElement("div");
	card.style.cssText = `background:#141419;border:1px solid rgba(240,180,41,.5);border-radius:12px;padding:20px;color:#f3e6d4;font:15px system-ui;min-width:min(420px,92vw);text-align:center;`;
	modal.appendChild(card);
	let poolTimer = 0;
	function close() {
		modal.style.display = "none";
		if (poolTimer) {
			clearInterval(poolTimer);
			poolTimer = 0;
		}
	}
	modal.addEventListener("click", (e) => {
		if (e.target === modal) close();
	});
	function header(title) {
		return `<div style="font-weight:800;color:#f0b429;margin-bottom:12px;font-size:18px">${title}</div>`;
	}
	function doneBtn() {
		return `<button id="mg-done" style="margin-top:14px;padding:8px 22px;border-radius:8px;border:1px solid #f0b429;background:transparent;color:#f0b429;font-weight:700;cursor:pointer">Done</button>`;
	}
	function wireDone() {
		card.querySelector("#mg-done")?.addEventListener("click", close);
	}
	function openDartsUI() {
		openDarts(svcs);
		let score = 501;
		let dartsThrown = 0;
		const render = (msg) => {
			card.innerHTML = header("🎯 Darts — 501") + `<div style="font-size:13px;opacity:.75;margin-bottom:8px">Score left: <b style="font-size:22px;color:#fff">${score}</b></div><div style="min-height:22px;margin-bottom:8px">${msg}</div><button id="mg-throw" style="padding:10px 26px;border-radius:8px;background:#f0b429;border:none;font-weight:800;cursor:pointer">Throw dart</button><br/>` + doneBtn();
			wireDone();
			card.querySelector("#mg-throw")?.addEventListener("click", () => {
				const r = throwDart(.55, 20, 2);
				const pts = r.segment * (r.ring === 3 ? 3 : r.ring === 2 ? 2 : 1);
				score = Math.max(0, score - pts);
				dartsThrown++;
				let m = `You hit ${r.segment} ×${r.ring === 3 ? 3 : r.ring === 2 ? 2 : 1} = <b>${pts}</b>`;
				if (dartsThrown % 3 === 0) {
					const cpu = cpuDartsVisit(.5);
					m += `<br/>CPU scores ${cpu}`;
				}
				if (score === 0) m = `<b style="color:#f0b429">🏆 You win!</b>`;
				render(m);
			});
		};
		render("Three darts per visit. First to exactly 0 wins.");
	}
	function openBlackjackUI() {
		const st = openBlackjack(svcs);
		const fmt = (h) => h.map((c) => c.rank).join(" ");
		const render = (msg, over) => {
			card.innerHTML = header("🂡 Blackjack") + `<div style="margin-bottom:6px">Dealer: ${fmt(st.dealer)} (${handValue(st.dealer)})</div><div style="margin-bottom:8px">You: <b>${fmt(st.player)}</b> (${handValue(st.player)})</div><div style="min-height:22px;margin-bottom:8px">${msg}</div>` + (over ? "" : `<button id="mg-hit" style="padding:10px 22px;border-radius:8px;background:#f0b429;border:none;font-weight:800;cursor:pointer;margin-right:8px">Hit</button>
        <button id="mg-stand" style="padding:10px 22px;border-radius:8px;background:transparent;border:1px solid #f0b429;color:#f0b429;font-weight:800;cursor:pointer">Stand</button><br/>`) + doneBtn();
			wireDone();
			if (!over) {
				card.querySelector("#mg-hit")?.addEventListener("click", () => {
					bjHit(st);
					const v = handValue(st.player);
					if (v > 21) render(`Bust at ${v}. Dealer takes it.`, true);
					else if (v === 21) render(`Blackjack!`, true);
					else render("", false);
				});
				card.querySelector("#mg-stand")?.addEventListener("click", () => {
					bjStand(st);
					const pv = handValue(st.player), dv = handValue(st.dealer);
					const msg = dv > 21 || pv > dv ? `<b style="color:#f0b429">You win ${pv} vs ${dv}!</b>` : pv === dv ? `Push at ${pv}.` : `Dealer wins ${dv} vs ${pv}.`;
					render(msg, true);
				});
			}
		};
		render("Beat the dealer without going over 21.", false);
	}
	function openPoolUI() {
		const balls = openPool(svcs);
		card.innerHTML = header("🎱 Pool") + "<div id=\"mg-table\" style=\"position:relative;width:340px;height:170px;background:#0e5c3f;border-radius:8px;margin:0 auto;overflow:hidden\"></div><div style=\"margin:10px 0;font-size:13px;opacity:.75\">Tap the table to shoot the cue ball</div>" + doneBtn();
		wireDone();
		const table = card.querySelector("#mg-table");
		const dots = [];
		balls.forEach((b, i) => {
			const d = document.createElement("div");
			d.style.cssText = `position:absolute;width:12px;height:12px;border-radius:50%;background:${i === 0 ? "#fff" : "#e4572e"};transform:translate(-50%,-50%);`;
			table.appendChild(d);
			dots.push(d);
		});
		const draw = () => {
			balls.forEach((b, i) => {
				dots[i].style.left = `${b.x / 100 * 340}px`;
				dots[i].style.top = `${b.y / 50 * 170}px`;
				dots[i].style.display = b.sunk ? "none" : "block";
			});
		};
		draw();
		table.addEventListener("click", (e) => {
			const r = table.getBoundingClientRect();
			const tx = (e.clientX - r.left) / 340 * 100;
			const ty = (e.clientY - r.top) / 170 * 50;
			const cue = balls[0];
			if (cue.sunk) return;
			const dx = tx - cue.x, dy = ty - cue.y;
			const m = Math.hypot(dx, dy) || 1;
			cue.vx = dx / m * 60;
			cue.vy = dy / m * 60;
		});
		poolTimer = window.setInterval(() => {
			stepPool(balls, 1 / 30);
			if (document.body.contains(table)) draw();
			else {
				clearInterval(poolTimer);
				poolTimer = 0;
			}
		}, 33);
	}
	return {
		open: (kind) => {
			modal.style.display = "flex";
			if (kind === "darts") openDartsUI();
			else if (kind === "blackjack") openBlackjackUI();
			else openPoolUI();
		},
		close,
		isOpen: () => modal.style.display !== "none"
	};
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
	"KeyX",
	"KeyF",
	"KeyC"
]);
function mount(canvas, push) {
	const sim = createSim(loadTune());
	sim.clearedMission = loadCleared();
	sim.purse = loadPurse();
	sim.xp = loadXp();
	sim.level = 1 + Math.floor(sim.xp / 100);
	const ranked = sim.bodies[0];
	if (ranked && sim.level > 1) {
		ranked.maxHp += (sim.level - 1) * 8;
		ranked.hp = ranked.maxHp;
	}
	const fighter = loadFighter();
	if (fighter) {
		sim.style = fighter.style;
		sim.martial = fighter.martial;
		sim.stance = fighter.stance;
		applyFighter(fighter.style, fighter.martial, fighter.slots);
		applyStance(fighter.stance);
	}
	const view = createView(canvas);
	sim.services = createServices();
	const svcs = sim.services;
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
		dash: false,
		use: false
	};
	const input = {
		x: 0,
		y: 0,
		attack: false,
		grab: false,
		blast: false,
		jump: false,
		dash: false,
		use: false
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
	buildTouchOverlay(parent, svcs, sim);
	const dlg = createDialogueUI(svcs);
	const minigames = createMinigameUI(svcs);
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
		consumeEncounter(sim, svcs);
		dlg.sync();
		syncQuestBrief(sim, svcs, dlg);
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
		const heard = /* @__PURE__ */ new Set();
		for (const name of names) {
			if (heard.has(name)) continue;
			heard.add(name);
			try {
				if (name === "hit" || name === "hurt") {
					sfxPunch(name === "hit");
					continue;
				}
				if (name === "kick") {
					sfxKick();
					continue;
				}
				if (name === "ko" || name === "knockout") {
					sfxKnockout();
					continue;
				}
			} catch {}
			if (!audio || audio.state !== "running") continue;
			blip$1(audio, name);
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
		setBuild(id) {
			sim.build = id;
			saveShape(sim);
			push(snapshot(sim));
		},
		setCrowd(id) {
			sim.crowd = id;
			saveShape(sim);
			push(snapshot(sim));
		},
		setShape(partial) {
			const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
			if (partial.height !== void 0) sim.height = clamp(partial.height, .86, 1.18);
			if (partial.bulk !== void 0) sim.bulk = clamp(partial.bulk, .8, 1.25);
			if (partial.head !== void 0) sim.head = clamp(partial.head, .75, 1.3);
			if (partial.leg !== void 0) sim.leg = clamp(partial.leg, .82, 1.22);
			if (partial.shoulder !== void 0) sim.shoulder = clamp(partial.shoulder, .82, 1.22);
			saveShape(sim);
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
		setWho(id) {
			const row = fighterById(id);
			sim.who = row.name;
			sim.bio = row.bio;
			sim.cast = row.attires[0]?.file ?? "";
			sim.martial = row.martial;
			const p = sim.bodies[0];
			if (p) p.name = row.name;
			equipStyle(sim.style);
			applyMartial(row.martial);
			applyStance(sim.stance);
			saveFighter(sim.style, sim.martial, sim.stance);
			push(snapshot(sim));
		},
		setAttire(file) {
			sim.cast = file;
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
			try {
				const music = getMusic();
				music.start();
				music.setIntensity("hype");
				startCrowd(.6);
			} catch {}
			push(snapshot(sim));
		},
		startStory(index) {
			unlock();
			startStory(sim, index);
			try {
				const music = getMusic();
				music.start();
				music.setIntensity("tense");
				startCrowd(.4);
			} catch {}
			push(snapshot(sim));
		},
		quit() {
			sim.running = false;
			sim.paused = false;
			sim.story = false;
			sim.bout = "off";
			try {
				getMusic().stop();
				stopCrowd();
			} catch {}
			push(snapshot(sim));
		},
		openMinigame(kind) {
			minigames.open(kind);
		},
		getReplay() {
			return replayJSON(svcs, "manual-export");
		},
		say(script, node) {
			dlg.show(openDialogue(svcs, script, node ?? "Start"));
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
/**
* Wired: attention encounters (attention.ts) spawn into the world.
* The director queues thugs / scouts / named-enforcer hunts; this consumes
* the queue and drops the bodies near the player via sim.addAttentionGrunt.
*/
function consumeEncounter(sim, svcs) {
	const enc = svcs.pendingEncounter;
	if (!enc) return;
	const p = sim.bodies[0];
	if (!p) return;
	svcs.pendingEncounter = null;
	const ring = (n, r, arch) => {
		for (let i = 0; i < n; i++) {
			const a = i / n * Math.PI * 2 + Math.random() * .5;
			addAttentionGrunt(sim, p.x + Math.cos(a) * r, p.z + Math.sin(a) * r, arch);
		}
	};
	if (enc.kind === "thugs") {
		ring(enc.count, 22, "hood");
		sim.banner = "Street thugs eyeing you";
		sim.bannerT = 1.6;
	} else if (enc.kind === "scouts") ring(enc.count, 16, "hood");
	else {
		const a = Math.random() * Math.PI * 2;
		addAttentionGrunt(sim, p.x + Math.cos(a) * 14, p.z + Math.sin(a) * 14, "hex", enc.enforcer.name, 160 + enc.enforcer.level * 30);
		for (let i = 0; i < enc.backup; i++) {
			const b2 = Math.random() * Math.PI * 2;
			addAttentionGrunt(sim, p.x + Math.cos(b2) * 18, p.z + Math.sin(b2) * 18, "hood");
		}
	}
}
/**
* Wired: quest step briefs (quests.ts) play as dialogue (dialogue.ts).
* A step's `brief` is an inline Yarn-style script shown once per step.
*/
function syncQuestBrief(sim, svcs, dlg) {
	const q = svcs.quest;
	const pr = svcs.questProgress;
	if (!q || !pr || pr.complete) return;
	if (svcs.briefStep === pr.stepIndex) return;
	svcs.briefStep = pr.stepIndex;
	const step = q.steps[pr.stepIndex];
	if (step?.brief && !dlg.visible()) dlg.show(openDialogue(svcs, step.brief));
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
	input.use = btns.use || keys.has("KeyF") || !!pad?.buttons[4]?.pressed;
	input.counter = keys.has("KeyC") || !!pad?.buttons[6]?.pressed;
	const svcs = sim.services;
	if (svcs) {
		const ti = touchInput(svcs);
		if (svcs.touch.move.active) {
			input.x = ti.x;
			input.y = ti.y;
		}
		input.attack = input.attack || ti.attack;
		input.grab = input.grab || ti.grab;
		input.blast = input.blast || ti.blast;
		input.jump = input.jump || ti.jump;
		input.dash = input.dash || ti.dash;
		input.use = input.use || ti.use;
		input.lock = input.lock || ti.lock;
		input.counter = input.counter || ti.counter;
		if (svcs.touch.camDX !== 0 || svcs.touch.camDY !== 0) {
			sim.orbit -= svcs.touch.camDX * .005;
			svcs.touch.camDX = 0;
			svcs.touch.camDY = 0;
		}
	}
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
function blip$1(audio, name) {
	const now = audio.currentTime;
	const impact = name === "hit" || name === "hurt" || name === "slam" || name === "throw" || name === "swing" || name === "crumple" || name === "grab";
	if (impact) {
		const dur = name === "slam" || name === "throw" ? .16 : .07;
		const count = Math.floor(audio.sampleRate * dur);
		const buf = audio.createBuffer(1, count, audio.sampleRate);
		const data = buf.getChannelData(0);
		for (let i = 0; i < count; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / count);
		const src = audio.createBufferSource();
		src.buffer = buf;
		const filter = audio.createBiquadFilter();
		filter.type = "lowpass";
		filter.frequency.value = name === "slam" || name === "throw" ? 280 : name === "swing" ? 1400 : 700;
		const g = audio.createGain();
		g.gain.setValueAtTime(name === "swing" ? .05 : .12, now);
		g.gain.exponentialRampToValueAtTime(.001, now + dur);
		src.connect(filter);
		filter.connect(g);
		g.connect(audio.destination);
		src.start(now);
		if (name === "swing" || name === "grab") return;
	}
	const o = audio.createOscillator();
	const tone = audio.createGain();
	const spec = {
		swing: [
			220,
			.07,
			"square"
		],
		hit: [
			140,
			.06,
			"triangle"
		],
		hurt: [
			90,
			.12,
			"sawtooth"
		],
		grab: [
			140,
			.1,
			"square"
		],
		throw: [
			70,
			.14,
			"sawtooth"
		],
		slam: [
			55,
			.16,
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
			80,
			.1,
			"triangle"
		],
		land: [
			120,
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
	tone.gain.setValueAtTime(impact ? .04 : .08, now);
	tone.gain.exponentialRampToValueAtTime(.001, now + spec[1]);
	o.connect(tone);
	tone.connect(audio.destination);
	o.start(now);
	o.stop(now + spec[1] + .02);
}
var ctx = null;
var enabled = true;
function ac() {
	if (!enabled) return null;
	try {
		if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
		if (ctx.state === "suspended") ctx.resume();
		return ctx;
	} catch {
		return null;
	}
}
function blip(freq, dur, type, gain, slideTo) {
	const c = ac();
	if (!c) return;
	const t = c.currentTime;
	const o = c.createOscillator();
	const g = c.createGain();
	o.type = type;
	o.frequency.setValueAtTime(freq, t);
	if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
	g.gain.setValueAtTime(gain, t);
	g.gain.exponentialRampToValueAtTime(1e-4, t + dur);
	o.connect(g).connect(c.destination);
	o.start(t);
	o.stop(t + dur + .02);
}
function noise(dur, gain, filterFreq, type = "lowpass") {
	const c = ac();
	if (!c) return;
	const t = c.currentTime;
	const len = Math.max(1, Math.floor(c.sampleRate * dur));
	const buf = c.createBuffer(1, len, c.sampleRate);
	const d = buf.getChannelData(0);
	for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
	const src = c.createBufferSource();
	src.buffer = buf;
	const f = c.createBiquadFilter();
	f.type = type;
	f.frequency.value = filterFreq;
	const g = c.createGain();
	g.gain.setValueAtTime(gain, t);
	g.gain.exponentialRampToValueAtTime(1e-4, t + dur);
	src.connect(f).connect(g).connect(c.destination);
	src.start(t);
}
/** Hover tick — short high blip. */
function sfxHover() {
	blip(880, .05, "square", .045, 1180);
}
/** Select — punchy confirm thud. */
function sfxSelect() {
	blip(196, .12, "triangle", .16, 98);
	noise(.09, .1, 900);
}
/** Back — tape rewind whoosh. */
function sfxBack() {
	blip(520, .14, "sawtooth", .06, 180);
	noise(.12, .05, 2400, "highpass");
}
/** Locked / error — dull buzz. */
function sfxLocked() {
	blip(140, .16, "sawtooth", .09, 110);
}
/** Round start — fight bell-ish metallic hit. */
function sfxFight() {
	blip(1244, .5, "triangle", .14);
	blip(1866, .35, "sine", .08);
	noise(.2, .06, 5200, "highpass");
}
/** Attach hover+click sounds to every button inside a container. Call once per menu mount. */
function wireMenuSfx(root) {
	if (!root) return;
	root.querySelectorAll("button:not([data-sfx])").forEach((el) => {
		el.setAttribute("data-sfx", "1");
		el.addEventListener("mouseenter", sfxHover, { passive: true });
		el.addEventListener("click", () => {
			if (el.disabled) sfxLocked();
			else sfxSelect();
		});
	});
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
	const [pendingJob, setPendingJob] = (0, import_react.useState)(null);
	const [pendingWho, setPendingWho] = (0, import_react.useState)(null);
	const [suiteWho, setSuiteWho] = (0, import_react.useState)(null);
	const [menu, setMenu] = (0, import_react.useState)("main");
	const [arena, setArena] = (0, import_react.useState)("ward");
	const [slot, setSlot] = (0, import_react.useState)("jab");
	const [clip, setClip] = (0, import_react.useState)("Unarmed_Melee_Attack_Punch_A");
	const seeded = (0, import_react.useRef)(false);
	const sheetRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		wireMenuSfx(sheetRef.current);
	}, [
		menu,
		pendingJob,
		suite
	]);
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
	function leave() {
		sfxBack();
		setSuite(false);
		setPendingJob(null);
		setPendingWho(null);
		setSuiteWho(null);
		setMenu("main");
		api.current?.quit();
	}
	function walkIn(pick) {
		if (pendingJob === null) return;
		sfxFight();
		api.current?.setWho(pick.id);
		api.current?.setAttire(pick.file);
		api.current?.startStory(pendingJob);
		setPendingJob(null);
		setPendingWho(null);
		setMenu("main");
	}
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
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "al-hazard-thin h-1.5 shrink-0",
				"aria-hidden": "true"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex shrink-0 items-center justify-between gap-3 border-b border-line bg-asphalt/60 px-4 py-2.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "al-kicker al-flicker",
					children: "Ashlane"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-headline text-xl uppercase leading-none tracking-wide text-cream",
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
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-display text-[10px] leading-tight text-cream-dim",
							children: [
								"H ",
								Math.round(hud.headDmg),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
								"C ",
								Math.round(hud.chestDmg),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
								"L ",
								Math.round(hud.legsDmg)
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "al-chip",
							onClick: () => api.current?.pause(true),
							children: "Pause"
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "max-w-48 text-right font-display text-[10px] uppercase tracking-widest text-cream-dim",
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
							className: "al-banner pointer-events-none absolute inset-x-0 top-4 text-center text-xl",
							children: hud.banner
						}) : null,
						playing && hud.face ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "pointer-events-none absolute inset-x-0 top-12 text-center font-display text-xs uppercase tracking-widest text-cream",
							children: hud.face
						}) : null,
						hud.combo > 1 && playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "al-title pointer-events-none absolute right-4 top-4 text-2xl text-ember",
							children: [hud.combo, " HIT"]
						}) : null,
						playing && hud.flow > 8 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "pointer-events-none absolute right-4 top-12 al-hud-chip",
							children: ["FLOW ", hud.flow]
						}) : null,
						playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "pointer-events-none absolute bottom-3 left-4 max-w-[70%] text-sm text-cream-dim",
							children: objective(hud)
						}) : null,
						!hud.running ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							ref: sheetRef,
							className: "sheet veil al-sheet al-concrete",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "al-sheet-inner mx-auto w-full max-w-md px-4 py-6",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "al-kicker",
										children: "Green Harbor · street circuit"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "al-title al-title-xl al-spray mt-1",
										children: "Ashlane"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "al-rip mt-3",
										"aria-hidden": "true"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-3 text-sm leading-relaxed text-cream-dim",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "font-headline uppercase text-brass",
											children: [MISSIONS.length, " jobs."]
										}), " Hold stick back to guard. Lows and launchers break it. Stick sideways and jump is an au. Throw them into a wall, then hit for a wall follow. Hold a direction as you land to tech. Spin stays on L."]
									}),
									menu === "main" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-5 flex flex-col gap-2.5",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "al-btn al-btn-primary al-pulse al-rise",
												onClick: () => setMenu("story"),
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Story — take the jobs" })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "grid grid-cols-2 gap-2.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													className: "al-btn al-rise al-rise-1",
													onClick: () => api.current?.startBout("exhibit", arena),
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Exhibition" })
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													className: "al-btn al-rise al-rise-1",
													onClick: () => api.current?.startBout("practice", arena),
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Practice" })
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "al-section",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "al-section-title",
													children: "Walk the ward"
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "al-btn al-rise al-rise-2",
												onClick: () => {
													api.current?.setStage("ward");
													begin("roam");
												},
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Cinder Ward ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", {
													className: "not-italic text-cream-dim",
													children: "— the plaza"
												})] })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "grid grid-cols-3 gap-2.5",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														type: "button",
														className: "al-chip al-rise al-rise-2",
														onClick: () => {
															api.current?.setStage("dock");
															begin("roam");
														},
														children: "Dock"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														type: "button",
														className: "al-chip al-rise al-rise-2",
														onClick: () => {
															api.current?.setStage("pit");
															begin("roam");
														},
														children: "Pit"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														type: "button",
														className: "al-chip al-rise al-rise-2",
														onClick: () => {
															api.current?.setStage("high");
															begin("platform");
														},
														children: "High line"
													})
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "grid grid-cols-3 gap-2.5",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														type: "button",
														className: "al-chip al-rise al-rise-3",
														onClick: () => setMenu("arenas"),
														children: "Arenas"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														type: "button",
														className: "al-chip al-rise al-rise-3",
														onClick: () => setMenu("story"),
														children: "Jobs"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														type: "button",
														className: "al-chip al-rise al-rise-3",
														onClick: () => setMenu("style"),
														children: "Customize"
													})
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "grid grid-cols-2 gap-2.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													className: "al-btn al-rise al-rise-4",
													onClick: () => begin("belt"),
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Scrap street" })
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													className: "al-btn al-rise al-rise-4",
													onClick: () => begin("platform"),
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Coil scaffolds" })
												})]
											})
										]
									}) : null,
									menu === "arenas" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-4 flex flex-col gap-2.5",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "al-section",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "al-section-title",
													children: "Pick a block"
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-sm text-cream-dim",
												children: "Exhibition and Practice use a ring in the middle of it. Ward still walks the whole lane."
											}),
											ARENAS.map((place, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												"data-on": arena === place.id ? "1" : void 0,
												className: `al-card al-rise al-rise-${Math.min(i + 1, 5)}`,
												onClick: () => setArena(place.id),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "al-card-title",
													children: [place.label, arena === place.id ? " — locked in" : ""]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "al-card-sub",
													children: place.note
												})]
											}, place.id)),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "al-btn al-btn-primary",
												onClick: () => api.current?.startBout("exhibit", arena),
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Exhibition here" })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "al-btn",
												onClick: () => api.current?.startBout("practice", arena),
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Practice here" })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "al-btn",
												onClick: () => {
													api.current?.setStage(arena);
													begin(arena === "high" ? "platform" : "roam");
												},
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Walk it" })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "al-btn al-btn-ghost",
												onClick: () => {
													sfxBack();
													setMenu("main");
												},
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "← Back" })
											})
										]
									}) : null,
									menu === "story" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-4 flex flex-col gap-2.5",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "al-section",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "al-section-title",
													children: "The jobs"
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-sm text-cream-dim",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "al-stamp",
													children: [
														"Cleared ",
														hud.clearedMission,
														" / ",
														MISSIONS.length
													]
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-sm text-cream-dim",
												children: "Later jobs stay locked until the one before them is done."
											}),
											MISSIONS.map((mission, index) => {
												const locked = index > hud.clearedMission;
												const done = index < hud.clearedMission;
												return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
													type: "button",
													disabled: locked,
													"data-done": done ? "1" : void 0,
													"data-locked": locked ? "1" : void 0,
													className: "al-card al-mission",
													onClick: () => {
														setPendingWho(null);
														setPendingJob(index);
													},
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "al-mission-num",
															children: locked ? "✕" : mission.n
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "al-card-title",
															children: mission.title
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: "al-card-sub",
															children: [
																placeName(mission.drop),
																mission.drop !== mission.home ? ` to ${placeName(mission.home)}` : "",
																". ",
																ruleLabel(mission.rule),
																".",
																mission.waves > 1 ? " One extra crew." : ""
															]
														})
													]
												}, mission.n);
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "al-btn al-btn-ghost",
												onClick: () => {
													sfxBack();
													setMenu("main");
												},
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "← Back" })
											})
										]
									}) : null,
									menu === "style" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-4 flex flex-col gap-2.5",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "al-section",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "al-section-title",
													children: "Build"
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-sm text-cream-dim",
												children: "KayKit stays shorter, at ward size. Soldier, Second soldier, Shambler, and Second shambler are full-size CC0 bodies and stand taller. Limb bones are no longer stretched, so the skin stays in one piece. Sliders change height, width, and the head only."
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex gap-2.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													className: "al-chip flex-1",
													"data-on": hud.build === "chibi" ? "1" : void 0,
													onClick: () => api.current?.setBuild("chibi"),
													children: "Ward size"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													className: "al-chip flex-1",
													"data-on": hud.build === "full" ? "1" : void 0,
													onClick: () => api.current?.setBuild("full"),
													children: "Full size"
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex gap-2.5",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														type: "button",
														className: "al-chip flex-1",
														"data-on": hud.crowd === "mix" ? "1" : void 0,
														onClick: () => api.current?.setCrowd("mix"),
														children: "Mixed crowd"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														type: "button",
														className: "al-chip flex-1",
														"data-on": hud.crowd === "chibi" ? "1" : void 0,
														onClick: () => api.current?.setCrowd("chibi"),
														children: "Chibi crowd"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														type: "button",
														className: "al-chip flex-1",
														"data-on": hud.crowd === "full" ? "1" : void 0,
														onClick: () => api.current?.setCrowd("full"),
														children: "Full crowd"
													})
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
												className: "al-slider-label",
												children: ["Height", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													className: "mt-1 block w-full",
													type: "range",
													min: .86,
													max: 1.18,
													step: .02,
													value: hud.height,
													onChange: (event) => api.current?.setShape({ height: Number(event.target.value) })
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
												className: "al-slider-label",
												children: ["Bulk", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													className: "mt-1 block w-full",
													type: "range",
													min: .8,
													max: 1.25,
													step: .02,
													value: hud.bulk,
													onChange: (event) => api.current?.setShape({ bulk: Number(event.target.value) })
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
												className: "al-slider-label",
												children: ["Head", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													className: "mt-1 block w-full",
													type: "range",
													min: .75,
													max: 1.3,
													step: .02,
													value: hud.head,
													onChange: (event) => api.current?.setShape({ head: Number(event.target.value) })
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
												className: "al-slider-label",
												children: ["Legs", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													className: "mt-1 block w-full",
													type: "range",
													min: .82,
													max: 1.22,
													step: .02,
													value: hud.leg,
													onChange: (event) => api.current?.setShape({ leg: Number(event.target.value) })
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
												className: "al-slider-label",
												children: ["Shoulders", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													className: "mt-1 block w-full",
													type: "range",
													min: .82,
													max: 1.22,
													step: .02,
													value: hud.shoulder,
													onChange: (event) => api.current?.setShape({ shoulder: Number(event.target.value) })
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "al-section",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "al-section-title",
													children: "Fight kit"
												})
											}),
											STYLES.map((style) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												"data-on": hud.style === style.id ? "1" : void 0,
												className: "al-card",
												onClick: () => api.current?.setStyle(style.id),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "al-card-title",
													children: style.label
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "al-card-sub",
													children: style.note
												})]
											}, style.id)),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "al-section",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "al-section-title",
													children: "Who you are"
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "text-sm text-cream-dim",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-headline uppercase text-cream",
														children: hud.who
													}),
													". ",
													hud.bio
												]
											}),
											ROSTER.map((fighter) => {
												const on = hud.who === fighter.name;
												return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													"data-on": on ? "1" : void 0,
													className: "al-card",
													onClick: () => api.current?.setWho(fighter.id),
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "al-fighter",
														"data-on": on ? "1" : void 0,
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "al-portrait",
															"aria-hidden": "true",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: fighter.name.charAt(0) })
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "al-card-title",
																children: fighter.name
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "al-card-sub",
																children: fighter.bio
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "al-hud-chip mt-1 inline-block",
																children: fighter.martial
															})
														] })]
													})
												}, fighter.id);
											}),
											fighterByName(hud.who)?.attires.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "al-section",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "al-section-title",
													children: "Attire"
												})
											}) : null,
											fighterByName(hud.who)?.attires.map((attire) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												"data-on": hud.cast === attire.file ? "1" : void 0,
												className: "al-card",
												onClick: () => api.current?.setAttire(attire.file),
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "al-card-title",
													children: attire.label
												})
											}, attire.file)),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "al-section",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "al-section-title",
													children: "Fighting style"
												})
											}),
											MARTIAL.map((style) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												"data-on": hud.martial === style.id ? "1" : void 0,
												className: "al-card",
												onClick: () => api.current?.setMartial(style.id),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "al-card-title",
													children: style.label
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "al-card-sub",
													children: style.note
												})]
											}, style.id)),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "al-section",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "al-section-title",
													children: "Stance"
												})
											}),
											STANCES.map((stance) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												"data-on": hud.stance === stance.id ? "1" : void 0,
												className: "al-card",
												onClick: () => api.current?.setStance(stance.id),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "al-card-title",
													children: stance.label
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "al-card-sub",
													children: stance.note
												})]
											}, stance.id)),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "al-btn",
												onClick: () => setMenu("library"),
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Assign a single clip" })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "al-btn al-btn-ghost",
												onClick: () => {
													sfxBack();
													setMenu("main");
												},
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "← Back" })
											})
										]
									}) : null,
									menu === "library" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-4 flex flex-col gap-2.5",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "al-section",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "al-section-title",
													children: "Move lab"
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "text-sm text-cream-dim",
												children: [CLIP_NAMES.length, " clips on this skeleton, kept on every body. Bannon's Mixamo bank uses different bone names, so those files are not in the phone build. Assign one of these instead."]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
												className: "al-slider-label",
												children: ["Slot", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
													className: "al-select",
													value: slot,
													onChange: (e) => setSlot(e.target.value),
													children: ASSIGN_SLOTS.map((name) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: name }, name))
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
												className: "al-slider-label",
												children: ["Clip", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
													className: "al-select",
													value: clip,
													onChange: (e) => setClip(e.target.value),
													children: CLIP_NAMES.map((name) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: name }, name))
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "al-btn al-btn-primary",
												onClick: () => api.current?.assignClip(slot, clip),
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
													"Assign ",
													clip,
													" to ",
													slot
												] })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "al-btn al-btn-ghost",
												onClick: () => {
													sfxBack();
													setMenu("main");
												},
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "← Back" })
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
							className: "sheet veil al-sheet al-concrete",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "al-sheet-inner mx-auto w-full max-w-sm px-4 py-6",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "al-kicker",
										children: "Dress for the fight"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "al-title text-3xl mt-1",
										children: "Customize"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "al-rip mt-2",
										"aria-hidden": "true"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-2 text-sm text-cream-dim",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-headline uppercase text-cream",
											children: hud.who
										}), hud.cast ? ` · ${CAST_PICKS.find((pick) => pick.file === hud.cast)?.label ?? hud.cast}` : ""]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-3 flex flex-col gap-2.5",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex gap-2.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													className: "al-chip flex-1",
													"data-on": hud.build === "full" ? "1" : void 0,
													onClick: () => api.current?.setBuild("full"),
													children: "Full"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													className: "al-chip flex-1",
													"data-on": hud.build === "chibi" ? "1" : void 0,
													onClick: () => api.current?.setBuild("chibi"),
													children: "Ward size"
												})]
											}),
											suiteWho === null ? ROSTER.map((fighter) => {
												const on = hud.who === fighter.name;
												return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													"data-on": on ? "1" : void 0,
													className: "al-card",
													onClick: () => {
														setSuiteWho(fighter.id);
														api.current?.setWho(fighter.id);
													},
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "al-fighter",
														"data-on": on ? "1" : void 0,
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "al-portrait",
															"aria-hidden": "true",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: fighter.name.charAt(0) })
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "al-card-title",
															children: fighter.name
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: "al-card-sub",
															children: [
																fighter.attires.length,
																" look",
																fighter.attires.length === 1 ? "" : "s"
															]
														})] })]
													})
												}, fighter.id);
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "al-section",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "al-section-title",
														children: [ROSTER.find((fighter) => fighter.id === suiteWho)?.name, " · pick a look"]
													})
												}),
												ROSTER.find((fighter) => fighter.id === suiteWho)?.attires.map((attire) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													"data-on": hud.cast === attire.file ? "1" : void 0,
													className: "al-card",
													onClick: () => api.current?.setAttire(attire.file),
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "al-card-title",
														children: attire.label
													})
												}, attire.file)),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													className: "al-btn al-btn-ghost",
													onClick: () => setSuiteWho(null),
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "← Different fighter" })
												})
											] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "al-section",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "al-section-title",
													children: "Kit"
												})
											}),
											STYLES.map((style) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												"data-on": hud.style === style.id ? "1" : void 0,
												className: "al-card",
												onClick: () => api.current?.setStyle(style.id),
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "al-card-title",
													children: style.label
												})
											}, style.id)),
											MARTIAL.map((style) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												"data-on": hud.martial === style.id ? "1" : void 0,
												className: "al-card",
												onClick: () => api.current?.setMartial(style.id),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "al-card-title",
													children: style.label
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "al-card-sub",
													children: style.note
												})]
											}, style.id)),
											STANCES.map((stance) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												"data-on": hud.stance === stance.id ? "1" : void 0,
												className: "al-card",
												onClick: () => api.current?.setStance(stance.id),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "al-card-title",
													children: stance.label
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "al-card-sub",
													children: stance.note
												})]
											}, stance.id)),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "al-btn al-btn-primary",
												onClick: () => setSuite(false),
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Done" })
											})
										]
									})
								]
							})
						}) : null,
						hud.running && hud.paused && hud.bout === "done" && !suite ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "veil al-sheet absolute inset-0 flex items-end justify-center p-4 sm:items-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "w-full max-w-sm al-rise",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "al-kicker",
										children: "Card's down"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "al-title text-4xl mt-1",
										children: "Exhibition clear"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "al-rip mt-2",
										"aria-hidden": "true"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-2 text-sm text-cream-dim",
										children: [
											"Flow was ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-headline text-brass",
												children: hud.flow
											}),
											"."
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-4 flex flex-col gap-2.5",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "al-btn al-btn-primary",
												onClick: () => api.current?.startBout("exhibit", arena),
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Run it again" })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "al-btn",
												onClick: () => api.current?.startBout("practice", arena),
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Practice" })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "al-btn al-btn-ghost",
												onClick: leave,
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "← Main menu" })
											})
										]
									})
								]
							})
						}) : null,
						hud.running && hud.paused && hud.missionClear && hud.bout !== "done" && !suite && pendingJob === null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "veil al-sheet absolute inset-0 flex items-end justify-center p-4 sm:items-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "w-full max-w-sm al-rise",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "al-kicker al-flicker",
										children: "Job complete"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "al-title text-4xl mt-1",
										children: "Job done"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "al-rip mt-2",
										"aria-hidden": "true"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-sm text-cream-dim",
										children: hud.missionTitle
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 text-sm text-cream",
										children: [
											"Purse ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-headline text-brass",
												children: hud.purse
											}),
											". Rank ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-headline text-brass",
												children: hud.level
											}),
											". The next job is a different block."
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-4 flex flex-col gap-2.5",
										children: [
											hud.mission + 1 < MISSIONS.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "al-btn al-btn-primary al-pulse",
												onClick: () => setPendingJob(hud.mission + 1),
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Next: ", placeName(MISSIONS[hud.mission + 1].home)] })
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-sm text-cream-dim",
												children: "That's the end of the four chapters."
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "al-btn",
												onClick: () => setPendingJob(hud.mission),
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Run it again" })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "al-btn",
												onClick: () => setSuite(true),
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Customize" })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "al-btn al-btn-ghost",
												onClick: leave,
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "← Main menu" })
											})
										]
									})
								]
							})
						}) : null,
						hud.running && hud.paused && !hud.missionClear && hud.bout !== "done" && !suite && pendingJob === null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							ref: sheetRef,
							className: "sheet veil al-sheet al-concrete",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "al-sheet-inner mx-auto w-full max-w-sm px-4 py-6",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "al-kicker",
										children: "Take five"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "al-title text-4xl mt-1",
										children: "Paused"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "al-rip mt-2",
										"aria-hidden": "true"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-2 text-sm text-cream-dim",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-headline uppercase text-cream",
											children: hud.who
										}), ". Drag this list. The ward stays where you left it."]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-4 flex flex-wrap gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "al-chip",
												"data-on": hud.build === "full" ? "1" : void 0,
												onClick: () => api.current?.setBuild("full"),
												children: "You full"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "al-chip",
												"data-on": hud.build === "chibi" ? "1" : void 0,
												onClick: () => api.current?.setBuild("chibi"),
												children: "You chibi"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "al-chip",
												"data-on": hud.crowd === "full" ? "1" : void 0,
												onClick: () => api.current?.setCrowd("full"),
												children: "Crowd full"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "al-chip",
												"data-on": hud.crowd === "mix" ? "1" : void 0,
												onClick: () => api.current?.setCrowd("mix"),
												children: "Crowd mix"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "al-chip",
												"data-on": hud.crowd === "chibi" ? "1" : void 0,
												onClick: () => api.current?.setCrowd("chibi"),
												children: "Crowd chibi"
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "al-section",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "al-section-title",
											children: "Switch block"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-col gap-2.5",
										children: [
											MODES.map((mode) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												className: "al-card",
												onClick: () => begin(mode.id),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "al-card-title",
													children: mode.label
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "al-card-sub",
													children: mode.hint
												})]
											}, mode.id)),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "al-btn al-btn-primary al-pulse",
												onClick: () => api.current?.pause(false),
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Resume" })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "al-btn",
												onClick: () => setSuite(true),
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Customize" })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "al-btn",
												onClick: () => api.current?.rematch(),
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Rematch" })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "al-btn al-btn-ghost",
												onClick: leave,
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "← Main menu" })
											})
										]
									})
								]
							})
						}) : null,
						pendingJob !== null && MISSIONS[pendingJob] ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							ref: sheetRef,
							className: "sheet veil al-sheet al-concrete",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "al-sheet-inner mx-auto w-full max-w-md px-4 py-6",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "al-kicker",
										children: [
											"Job ",
											MISSIONS[pendingJob].n,
											" · ",
											placeName(MISSIONS[pendingJob].drop)
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "al-title text-4xl mt-1",
										children: pendingWho ? "Which look" : "Who walks in"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "al-rip mt-2",
										"aria-hidden": "true"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-2 text-sm text-cream-dim",
										children: [MISSIONS[pendingJob].title, "."]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-4 flex flex-col gap-2.5",
										children: [pendingWho === null ? ROSTER.map((fighter) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "al-card",
											onClick: () => setPendingWho(fighter.id),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "al-fighter",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "al-portrait",
													"aria-hidden": "true",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: fighter.name.charAt(0) })
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "al-card-title",
														children: fighter.name
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "al-card-sub",
														children: fighter.bio
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "al-hud-chip mt-1 inline-block",
														children: fighter.martial
													})
												] })]
											})
										}, fighter.id)) : ROSTER.find((fighter) => fighter.id === pendingWho)?.attires.map((attire) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											className: "al-card",
											onClick: () => walkIn({
												id: pendingWho,
												name: ROSTER.find((fighter) => fighter.id === pendingWho)?.name ?? "",
												label: attire.label,
												file: attire.file,
												bio: ""
											}),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "al-card-title",
												children: attire.label
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "al-card-sub",
												children: ROSTER.find((fighter) => fighter.id === pendingWho)?.name
											})]
										}, attire.file)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "al-btn al-btn-ghost",
											onClick: () => {
												sfxBack();
												pendingWho ? setPendingWho(null) : setPendingJob(null);
											},
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "← Back" })
										})]
									})
								]
							})
						}) : null
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pad-dock",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stick, { onChange: (x, y) => api.current?.setStick(x, y) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "rounded-full border border-line bg-ink-2 px-4 py-3 font-display text-xs text-cream",
						onClick: () => api.current?.pause(true),
						children: "Pause"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap justify-end gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pad, {
								label: "Use",
								hot: hud.weapon !== "fist",
								onDown: (d) => api.current?.setBtn("use", d)
							}),
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
					})
				]
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
	if (hud.story) return `Rank ${hud.level}. ${hud.actName}. ${hud.missionTitle}. Wave ${hud.wave}/${hud.waveMax}. Purse ${hud.purse}. ${hud.missionStep}`;
	if (hud.scuffle || hud.phase === "clear") return `${hud.phase}. ${hud.phaseStep}`;
	if (hud.area === "house") return hud.weapon === "fist" ? "Noodle house. Take the pipe. Smash the crate." : "Pipe's in hand. Run and the swing lunges. It snaps.";
	if (hud.area === "ring") return "The ring. Throw them into the red ropes and they come back.";
	if (hud.area === "cage") return "West cage. The grate is a wall. Throw them into it.";
	if (hud.area === "subway") return "South tunnel. Stay off the track when the train comes.";
	if (hud.area === "crane") return "North roof. A long fall hurts.";
	if (hud.area === "office") return "Back room, past the market. Ledger Cho keeps the paper.";
	return `${hud.job}. ${hud.jobStep}`;
}
function Meter({ label, value, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "w-20",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-1 font-display text-[10px] uppercase tracking-widest text-cream-dim",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: `al-hpbar${tone === "brass" ? " brass" : ""}`,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { style: { width: `${Math.max(0, Math.min(1, value)) * 100}%` } })
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
