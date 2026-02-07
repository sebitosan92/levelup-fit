"use client"
import React, { useRef, useState } from "react"
import { motion } from "framer-motion"

export function HoloCard({ children }: { children: React.ReactNode }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [rotate, setRotate] = useState({ x: 0, y: 0 })
  const [light, setLight] = useState({ x: 50, y: 50 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    
    // Obliczanie pozycji kursora (0 do 1)
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    
    // Rotacja do 30 stopni dla lepszego efektu głębi
    setRotate({ x: (y - 0.5) * 30, y: (x - 0.5) * -30 })
    setLight({ x: x * 100, y: y * 100 })
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { 
        setRotate({ x: 0, y: 0 }); 
        setLight({ x: 50, y: 50 }); 
      }}
      animate={{ rotateX: rotate.x, rotateY: rotate.y }}
      transition={{ type: "spring", stiffness: 150, damping: 20 }}
      style={{ transformStyle: "preserve-3d" }}
      className="relative group w-full"
    >
      {/* REFLEKS ŚWIETLNY - Dynamiczny biały blask */}
      <div 
        className="absolute inset-0 z-30 pointer-events-none rounded-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at ${light.x}% ${light.y}%, rgba(255,255,255,0.4) 0%, transparent 60%)`,
        }}
      />
      
      {/* WARSTWA HOLOGRAFICZNA - Neonowe przejścia kolorystyczne */}
      <div 
        className="absolute inset-0 z-20 pointer-events-none rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"
        style={{
          background: `linear-gradient(${light.x}deg, #ff00ee, #00ffaa, #00d4ff)`,
          mixBlendMode: 'color-dodge'
        }}
      />

      {/* KONTENER TREŚCI - Wypchnięty do przodu (efekt 3D) */}
      <div style={{ transform: "translateZ(30px)" }}>
        {children}
      </div>

      {/* Dodatkowy techniczny szum w tle (opcjonalny detal) */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none rounded-2xl" />
    </motion.div>
  )
}