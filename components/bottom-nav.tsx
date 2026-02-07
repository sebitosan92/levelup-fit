"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Home, Shield, Trophy, Settings, Gift, Zap } from "lucide-react"

// Dodano 'habits' do typu TabId
export type TabId = 'home' | 'habits' | 'rewards' | 'vault' | 'leaderboard' | 'social' | 'settings';

interface BottomNavProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

// Lista zakładek - DYSCYPLINA wstawiona między BAZĘ a SEJF
const tabs = [
  { id: "home" as TabId, label: "BAZA", icon: Home },
  { id: "habits" as TabId, label: "DYSCYPLINA", icon: Zap }, // NOWA ZAKŁADKA
  { id: "vault" as TabId, label: "SEJF", icon: Shield },
  { id: "leaderboard" as TabId, label: "RANKING", icon: Trophy },
  { id: "settings" as TabId, label: "USTAWIENIA", icon: Settings },
]

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-2xl border-t border-white/10"
      role="navigation"
      aria-label="Nawigacja główna"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto h-20 px-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          
          // Specjalny kolor dla zakładki Dyscyplina (Pomarańczowy neon)
          const activeColor = tab.id === 'habits' ? 'text-orange-400' : 'text-purple-400';
          const glowColor = tab.id === 'habits' ? 'rgba(249,115,22,0.8)' : 'rgba(168,85,247,0.8)';
          const gradientLine = tab.id === 'habits' 
            ? "linear-gradient(90deg, #f97316, #fbbf24)" 
            : "linear-gradient(90deg, #a855f7, #22c55e)";

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-col items-center justify-center flex-1 h-full gap-1.5 transition-all duration-300 group"
              aria-label={tab.label}
              aria-current={isActive ? "page" : undefined}
            >
              {/* Neonowy indykator na górze przycisku */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute top-0 left-2 right-2 h-[2px] rounded-full"
                    style={{ 
                      background: gradientLine,
                      boxShadow: `0 0 15px ${tab.id === 'habits' ? '#f97316' : '#a855f7'}` 
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </AnimatePresence>

              {/* Ikona z efektem świecenia */}
              <tab.icon
                className={`w-5 h-5 transition-all duration-300 ${
                  isActive 
                    ? `${activeColor} drop-shadow-[0_0_8px_${glowColor}] scale-110` 
                    : "text-zinc-600 group-hover:text-zinc-400"
                }`}
              />

              {/* Tekst - stylistyka Neural Link */}
              <span
                className={`text-[7px] font-black uppercase tracking-[0.15em] transition-colors duration-300 ${
                  isActive ? activeColor : "text-zinc-600"
                }`}
              >
                {tab.label}
              </span>

              {/* Aktywny blask w tle ikony */}
              {isActive && (
                <motion.div 
                  layoutId="nav-glow" 
                  className={`absolute -inset-2 ${tab.id === 'habits' ? 'bg-orange-500/5' : 'bg-purple-500/5'} blur-xl rounded-full -z-10`} 
                />
              )}
            </button>
          )
        })}
      </div>
      
      {/* Obsługa tzw. "Home Indicator" na iPhone'ach */}
      <div className="h-[env(safe-area-inset-bottom)] bg-transparent" />
    </nav>
  )
}