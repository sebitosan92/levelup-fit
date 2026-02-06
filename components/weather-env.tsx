"use client"
import { useEffect } from "react"
import { useWeather } from "@/lib/weather-store"

export function WeatherEnvironment() {
  const { vibe, fetchWeather } = useWeather()

  useEffect(() => {
    fetchWeather()
    const interval = setInterval(fetchWeather, 600000) // Odświeżaj co 10 min
    return () => clearInterval(interval)
  }, [])

  if (vibe === 'rainy') {
    return (
      <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
        {/* Generujemy 20 kropel deszczu */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-gradient-to-b from-transparent to-cyan-400/30 w-[1px] h-[100px]"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-${Math.random() * 100}px`,
              animation: `fall ${0.5 + Math.random() * 0.5}s linear infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
        <style jsx>{`
          @keyframes fall {
            to { transform: translateY(110vh); }
          }
        `}</style>
      </div>
    )
  }

  if (vibe === 'sunny') {
    return (
      <div className="fixed inset-0 pointer-events-none z-[60] bg-orange-500/5 mix-blend-overlay">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-400/20 blur-[120px] rounded-full animate-pulse" />
      </div>
    )
  }

  return null // Dla pochmurnej pogody zostawiamy czysty interfejs
}