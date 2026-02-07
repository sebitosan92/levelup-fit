"use client"

import { motion } from "framer-motion"

interface Stats {
  strength: number
  speed: number
  defense: number
  focus: number
  xp: number
}

export function StatsRadar({ stats }: { stats: Stats }) {
  // Mapujemy statystyki na punkty (skala 0-100 dla wykresu)
  // Jeśli statystyki są małe na początku, możemy je pomnożyć dla lepszego efektu
  const s = {
    str: Math.min(stats.strength + 20, 100),
    spd: Math.min(stats.speed + 20, 100),
    def: Math.min(stats.defense + 20, 100),
    foc: Math.min(stats.focus + 20, 100),
    xp: Math.min((stats.xp % 100) + 20, 100)
  }

  // Obliczanie punktów wielokąta (Polygon)
  const points = [
    `50,${100 - s.str}`,     // Top (Strength)
    `${50 + (s.spd * 0.475)},${50 - (s.spd * 0.15)}`, // Top-Right (Speed)
    `${50 + (s.def * 0.3)},${50 + (s.def * 0.45)}`,   // Bottom-Right (Defense)
    `${50 - (s.foc * 0.3)},${50 + (s.foc * 0.45)}`,   // Bottom-Left (Focus)
    `${50 - (s.xp * 0.475)},${50 - (s.xp * 0.15)}`    // Top-Left (XP/Energy)
  ].join(" ")

  return (
    <div className="relative w-48 h-48 mx-auto my-4">
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        {/* Background Grids */}
        {[0.2, 0.4, 0.6, 0.8, 1].map((p) => (
          <circle
            key={p}
            cx="50"
            cy="50"
            r={50 * p}
            fill="none"
            stroke="white"
            strokeOpacity="0.05"
            strokeWidth="0.5"
          />
        ))}
        
        {/* Axis Lines */}
        <line x1="50" y1="50" x2="50" y2="0" stroke="white" strokeOpacity="0.1" strokeWidth="0.5" />
        <line x1="50" y1="50" x2="100" y2="35" stroke="white" strokeOpacity="0.1" strokeWidth="0.5" />
        <line x1="50" y1="50" x2="80" y2="95" stroke="white" strokeOpacity="0.1" strokeWidth="0.5" />
        <line x1="50" y1="50" x2="20" y2="95" stroke="white" strokeOpacity="0.1" strokeWidth="0.5" />
        <line x1="50" y1="50" x2="0" y2="35" stroke="white" strokeOpacity="0.1" strokeWidth="0.5" />

        {/* The Stats Shape */}
        <motion.polygon
          points={points}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          fill="rgba(168, 85, 247, 0.2)"
          stroke="#a855f7"
          strokeWidth="1.5"
          strokeLinejoin="round"
          className="drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]"
        />

        {/* Labels */}
        <text x="50" y="-5" textAnchor="middle" fontSize="5" className="fill-muted-foreground font-mono uppercase tracking-widest">STR</text>
        <text x="105" y="35" textAnchor="start" fontSize="5" className="fill-muted-foreground font-mono uppercase tracking-widest">SPD</text>
        <text x="85" y="102" textAnchor="start" fontSize="5" className="fill-muted-foreground font-mono uppercase tracking-widest">DEF</text>
        <text x="15" y="102" textAnchor="end" fontSize="5" className="fill-muted-foreground font-mono uppercase tracking-widest">FOC</text>
        <text x="-5" y="35" textAnchor="end" fontSize="5" className="fill-muted-foreground font-mono uppercase tracking-widest">XP</text>
      </svg>
    </div>
  )
}