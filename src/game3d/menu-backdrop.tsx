/**
 * ASHLANE menu backdrop — animated street scene.
 * Pure SVG/CSS: cityscape silhouette, flickering neon signs,
 * drifting rain, rising embers. No external assets.
 */

export function StreetBackdrop() {
  return (
    <div className="al-street-bg" aria-hidden="true">
      <svg className="al-street-skyline" viewBox="0 0 800 400" preserveAspectRatio="xMidYMax slice">
        <defs>
          <linearGradient id="al-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0a0806" />
            <stop offset="60%" stopColor="#1a1210" />
            <stop offset="100%" stopColor="#241610" />
          </linearGradient>
          <linearGradient id="al-win" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f0b429" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#e4572e" stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id="al-win-blue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7fb3d5" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#4d9de0" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        <rect width="800" height="400" fill="url(#al-sky)" />

        {/* moon */}
        <circle cx="650" cy="60" r="28" fill="#f5ead6" opacity="0.14" />
        <circle cx="650" cy="60" r="20" fill="#f5ead6" opacity="0.1" />

        {/* back buildings */}
        <g fill="#14100d" opacity="0.9">
          <rect x="0" y="180" width="90" height="220" />
          <rect x="100" y="140" width="70" height="260" />
          <rect x="180" y="200" width="110" height="200" />
          <rect x="300" y="120" width="80" height="280" />
          <rect x="390" y="170" width="100" height="230" />
          <rect x="500" y="140" width="75" height="260" />
          <rect x="585" y="190" width="95" height="210" />
          <rect x="690" y="150" width="110" height="250" />
        </g>
        {/* back windows */}
        <g fill="url(#al-win-blue)" opacity="0.5">
          {Array.from({ length: 8 }, (_, b) => {
            const bx = [0, 100, 180, 300, 390, 500, 585, 690][b];
            const bw = [90, 70, 110, 80, 100, 75, 95, 110][b];
            const by = [180, 140, 200, 120, 170, 140, 190, 150][b];
            return Array.from({ length: 4 }, (_, r) =>
              Array.from({ length: 3 }, (_, c) => (
                <rect
                  key={`${b}-${r}-${c}`}
                  x={bx + 12 + c * ((bw - 24) / 3)}
                  y={by + 16 + r * 42}
                  width={(bw - 24) / 3 - 8}
                  height="22"
                  opacity={((b * 7 + r * 3 + c) % 3 === 0) ? 0.9 : 0.25}
                />
              ))
            );
          })}
        </g>

        {/* front buildings */}
        <g fill="#0d0b09">
          <rect x="40" y="240" width="120" height="160" />
          <rect x="230" y="220" width="100" height="180" />
          <rect x="420" y="250" width="130" height="150" />
          <rect x="620" y="230" width="110" height="170" />
        </g>
        {/* front windows */}
        <g fill="url(#al-win)">
          <rect x="55" y="255" width="22" height="30" className="al-neon-a" />
          <rect x="85" y="255" width="22" height="30" opacity="0.3" />
          <rect x="115" y="290" width="22" height="30" className="al-neon-b" />
          <rect x="245" y="235" width="20" height="28" opacity="0.35" />
          <rect x="275" y="270" width="20" height="28" className="al-neon-a" />
          <rect x="435" y="265" width="24" height="30" className="al-neon-b" />
          <rect x="470" y="300" width="24" height="30" opacity="0.3" />
          <rect x="635" y="245" width="22" height="30" className="al-neon-a" />
          <rect x="665" y="280" width="22" height="30" opacity="0.25" />
        </g>

        {/* neon signs */}
        <g fontFamily="var(--font-headline), Impact, sans-serif" fontWeight="900">
          <text x="245" y="215" fontSize="26" fill="#ff2e4d" className="al-neon-sign-a" transform="rotate(-3 245 215)">
            NOODLE
          </text>
          <text x="435" y="245" fontSize="22" fill="#4d9de0" className="al-neon-sign-b" transform="rotate(2 435 245)">
            LANE
          </text>
          <text x="55" y="232" fontSize="20" fill="#f0b429" className="al-neon-sign-a" transform="rotate(-2 55 232)">
            24HR
          </text>
        </g>

        {/* street */}
        <rect y="360" width="800" height="40" fill="#080706" />
        <g stroke="#f0b429" strokeWidth="2" opacity="0.25" strokeDasharray="24 18">
          <line x1="0" y1="380" x2="800" y2="380" />
        </g>

        {/* streetlamp glow */}
        <ellipse cx="380" cy="330" rx="90" ry="26" fill="#f0b429" opacity="0.08" />
        <rect x="377" y="250" width="6" height="110" fill="#0d0b09" />
        <circle cx="380" cy="248" r="8" fill="#f0b429" className="al-lamp" />
      </svg>

      {/* rain */}
      <div className="al-rain" aria-hidden="true">
        {Array.from({ length: 40 }, (_, i) => (
          <span
            key={i}
            className="al-drop"
            style={{
              left: `${(i * 37) % 100}%`,
              animationDelay: `${(i * 0.37) % 2}s`,
              animationDuration: `${0.7 + ((i * 13) % 10) / 20}s`,
            }}
          />
        ))}
      </div>

      {/* rising embers */}
      <div className="al-embers" aria-hidden="true">
        {Array.from({ length: 14 }, (_, i) => (
          <span
            key={i}
            className="al-ember"
            style={{
              left: `${(i * 71) % 100}%`,
              animationDelay: `${(i * 0.83) % 6}s`,
              animationDuration: `${4 + ((i * 17) % 20) / 10}s`,
            }}
          />
        ))}
      </div>

      {/* vignette */}
      <div className="al-vignette" aria-hidden="true" />
    </div>
  );
}

/**
 * Loading screen with art.
 */
export function LoadingScreen({ label = "Loading the ward…" }: { label?: string }) {
  return (
    <div className="al-loading" aria-hidden="true">
      <StreetBackdrop />
      <div className="al-loading-inner">
        <div className="al-loading-flame">
          <svg width="64" height="64" viewBox="0 0 48 48">
            <path
              d="M24 4 C28 12 34 16 34 26 C34 35 29 42 24 42 C19 42 14 35 14 26 C14 21 16 17 19 14 C19 18 21 20 22 20 C21 15 21 9 24 4 Z"
              fill="#e4572e"
              className="al-flame-dance"
            />
            <path
              d="M24 22 C26 26 27 28 27 31 C27 34 25.5 36 24 36 C22.5 36 21 34 21 31 C21 28 22 26 24 22 Z"
              fill="#f0b429"
              className="al-flame-dance"
              style={{ animationDelay: "0.2s" }}
            />
          </svg>
        </div>
        <p className="al-loading-label">{label}</p>
        <div className="al-loading-bar">
          <i />
        </div>
      </div>
    </div>
  );
}
