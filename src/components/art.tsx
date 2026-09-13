/**
 * Hand-drawn chibi-style illustrations in the game's flat, outlined look.
 * Each is a pure SVG so it scales and recolors; no external assets.
 */

export function HeroLifter({ size = 120 }: { size?: number }) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden>
      {/* sparkles */}
      <path d="M14 20l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="#fff" opacity=".9" />
      <path d="M104 14l1.5 4.5 4.5 1.5-4.5 1.5-1.5 4.5-1.5-4.5-4.5-1.5 4.5-1.5z" fill="#fff" opacity=".9" />
      <circle cx="96" cy="44" r="2" fill="#fff" opacity=".8" />
      {/* platform */}
      <ellipse cx="60" cy="108" rx="34" ry="7" fill="#1f6f3a" />
      <ellipse cx="60" cy="104" rx="34" ry="7" fill="#3fbf63" />
      {/* barbell */}
      <rect x="18" y="38" width="84" height="5" rx="2.5" fill="#3a3b40" stroke="#1a1a1c" strokeWidth="1.5" />
      <rect x="14" y="30" width="10" height="21" rx="3" fill="#e8445a" stroke="#1a1a1c" strokeWidth="1.5" />
      <rect x="96" y="30" width="10" height="21" rx="3" fill="#e8445a" stroke="#1a1a1c" strokeWidth="1.5" />
      <rect x="24" y="33" width="6" height="15" rx="2" fill="#f2b90c" stroke="#1a1a1c" strokeWidth="1.5" />
      <rect x="90" y="33" width="6" height="15" rx="2" fill="#f2b90c" stroke="#1a1a1c" strokeWidth="1.5" />
      {/* arms up */}
      <path d="M40 60 L36 44" stroke="#f6d2b4" strokeWidth="7" strokeLinecap="round" />
      <path d="M80 60 L84 44" stroke="#f6d2b4" strokeWidth="7" strokeLinecap="round" />
      <path d="M40 60 L36 44 M80 60 L84 44" stroke="#1a1a1c" strokeWidth="1.2" fill="none" opacity=".35" />
      {/* body */}
      <rect x="40" y="56" width="40" height="34" rx="12" fill="#3b6cff" stroke="#1a1a1c" strokeWidth="1.5" />
      <rect x="46" y="86" width="12" height="16" rx="4" fill="#26282e" stroke="#1a1a1c" strokeWidth="1.5" />
      <rect x="62" y="86" width="12" height="16" rx="4" fill="#26282e" stroke="#1a1a1c" strokeWidth="1.5" />
      {/* head */}
      <circle cx="60" cy="46" r="20" fill="#f6d2b4" stroke="#1a1a1c" strokeWidth="1.5" />
      <path d="M40 44 C 42 24, 78 24, 80 44 C 74 34, 46 34, 40 44 Z" fill="#2b1d16" />
      <path d="M44 34 l6-8 4 6 6-8 4 8 6-8 4 8" fill="#2b1d16" stroke="#2b1d16" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="53" cy="48" r="2.4" fill="#1a1a1c" />
      <circle cx="67" cy="48" r="2.4" fill="#1a1a1c" />
      <path d="M54 56 Q 60 61 66 56" stroke="#1a1a1c" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M46 52 q2 2 4 0" stroke="#e8445a" strokeWidth="1.2" fill="none" opacity=".5" />
      <path d="M70 52 q2 2 4 0" stroke="#e8445a" strokeWidth="1.2" fill="none" opacity=".5" />
      {/* headband */}
      <rect x="41" y="37" width="38" height="5" rx="2.5" fill="#e8445a" stroke="#1a1a1c" strokeWidth="1.2" />
    </svg>
  );
}

export function BossGolem({ size = 96 }: { size?: number }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden>
      <ellipse cx="50" cy="90" rx="34" ry="6" fill="#000" opacity=".35" />
      {/* aura */}
      <circle cx="50" cy="52" r="40" fill="#7c3aed" opacity=".18" />
      <circle cx="50" cy="52" r="30" fill="#a855f7" opacity=".14" />
      {/* body rocks */}
      <path d="M22 78 L18 52 L30 34 L50 26 L72 34 L82 54 L76 80 Z" fill="#5b5e6a" stroke="#1a1a1c" strokeWidth="2" strokeLinejoin="round" />
      <path d="M30 40 L44 34 L48 46 L34 52 Z" fill="#7b7f8e" />
      <path d="M56 32 L70 40 L66 54 L54 46 Z" fill="#7b7f8e" />
      <path d="M26 60 L40 58 L44 74 L30 76 Z" fill="#474a55" />
      {/* cracks glow */}
      <path d="M46 48 l4 8 -3 6 5 7" stroke="#f2b90c" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M60 56 l-3 7 4 5" stroke="#f2b90c" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* eyes */}
      <path d="M36 44 l10 4 -10 4 z" fill="#ff3b3b" />
      <path d="M64 44 l-10 4 10 4 z" fill="#ff3b3b" />
      {/* fists */}
      <circle cx="16" cy="66" r="9" fill="#5b5e6a" stroke="#1a1a1c" strokeWidth="2" />
      <circle cx="84" cy="66" r="9" fill="#5b5e6a" stroke="#1a1a1c" strokeWidth="2" />
      {/* crown */}
      <path d="M38 28 l4-10 6 8 4-12 4 12 6-8 4 10 z" fill="#f2b90c" stroke="#1a1a1c" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function ChefSlime({ size = 110 }: { size?: number }) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden>
      {/* steam */}
      <path d="M86 30 c-4 6 4 8 0 14" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity=".8" />
      <path d="M96 26 c-4 6 4 8 0 14" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity=".6" />
      {/* table */}
      <rect x="6" y="96" width="108" height="10" rx="4" fill="#8b5a2b" stroke="#1a1a1c" strokeWidth="1.5" />
      {/* bowl */}
      <path d="M70 76 h40 a20 20 0 0 1 -40 0 z" fill="#ffffff" stroke="#1a1a1c" strokeWidth="1.5" />
      <path d="M68 76 h44" stroke="#1a1a1c" strokeWidth="1.5" />
      <ellipse cx="90" cy="74" rx="19" ry="5" fill="#f2b90c" />
      <circle cx="82" cy="72" r="3.5" fill="#3fbf63" stroke="#1a1a1c" strokeWidth="1" />
      <circle cx="94" cy="71" r="3.5" fill="#e8445a" stroke="#1a1a1c" strokeWidth="1" />
      <circle cx="99" cy="75" r="2.5" fill="#ff9f43" stroke="#1a1a1c" strokeWidth="1" />
      {/* slime body */}
      <path d="M14 96 C 10 70, 20 50, 44 50 C 68 50, 78 70, 74 96 Z" fill="#7ad14a" stroke="#1a1a1c" strokeWidth="2" />
      <path d="M22 92 C 20 74, 28 60, 44 58" stroke="#b9f08a" strokeWidth="4" fill="none" strokeLinecap="round" opacity=".8" />
      {/* face */}
      <circle cx="36" cy="76" r="3" fill="#1a1a1c" />
      <circle cx="54" cy="76" r="3" fill="#1a1a1c" />
      <path d="M38 86 Q 45 92 52 86" stroke="#1a1a1c" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="30" cy="84" r="3" fill="#ff8fa3" opacity=".6" />
      <circle cx="60" cy="84" r="3" fill="#ff8fa3" opacity=".6" />
      {/* chef hat */}
      <rect x="28" y="40" width="32" height="12" rx="4" fill="#fff" stroke="#1a1a1c" strokeWidth="1.5" />
      <path d="M26 42 C 18 30, 32 20, 40 28 C 42 16, 58 16, 58 28 C 68 22, 76 32, 64 42 Z" fill="#fff" stroke="#1a1a1c" strokeWidth="1.5" />
      {/* spoon */}
      <path d="M62 70 L76 58" stroke="#c9c9c9" strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="78" cy="56" rx="5" ry="3.5" fill="#c9c9c9" stroke="#1a1a1c" strokeWidth="1" transform="rotate(-40 78 56)" />
    </svg>
  );
}

export function LeafBadge({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <path d="M12 3 C 6 6, 4 12, 5 19 C 12 18, 18 14, 19 5 C 16 4, 14 3, 12 3 Z" fill="#7ad14a" stroke="#1a1a1c" strokeWidth="1.2" />
      <path d="M6 18 C 10 13, 13 10, 17 7" stroke="#1a1a1c" strokeWidth="1.2" fill="none" />
    </svg>
  );
}

export function TreasureChest({ size = 96, open = false }: { size?: number; open?: boolean }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden>
      <ellipse cx="50" cy="90" rx="34" ry="6" fill="#000" opacity=".3" />
      {open && (
        <>
          <path d="M50 10 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z" fill="#ffd23f" />
          <path d="M22 26 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" fill="#fff" opacity=".9" />
          <path d="M78 22 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" fill="#fff" opacity=".9" />
          <ellipse cx="50" cy="52" rx="26" ry="8" fill="#ffd23f" opacity=".5" />
        </>
      )}
      {/* lid */}
      <path d={open ? "M18 44 L18 30 Q18 18 30 18 L70 18 Q82 18 82 30 L82 44 Z" : "M18 50 L18 38 Q18 26 30 26 L70 26 Q82 26 82 38 L82 50 Z"} fill="#a05a1c" stroke="#1a1a1c" strokeWidth="2" transform={open ? "rotate(-28 18 44)" : undefined} />
      <path d={open ? "M18 44 L18 30 Q18 18 30 18 L70 18 Q82 18 82 30 L82 44 Z" : "M18 50 L18 38 Q18 26 30 26 L70 26 Q82 26 82 38 L82 50 Z"} fill="none" stroke="#f2b90c" strokeWidth="3" strokeDasharray="0 0" transform={open ? "rotate(-28 18 44)" : undefined} opacity=".7" />
      {/* base */}
      <rect x="18" y="50" width="64" height="36" rx="5" fill="#c97a2b" stroke="#1a1a1c" strokeWidth="2" />
      <rect x="18" y="50" width="64" height="8" fill="#8a4d16" />
      <rect x="20" y="52" width="60" height="32" rx="4" fill="none" stroke="#f2b90c" strokeWidth="2.5" opacity=".8" />
      {/* lock */}
      <rect x="43" y="56" width="14" height="14" rx="3" fill="#f2b90c" stroke="#1a1a1c" strokeWidth="1.5" />
      <circle cx="50" cy="62" r="2.2" fill="#1a1a1c" />
      {/* gold inside when open */}
      {open && <ellipse cx="50" cy="52" rx="26" ry="6" fill="#ffd23f" stroke="#b58900" strokeWidth="1.5" />}
    </svg>
  );
}
