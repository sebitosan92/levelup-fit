"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"

interface ConfettiProps {
  show: boolean
  onComplete?: () => void
}

const COLORS = [
  "hsl(270 80% 65%)", // Fiolet
  "hsl(270 80% 75%)", 
  "hsl(142 72% 50%)", // Neonowa zieleń
  "hsl(142 72% 65%)", 
  "hsl(0 0% 95%)",    // Biały
  "hsl(270 60% 80%)", 
]

interface Particle {
  id: number
  x: number
  color: string
  size: number
  delay: number
  rotateEnd: number
  shape: "square" | "rect" | "circle"
}

export function Confetti({ show, onComplete }: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    if (show) {
      const shapes: Particle["shape"][] = ["square", "rect", "circle"]
      const newParticles: Particle[] = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: Math.random() * 8 + 4,
        delay: Math.random() * 0.6,
        rotateEnd: Math.random() * 1080 - 540,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      }))
      setParticles(newParticles)
      const timer = setTimeout(() => {
        setParticles([])
        onComplete?.()
      }, 3500)
      return () => clearTimeout(timer)
    }
  }, [show, onComplete])

  return (
    <AnimatePresence>
      {particles.length > 0 && (
        <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute"
              style={{
                left: `${p.x}%`,
                width: p.shape === "rect" ? p.size * 1.5 : p.size,
                height: p.shape === "rect" ? p.size * 0.6 : p.size,
                backgroundColor: p.color,
                borderRadius: p.shape === "circle" ? "50%" : "1px",
              }}
              initial={{ y: -20, opacity: 1, rotate: 0, scale: 1 }}
              animate={{
                y: "100vh",
                opacity: [1, 1, 0],
                rotate: p.rotateEnd,
                scale: [1, 1.2, 0.5],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 2.5 + Math.random() * 0.5,
                delay: p.delay,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            />
          ))}

          {/* Nakładka tekstu Level Up */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.1, 1], opacity: [0, 1, 1] }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center glass-card rounded-[2.5rem] px-10 py-6 border border-white/10 shadow-[0_0_50px_rgba(168,85,247,0.2)] bg-black/60 backdrop-blur-xl">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-2">
                Osiągnięcie odblokowane
              </p>
              <p className="text-4xl font-black text-neon-green italic tracking-tighter shadow-green-500/50 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]">
                AWANS POZIOMU!
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}