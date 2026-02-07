"use client"

import React from "react"
import { motion } from "framer-motion"
import { useFitnessData } from "@/lib/fitness-store"

// 1. Interfejs z polskimi nazwami dla jasności logiki
interface Stats {
  strength: number;  // SIŁA
  speed: number;     // SZYBKOŚĆ
  defense: number;   // OBRONA
  focus: number;     // SKUPIENIE
  endurance: number; // WYTRZYMAŁOŚĆ
}

export function StatsRadar() {
  const fitness = useFitnessData()
  
  // 2. Kalkulacja statystyk (mapowanie danych na wartości liczbowe)
  const stats: Stats = {
    strength: Math.floor((fitness?.totalMinutes || 0) / 10),
    speed: Math.floor((fitness?.totalMinutes || 0) / 12),
    defense: Math.floor((fitness?.currentLevel || 0) * 5),
    focus: Math.floor((fitness?.currentLevel || 0) * 4),
    endurance: Math.floor((fitness?.totalMinutes || 0) / 8),
  }

  // 3. Skalowanie wizualne (min 20, by wykres zawsze był widoczny)
  const s = {
    str: Math.min(stats.strength + 20, 100),
    spd: Math.min(stats.speed + 20, 100),
    def: Math.min(stats.defense + 20, 100),
    foc: Math.min(stats.focus + 20, 100),
    end: Math.min(stats.endurance + 20, 100),
  }

  // 4. Współrzędne wierzchołków radaru
  const pointsArray: [number, number][] = [
    [50, 100 - s.str],                           // GÓRA: SIŁ
    [50 + s.spd * 0.47, 50 - s.spd * 0.15],      // PRAWA-GÓRA: SZY
    [50 + s.def * 0.29, 50 + s.def * 0.4],       // PRAWA-DÓŁ: OBR
    [50 - s.foc * 0.29, 50 + s.foc * 0.4],       // LEWA-DÓŁ: SKU
    [50 - s.end * 0.47, 50 - s.end * 0.15],      // LEWA-GÓRA: WYT
  ]

  const pointsString = pointsArray.map(p => p.join(",")).join(" ")

  return (
    <div className="relative w-64 h-64 flex items-center justify-center">
      {/* Blask tła */}
      <div className="absolute inset-0 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" />
      
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(6,182,212,0.3)] overflow-visible">
        {/* Siatka pomocnicza (pajęczyna) */}
        <polygon points="50,5 95,35 75,90 25,90 5,35" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
        <polygon points="50,27.5 72.5,42.5 62.5,70 37.5,70 27.5,42.5" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
        
        {/* Osie główne */}
        {["50,5", "95,35", "75,90", "25,90", "5,35"].map((p, i) => (
          <line key={`axis-${i}`} x1="50" y1="50" x2={p.split(",")[0]} y2={p.split(",")[1]} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
        ))}

        {/* Poligon statystyk użytkownika */}
        <motion.polygon
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "backOut" }}
          points={pointsString}
          fill="rgba(6, 182, 212, 0.25)"
          stroke="#06b6d4"
          strokeWidth="1.5"
        />

        {/* Wierzchołki (punkty węzłowe) */}
        {pointsArray.map((p, i) => (
          <circle key={`dot-${i}`} cx={p[0]} cy={p[1]} r="1.5" fill="#06b6d4" />
        ))}
      </svg>

      {/* ETYKIETY STATYSTYK - SPOLSZCZONE */}
      {/* SIŁA (Góra) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-6 flex flex-col items-center">
        <span className="text-[8px] font-black text-white uppercase tracking-widest">SIŁ</span>
        <span className="text-[7px] text-cyan-400 font-mono font-bold">{stats.strength}</span>
      </div>

      {/* SZYBKOŚĆ (Prawa-Góra) */}
      <div className="absolute top-[25%] right-0 translate-x-8 flex flex-col items-center">
        <span className="text-[8px] font-black text-white uppercase tracking-widest">SZY</span>
        <span className="text-[7px] text-cyan-400 font-mono font-bold">{stats.speed}</span>
      </div>

      {/* OBRONA (Prawa-Dół) */}
      <div className="absolute bottom-0 right-[15%] translate-y-6 flex flex-col items-center">
        <span className="text-[8px] font-black text-white uppercase tracking-widest">OBR</span>
        <span className="text-[7px] text-cyan-400 font-mono font-bold">{stats.defense}</span>
      </div>

      {/* SKUPIENIE (Lewa-Dół) */}
      <div className="absolute bottom-0 left-[15%] translate-y-6 flex flex-col items-center">
        <span className="text-[8px] font-black text-white uppercase tracking-widest">SKU</span>
        <span className="text-[7px] text-cyan-400 font-mono font-bold">{stats.focus}</span>
      </div>

      {/* WYTRZYMAŁOŚĆ (Lewa-Góra) */}
      <div className="absolute top-[25%] left-0 -translate-x-8 flex flex-col items-center">
        <span className="text-[8px] font-black text-white uppercase tracking-widest">WYT</span>
        <span className="text-[7px] text-cyan-400 font-mono font-bold">{stats.endurance}</span>
      </div>
    </div>
  )
}