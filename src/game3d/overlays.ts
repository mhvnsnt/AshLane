/**
 * overlays.ts — DOM UI for the wired modules.
 *
 * Driven by mount.ts; all game logic lives in services.ts / federated/*.
 *   touch.ts     -> buildTouchOverlay (mobile stick + buttons + camera drag)
 *   dialogue.ts  -> createDialogueUI (bottom dialogue panel)
 *   minigames.ts -> createMinigameUI (darts / blackjack / pool overlays)
 */

import type { Sim } from "./sim";
import {
  advanceDialogue, chooseDialogue, openDarts, openBlackjack, openPool,
  type GameServices,
} from "./services";
import type { DialogueEvent } from "./federated/dialogue";
import {
  stickMove, stickRelease, BUTTON_LAYOUT, touchScale,
} from "./federated/touch";
import {
  throwDart, cpuDartsVisit, bjHit, bjStand, handValue, stepPool,
} from "./federated/minigames";

// ---------------------------------------------------------------------------
// Touch overlay (touch.ts -> FrameInput)
// ---------------------------------------------------------------------------

export function buildTouchOverlay(parent: HTMLElement, svcs: GameServices, sim: Sim): void {
  if (!window.matchMedia("(pointer: coarse)").matches) return;
  const t = svcs.touch;
  const s = touchScale(window.innerWidth);
  const layer = document.createElement("div");
  layer.style.cssText = `position:absolute;inset:0;pointer-events:none;z-index:20;touch-action:none;`;
  parent.style.position = "relative";
  parent.appendChild(layer);

  // --- Left stick zone ---
  const stickBase = document.createElement("div");
  const R = 60 * s;
  stickBase.style.cssText = `position:absolute;left:${16}px;bottom:${16}px;width:${R * 2}px;height:${R * 2}px;border-radius:50%;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.25);pointer-events:auto;`;
  const knob = document.createElement("div");
  knob.style.cssText = `position:absolute;left:50%;top:50%;width:${R * 0.9}px;height:${R * 0.9}px;border-radius:50%;background:rgba(255,255,255,.28);transform:translate(-50%,-50%);`;
  stickBase.appendChild(knob);
  layer.appendChild(stickBase);
  let stickId: number | null = null;
  const setKnob = (dx: number, dy: number) => {
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
    setKnob(t.move.x * R * 0.6, t.move.y * R * 0.6);
  }, { passive: false });
  stickBase.addEventListener("touchmove", (e) => {
    e.preventDefault();
    for (const tc of Array.from(e.changedTouches)) {
      if (tc.identifier !== stickId) continue;
      const r = stickBase.getBoundingClientRect();
      const dx = tc.clientX - (r.left + r.width / 2);
      const dy = tc.clientY - (r.top + r.height / 2);
      stickMove(t, stickId, dx, dy, R);
      setKnob(t.move.x * R * 0.6, t.move.y * R * 0.6);
    }
  }, { passive: false });
  const endStick = (e: TouchEvent) => {
    for (const tc of Array.from(e.changedTouches)) {
      if (tc.identifier === stickId) {
        stickRelease(t, stickId);
        stickId = null;
        setKnob(0, 0);
      }
    }
  };
  stickBase.addEventListener("touchend", endStick);
  stickBase.addEventListener("touchcancel", endStick);

  // --- Camera drag (right half, outside buttons) ---
  let camId: number | null = null;
  let camX = 0;
  layer.addEventListener("touchstart", (e) => {
    for (const tc of Array.from(e.changedTouches)) {
      if (tc.clientX > window.innerWidth * 0.45 && camId === null) {
        camId = tc.identifier;
        camX = tc.clientX;
      }
    }
  }, { passive: true });
  layer.addEventListener("touchmove", (e) => {
    for (const tc of Array.from(e.changedTouches)) {
      if (tc.identifier === camId) {
        t.camDX += tc.clientX - camX;
        camX = tc.clientX;
        void sim;
      }
    }
  }, { passive: true });
  const endCam = (e: TouchEvent) => {
    for (const tc of Array.from(e.changedTouches)) if (tc.identifier === camId) camId = null;
  };
  layer.addEventListener("touchend", endCam);
  layer.addEventListener("touchcancel", endCam);

  // --- Action buttons (BUTTON_LAYOUT: 3x3 right cluster) ---
  const btnSize = 56 * s;
  const gap = 8 * s;
  const cluster = document.createElement("div");
  cluster.style.cssText = `position:absolute;right:${16}px;bottom:${16}px;pointer-events:auto;`;
  layer.appendChild(cluster);
  for (const [name, lay] of Object.entries(BUTTON_LAYOUT)) {
    const b = document.createElement("div");
    b.textContent = lay.label;
    b.style.cssText = `position:absolute;width:${btnSize}px;height:${btnSize}px;border-radius:50%;background:rgba(20,20,24,.55);border:1px solid rgba(255,255,255,.35);color:#fff;display:flex;align-items:center;justify-content:center;font:700 ${13 * s}px system-ui;user-select:none;-webkit-user-select:none;left:${lay.col * (btnSize + gap)}px;top:${lay.row * (btnSize + gap)}px;`;
    const key = name as keyof typeof t.buttons;
    b.addEventListener("touchstart", (e) => { e.preventDefault(); e.stopPropagation(); t.buttons[key] = true; b.style.background = "rgba(240,180,41,.6)"; }, { passive: false });
    const off = (e: TouchEvent) => { e.preventDefault(); t.buttons[key] = false; b.style.background = "rgba(20,20,24,.55)"; };
    b.addEventListener("touchend", off);
    b.addEventListener("touchcancel", off);
    cluster.appendChild(b);
  }
}

// ---------------------------------------------------------------------------
// Dialogue UI (dialogue.ts)
// ---------------------------------------------------------------------------

export function createDialogueUI(svcs: GameServices): {
  show: (ev: DialogueEvent) => void;
  sync: () => void;
  visible: () => boolean;
} {
  const panel = document.createElement("div");
  panel.style.cssText = `position:absolute;left:50%;bottom:24px;transform:translateX(-50%);width:min(560px,92%);background:rgba(12,12,16,.92);border:1px solid rgba(240,180,41,.5);border-radius:10px;padding:14px 16px;color:#f3e6d4;font:15px/1.45 system-ui;display:none;z-index:30;cursor:pointer;`;
  document.body.appendChild(panel);
  let current: DialogueEvent | null = null;

  function render(ev: DialogueEvent): void {
    current = ev;
    if (ev.kind === "line") {
      panel.innerHTML = `<div style="color:#f0b429;font-weight:700;margin-bottom:4px">${esc(ev.speaker)}</div><div>${esc(ev.text)}</div><div style="opacity:.5;font-size:12px;margin-top:8px">tap / Enter ▸</div>`;
      panel.style.display = "block";
    } else if (ev.kind === "options") {
      panel.innerHTML = ev.options.map((o, i) =>
        `<div data-i="${i}" style="padding:8px;border:1px solid rgba(255,255,255,.25);border-radius:6px;margin-top:6px;cursor:pointer">▸ ${esc(o.label)}</div>`
      ).join("");
      panel.style.display = "block";
      panel.querySelectorAll("[data-i]").forEach((el) => {
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          render(chooseDialogue(svcs, Number((el as HTMLElement).dataset.i)));
        });
      });
    } else if (ev.kind === "command") {
      // Commands apply silently; advance.
      render(advanceDialogue(svcs));
    } else {
      panel.style.display = "none";
      current = null;
    }
  }
  function esc(s: string): string {
    return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
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
    visible: () => panel.style.display !== "none",
  };
}

// ---------------------------------------------------------------------------
// Minigame UI (minigames.ts)
// ---------------------------------------------------------------------------

export type MinigameKind = "darts" | "blackjack" | "pool";

export function createMinigameUI(svcs: GameServices): {
  open: (kind: MinigameKind) => void;
  close: () => void;
  isOpen: () => boolean;
} {
  const modal = document.createElement("div");
  modal.style.cssText = `position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.72);z-index:40;`;
  document.body.appendChild(modal);
  const card = document.createElement("div");
  card.style.cssText = `background:#141419;border:1px solid rgba(240,180,41,.5);border-radius:12px;padding:20px;color:#f3e6d4;font:15px system-ui;min-width:min(420px,92vw);text-align:center;`;
  modal.appendChild(card);
  let poolTimer = 0;

  function close() {
    modal.style.display = "none";
    if (poolTimer) { clearInterval(poolTimer); poolTimer = 0; }
  }
  modal.addEventListener("click", (e) => { if (e.target === modal) close(); });

  function header(title: string): string {
    return `<div style="font-weight:800;color:#f0b429;margin-bottom:12px;font-size:18px">${title}</div>`;
  }
  function doneBtn(): string {
    return `<button id="mg-done" style="margin-top:14px;padding:8px 22px;border-radius:8px;border:1px solid #f0b429;background:transparent;color:#f0b429;font-weight:700;cursor:pointer">Done</button>`;
  }
  function wireDone() {
    card.querySelector("#mg-done")?.addEventListener("click", close);
  }

  function openDartsUI() {
    const st = openDarts(svcs);
    let score = 501;
    let dartsThrown = 0;
    const render = (msg: string) => {
      card.innerHTML = header("🎯 Darts — 501") +
        `<div style="font-size:13px;opacity:.75;margin-bottom:8px">Score left: <b style="font-size:22px;color:#fff">${score}</b></div>` +
        `<div style="min-height:22px;margin-bottom:8px">${msg}</div>` +
        `<button id="mg-throw" style="padding:10px 26px;border-radius:8px;background:#f0b429;border:none;font-weight:800;cursor:pointer">Throw dart</button><br/>` +
        doneBtn();
      wireDone();
      card.querySelector("#mg-throw")?.addEventListener("click", () => {
        const r = throwDart(0.55, 20, 2);
        const pts = r.segment * (r.ring === 3 ? 3 : r.ring === 2 ? 2 : 1);
        score = Math.max(0, score - pts);
        dartsThrown++;
        let m = `You hit ${r.segment} ×${r.ring === 3 ? 3 : r.ring === 2 ? 2 : 1} = <b>${pts}</b>`;
        if (dartsThrown % 3 === 0) {
          const cpu = cpuDartsVisit(0.5);
          m += `<br/>CPU scores ${cpu}`;
        }
        if (score === 0) m = `<b style="color:#f0b429">🏆 You win!</b>`;
        void st;
        render(m);
      });
    };
    render("Three darts per visit. First to exactly 0 wins.");
  }

  function openBlackjackUI() {
    const st = openBlackjack(svcs);
    const fmt = (h: { rank: string }[]) => h.map((c) => c.rank).join(" ");
    const render = (msg: string, over: boolean) => {
      card.innerHTML = header("🂡 Blackjack") +
        `<div style="margin-bottom:6px">Dealer: ${fmt(st.dealer)} (${handValue(st.dealer)})</div>` +
        `<div style="margin-bottom:8px">You: <b>${fmt(st.player)}</b> (${handValue(st.player)})</div>` +
        `<div style="min-height:22px;margin-bottom:8px">${msg}</div>` +
        (over ? "" : `<button id="mg-hit" style="padding:10px 22px;border-radius:8px;background:#f0b429;border:none;font-weight:800;cursor:pointer;margin-right:8px">Hit</button>
        <button id="mg-stand" style="padding:10px 22px;border-radius:8px;background:transparent;border:1px solid #f0b429;color:#f0b429;font-weight:800;cursor:pointer">Stand</button><br/>`) +
        doneBtn();
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
          const msg = dv > 21 || pv > dv ? `<b style="color:#f0b429">You win ${pv} vs ${dv}!</b>`
            : pv === dv ? `Push at ${pv}.` : `Dealer wins ${dv} vs ${pv}.`;
          render(msg, true);
        });
      }
    };
    render("Beat the dealer without going over 21.", false);
  }

  function openPoolUI() {
    const balls = openPool(svcs);
    card.innerHTML = header("🎱 Pool") +
      `<div id="mg-table" style="position:relative;width:340px;height:170px;background:#0e5c3f;border-radius:8px;margin:0 auto;overflow:hidden"></div>` +
      `<div style="margin:10px 0;font-size:13px;opacity:.75">Tap the table to shoot the cue ball</div>` +
      doneBtn();
    wireDone();
    const table = card.querySelector("#mg-table") as HTMLElement;
    const dots: HTMLElement[] = [];
    balls.forEach((b, i) => {
      const d = document.createElement("div");
      d.style.cssText = `position:absolute;width:12px;height:12px;border-radius:50%;background:${i === 0 ? "#fff" : "#e4572e"};transform:translate(-50%,-50%);`;
      table.appendChild(d);
      dots.push(d);
    });
    const draw = () => {
      balls.forEach((b, i) => {
        dots[i].style.left = `${(b.x / 100) * 340}px`;
        dots[i].style.top = `${(b.y / 50) * 170}px`;
        dots[i].style.display = b.sunk ? "none" : "block";
      });
    };
    draw();
    table.addEventListener("click", (e) => {
      const r = table.getBoundingClientRect();
      const tx = ((e.clientX - r.left) / 340) * 100;
      const ty = ((e.clientY - r.top) / 170) * 50;
      const cue = balls[0];
      if (cue.sunk) return;
      const dx = tx - cue.x, dy = ty - cue.y;
      const m = Math.hypot(dx, dy) || 1;
      cue.vx = (dx / m) * 60;
      cue.vy = (dy / m) * 60;
    });
    poolTimer = window.setInterval(() => {
      stepPool(balls, 1 / 30);
      if (document.body.contains(table)) draw();
      else { clearInterval(poolTimer); poolTimer = 0; }
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
    isOpen: () => modal.style.display !== "none",
  };
}
