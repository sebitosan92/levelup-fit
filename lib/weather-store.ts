"use client"
import { create } from 'zustand'

type WeatherVibe = 'sunny' | 'rainy' | 'cloudy'

interface WeatherState {
  vibe: WeatherVibe
  temp: number | null
  fetchWeather: () => Promise<void>
}

export const useWeather = create<WeatherState>((set) => ({
  vibe: 'cloudy',
  temp: null,
  fetchWeather: async () => {
    try {
      // Lokalizacja Zgierz (szerokość: 51.85, długość: 19.41)
      const res = await fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=51.85&longitude=19.41&current_weather=true"
      );
      const data = await res.json();
      const code = data.current_weather.weathercode;
      const temp = data.current_weather.temperature;

      let currentVibe: WeatherVibe = 'cloudy';
      if ([0, 1, 2].includes(code)) currentVibe = 'sunny';
      if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) currentVibe = 'rainy';

      set({ vibe: currentVibe, temp });
    } catch (e) {
      console.error("Weather fetch failed", e);
    }
  }
}))