/**
 * ASHLANE fighter portraits — deterministic SVG street-art portraits.
 * Same fighter id ALWAYS generates the same portrait. No external assets.
 * Style: bold geometric street-art / wheatpaste poster look.
 */

import type { FactionId } from "./char-gen";

/* Simple string hash for deterministic generation */
function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/* Seeded PRNG */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SKIN_TONES = ["#f5d0b0", "#e8b88a", "#c98e5e", "#a06a3c", "#7a4e28", "#5a3820", "#3e2616"];
const HAIR_COLORS = ["#1a1a1a", "#2e2018", "#4a3220", "#6e4a28", "#8a6a3a", "#b8b8b8", "#e8e8e8", "#a83215", "#1f2a44"];
const ACCENT = ["#e4572e", "#f0b429", "#cc3300", "#7fb3d5", "#b04df0", "#4d9de0"];

export interface PortraitSpec {
  fighterId: string;
  name: string;
  faction?: FactionId;
  size?: number;
  className?: string;
}

/**
 * Generate a stylized geometric portrait for a fighter.
 * Deterministic: same id = same face.
 */
export function FighterPortrait({ fighterId, name, faction, size = 96, className = "" }: PortraitSpec) {
  const h = hashStr(fighterId);
  const rng = mulberry32(h);

  const skin = SKIN_TONES[Math.floor(rng() * SKIN_TONES.length)];
  const hair = HAIR_COLORS[Math.floor(rng() * HAIR_COLORS.length)];
  const accent = ACCENT[Math.floor(rng() * ACCENT.length)];

  // Face shape variation
  const faceW = 34 + rng() * 8; // 34-42
  const faceH = 40 + rng() * 8;
  const jawSharp = rng() > 0.5;

  // Hair style: 0=short, 1=long, 2=mohawk/fade, 3=bald, 4=dreads-ish
  const hairStyle = Math.floor(rng() * 5);
  // Facial hair
  const beard = rng() > 0.65;
  // Scar / tattoo
  const mark = rng() > 0.7;
  const markSide = rng() > 0.5 ? 1 : -1;
  // Eye style
  const angryBrows = rng() > 0.4;
  // Headband / accessory
  const accessory = rng() > 0.75;

  const cx = 50;
  const faceTop = 50 - faceH / 2;
  const uid = `fp-${fighterId.replace(/[^a-z0-9]/gi, "")}`;

  // Background: faction-tinted halftone
  const bgColors: Record<string, string> = {
    ashes: "#2a1a12",
    combine: "#141e30",
    hollows: "#1a1214",
    unaffiliated: "#1e1c14",
    painted: "#1e1226",
    authority: "#101c2c",
  };
  const bg = (faction && bgColors[faction]) || "#1a1512";

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} role="img" aria-label={name}>
      <defs>
        <clipPath id={`${uid}-clip`}>
          <rect x="0" y="0" width="100" height="100" rx="8" />
        </clipPath>
        <pattern id={`${uid}-dots`} width="8" height="8" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="#ffffff" opacity="0.06" />
        </pattern>
      </defs>
      <g clipPath={`url(#${uid}-clip)`}>
        {/* background */}
        <rect width="100" height="100" fill={bg} />
        <rect width="100" height="100" fill={`url(#${uid}-dots)`} />
        {/* accent slash */}
        <polygon points={`0,100 100,${60 + rng() * 20} 100,100`} fill={accent} opacity="0.25" />

        {/* neck */}
        <rect x={cx - 9} y={50 + faceH / 2 - 8} width="18" height="20" fill={skin} opacity="0.85" />
        {/* shoulders */}
        <path
          d={`M${cx - 28} 100 Q${cx - 24} 78 ${cx - 10} 72 L${cx + 10} 72 Q${cx + 24} 78 ${cx + 28} 100 Z`}
          fill="#241d17"
        />
        <path
          d={`M${cx - 28} 100 Q${cx - 24} 78 ${cx - 10} 72 L${cx + 10} 72 Q${cx + 24} 78 ${cx + 28} 100 Z`}
          fill={accent}
          opacity="0.3"
        />

        {/* face */}
        {jawSharp ? (
          <polygon
            points={`${cx - faceW / 2},${faceTop} ${cx + faceW / 2},${faceTop} ${cx + faceW / 2},${faceTop + faceH * 0.6} ${cx},${faceTop + faceH} ${cx - faceW / 2},${faceTop + faceH * 0.6}`}
            fill={skin}
          />
        ) : (
          <ellipse cx={cx} cy={faceTop + faceH / 2} rx={faceW / 2} ry={faceH / 2} fill={skin} />
        )}

        {/* hair */}
        {hairStyle === 0 && (
          <path
            d={`M${cx - faceW / 2 - 2} ${faceTop + 12} Q${cx} ${faceTop - 14} ${cx + faceW / 2 + 2} ${faceTop + 12} L${cx + faceW / 2 - 2} ${faceTop + 4} Q${cx} ${faceTop - 4} ${cx - faceW / 2 + 2} ${faceTop + 4} Z`}
            fill={hair}
          />
        )}
        {hairStyle === 1 && (
          <g fill={hair}>
            <path d={`M${cx - faceW / 2 - 4} ${faceTop + 40} Q${cx - faceW / 2 - 6} ${faceTop - 10} ${cx} ${faceTop - 12} Q${cx + faceW / 2 + 6} ${faceTop - 10} ${cx + faceW / 2 + 4} ${faceTop + 40} L${cx + faceW / 2 - 2} ${faceTop + 38} Q${cx} ${faceTop + 2} ${cx - faceW / 2 + 2} ${faceTop + 38} Z`} />
            <ellipse cx={cx - faceW / 2 - 2} cy={faceTop + 42} rx="5" ry="12" />
            <ellipse cx={cx + faceW / 2 + 2} cy={faceTop + 42} rx="5" ry="12" />
          </g>
        )}
        {hairStyle === 2 && (
          <g fill={hair}>
            <rect x={cx - 6} y={faceTop - 16} width="12" height="22" rx="3" />
            <rect x={cx - faceW / 2} y={faceTop} width={faceW} height="6" opacity="0.6" />
          </g>
        )}
        {hairStyle === 3 && (
          <ellipse cx={cx} cy={faceTop + 2} rx={faceW / 2} ry="6" fill={skin} opacity="0.7" />
        )}
        {hairStyle === 4 && (
          <g fill={hair}>
            {Array.from({ length: 7 }, (_, i) => {
              const x = cx - 18 + i * 6;
              return <rect key={i} x={x} y={faceTop - 8} width="4.5" height={26 + (rng() * 10)} rx="2" />;
            })}
          </g>
        )}

        {/* brows */}
        {angryBrows ? (
          <g stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round">
            <path d={`M${cx - 14} ${faceTop + 22} L${cx - 4} ${faceTop + 26}`} />
            <path d={`M${cx + 14} ${faceTop + 22} L${cx + 4} ${faceTop + 26}`} />
          </g>
        ) : (
          <g stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round">
            <path d={`M${cx - 14} ${faceTop + 23} Q${cx - 9} ${faceTop + 21} ${cx - 4} ${faceTop + 23}`} />
            <path d={`M${cx + 4} ${faceTop + 23} Q${cx + 9} ${faceTop + 21} ${cx + 14} ${faceTop + 23}`} />
          </g>
        )}

        {/* eyes */}
        <g fill="#1a1a1a">
          <ellipse cx={cx - 9} cy={faceTop + 30} rx="3.2" ry="2.4" />
          <ellipse cx={cx + 9} cy={faceTop + 30} rx="3.2" ry="2.4" />
        </g>
        <circle cx={cx - 8.2} cy={faceTop + 29.2} r="0.9" fill="#fff" />
        <circle cx={cx + 9.8} cy={faceTop + 29.2} r="0.9" fill="#fff" />

        {/* nose */}
        <path d={`M${cx} ${faceTop + 32} L${cx - 2.5} ${faceTop + 40} L${cx + 2.5} ${faceTop + 40} Z`} fill="#000" opacity="0.18" />

        {/* mouth */}
        {rng() > 0.5 ? (
          <path d={`M${cx - 7} ${faceTop + 46} Q${cx} ${faceTop + 49} ${cx + 7} ${faceTop + 46}`} stroke="#1a1a1a" strokeWidth="2" fill="none" strokeLinecap="round" />
        ) : (
          <rect x={cx - 6} y={faceTop + 44} width="12" height="3" rx="1.5" fill="#1a1a1a" opacity="0.8" />
        )}

        {/* beard */}
        {beard && (
          <path
            d={`M${cx - faceW / 2 + 4} ${faceTop + faceH * 0.62} Q${cx} ${faceTop + faceH + 6} ${cx + faceW / 2 - 4} ${faceTop + faceH * 0.62} Q${cx} ${faceTop + faceH - 4} ${cx - faceW / 2 + 4} ${faceTop + faceH * 0.62} Z`}
            fill={hair}
            opacity="0.85"
          />
        )}

        {/* scar / tattoo mark */}
        {mark && (
          <g stroke={accent} strokeWidth="2" opacity="0.85" strokeLinecap="round">
            <path d={`M${cx + markSide * 12} ${faceTop + 18} L${cx + markSide * 8} ${faceTop + 34}`} />
            <path d={`M${cx + markSide * 14} ${faceTop + 24} L${cx + markSide * 6} ${faceTop + 28}`} />
          </g>
        )}

        {/* headband accessory */}
        {accessory && (
          <rect x={cx - faceW / 2 - 2} y={faceTop + 6} width={faceW + 4} height="7" fill={accent} opacity="0.9" transform={`rotate(-3 ${cx} ${faceTop + 9})`} />
        )}

        {/* street-art edge: torn corner */}
        <polygon points="0,0 26,0 0,26" fill={accent} opacity="0.5" />
      </g>
      {/* frame */}
      <rect x="1" y="1" width="98" height="98" rx="8" fill="none" stroke={accent} strokeWidth="2" opacity="0.6" />
    </svg>
  );
}
