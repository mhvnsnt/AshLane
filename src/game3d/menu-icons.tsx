/**
 * ASHLANE menu icon library — proprietary SVG art.
 * No external assets. Everything is hand-built SVG for the Concrete Jungle theme.
 *
 * Usage: <AshlaneLogo />, <FactionEmblem faction="ashes" />, <StyleIcon style="boxing" />, etc.
 */

import type { FactionId } from "./char-gen";

/* ============================================================
   ASHLANE LOGO — graffiti/street wordmark
   ============================================================ */

export function AshlaneLogo({ className = "", glow = true }: { className?: string; glow?: boolean }) {
  return (
    <svg viewBox="0 0 640 160" className={className} role="img" aria-label="Ashlane">
      <defs>
        <linearGradient id="al-logo-fire" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff7a4d" />
          <stop offset="55%" stopColor="#e4572e" />
          <stop offset="100%" stopColor="#a83215" />
        </linearGradient>
        <linearGradient id="al-logo-steel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f5ead6" />
          <stop offset="60%" stopColor="#d8c9a8" />
          <stop offset="100%" stopColor="#9a8a68" />
        </linearGradient>
        <filter id="al-logo-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="10" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* hazard stripe underline */}
      <g transform="rotate(-2 320 130)">
        <rect x="60" y="128" width="520" height="14" fill="#e4572e" />
        <g fill="#140d08">
          {Array.from({ length: 13 }, (_, i) => (
            <polygon key={i} points={`${70 + i * 40},128 ${90 + i * 40},128 ${80 + i * 40},142 ${60 + i * 40},142`} />
          ))}
        </g>
      </g>
      {/* spray splatter accents */}
      <g fill="#e4572e" opacity="0.55">
        <ellipse cx="48" cy="42" rx="16" ry="10" transform="rotate(-20 48 42)" />
        <ellipse cx="596" cy="118" rx="20" ry="12" transform="rotate(15 596 118)" />
        <circle cx="70" cy="110" r="5" />
        <circle cx="578" cy="36" r="6" />
        <circle cx="600" cy="52" r="3.5" />
      </g>
      {/* main wordmark */}
      <g filter={glow ? "url(#al-logo-glow)" : undefined} transform="rotate(-2 320 80)">
        <text
          x="320"
          y="104"
          textAnchor="middle"
          fontFamily="var(--font-headline), Impact, sans-serif"
          fontWeight="900"
          fontSize="96"
          letterSpacing="2"
          fill="url(#al-logo-fire)"
          stroke="#140d08"
          strokeWidth="3"
        >
          ASHLANE
        </text>
        {/* steel highlight slice */}
        <text
          x="320"
          y="104"
          textAnchor="middle"
          fontFamily="var(--font-headline), Impact, sans-serif"
          fontWeight="900"
          fontSize="96"
          letterSpacing="2"
          fill="none"
          stroke="url(#al-logo-steel)"
          strokeWidth="1"
          opacity="0.35"
          clipPath="polygon(0 0, 640 0, 640 60, 0 60)"
        >
          ASHLANE
        </text>
      </g>
      {/* tagline */}
      <text
        x="322"
        y="152"
        textAnchor="middle"
        fontFamily="var(--font-display), monospace"
        fontSize="15"
        letterSpacing="8"
        fill="#f0b429"
        opacity="0.9"
      >
        CONCRETE JUNGLE
      </text>
    </svg>
  );
}

/* ============================================================
   FACTION EMBLEMS
   ============================================================ */

const FACTION_COLORS: Record<FactionId, { primary: string; secondary: string }> = {
  ashes: { primary: "#ff6b35", secondary: "#a83215" },
  combine: { primary: "#7fb3d5", secondary: "#1f2a44" },
  hollows: { primary: "#cc3300", secondary: "#1a1a1a" },
  unaffiliated: { primary: "#c9a227", secondary: "#2d2d2d" },
  painted: { primary: "#b04df0", secondary: "#1a0a24" },
  authority: { primary: "#4d9de0", secondary: "#0a1626" },
};

export function FactionEmblem({
  faction,
  size = 40,
  className = "",
}: {
  faction: FactionId;
  size?: number;
  className?: string;
}) {
  const c = FACTION_COLORS[faction];
  const id = `fe-${faction}`;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} role="img" aria-label={faction}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c.primary} />
          <stop offset="100%" stopColor={c.secondary} />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="22" fill="#140d08" stroke={`url(#${id})`} strokeWidth="2.5" />
      {faction === "ashes" && (
        <g fill={`url(#${id})`}>
          {/* flame */}
          <path d="M24 8 C28 14 32 18 32 26 C32 33 28 38 24 38 C20 38 16 33 16 26 C16 22 18 19 20 16 C20 20 22 22 23 22 C22 18 22 13 24 8 Z" />
          <path d="M24 24 C26 27 27 29 27 31 C27 34 25.5 35.5 24 35.5 C22.5 35.5 21 34 21 31 C21 29 22 27 24 24 Z" fill="#140d08" opacity="0.6" />
        </g>
      )}
      {faction === "combine" && (
        <g fill="none" stroke={`url(#${id})`} strokeWidth="2.5">
          {/* corporate tower / shield */}
          <path d="M24 8 L36 14 V24 C36 32 30 38 24 40 C18 38 12 32 12 24 V14 Z" />
          <path d="M24 14 V34 M18 20 H30 M18 26 H30" strokeWidth="1.8" />
        </g>
      )}
      {faction === "hollows" && (
        <g fill={`url(#${id})`}>
          {/* cracked skull */}
          <ellipse cx="24" cy="21" rx="10" ry="11" />
          <rect x="17" y="28" width="14" height="8" rx="2" />
          <circle cx="20" cy="20" r="3" fill="#140d08" />
          <circle cx="28" cy="20" r="3" fill="#140d08" />
          <path d="M24 14 L26 8 L24 11 L22 6 Z" fill="#e4572e" />
        </g>
      )}
      {faction === "unaffiliated" && (
        <g fill="none" stroke={`url(#${id})`} strokeWidth="2.5">
          {/* lone coin / dollar slash */}
          <circle cx="24" cy="24" r="12" />
          <path d="M24 14 V34 M18 19 H30 M18 29 H30" strokeWidth="2" />
        </g>
      )}
      {faction === "painted" && (
        <g fill={`url(#${id})`}>
          {/* clown smile mask */}
          <ellipse cx="24" cy="24" rx="11" ry="13" />
          <circle cx="20" cy="20" r="2.5" fill="#140d08" />
          <circle cx="28" cy="20" r="2.5" fill="#140d08" />
          <path d="M16 28 Q24 36 32 28 Q24 31 16 28 Z" fill="#140d08" />
          <circle cx="24" cy="25" r="2" fill="#ff2e4d" />
        </g>
      )}
      {faction === "authority" && (
        <g fill="none" stroke={`url(#${id})`} strokeWidth="2.5">
          {/* police badge star */}
          <path d="M24 8 L27 19 L38 19 L29 26 L32 37 L24 30 L16 37 L19 26 L10 19 L21 19 Z" fill={`url(#${id})`} stroke="none" />
          <circle cx="24" cy="24" r="4" fill="#140d08" />
        </g>
      )}
    </svg>
  );
}

/* ============================================================
   FIGHTING STYLE ICONS
   ============================================================ */

export type StyleIconId =
  | "boxing" | "kickboxing" | "wrestling" | "mma" | "lucha"
  | "capoeira" | "muaythai" | "karate" | "street" | "grapple";

export function StyleIcon({
  style,
  size = 28,
  className = "",
}: {
  style: string;
  size?: number;
  className?: string;
}) {
  const s = style.toLowerCase();
  const stroke = "#f0b429";
  const fill = "none";
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} role="img" aria-label={style}>
      {(s.includes("box") || s === "boxing") && (
        <g stroke={stroke} strokeWidth="2" fill={fill}>
          {/* boxing glove */}
          <path d="M10 18 C6 14 8 8 14 7 C20 6 25 10 24 16 C23 21 18 24 13 23 Z" />
          <path d="M10 18 L7 25 M13 23 L11 28" />
          <path d="M14 12 C17 11 20 13 20 16" />
        </g>
      )}
      {(s.includes("kick") || s.includes("muay") || s.includes("savate")) && (
        <g stroke={stroke} strokeWidth="2" fill={fill}>
          {/* kicking boot */}
          <path d="M8 6 L14 6 L14 18 L24 22 L24 26 L8 26 Z" />
          <path d="M14 18 L20 20" />
          <path d="M8 10 L14 10" />
        </g>
      )}
      {(s.includes("wrestl") || s.includes("catch") || s.includes("sambo") || s.includes("grapple")) && (
        <g stroke={stroke} strokeWidth="2" fill={fill}>
          {/* grappling hands */}
          <path d="M6 12 C10 8 14 10 16 14 C18 10 22 8 26 12" />
          <path d="M6 12 L6 22 M26 12 L26 22" />
          <path d="M10 22 H22" />
          <circle cx="16" cy="18" r="2" fill={stroke} stroke="none" />
        </g>
      )}
      {s.includes("mma") && (
        <g stroke={stroke} strokeWidth="2" fill={fill}>
          {/* octagon */}
          <polygon points="12,4 20,4 28,12 28,20 20,28 12,28 4,20 4,12" />
          <path d="M12 16 H20 M16 12 V20" />
        </g>
      )}
      {s.includes("lucha") && (
        <g stroke={stroke} strokeWidth="2" fill={fill}>
          {/* lucha mask */}
          <path d="M8 6 H24 V20 C24 26 20 29 16 29 C12 29 8 26 8 20 Z" />
          <circle cx="13" cy="15" r="2" />
          <circle cx="19" cy="15" r="2" />
          <path d="M12 22 Q16 25 20 22" />
        </g>
      )}
      {s.includes("capoeira") && (
        <g stroke={stroke} strokeWidth="2" fill={fill}>
          {/* spinning kick arc */}
          <path d="M6 26 C10 14 18 8 28 8" />
          <path d="M24 6 L28 8 L25 12" />
          <circle cx="10" cy="26" r="3" />
        </g>
      )}
      {(s.includes("karate") || s.includes("kenpo") || s.includes("jeet")) && (
        <g stroke={stroke} strokeWidth="2" fill={fill}>
          {/* open hand chop */}
          <path d="M10 28 L10 10 L14 6 L18 10 L18 28 Z" />
          <path d="M10 16 H18 M10 21 H18" />
        </g>
      )}
      {s.includes("street") && (
        <g stroke={stroke} strokeWidth="2" fill={fill}>
          {/* brass knuckles */}
          <circle cx="9" cy="16" r="4" />
          <circle cx="16" cy="16" r="4" />
          <circle cx="23" cy="16" r="4" />
          <path d="M6 20 H27 V24 H6 Z" />
        </g>
      )}
      {/* fallback: fist */}
      {!["box", "kick", "muay", "savate", "wrestl", "catch", "sambo", "grapple", "mma", "lucha", "capoeira", "karate", "kenpo", "jeet", "street"].some((k) => s.includes(k)) && (
        <g stroke={stroke} strokeWidth="2" fill={fill}>
          <path d="M10 14 C10 10 13 8 16 8 C19 8 22 10 22 14 L22 20 C22 24 19 27 16 27 C13 27 10 24 10 20 Z" />
          <path d="M10 14 H22 M13 8 V13 M16 8 V13 M19 8 V13" />
        </g>
      )}
    </svg>
  );
}

/* ============================================================
   MENU NAVIGATION ICONS
   ============================================================ */

export function MenuIcon({ name, size = 22, className = "" }: { name: string; size?: number; className?: string }) {
  const stroke = "currentColor";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {name === "story" && (
        <g>
          <path d="M4 19.5 A2.5 2.5 0 0 1 6.5 17 H20 V4 H6.5 A2.5 2.5 0 0 0 4 6.5 Z" />
          <path d="M4 19.5 A2.5 2.5 0 0 0 6.5 22 H20 V17" />
          <path d="M9 8 H15 M9 12 H13" />
        </g>
      )}
      {name === "fight" && (
        <g>
          <circle cx="7" cy="7" r="3" />
          <path d="M7 10 V14 M7 12 L3 13 M7 12 L11 13 M7 14 L4 20 M7 14 L10 20" />
          <circle cx="17" cy="7" r="3" />
          <path d="M17 10 V14 M17 12 L13 13 M17 12 L21 13 M17 14 L14 20 M17 14 L20 20" />
        </g>
      )}
      {name === "trophy" && (
        <g>
          <path d="M8 4 H16 V10 C16 14 13 17 12 17 C11 17 8 14 8 10 Z" />
          <path d="M8 6 H4 C4 9 6 11 8 11 M16 6 H20 C20 9 18 11 16 11" />
          <path d="M12 17 V20 M8 20 H16" />
        </g>
      )}
      {name === "gear" && (
        <g>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2 V5 M12 19 V22 M2 12 H5 M19 12 H22 M4.9 4.9 L7 7 M17 17 L19.1 19.1 M19.1 4.9 L17 7 M7 17 L4.9 19.1" />
        </g>
      )}
      {name === "map" && (
        <g>
          <polygon points="9,4 3,6 3,20 9,18 15,20 21,18 21,4 15,6" />
          <path d="M9 4 V18 M15 6 V20" />
        </g>
      )}
      {name === "user" && (
        <g>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21 C4 16 8 14 12 14 C16 14 20 16 20 21" />
        </g>
      )}
      {name === "music" && (
        <g>
          <circle cx="7" cy="18" r="3" />
          <circle cx="17" cy="16" r="3" />
          <path d="M10 18 V6 L20 4 V16" />
        </g>
      )}
      {name === "back" && <path d="M15 6 L9 12 L15 18" />}
      {name === "lock" && (
        <g>
          <rect x="5" y="11" width="14" height="9" rx="1" />
          <path d="M8 11 V7 C8 4 10 2 12 2 C14 2 16 4 16 7 V11" />
        </g>
      )}
      {name === "check" && <path d="M4 12 L10 18 L20 6" />}
      {name === "flame" && (
        <path d="M12 2 C14 6 17 8 17 13 C17 17 14.5 20 12 20 C9.5 20 7 17 7 13 C7 10 8.5 8 10 6 C10 8 11 9 12 9 C11.5 6 11.5 4 12 2 Z" />
      )}
    </svg>
  );
}
