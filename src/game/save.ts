export type CustomCart = { id: string; name: string; source: string };

export type SaveData = {
  version: 1;
  muted: boolean;
  cleared: string[];
  customs: CustomCart[];
};

const KEY = "ashlane-save-v1";

export const emptySave = (): SaveData => ({ version: 1, muted: false, cleared: [], customs: [] });

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptySave();
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    const customs = Array.isArray(parsed.customs)
      ? parsed.customs
          .filter(
            (item): item is CustomCart =>
              !!item &&
              typeof item === "object" &&
              typeof item.id === "string" &&
              typeof item.name === "string" &&
              typeof item.source === "string",
          )
          .slice(0, 12)
      : [];
    const cleared = Array.isArray(parsed.cleared) ? parsed.cleared.filter((id) => typeof id === "string").slice(0, 80) : [];
    return { version: 1, muted: Boolean(parsed.muted), cleared, customs };
  } catch {
    return emptySave();
  }
}

export function writeSave(save: SaveData) {
  localStorage.setItem(KEY, JSON.stringify(save));
}
