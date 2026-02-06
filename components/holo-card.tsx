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
    
    // Obliczanie pozycji kursora względem karty (0 do 1)
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    
    // Mocniejsza rotacja, żeby na pewno było widać (do 25 stopni)
    setRotate({ x: (y - 0.5) * 30, y: (x - 0.5) * -30 })
    setLight({ x: x * 100, y: y * 100 })
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { setRotate({ x: 0, y: 0 }); setLight({ x: 50, y: 50 }); }}
      animate={{ rotateX: rotate.x, rotateY: rotate.y }}
      transition={{ type: "spring", stiffness: 150, damping: 20 }}
      style={{ transformStyle: "preserve-3d" }}
      className="relative group w-full"
    >
      {/* ODBlASK - To powinno być białe i bardzo widoczne przy ruchu */}
      <div 
        className="absolute inset-0 z-30 pointer-events-none rounded-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at ${light.x}% ${light.y}%, rgba(255,255,255,0.4) 0%, transparent 60%)`,
        }}
      />
      
      {/* TĘCZA - Holograficzny kolor */}
      <div 
        className="absolute inset-0 z-20 pointer-events-none rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"
        style={{
          background: `linear-gradient(${light.x}deg, #ff00ee, #00ffaa, #00d4ff)`,
          mixBlendMode: 'color-dodge'
        }}
      />

      <div style={{ transform: "translateZ(30px)" }}>
        {children}
      </div>
    </motion.div>
  )
}