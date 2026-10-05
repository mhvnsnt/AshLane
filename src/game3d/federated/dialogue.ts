/**
 * Federated dialogue runner for AshLane.
 *
 * Inspiration: Yarn Spinner (MIT, YarnSpinnerTool/YarnSpinner) — writers use a
 * screenplay-like script; the runtime yields lines, options, and commands.
 * bondage.js is the JS Yarn runtime (license unverified — so this is an
 * original minimal implementation of the same pattern, not a port).
 *
 * Script format (Yarn-inspired, subset):
 *   === Start ===
 *   Mara: Ash. You came back.
 *   Ash: Didn't have a choice.
 *   -> What's the job?
 *       Mara: The Combine took the east block.
 *       <<set_job east_block>>
 *   -> Not interested.
 *       Mara: Then why are you here?
 *   ===
 */

export type DialogueNode = {
  speaker: string;
  text: string;
} | {
  options: { label: string; jump: string }[];
} | {
  command: string;
  args: string[];
};

export type DialogueScript = Map<string, DialogueNode[]>;

export interface DialogueState {
  script: DialogueScript;
  node: string;
  index: number;
  vars: Map<string, string | number | boolean>;
  /** when waiting on player choice */
  pendingOptions: { label: string; jump: string }[] | null;
  done: boolean;
}

export function parseDialogue(src: string): DialogueScript {
  const script: DialogueScript = new Map();
  const blocks = src.split(/^===\s*$/m);
  for (const block of blocks) {
    const lines = block.split("\n").map(l => l.trimEnd()).filter(l => l.trim());
    if (!lines.length) continue;
    const titleMatch = lines[0].match(/^===\s*(.+?)\s*===$/);
    if (!titleMatch) continue;
    const nodes: DialogueNode[] = [];
    let i = 1;
    while (i < lines.length) {
      const line = lines[i];
      const optMatch = line.match(/^->\s*(.+)$/);
      if (optMatch) {
        const options: { label: string; jump: string }[] = [];
        while (i < lines.length) {
          const m = lines[i].match(/^->\s*(.+)$/);
          if (!m) break;
          const label = m[1].trim();
          i++;
          const body: DialogueNode[] = [];
          while (i < lines.length && /^\s{4}\S/.test(lines[i])) {
            body.push(parseLine(lines[i].trim()));
            i++;
          }
          // inline option body as a sub-node list; jump encoded
          const subName = `__opt_${nodes.length}_${options.length}`;
          script.set(subName, body);
          options.push({ label, jump: subName });
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

function parseLine(line: string): DialogueNode {
  const cmd = line.match(/^<<(.+)>>$/);
  if (cmd) {
    const parts = cmd[1].trim().split(/\s+/);
    return { command: parts[0], args: parts.slice(1) };
  }
  const sp = line.match(/^([^:]+):\s*(.+)$/);
  if (sp) return { speaker: sp[1].trim(), text: sp[2].trim() };
  return { speaker: "", text: line };
}

export function startDialogue(script: DialogueScript, node = "Start"): DialogueState {
  return { script, node, index: 0, vars: new Map(), pendingOptions: null, done: false };
}

export type DialogueEvent =
  | { kind: "line"; speaker: string; text: string }
  | { kind: "options"; options: { label: string; jump: string }[] }
  | { kind: "command"; command: string; args: string[] }
  | { kind: "end" };

/** Advance one step. Returns what the UI should show/do. */
export function dialogueNext(st: DialogueState): DialogueEvent {
  if (st.done) return { kind: "end" };
  const nodes = st.script.get(st.node);
  if (!nodes || st.index >= nodes.length) {
    st.done = true;
    return { kind: "end" };
  }
  const node = nodes[st.index++];
  if ("options" in node) {
    st.pendingOptions = node.options;
    st.index--; // stay until choose() is called
    return { kind: "options", options: node.options };
  }
  if ("command" in node) {
    applyCommand(st, node.command, node.args);
    return { kind: "command", command: node.command, args: node.args };
  }
  return { kind: "line", speaker: node.speaker, text: interpolate(st, node.text) };
}

/** Player picks a dialogue option (by index). */
export function dialogueChoose(st: DialogueState, idx: number): DialogueEvent {
  const opts = st.pendingOptions;
  if (!opts || idx < 0 || idx >= opts.length) return { kind: "end" };
  st.pendingOptions = null;
  st.node = opts[idx].jump;
  st.index = 0;
  return dialogueNext(st);
}

function applyCommand(st: DialogueState, cmd: string, args: string[]): void {
  if (cmd === "set" && args.length >= 2) {
    const v: string | number | boolean = args[1] === "true" ? true
      : args[1] === "false" ? false
      : isNaN(Number(args[1])) ? args.slice(1).join(" ") : Number(args[1]);
    st.vars.set(args[0], v);
  } else if (cmd === "jump" && args.length >= 1) {
    st.node = args[0];
    st.index = 0;
  }
}

function interpolate(st: DialogueState, text: string): string {
  return text.replace(/\{(\w+)\}/g, (_, k) => String(st.vars.get(k) ?? `{${k}}`));
}
