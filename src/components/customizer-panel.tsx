/**
 * components/customizer-panel.tsx — the in-game character customizer UI.
 *
 * Lives INSIDE the PWA main menu (rendered by AshlaneApp's menu sheet, NOT a
 * disconnected tool). Drives CustomizerPreview: the ACTUAL roster fighter GLB
 * on a zoomable live 3D stage. Every control applies to the live model
 * immediately; Save persists the build per fighter (customizer/persistence.ts)
 * and the game loads it back next visit.
 *
 * Sections: Fighter / Attire (clothing) / Eyes / Body (morphs) / Hair /
 * Facial hair / Accessories / Face paint / Save.
 * Skin-tone likeness is LOCKED — nothing here recolors skin.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { ROSTER, type LaneFighter } from "@/game3d/roster";
import { FighterPortrait } from "@/game3d/fighter-portraits";
import { CustomizerPreview } from "@/game3d/customization/customizer/preview";
import { EYE_COLOR_PALETTE, supportsEyeColor } from "@/game3d/customization/customizer/eye-colors";
import { MORPH_DEFS, supportedMorphs } from "@/game3d/customization/customizer/morphs";
import {
  loadAccessoryManifests,
  manifestsForSlot,
} from "@/game3d/customization/customizer/accessories";
import {
  facePaintAvailable,
  facePaintPickerData,
  serializeFacePaintLayers,
  validateFacePaintLayers,
  type FacePaintLayer,
  type FacePaintPickerData,
} from "@/game3d/customization/customizer/facepaint-adapter";
import {
  deleteBuild,
  loadBuild,
  saveBuild,
} from "@/game3d/customization/customizer/persistence";
import {
  ACCESSORY_SLOTS,
  defaultBuild,
  type AccessoryManifest,
  type AccessorySlotId,
  type CustomBuild,
} from "@/game3d/customization/customizer/types";
import { assetUrl } from "@/game3d/asset-base";
import { sfxBack } from "@/game3d/menu-sfx";

const SLOT_LABELS: Record<AccessorySlotId, string> = {
  hair: "Hair",
  facialHair: "Facial hair",
  mask: "Mask",
  hood: "Hood",
  chain: "Chain",
  gloves: "Gloves",
  wristbands: "Wristbands",
  shoes: "Shoes",
};

export function CustomizerPanel({ onBack }: { onBack: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<CustomizerPreview | null>(null);
  const [fighterId, setFighterId] = useState<string>(ROSTER[0]?.id ?? "");
  const [build, setBuild] = useState<CustomBuild>(() => defaultBuild(ROSTER[0]?.id ?? "", ""));
  const [manifests, setManifests] = useState<AccessoryManifest[]>([]);
  const [paintData, setPaintData] = useState<FacePaintPickerData | null>(null);
  const paintSupported = facePaintAvailable(fighterId);
  // Custom paint builder state (the layer stack the player is composing).
  const [paintLayers, setPaintLayers] = useState<FacePaintLayer[]>([]);
  const [paintRegion, setPaintRegion] = useState("fullFace");
  const [paintPattern, setPaintPattern] = useState("base-soft");
  const [paintColor, setPaintColor] = useState("#f2ede2");
  const [paintOpacity, setPaintOpacity] = useState(1);
  const [paintErrors, setPaintErrors] = useState<string[]>([]);
  const [eyeSupported, setEyeSupported] = useState(false);
  const [morphKeys, setMorphKeys] = useState<string[]>([]);
  const [status, setStatus] = useState("");
  const [zoom, setZoom] = useState(3.2);
  const buildRef = useRef(build);
  buildRef.current = build;

  const fighter: LaneFighter | undefined = useMemo(
    () => ROSTER.find((f) => f.id === fighterId),
    [fighterId],
  );
  const attireFile = useMemo(() => {
    if (!fighter) return "";
    const found = fighter.attires.find((a) => a.id === build.attireId);
    return (found ?? fighter.attires[0])?.file ?? "";
  }, [fighter, build.attireId]);

  // Mount the preview once (StrictMode-safe: create/dispose/create).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const preview = new CustomizerPreview(canvas);
    previewRef.current = preview;
    preview.onStatus = (s) => {
      setStatus(s.loading ? "Loading model…" : (s.error ?? ""));
      if (preview.root) {
        setEyeSupported(supportsEyeColor(preview.root));
        setMorphKeys(supportedMorphs(preview.root));
        setZoom(preview.zoom);
      }
    };
    void loadAccessoryManifests().then(setManifests);
    try {
      setPaintData(facePaintPickerData());
    } catch (e) {
      console.error("Face-paint picker data unavailable:", e);
    }
    return () => {
      preview.dispose();
      previewRef.current = null;
    };
  }, []);

  // Fighter change: load saved build (or defaults), then the model.
  const selectFighter = async (id: string) => {
    const f = ROSTER.find((r) => r.id === id);
    if (!f) return;
    const preview = previewRef.current;
    setFighterId(id);
    const saved = await loadBuild(id);
    const attireId = saved?.attireId ?? f.attires[0]?.id ?? "";
    const next = saved ?? defaultBuild(id, attireId);
    next.attireId = attireId;
    setBuild(next);
    setStatus("Loading model…");
    if (preview) {
      const file = f.attires.find((a) => a.id === attireId)?.file ?? f.attires[0]?.file ?? "";
      await preview.loadFighter(id, file);
      await preview.applyBuild(next);
      if (preview.root) {
        setEyeSupported(supportsEyeColor(preview.root));
        setMorphKeys(supportedMorphs(preview.root));
        setZoom(preview.zoom);
      }
      setStatus(saved ? "Saved build loaded." : "");
    }
  };

  // First paint: load the default fighter's build + model.
  useEffect(() => {
    void selectFighter(fighterId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeAttire = async (attireId: string) => {
    const next = { ...build, attireId };
    setBuild(next);
    const preview = previewRef.current;
    if (preview && fighter) {
      const file = fighter.attires.find((a) => a.id === attireId)?.file ?? "";
      setStatus("Loading model…");
      await preview.loadFighter(fighter.id, file);
      await preview.applyBuild(next);
      if (preview.root) {
        setEyeSupported(supportsEyeColor(preview.root));
        setMorphKeys(supportedMorphs(preview.root));
        setZoom(preview.zoom);
      }
      setStatus("");
    }
  };

  const patchBuild = (patch: Partial<CustomBuild>) => {
    const next = { ...build, ...patch };
    setBuild(next);
    void previewRef.current?.applyBuild(next);
  };

  const setEyes = (eyeColor: string) => {
    const next = { ...build, eyeColor };
    setBuild(next);
    previewRef.current?.setEyeColor(eyeColor);
  };

  const setMorph = (key: string, value: number) => {
    const morphs = { ...build.morphs, [key]: value };
    const next = { ...build, morphs };
    setBuild(next);
    previewRef.current?.setMorphs(morphs);
  };

  const setAccessory = (slot: AccessorySlotId, id: string | null) => {
    patchBuild({ accessories: { ...build.accessories, [slot]: id } });
  };

  const setFacePaintSpec = (spec: string | null) => {
    const next = { ...build, facePaint: spec };
    setBuild(next);
    void previewRef.current?.setFacePaint(spec);
  };

  const addPaintLayer = () => {
    const layer: FacePaintLayer = {
      region: paintRegion as FacePaintLayer["region"],
      pattern: paintPattern,
      color: paintColor,
      opacity: paintOpacity,
    };
    const errors = validateFacePaintLayers([...paintLayers, layer]);
    setPaintErrors(errors);
    if (errors.length > 0) return;
    setPaintLayers([...paintLayers, layer]);
  };

  const removePaintLayer = (i: number) =>
    setPaintLayers(paintLayers.filter((_, k) => k !== i));

  const applyCustomPaint = () => {
    const errors = validateFacePaintLayers(paintLayers);
    setPaintErrors(errors);
    if (errors.length > 0 || paintLayers.length === 0) return;
    setFacePaintSpec(serializeFacePaintLayers(paintLayers));
  };

  const presetIds = useMemo(
    () => new Set((paintData?.presets ?? []).map((p) => p.id)),
    [paintData],
  );
  const customPaintActive = !!build.facePaint && !presetIds.has(build.facePaint);

  const onSave = async () => {
    setStatus("Saving…");
    await saveBuild(buildRef.current);
    setStatus("Build saved — it loads back every visit.");
  };

  const onReset = async () => {
    const next = defaultBuild(fighterId, build.attireId);
    setBuild(next);
    await previewRef.current?.applyBuild(next);
    await deleteBuild(fighterId);
    setStatus("Reset to the authored look.");
  };

  const onZoom = (v: number) => {
    setZoom(v);
    previewRef.current?.setZoom(v);
  };

  return (
    <div className="mt-4 flex flex-col gap-3">
      <div className="al-section">
        <span className="al-section-title">Character customizer</span>
      </div>
      <p className="text-sm text-cream-dim">
        Live preview of the actual in-game model. Drag to orbit, scroll or pinch
        to zoom. Everything you change applies instantly — hit Save to keep it.
      </p>

      {/* Live 3D preview */}
      <div className="relative overflow-hidden rounded-2xl border border-line bg-ink">
        <canvas ref={canvasRef} className="block h-80 w-full cursor-grab active:cursor-grabbing" />
        {status ? (
          <p className="pointer-events-none absolute left-3 top-3 rounded bg-ink/70 px-2 py-1 text-xs text-cream">
            {status}
          </p>
        ) : null}
        <label className="absolute bottom-3 left-3 right-3 flex items-center gap-2 rounded bg-ink/70 px-2 py-1">
          <span className="text-xs uppercase tracking-widest text-cream-dim">Zoom</span>
          <input
            type="range"
            min={1.4}
            max={7}
            step={0.1}
            value={zoom}
            onChange={(e) => onZoom(Number(e.target.value))}
            className="w-full"
            aria-label="Preview zoom"
          />
        </label>
      </div>

      {/* Fighter */}
      <div className="al-section"><span className="al-section-title">Fighter</span></div>
      <div className="grid max-h-56 grid-cols-4 gap-2 overflow-y-auto pr-1">
        {ROSTER.map((f) => (
          <button
            key={f.id}
            type="button"
            data-on={f.id === fighterId ? "1" : undefined}
            className="al-card flex flex-col items-center gap-1 p-2"
            onClick={() => void selectFighter(f.id)}
            title={f.name}
          >
            <FighterPortrait fighterId={f.id} name={f.name} faction="unaffiliated" size={44} />
            <span className="text-[11px] leading-tight text-cream">{f.name}</span>
          </button>
        ))}
      </div>

      {/* Attire = clothing */}
      {fighter && fighter.attires.length > 1 ? (
        <>
          <div className="al-section"><span className="al-section-title">Clothing — attire</span></div>
          <div className="flex flex-wrap gap-2">
            {fighter.attires.map((a) => (
              <button
                key={a.id}
                type="button"
                data-on={build.attireId === a.id ? "1" : undefined}
                className="al-chip"
                onClick={() => void changeAttire(a.id)}
              >
                {a.label}
              </button>
            ))}
          </div>
        </>
      ) : null}

      {/* Eyes */}
      <div className="al-section"><span className="al-section-title">Eyes</span></div>
      {eyeSupported ? (
        <div className="flex flex-wrap gap-2">
          {EYE_COLOR_PALETTE.map((e) => (
            <button
              key={e.id}
              type="button"
              data-on={build.eyeColor === e.id ? "1" : undefined}
              className="al-chip flex items-center gap-2"
              onClick={() => setEyes(e.id)}
              title={e.label}
            >
              {e.id === "natural" ? (
                <span className="inline-block h-4 w-4 rounded-full border border-line bg-gradient-to-br from-amber-700 to-stone-900" />
              ) : (
                <span
                  className="inline-block h-4 w-4 rounded-full border border-line"
                  style={{ backgroundColor: e.hex }}
                />
              )}
              {e.label}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-cream-dim">
          This model's eyes are baked into its face texture — iris color stays
          authored so the likeness never drifts.
        </p>
      )}

      {/* Body morphs */}
      <div className="al-section"><span className="al-section-title">Body</span></div>
      {MORPH_DEFS.filter((d) => morphKeys.includes(d.key)).map((d) => (
        <label key={d.key} className="al-slider-label">
          {d.label} <span className="text-cream-dim">— {d.hint}</span>
          <input
            className="mt-1 block w-full"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={build.morphs[d.key]}
            onChange={(e) => setMorph(d.key, Number(e.target.value))}
            onDoubleClick={() => setMorph(d.key, 0.5)}
            aria-label={d.label}
          />
        </label>
      ))}
      {morphKeys.length === 0 ? (
        <p className="text-sm text-cream-dim">No morphable bones detected on this model.</p>
      ) : (
        <p className="text-xs text-cream-dim">Double-click a slider to snap back to the authored shape.</p>
      )}

      {/* Accessories */}
      <div className="al-section"><span className="al-section-title">Accessories</span></div>
      {ACCESSORY_SLOTS.map((slot) => {
        const options = manifestsForSlot(manifests, slot);
        if (options.length === 0) {
          return (
            <div key={slot} className="flex items-center justify-between gap-2">
              <span className="text-sm text-cream">{SLOT_LABELS[slot]}</span>
              <span className="text-xs text-cream-dim">Lane assets pending — plugs in on merge</span>
            </div>
          );
        }
        return (
          <div key={slot} className="flex flex-col gap-1.5">
            <span className="text-sm text-cream">{SLOT_LABELS[slot]}</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                data-on={!build.accessories[slot] ? "1" : undefined}
                className="al-chip"
                onClick={() => setAccessory(slot, null)}
              >
                None
              </button>
              {options.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  data-on={build.accessories[slot] === m.id ? "1" : undefined}
                  className="al-chip"
                  title={m.canonNotes ?? m.label}
                  onClick={() => setAccessory(slot, m.id)}
                >
                  {m.label}
                  {m.canon ? " ★ canon" : ""}
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {/* Face paint — the paint lane's decal system; base skin is never touched. */}
      <div className="al-section"><span className="al-section-title">Face paint</span></div>
      {paintSupported && paintData ? (
        <div className="flex flex-col gap-2.5">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              data-on={!build.facePaint ? "1" : undefined}
              className="al-chip"
              onClick={() => setFacePaintSpec(null)}
            >
              None
            </button>
            {paintData.presets.map((p) => (
              <button
                key={p.id}
                type="button"
                data-on={build.facePaint === p.id ? "1" : undefined}
                className="al-chip"
                title={p.description}
                onClick={() => setFacePaintSpec(p.id)}
              >
                {p.label}
                {p.canonLocked ? " 🔒" : ""}
              </button>
            ))}
            {customPaintActive ? (
              <button type="button" data-on="1" className="al-chip" onClick={() => {}}>
                Custom paint
              </button>
            ) : null}
          </div>

          <details className="al-card p-2">
            <summary className="cursor-pointer text-sm text-cream">
              Custom paint — layer your own
            </summary>
            <div className="mt-2 flex flex-col gap-2">
              <div>
                <span className="text-xs uppercase tracking-widest text-cream-dim">Region</span>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {paintData.regions.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      data-on={paintRegion === r.id ? "1" : undefined}
                      className="al-chip"
                      title={r.hint}
                      onClick={() => setPaintRegion(r.id)}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-xs uppercase tracking-widest text-cream-dim">Pattern</span>
                <div className="mt-1 grid max-h-40 grid-cols-3 gap-1.5 overflow-y-auto pr-1">
                  {paintData.patterns.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      data-on={paintPattern === p.id ? "1" : undefined}
                      className="al-card flex flex-col items-center gap-1 p-1.5"
                      title={p.hint}
                      onClick={() => setPaintPattern(p.id)}
                    >
                      <img
                        src={assetUrl(p.file)}
                        alt={p.label}
                        className="h-8 w-8 rounded bg-black/40 object-contain invert"
                      />
                      <span className="text-[10px] leading-tight text-cream">{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-xs uppercase tracking-widest text-cream-dim">Color</span>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {paintData.colors.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      data-on={paintColor === c.hex ? "1" : undefined}
                      className="al-chip flex items-center gap-1.5"
                      title={c.label}
                      onClick={() => setPaintColor(c.hex)}
                    >
                      <span
                        className="inline-block h-4 w-4 rounded-full border border-line"
                        style={{ backgroundColor: c.hex }}
                      />
                      {c.canon ? "🔒" : ""}
                    </button>
                  ))}
                  <input
                    type="color"
                    value={paintColor}
                    onChange={(e) => setPaintColor(e.target.value)}
                    className="h-8 w-10 cursor-pointer"
                    aria-label="Custom paint color"
                    title="Custom color"
                  />
                </div>
              </div>
              <label className="al-slider-label">
                Opacity
                <input
                  className="mt-1 block w-full"
                  type="range"
                  min={0.1}
                  max={1}
                  step={0.05}
                  value={paintOpacity}
                  onChange={(e) => setPaintOpacity(Number(e.target.value))}
                  aria-label="Layer opacity"
                />
              </label>
              <div className="flex gap-2">
                <button type="button" className="al-btn al-btn-ghost flex-1" onClick={addPaintLayer}>
                  <span>+ Add layer</span>
                </button>
                <button
                  type="button"
                  className="al-btn al-btn-primary flex-1"
                  disabled={paintLayers.length === 0}
                  onClick={applyCustomPaint}
                >
                  <span>Apply custom ({paintLayers.length})</span>
                </button>
              </div>
              {paintLayers.length > 0 ? (
                <ul className="flex flex-col gap-1">
                  {paintLayers.map((l, i) => (
                    <li key={i} className="flex items-center justify-between gap-2 text-xs text-cream">
                      <span className="flex items-center gap-1.5">
                        <span
                          className="inline-block h-3.5 w-3.5 rounded-full border border-line"
                          style={{ backgroundColor: l.color }}
                        />
                        {l.pattern} · {l.region} · {Math.round(l.opacity * 100)}%
                      </span>
                      <button
                        type="button"
                        className="al-chip"
                        onClick={() => removePaintLayer(i)}
                        aria-label={`Remove layer ${i + 1}`}
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
              {paintErrors.length > 0 ? (
                <p className="text-xs text-red-300">{paintErrors.join("; ")}</p>
              ) : null}
            </div>
          </details>
          <p className="text-xs text-cream-dim">
            Paint is a decal overlay — the character's skin is never changed.
          </p>
        </div>
      ) : (
        <p className="text-sm text-cream-dim">
          No verified face profile for this fighter yet — the paint lane adds
          characters as their profiles land.
        </p>
      )}

      {/* Save */}
      <div className="flex gap-2.5">
        <button type="button" className="al-btn al-btn-primary flex-1" onClick={() => void onSave()}>
          <span>Save build</span>
        </button>
        <button type="button" className="al-btn al-btn-ghost flex-1" onClick={() => void onReset()}>
          <span>Reset</span>
        </button>
      </div>

      <button
        type="button"
        className="al-btn al-btn-ghost"
        onClick={() => {
          sfxBack();
          onBack();
        }}
      >
        <span>← Back</span>
      </button>
    </div>
  );
}
