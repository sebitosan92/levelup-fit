"use client"

import { motion } from "framer-motion"

interface LevelRingProps {
  level: number
  totalMinutes: number
}

export function LevelRing({ level, totalMinutes }: LevelRingProps) {
  const minutesInCurrentLevel = totalMinutes % 30
  const progress = minutesInCurrentLevel / 30

  const radius = 105
  const strokeWidth = 6
  const normalizedRadius = radius - strokeWidth / 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - progress * circumference

  // Track outline ring
  const outerRadius = radius + 14
  const outerStroke = 1

  return (
    <div className="relative flex items-center justify-center">
      {/* Poświaty tła (Ambient pulse glow) */}
      <div
        className="absolute w-64 h-64 rounded-full animate-ring-pulse"
        style={{
          background: "radial-gradient(circle, hsl(270 80% 65% / 0.12) 0%, transparent 70%)",
        }}
      />

      <svg
        height={(outerRadius + outerStroke) * 2}
        width={(outerRadius + outerStroke) * 2}
        className="transform -rotate-90"
        aria-hidden="true"
      >
        {/* Zewnętrzny pierścień dekoracyjny */}
        <circle
          stroke="hsl(240 8% 16% / 0.6)"
          fill="transparent"
          strokeWidth={outerStroke}
          strokeDasharray="4 8"
          r={outerRadius}
          cx={outerRadius + outerStroke}
          cy={outerRadius + outerStroke}
        />

        {/* Tło ścieżki progresu */}
        <circle
          stroke="hsl(240 8% 14%)"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={outerRadius + outerStroke}
          cy={outerRadius + outerStroke}
        />

        {/* Łuk postępu (Progress arc) */}
        <motion.circle
          stroke="url(#levelGradientV2)"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={outerRadius + outerStroke}
          cy={outerRadius + outerStroke}
          style={{ strokeDasharray: circumference }}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          filter="url(#glow)"
        />

        {/* Definicje filtrów i gradientów */}
        <defs>
          <linearGradient id="levelGradientV2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(270 80% 65%)" />
            <stop offset="50%" stopColor="hsl(270 70% 70%)" />
            <stop offset="100%" stopColor="hsl(142 72% 50%)" />
          </linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* Treść centralna */}
      <div className="absolute flex flex-col items-center">
        <span className="text-[10px] font-mono text-white/40 uppercase tracking-[0.25em]">
          Poziom
        </span>
        <motion.span
          key={level}
          initial={{ scale: 0.5, opacity: 0, y: 5 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="text-5xl font-bold text-white neon-purple-text font-mono leading-none mt-1"
        >
          {level}
        </motion.span>
        <div className="flex items-center gap-1 mt-2">
          <div className="w-1 h-1 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]" />
          <span className="text-[10px] text-white/50 font-mono uppercase tracking-tight">
            {minutesInCurrentLevel} / 30 MIN
          </span>
        </div>
      </div>
    </div>
  )
}