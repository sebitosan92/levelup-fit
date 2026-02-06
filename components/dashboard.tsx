"use client"

import { motion } from "framer-motion"
import { Timer, Zap, TrendingUp, Edit2 } from "lucide-react"
import { LevelRing } from "./level-ring"
import { WorkoutTimer } from "./workout-timer"
import { WaterTracker } from "./water-tracker"
import { HoloCard } from "./holo-card"
import { WeatherEnvironment } from "./weather-env"
import { useWeather } from "@/lib/weather-store"
import { 
  useFitnessData, 
  useStatusMessage, 
  updateStatusMessage, 
  useAuth 
} from "@/lib/fitness-store"

export function Dashboard() {
  const user = useAuth()
  const fitness = useFitnessData()
  const status = useStatusMessage()
  const { vibe, temp } = useWeather()
  
  const minutesToNext = 30 - (fitness.totalMinutes % 30)
  
  // Dynamiczny kolor neonu zależny od pogody/temperatury
  const isCold = temp !== null && temp < 5
  const weatherColor = vibe === 'rainy' ? 'text-cyan-400' : 
                       vibe === 'sunny' ? 'text-orange-400' : 
                       isCold ? 'text-blue-500' : 'text-neon-green'

  return (
    <div className="relative px-4 pb-24 space-y-6 pt-8 min-h-screen">
      {/* Warstwa efektów pogodowych (deszcz/słońce) */}
      <WeatherEnvironment />
      
      {/* Główny kontener interfejsu */}
      <div className="relative z-10 space-y-6">
        
        {/* HEADER SECTION */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <motion.p 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`text-[10px] font-mono uppercase tracking-[0.2em] ${weatherColor}`}
            >
              {vibe} protocol active {temp !== null && `[${temp}°C]`}
            </motion.p>
            
            <h1 className="text-xl font-bold font-mono italic">
              <span className="text-neon-purple">LEVEL</span>
              <span className={weatherColor}>UP</span> FIT
            </h1>

            <div 
              onClick={() => { 
                const s = prompt("Update your status:", status); 
                if(s !== null) updateStatusMessage(s); 
              }} 
              className="cursor-pointer flex items-center gap-2 mt-2 group"
            >
              <p className="text-sm font-mono text-muted-foreground italic">"{status}"</p>
              <Edit2 size={10} className="text-neon-purple opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* LEVEL BADGE */}
          <div className="p-3 glass-card rounded-xl border border-white/10 text-center min-w-[80px] shadow-[0_0_15px_rgba(34,197,94,0.1)]">
            <Zap size={16} className={`${weatherColor} mx-auto mb-1 animate-pulse`} />
            <p className="text-xl font-black italic">LVL {fitness.currentLevel}</p>
          </div>
        </div>

        {/* LEVEL PROGRESS RING */}
        <div className="flex justify-center py-4">
          <LevelRing level={fitness.currentLevel} totalMinutes={fitness.totalMinutes} />
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-2 gap-4">
          <HoloCard>
            <div className="p-4 glass-card rounded-2xl h-full flex flex-col items-start">
              <Timer size={14} className="text-neon-purple mb-2" />
              <p className="text-2xl font-black italic">{fitness.totalMinutes}</p>
              <p className="text-[10px] text-muted-foreground uppercase font-mono tracking-tight">Total Minutes</p>
            </div>
          </HoloCard>

          <HoloCard>
            <div className="p-4 glass-card rounded-2xl h-full flex flex-col items-start">
              <TrendingUp size={14} className={`${weatherColor} mb-2`} />
              <p className="text-2xl font-black italic">{minutesToNext}</p>
              <p className="text-[10px] text-muted-foreground uppercase font-mono tracking-tight">To Next Level</p>
            </div>
          </HoloCard>
        </div>

        {/* INTERACTIVE TOOLS */}
        <div className="space-y-6">
          <WorkoutTimer />
          <WaterTracker />
        </div>

      </div>
    </div>
  )
}