import React, { useState } from 'react';

export type MascotMood = 'welcome' | 'feeling' | 'idea' | 'secure' | 'care' | 'celebrate';

interface LumiMascotProps {
  mood?: MascotMood;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showGlow?: boolean;
  interactive?: boolean;
  className?: string;
  onClick?: () => void;
  bubbleText?: string;
}

export const LumiMascot: React.FC<LumiMascotProps> = ({
  mood = 'welcome',
  size = 'md',
  showGlow = true,
  interactive = true,
  className = '',
  onClick,
  bubbleText,
}) => {
  const [isWiggling, setIsWiggling] = useState(false);

  const sizeDimensions = {
    sm: { width: 64, height: 68 },
    md: { width: 110, height: 116 },
    lg: { width: 160, height: 170 },
    xl: { width: 220, height: 232 },
  }[size];

  const handleClick = () => {
    if (interactive) {
      setIsWiggling(true);
      setTimeout(() => setIsWiggling(false), 800);
    }
    if (onClick) onClick();
  };

  return (
    <div
      className={`relative inline-flex flex-col items-center select-none ${className}`}
      onClick={handleClick}
      title={interactive ? 'Hi! I am Lumi, your mindful reflection companion.' : undefined}
    >
      {/* Speech / Thought Bubble (Optional) */}
      {bubbleText && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-xl bg-slate-900/95 border border-cyan-500/40 text-cyan-200 text-[11px] font-semibold shadow-lg shadow-cyan-500/10 whitespace-nowrap z-20 animate-bounce pointer-events-none flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          <span>{bubbleText}</span>
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 border-r border-b border-cyan-500/40 rotate-45" />
        </div>
      )}

      {/* Ambient Pulsing Aura Glow */}
      {showGlow && (
        <div
          className={`absolute inset-0 rounded-full blur-2xl pointer-events-none transition-all duration-700 ${
            mood === 'care'
              ? 'bg-rose-500/20'
              : mood === 'idea'
              ? 'bg-amber-400/25'
              : mood === 'secure'
              ? 'bg-emerald-500/25'
              : mood === 'celebrate'
              ? 'bg-purple-500/30'
              : 'bg-cyan-500/25'
          }`}
          style={{ transform: 'scale(1.25)' }}
        />
      )}

      {/* SVG Mascot Figure */}
      <svg
        width={sizeDimensions.width}
        height={sizeDimensions.height}
        viewBox="0 0 200 210"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`relative z-10 transition-transform duration-300 ${
          interactive ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
        } ${isWiggling ? 'animate-bounce' : ''}`}
        style={{
          filter: 'drop-shadow(0px 8px 24px rgba(6, 182, 212, 0.25))',
        }}
      >
        <defs>
          {/* Body Gradient */}
          <linearGradient id="lumiBodyGrad" x1="50" y1="20" x2="150" y2="190" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="45%" stopColor="#06b6d4" />
            <stop offset="85%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>

          {/* Belly Soft Glow Gradient */}
          <radialGradient id="lumiBellyGrad" cx="100" cy="140" r="55" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.85" />
            <stop offset="55%" stopColor="#7dd3fc" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </radialGradient>

          {/* Sprout Leaves Gradient */}
          <linearGradient id="lumiSproutGrad" x1="100" y1="10" x2="100" y2="50" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="60%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>

          {/* Head Pearl Glow */}
          <radialGradient id="lumiPearlGlow" cx="100" cy="18" r="14" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#fef08a" />
            <stop offset="80%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#ca8a04" />
          </radialGradient>

          {/* Shield Gradient */}
          <linearGradient id="lumiShieldGrad" x1="120" y1="90" x2="180" y2="150" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#67e8f9" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0e7490" />
          </linearGradient>

          {/* Heart Gradient */}
          <linearGradient id="lumiHeartGrad" x1="85" y1="110" x2="115" y2="140" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fda4af" />
            <stop offset="50%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#be123c" />
          </linearGradient>

          {/* Eye Sparkle Filter */}
          <filter id="eyeGleam" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient floating bubbles/sparkles around Lumi */}
        <g className="animate-pulse">
          <circle cx="28" cy="85" r="3" fill="#67e8f9" opacity="0.6" />
          <circle cx="175" cy="65" r="2.5" fill="#a7f3d0" opacity="0.7" />
          <circle cx="182" cy="140" r="3.5" fill="#fbcfe8" opacity="0.5" />
          <path d="M 25 50 L 27 55 L 32 57 L 27 59 L 25 64 L 23 59 L 18 57 L 23 55 Z" fill="#fef08a" opacity="0.8" />
          <path d="M 170 30 L 172 34 L 176 35 L 172 36 L 170 40 L 168 36 L 164 35 L 168 34 Z" fill="#67e8f9" opacity="0.75" />
        </g>

        {/* --- SPROUT ON HEAD --- */}
        <g id="mascot-sprout">
          {/* Stem */}
          <path d="M 100 48 Q 100 32 100 24" stroke="#22c55e" strokeWidth="4.5" strokeLinecap="round" />
          {/* Left Leaf */}
          <path
            d="M 100 32 C 86 30 76 20 82 12 C 92 12 98 22 100 32 Z"
            fill="url(#lumiSproutGrad)"
            stroke="#15803d"
            strokeWidth="1.2"
          />
          {/* Right Leaf */}
          <path
            d="M 100 28 C 114 26 124 16 118 8 C 108 8 102 18 100 28 Z"
            fill="url(#lumiSproutGrad)"
            stroke="#15803d"
            strokeWidth="1.2"
          />
          {/* Glowing Pearl / Lantern Bud atop Stem */}
          <circle cx="100" cy="18" r="7" fill="url(#lumiPearlGlow)" />
          <circle cx="98" cy="16" r="2.5" fill="#ffffff" opacity="0.9" />
          {mood === 'idea' && (
            <g>
              <circle cx="100" cy="18" r="14" fill="#fef08a" opacity="0.3" className="animate-ping" />
              {/* Radiating idea rays */}
              <line x1="100" y1="5" x2="100" y2="0" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" />
              <line x1="112" y1="9" x2="116" y2="5" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" />
              <line x1="88" y1="9" x2="84" y2="5" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" />
            </g>
          )}
        </g>

        {/* --- MAIN BODY (ROUNDED BEAN / SPIRIT) --- */}
        <g id="mascot-body">
          {/* Outer Body Shadow */}
          <path
            d="M 100 45 C 55 45 42 75 42 118 C 42 165 60 195 100 195 C 140 195 158 165 158 118 C 158 75 145 45 100 45 Z"
            fill="url(#lumiBodyGrad)"
            stroke="#0ea5e9"
            strokeWidth="2.5"
          />

          {/* Soft Belly Light */}
          <ellipse cx="100" cy="138" rx="46" ry="42" fill="url(#lumiBellyGrad)" />

          {/* Top highlight gleam */}
          <path
            d="M 68 62 C 80 52 108 50 125 54 C 115 50 85 50 68 62 Z"
            fill="#ffffff"
            opacity="0.45"
          />
        </g>

        {/* --- CHEEKS BLUSH --- */}
        <g id="mascot-cheeks">
          <ellipse cx="66" cy="116" rx="9" ry="5.5" fill="#fb7185" opacity="0.65" />
          <ellipse cx="134" cy="116" rx="9" ry="5.5" fill="#fb7185" opacity="0.65" />
        </g>

        {/* --- EYES EXPRESSIONS --- */}
        <g id="mascot-eyes">
          {mood === 'welcome' || mood === 'feeling' ? (
            /* Joyful Open Anime Sparkle Eyes */
            <>
              {/* Left Eye */}
              <circle cx="76" cy="100" r="10.5" fill="#0f172a" />
              <circle cx="73" cy="97" r="4.5" fill="#ffffff" filter="url(#eyeGleam)" />
              <circle cx="79" cy="104" r="2.2" fill="#38bdf8" />
              {/* Right Eye */}
              <circle cx="124" cy="100" r="10.5" fill="#0f172a" />
              <circle cx="121" cy="97" r="4.5" fill="#ffffff" filter="url(#eyeGleam)" />
              <circle cx="127" cy="104" r="2.2" fill="#38bdf8" />
            </>
          ) : mood === 'idea' ? (
            /* Bright Star Pupils */
            <>
              <circle cx="76" cy="98" r="11" fill="#0f172a" />
              <circle cx="76" cy="98" r="6" fill="#38bdf8" />
              <path d="M 76 94 L 77 97 L 80 98 L 77 99 L 76 102 L 75 99 L 72 98 L 75 97 Z" fill="#ffffff" />
              <circle cx="124" cy="98" r="11" fill="#0f172a" />
              <circle cx="124" cy="98" r="6" fill="#38bdf8" />
              <path d="M 124 94 L 125 97 L 128 98 L 125 99 L 124 102 L 123 99 L 120 98 L 123 97 Z" fill="#ffffff" />
            </>
          ) : mood === 'secure' ? (
            /* Confident Guardian Wink / Focus */
            <>
              {/* Left Eye: Focused twinkle */}
              <circle cx="76" cy="99" r="10" fill="#0f172a" />
              <circle cx="74" cy="96" r="4" fill="#ffffff" />
              <circle cx="78" cy="101" r="2" fill="#34d399" />
              {/* Right Eye: Cheerful wink arc */}
              <path d="M 115 102 Q 124 93 133 102" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" fill="none" />
            </>
          ) : mood === 'care' ? (
            /* Gentle Caring Curved Eyes (◠ ‿ ◠) */
            <>
              <path d="M 68 102 Q 76 92 84 102" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" fill="none" />
              <path d="M 116 102 Q 124 92 132 102" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" fill="none" />
            </>
          ) : (
            /* Celebrate (Starry Big Smiles ★ ‿ ★) */
            <>
              <circle cx="76" cy="97" r="11" fill="#0f172a" />
              <polygon points="76,90 78,95 83,96 79,99 80,104 76,101 72,104 73,99 69,96 74,95" fill="#fde047" />
              <circle cx="124" cy="97" r="11" fill="#0f172a" />
              <polygon points="124,90 126,95 131,96 127,99 128,104 124,101 120,104 121,99 117,96 122,95" fill="#fde047" />
            </>
          )}
        </g>

        {/* --- MOUTH --- */}
        <g id="mascot-mouth">
          {mood === 'celebrate' || mood === 'idea' ? (
            /* Open Happy Mouth with Tongue */
            <path
              d="M 92 114 Q 100 128 108 114 Q 100 120 92 114 Z"
              fill="#be123c"
              stroke="#0f172a"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
          ) : (
            /* Soft Cat/Joyful Smile (w) */
            <path
              d="M 91 113 Q 96 119 100 115 Q 104 119 109 113"
              stroke="#0f172a"
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
            />
          )}
        </g>

        {/* --- HANDS & PROPS (MOOD-SPECIFIC) --- */}
        <g id="mascot-props">
          {mood === 'welcome' && (
            /* Waving Right Hand */
            <>
              {/* Left resting paw */}
              <ellipse cx="48" cy="132" rx="9" ry="12" fill="#38bdf8" stroke="#0ea5e9" strokeWidth="2" />
              {/* Right waving paw */}
              <g className="origin-[155px_115px] animate-[wiggle_1.5s_ease-in-out_infinite]">
                <ellipse cx="158" cy="98" rx="10" ry="14" fill="#38bdf8" stroke="#0ea5e9" strokeWidth="2" transform="rotate(35 158 98)" />
                {/* Motion sparkles */}
                <circle cx="174" cy="90" r="2" fill="#fef08a" />
                <circle cx="178" cy="105" r="2.5" fill="#67e8f9" />
              </g>
            </>
          )}

          {mood === 'feeling' && (
            /* Holding a Glowing Prismatic Mood Gem */
            <>
              <ellipse cx="68" cy="142" rx="9" ry="11" fill="#38bdf8" stroke="#0ea5e9" strokeWidth="2" />
              <ellipse cx="132" cy="142" rx="9" ry="11" fill="#38bdf8" stroke="#0ea5e9" strokeWidth="2" />
              {/* Prismatic Diamond Gem */}
              <polygon
                points="100,124 116,140 100,156 84,140"
                fill="url(#lumiSproutGrad)"
                stroke="#67e8f9"
                strokeWidth="2.2"
                filter="url(#eyeGleam)"
              />
              <polygon points="100,124 108,140 100,150 92,140" fill="#ffffff" opacity="0.6" />
            </>
          )}

          {mood === 'idea' && (
            /* Holding a Glowing Feather Quill */
            <>
              <ellipse cx="50" cy="135" rx="9" ry="11" fill="#38bdf8" stroke="#0ea5e9" strokeWidth="2" />
              <g>
                <ellipse cx="150" cy="120" rx="9" ry="12" fill="#38bdf8" stroke="#0ea5e9" strokeWidth="2" />
                {/* Glowing feather quill */}
                <path
                  d="M 148 116 Q 165 90 178 72 Q 164 96 156 120 Z"
                  fill="#fef08a"
                  stroke="#ca8a04"
                  strokeWidth="1.5"
                />
                <circle cx="154" cy="122" r="3" fill="#38bdf8" />
              </g>
            </>
          )}

          {mood === 'secure' && (
            /* Proud Guardian with Cyan Hologram Shield */
            <>
              <ellipse cx="52" cy="136" rx="9" ry="11" fill="#38bdf8" stroke="#0ea5e9" strokeWidth="2" />
              <ellipse cx="148" cy="136" rx="9" ry="11" fill="#38bdf8" stroke="#0ea5e9" strokeWidth="2" />
              {/* Shield */}
              <g transform="translate(75, 122) scale(0.9)">
                <path
                  d="M 28 0 L 52 8 C 52 35 38 52 28 60 C 18 52 4 35 4 8 Z"
                  fill="url(#lumiShieldGrad)"
                  stroke="#e0f2fe"
                  strokeWidth="2.2"
                />
                {/* Lock icon on shield */}
                <rect x="22" y="24" width="12" height="11" rx="2.5" fill="#ffffff" />
                <path d="M 25 24 V 19 C 25 16 31 16 31 19 V 24" stroke="#ffffff" strokeWidth="2" fill="none" />
                <circle cx="28" cy="29" r="1.5" fill="#0891b2" />
              </g>
            </>
          )}

          {mood === 'care' && (
            /* Holding a Warm Pulsing Rose Heart */
            <>
              <ellipse cx="70" cy="138" rx="8" ry="10" fill="#38bdf8" stroke="#0ea5e9" strokeWidth="2" />
              <ellipse cx="130" cy="138" rx="8" ry="10" fill="#38bdf8" stroke="#0ea5e9" strokeWidth="2" />
              {/* Heart */}
              <path
                d="M 100 148 C 100 148 82 134 82 122 C 82 114 88 109 95 109 C 98 109 100 112 100 112 C 100 112 102 109 105 109 C 112 109 118 114 118 122 C 118 134 100 148 100 148 Z"
                fill="url(#lumiHeartGrad)"
                stroke="#ffe4e6"
                strokeWidth="1.8"
                className="animate-pulse"
              />
            </>
          )}

          {mood === 'celebrate' && (
            /* Both Paws Raised in Celebration */
            <>
              <ellipse cx="44" cy="98" rx="10" ry="14" fill="#38bdf8" stroke="#0ea5e9" strokeWidth="2" transform="rotate(-35 44 98)" />
              <ellipse cx="156" cy="98" rx="10" ry="14" fill="#38bdf8" stroke="#0ea5e9" strokeWidth="2" transform="rotate(35 156 98)" />
              {/* Confetti pieces */}
              <rect x="30" y="55" width="5" height="5" rx="1" fill="#f43f5e" transform="rotate(25 30 55)" />
              <rect x="165" y="50" width="5" height="5" rx="1" fill="#3b82f6" transform="rotate(-30 165 50)" />
              <rect x="50" y="35" width="4" height="6" rx="1" fill="#eab308" transform="rotate(45 50 35)" />
              <rect x="150" y="38" width="6" height="4" rx="1" fill="#10b981" transform="rotate(15 150 38)" />
            </>
          )}
        </g>

        {/* Feet / Bottom Base */}
        <g id="mascot-feet">
          <ellipse cx="78" cy="188" rx="14" ry="8" fill="#0284c7" stroke="#0369a1" strokeWidth="1.5" />
          <ellipse cx="122" cy="188" rx="14" ry="8" fill="#0284c7" stroke="#0369a1" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
};
