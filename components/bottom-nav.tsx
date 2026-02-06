"use client"

import { Home, Shield, Trophy, Settings, Gift } from "lucide-react"
import { motion } from "framer-motion"

// Dodano 'leaderboard' do typu TabId
export type TabId = "home" | "vault" | "rewards" | "settings" | "leaderboard"

interface BottomNavProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

// Zaktualizowana lista tabów o Ranking
const tabs = [
  { id: "home" as TabId, label: "HQ", icon: Home },
  { id: "vault" as TabId, label: "Sejf", icon: Shield },
  { id: "leaderboard" as TabId, label: "Ranking", icon: Trophy },
  { id: "rewards" as TabId, label: "Loot", icon: Gift }, // Zmieniono na Gift dla odróżnienia od Trophy
  { id: "settings" as TabId, label: "Opcje", icon: Settings },
]

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 glassmorphism border-t border-white/10"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto h-16 px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-300"
              aria-label={tab.label}
              aria-current={isActive ? "page" : undefined}
            >
              {/* Neonowy indykator na górze przycisku */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute top-0 left-2 right-2 h-[2px] rounded-full shadow-[0_0_10px_#a855f7]"
                    style={{ 
                      background: "linear-gradient(90deg, #a855f7, #22c55e)" 
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </AnimatePresence>

              {/* Ikona z efektem świecenia jeśli aktywna */}
              <tab.icon
                className={`w-5 h-5 transition-all duration-300 ${
                  isActive 
                    ? "text-purple-400 drop-shadow-[0_0_5px_#a855f7] scale-110" 
                    : "text-zinc-500"
                }`}
              />

              {/* Tekst - font mono pasujący do Twojej stylistyki */}
              <span
                className={`text-[9px] font-mono font-black uppercase tracking-tighter transition-colors duration-300 ${
                  isActive ? "text-purple-400" : "text-zinc-500"
                }`}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
      
      {/* Obsługa tzw. "Home Indicator" na iPhone'ach */}
      <div className="h-[env(safe-area-inset-bottom)] bg-transparent" />
    </nav>
  )
}

// Importujemy AnimatePresence z framer-motion dla płynności indykatora
import { AnimatePresence } from "framer-motion"