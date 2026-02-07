'use client';

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dashboard } from "@/components/dashboard"
import { BottomNav, TabId } from "@/components/bottom-nav"
import { RewardsView } from "@/components/rewards-view"
import { MotivationVault } from "@/components/motivation-vault"
import { SettingsView } from "@/components/settings-view"
import { AuthScreen } from "@/components/auth-screen"
import { LeaderboardView } from "@/components/leaderboard-view" 
import { SocialView } from "@/components/social-view" 
import { useAuth } from "@/lib/fitness-store"

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>('home')
  const { user, initError } = useAuth()

  if (initError) {
    return (
      <main className="min-h-screen bg-[#020202] text-white flex items-center justify-center px-6">
        <div className="max-w-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto border border-red-500/50">
            <span className="text-2xl font-bold text-red-400">!</span>
          </div>
          <h1 className="text-xl font-bold font-mono">Configuration Required</h1>
          <p className="text-sm text-gray-400 font-mono leading-relaxed">{initError}</p>
          <p className="text-xs text-gray-500 font-mono">
            Set <code className="text-purple-400">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
            <code className="text-purple-400">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in your environment variables.
          </p>
        </div>
      </main>
    )
  }

  if (!user) {
    return <AuthScreen />
  }

  return (
    <main className="min-h-screen bg-[#020202] text-white relative overflow-x-hidden font-sans">
      
      {/* --- BACKGROUND DECORATION --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute inset-0 opacity-[0.2]" 
          style={{
            backgroundImage: `
              linear-gradient(to right, #a855f7 1px, transparent 1px),
              linear-gradient(to bottom, #22c55e 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-[-10%] left-[-5%] w-[70%] h-[50%] bg-purple-500/30 rounded-full blur-[110px]" 
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,transparent_0%,#020202_90%)]" />
      </div>

      {/* --- CONTENT LAYER --- */}
      {/* Dodaliśmy flex i flex-col oraz items-center, aby kontrolować dzieci */}
      <div className="relative z-10 max-w-md mx-auto pt-4 pb-40 flex flex-col items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            /* KLUCZ: h-auto i w-full zapobiegają rozciąganiu w pionie */
            className="w-full h-auto"
          >
            {activeTab === 'home' && <Dashboard />}
            
            {activeTab === 'rewards' && (
              <div className="px-4 pt-4"><RewardsView /></div>
            )}
            
            {activeTab === 'vault' && (
              <div className="px-4 pt-4"><MotivationVault /></div>
            )}

            {activeTab === 'leaderboard' && (
              <div className="px-4 pt-4"><LeaderboardView /></div>
            )}

            {/* --- ZMIANA TUTAJ: SZTYWNA BLOKADA DLA SOCIAL --- */}
            {activeTab === 'social' && (
              <div className="w-full px-4 flex justify-center" style={{ height: '250px', overflow: 'hidden' }}>
                <SocialView />
              </div>
            )}
            
            {activeTab === 'settings' && (
              <div className="px-4 pt-4"><SettingsView /></div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* --- NAVIGATION --- */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </main>
  )
}
