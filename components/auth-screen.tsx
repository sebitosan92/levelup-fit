"use client"

import React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { User, Lock, ArrowRight, Zap } from "lucide-react"
import { loginUser, signupUser } from "@/lib/fitness-store"

export function AuthScreen() {
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = mode === "login"
        ? await loginUser(username, password)
        : await signupUser(username, password)

      if (result?.error) {
        setError(result.error.message || "Something went wrong")
      }
    } catch (err: any) {
      setError(err?.message || "Connection protocol failed. Check your Supabase configuration.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden bg-background">
      {/* Ambient glow - tło */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full pointer-events-none opacity-20"
        style={{ background: "radial-gradient(circle, #a855f7 0%, transparent 70%)" }}
      />

      <motion.div
        className="w-full max-w-sm z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <motion.div
          className="flex flex-col items-center mb-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="w-16 h-16 rounded-2xl bg-neon-purple/20 flex items-center justify-center mb-4 border border-neon-purple/50 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
            <Zap className="w-8 h-8 text-neon-purple" />
          </div>
          <h1 className="text-2xl font-bold font-mono tracking-tight text-center">
            <span className="text-neon-purple">LEVEL</span>
            <span className="text-neon-green">UP</span>
            <span className="text-foreground"> FIT</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-mono uppercase tracking-widest text-[10px]">
            {mode === "login" ? "Identity required" : "Initialize profile"}
          </p>
        </motion.div>

        {/* Tab switcher */}
        <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10 mb-6">
          {(["login", "signup"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setError("") }}
              className={`flex-1 py-2.5 rounded-lg text-xs font-mono font-medium transition-all ${
                mode === m
                  ? "bg-neon-purple text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m === "login" ? "LOG IN" : "SIGN UP"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground font-mono text-sm focus:outline-none focus:border-neon-purple/50 transition-all"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground font-mono text-sm focus:outline-none focus:border-neon-purple/50 transition-all"
              required
            />
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-xs text-red-400 font-mono text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-neon-purple text-white font-mono text-sm font-bold shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all disabled:opacity-50"
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {mode === "login" ? "ACCESS ARENA" : "JOIN REBELLION"}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </form>

        <p className="text-center text-[10px] text-muted-foreground font-mono mt-8 uppercase tracking-tighter">
          {mode === "login" ? "No credentials found? " : "Already registered? "}
          <button
            type="button"
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError("") }}
            className="text-neon-purple hover:text-neon-green transition-colors underline"
          >
            {mode === "login" ? "Create ID" : "Verify ID"}
          </button>
        </p>
      </motion.div>
    </div>
  )
}
