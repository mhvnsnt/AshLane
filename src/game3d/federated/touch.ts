/**
 * Federated touch controls for AshLane's phone PWA.
 *
 * Inspiration (patterns, original implementation):
 *  - devindu22/cyber-arcade-nexus-3d (MIT): touch joysticks, virtual action
 *    buttons, responsive WebGL viewports, mobile-first.
 *  - shri816/forest-arena-game (MIT): left joystick / right action cluster
 *    layout, adaptive portrait/landscape.
 *
 * This module is the LOGIC side (no DOM): it turns touch state into
 * FrameInput. The renderer builds the DOM/SVG controls and feeds this.
 */

import type { FrameInput } from "../sim";

export interface TouchStick {
  /** -1..1 */
  x: number; y: number;
  active: boolean;
  /** touch identifier tracking this stick */
  touchId: number | null;
}

export interface TouchButtons {
  attack: boolean;
  grab: boolean;
  blast: boolean;
  jump: boolean;
  dash: boolean;
  use: boolean;
  lock: boolean;
  /** NEW: counter button (owner-requested input abstraction) */
  counter: boolean;
}

export interface TouchState {
  move: TouchStick;
  buttons: TouchButtons;
  /** camera drag delta (pixels, consumed per frame) */
  camDX: number;
  camDY: number;
}

export function createTouchState(): TouchState {
  return {
    move: { x: 0, y: 0, active: false, touchId: null },
    buttons: {
      attack: false, grab: false, blast: false, jump: false,
      dash: false, use: false, lock: false, counter: false,
    },
    camDX: 0, camDY: 0,
  };
}

/** Convert touch state to a sim FrameInput */
export function touchToInput(t: TouchState): FrameInput & { counter: boolean } {
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
    counter: t.buttons.counter,
  };
}

/** Update the movement stick from a touch point relative to stick center */
export function stickMove(
  t: TouchState, touchId: number,
  dx: number, dy: number, radius: number,
): void {
  const len = Math.hypot(dx, dy) || 1;
  const cl = Math.min(len, radius) / len;
  t.move.x = (dx * cl) / radius;
  t.move.y = (dy * cl) / radius;
  t.move.active = true;
  t.move.touchId = touchId;
}

export function stickRelease(t: TouchState, touchId: number): void {
  if (t.move.touchId === touchId) {
    t.move.x = 0; t.move.y = 0;
    t.move.active = false;
    t.move.touchId = null;
  }
}

/** Button layout: right-side cluster (forest-arena-game convention) */
export const BUTTON_LAYOUT = {
  attack: { label: "ATK", row: 0, col: 1 },
  grab:   { label: "GRB", row: 0, col: 0 },
  counter:{ label: "CTR", row: 0, col: 2 },
  jump:   { label: "JMP", row: 1, col: 1 },
  dash:   { label: "DSH", row: 1, col: 0 },
  blast:  { label: "SPL", row: 1, col: 2 },
  lock:   { label: "LCK", row: 2, col: 1 },
  use:    { label: "USE", row: 2, col: 0 },
} as const;

/** Viewport helper: scale factor for touch targets on small screens */
export function touchScale(viewportWidth: number): number {
  if (viewportWidth < 400) return 0.85;
  if (viewportWidth < 700) return 1;
  return 1.15;
}
