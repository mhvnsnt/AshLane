import * as THREE from "three";

/**
 * Quaternius CC0 modular character system for AshLane.
 *
 * Source: https://quaternius.com — CC0 1.0 Universal (public domain).
 * Packs: Universal Base Characters [Standard], Universal Animation Library [Standard],
 *        Universal Animation Library 2 [Standard].
 * License record: assets/characters/quaternius/QUATERNIUS_LICENSE_CC0.txt
 * Full manifest + bone mapping: docs/QUATERNIUS.md
 *
 * How the modular system works:
 *  1. Load a base body (Superhero_Male/Female_FullBody.glb). It carries a 65-joint
 *     Unreal-style rig (pelvis, spine_01, upperarm_l, ...). ~13k triangles.
 *  2. Load any part (Hair_*.glb, Hair_Beard.glb, Eyebrows_*.glb). Each part GLB
 *     carries the SAME 65-joint skeleton with IDENTICAL joint names, and its
 *     meshes are skinned ~100% to the relevant bone (e.g. hair -> Head).
 *  3. Call attachPart(body, part): it rebinds the part's skinned meshes onto the
 *     BODY's live skeleton by matching bone names — no retargeting, no remap.
 *     Bone inverses are carried over from the part file; both were authored in
 *     the same rest pose, so the bind stays valid.
 *  4. Skin/eye color variants: the Standard tier bakes one skin tone; swap the
 *     material's baseColorFactor at runtime for tone variants (see tintSkin()).
 *
 * Rig note: the 65-joint Quaternius rig maps onto the repo's 58-joint Mixamo
 * skeleton via QUATERNIUS_UAL_BONE in ./motion-bank.ts (used by retargetUal()).
 * 13 joints are dropped in that direction (root + 12 leaf/end-effectors).
 * UAL1/UAL2 animation clips (86 total, CC0) ship on the Quaternius rig and need
 * NO retargeting when played on Quaternius bodies — only when shared with the
 * 58-joint cast, which retargetUal() now handles.
 */

export const QUATERNIUS_MODEL_ROOT = "/models/cast/quaternius/";
export const QUATERNIUS_MOTION_ROOT = "/motion/ual/";

export type QuaterniusPart = {
  id: string;
  label: string;
  file: string;
  slot: "hair" | "beard" | "eyebrows";
  /** "male" | "female" | "both" — which base bodies this part fits. */
  fits: "male" | "female" | "both";
};

export const QUATERNIUS_BODIES = [
  { id: "male", label: "Male", file: `${QUATERNIUS_MODEL_ROOT}Superhero_Male_FullBody.glb` },
  { id: "female", label: "Female", file: `${QUATERNIUS_MODEL_ROOT}Superhero_Female_FullBody.glb` },
] as const;

export const QUATERNIUS_PARTS: QuaterniusPart[] = [
  { id: "hair_buns", label: "Buns", file: `${QUATERNIUS_MODEL_ROOT}Hair_Buns.glb`, slot: "hair", fits: "both" },
  { id: "hair_buzzed", label: "Buzzed", file: `${QUATERNIUS_MODEL_ROOT}Hair_Buzzed.glb`, slot: "hair", fits: "male" },
  { id: "hair_buzzed_f", label: "Buzzed (F)", file: `${QUATERNIUS_MODEL_ROOT}Hair_BuzzedFemale.glb`, slot: "hair", fits: "female" },
  { id: "hair_long", label: "Long", file: `${QUATERNIUS_MODEL_ROOT}Hair_Long.glb`, slot: "hair", fits: "both" },
  { id: "hair_parted", label: "Parted", file: `${QUATERNIUS_MODEL_ROOT}Hair_SimpleParted.glb`, slot: "hair", fits: "male" },
  { id: "beard", label: "Beard", file: `${QUATERNIUS_MODEL_ROOT}Hair_Beard.glb`, slot: "beard", fits: "male" },
  { id: "brows_f", label: "Brows (F)", file: `${QUATERNIUS_MODEL_ROOT}Eyebrows_Female.glb`, slot: "eyebrows", fits: "female" },
  { id: "brows", label: "Brows", file: `${QUATERNIUS_MODEL_ROOT}Eyebrows_Regular.glb`, slot: "eyebrows", fits: "both" },
];

/** CC0 animation libraries on the Quaternius rig (no retarget needed on Quaternius bodies). */
export const QUATERNIUS_UAL = [
  `${QUATERNIUS_MOTION_ROOT}UAL1_Standard.glb`, // 43 clips: locomotion, barehand combat, reactions
  `${QUATERNIUS_MOTION_ROOT}UAL2_Standard.glb`, // 43 clips: melee/weapon combat
] as const;

/**
 * Bind a Quaternius part (hair/beard/eyebrows) onto a loaded base body's live
 * skeleton. Both sides use the identical 65-joint rig, so bones are matched by
 * name and the part's bind inverses are reused.
 *
 * @returns number of skinned meshes successfully attached (0 = nothing bound).
 */
export function attachPart(body: THREE.Object3D, part: THREE.Object3D): number {
  const bodyBones = new Map<string, THREE.Bone>();
  body.traverse((o) => {
    if ((o as THREE.Bone).isBone) bodyBones.set(o.name, o as THREE.Bone);
  });
  if (bodyBones.size === 0) return 0;

  body.updateMatrixWorld(true);
  let attached = 0;

  part.traverse((o) => {
    const mesh = o as THREE.SkinnedMesh;
    if (!mesh.isSkinnedMesh || !mesh.skeleton) return;
    const src = mesh.skeleton;
    const remapped: THREE.Bone[] = [];
    const inverses: THREE.Matrix4[] = [];
    for (let i = 0; i < src.bones.length; i++) {
      const target = bodyBones.get(src.bones[i].name);
      if (!target) return; // incomplete bind — leave this mesh on the part rig
      remapped.push(target);
      inverses.push(src.getBoneInverse(i).clone());
    }
    mesh.skeleton = new THREE.Skeleton(remapped, inverses);
    // Re-bind against the body's current world transform so the part follows it.
    mesh.bind(mesh.skeleton, mesh.matrixWorld);
    // Reparent under the body root; skinning is driven by bone world matrices.
    body.add(mesh);
    attached++;
  });
  return attached;
}

/**
 * Runtime skin-tone variant: the Standard tier bakes one tone, so tint the body
 * materials instead of swapping textures.
 */
export function tintSkin(body: THREE.Object3D, hex: number): void {
  body.traverse((o) => {
    const mesh = o as THREE.Mesh;
    const mat = (mesh as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
    if (mesh.isMesh && mat && "baseColorFactor" in mat) {
      // GLTF materials expose color; tint toward the requested tone.
      (mat as THREE.MeshStandardMaterial).color.setHex(hex);
    }
  });
}

/** Parts valid for one slot on a given body ("male" | "female"). */
export function partsFor(slot: QuaterniusPart["slot"], bodyId: "male" | "female"): QuaterniusPart[] {
  return QUATERNIUS_PARTS.filter((p) => p.slot === slot && (p.fits === "both" || p.fits === bodyId));
}
