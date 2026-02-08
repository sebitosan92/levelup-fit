"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Home, Shield, Trophy, Settings, Zap } from "lucide-react"

export type TabId = 'home' | 'habits' | 'rewards' | 'vault' | 'leaderboard' | 'social' | 'settings';

interface BottomNavProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

const tabs = [
  { id: "home" as TabId, label: "BAZA", icon: Home },
  { id: "habits" as TabId, label: "DYSCYPLINA", icon: Zap },
  { id: "vault" as TabId, label: "SEJF", icon: Shield },
  { id: "leaderboard" as TabId, label: "RANKING", icon: Trophy },
  { id: "settings" as TabId, label: "OPCJE", icon: Settings },
]

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-2xl border-t border-white/10"
      role="navigation"
      aria-label="Nawigacja główna"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto h-20 px-0.5">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          
          const getColors = () => {
            if (tab.id === 'habits') return { 
              active: 'text-orange-400', 
              glow: 'rgba(249,115,22,0.8)', 
              gradient: "linear-gradient(90deg, #f97316, #fbbf24)",
              shadow: '#f97316'
            };
            return { 
              active: 'text-purple-400', 
              glow: 'rgba(168,85,247,0.8)', 
              gradient: "linear-gradient(90deg, #a855f7, #22c55e)",
              shadow: '#a855f7'
            };
          }

          const colors = getColors();

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-300 group"
              aria-label={tab.label}
              aria-current={isActive ? "page" : undefined}
            >
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute top-0 left-1 right-1 h-[2px] rounded-full"
                    style={{ 
                      background: colors.gradient,
                      boxShadow: `0 0 15px ${colors.shadow}` 
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </AnimatePresence>

              <tab.icon
                className={`w-5 h-5 transition-all duration-300 ${
                  isActive 
                    ? `${colors.active} drop-shadow-[0_0_8px_${colors.glow}] scale-110` 
                    : "text-zinc-600 group-hover:text-zinc-400"
                }`}
              />

              <span
                className={`text-[7px] font-black uppercase tracking-[0.1em] transition-colors duration-300 ${
                  isActive ? colors.active : "text-zinc-600"
                }`}
              >
                {tab.label}
              </span>

              {isActive && (
                <motion.div 
                  layoutId="nav-glow" 
                  className={`absolute -inset-1 ${
                    tab.id === 'habits' ? 'bg-orange-500/5' : 'bg-purple-500/5'
                  } blur-xl rounded-full -z-10`} 
                />
              )}
            </button>
          )
        })}
      </div>
      
      <div className="h-[env(safe-area-inset-bottom)] bg-transparent" />
    </nav>
  )
}