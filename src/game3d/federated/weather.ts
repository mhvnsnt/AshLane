/**
 * Federated day/night + weather system for AshLane.
 *
 * Inspiration: skyeshark/eanpa-sky (MIT) — day/night cycle, 8 weather states,
 * rain with wetness, wind-driven grass. This is an original TypeScript
 * implementation of those patterns, sized for AshLane's sim.
 *
 * The sim owns the clock; the renderer reads this state to drive
 * sun position, fog, rain particles, and wet-material uniforms.
 */

export type WeatherState =
  | "clear" | "overcast" | "drizzle" | "rain"
  | "storm" | "fog" | "clear-night" | "storm-night";

export interface WeatherSim {
  /** 0..24 hours */
  timeOfDay: number;
  /** hours per real second */
  timeScale: number;
  weather: WeatherState;
  /** 0..1 how long current weather has been active (for transitions) */
  weatherBlend: number;
  /** target weather we're blending toward */
  targetWeather: WeatherState;
  /** 0..1 wetness of surfaces (drives reflections/puddles) */
  wetness: number;
  /** wind vector for grass/particles */
  windX: number;
  windZ: number;
  /** lightning flash 0..1 (decays) */
  lightning: number;
}

export function createWeather(startHour = 18): WeatherSim {
  return {
    timeOfDay: startHour,
    timeScale: 1 / 480, // full day = 8 min (matches naveenkcg/game pacing)
    weather: startHour >= 6 && startHour < 19 ? "clear" : "clear-night",
    weatherBlend: 1,
    targetWeather: "clear",
    wetness: 0,
    windX: 0.3,
    windZ: 0.1,
    lightning: 0,
  };
}

const RAINY: WeatherState[] = ["drizzle", "rain", "storm", "storm-night"];

export function updateWeather(w: WeatherSim, dt: number): void {
  w.timeOfDay = (w.timeOfDay + dt * w.timeScale) % 24;

  // Blend toward target weather
  if (w.weather !== w.targetWeather) {
    w.weatherBlend = Math.min(1, w.weatherBlend + dt * 0.1);
    if (w.weatherBlend >= 1) w.weather = w.targetWeather;
  } else {
    w.weatherBlend = Math.min(1, w.weatherBlend + dt * 0.1);
  }

  // Wetness rises in rain, dries otherwise
  const raining = RAINY.includes(w.weather);
  w.wetness = Math.max(0, Math.min(1,
    w.wetness + (raining ? dt * 0.08 : -dt * 0.02)));

  // Lightning: random strikes during storms
  w.lightning = Math.max(0, w.lightning - dt * 3);
  if ((w.weather === "storm" || w.weather === "storm-night") && Math.random() < dt * 0.15) {
    w.lightning = 1;
  }

  // Wind gusts
  w.windX += (Math.random() - 0.5) * dt * 0.4;
  w.windZ += (Math.random() - 0.5) * dt * 0.4;
  const mag = Math.hypot(w.windX, w.windZ) || 1;
  const target = raining ? 1.2 : 0.4;
  w.windX = (w.windX / mag) * target;
  w.windZ = (w.windZ / mag) * target;
}

/** 0..1 sun elevation; negative = night */
export function sunElevation(w: WeatherSim): number {
  return Math.sin(((w.timeOfDay - 6) / 12) * Math.PI);
}

export function isNight(w: WeatherSim): boolean {
  return sunElevation(w) < 0.05;
}

/** Rain intensity 0..1 for particle systems */
export function rainIntensity(w: WeatherSim): number {
  switch (w.weather) {
    case "drizzle": return 0.25;
    case "rain": return 0.6;
    case "storm": case "storm-night": return 1;
    default: return 0;
  }
}

/** Fog density 0..1 for the renderer */
export function fogDensity(w: WeatherSim): number {
  const base = w.weather === "fog" ? 0.8 : w.weather === "overcast" ? 0.3 : 0.08;
  return base + (isNight(w) ? 0.1 : 0);
}

/** Schedule a weather change (mission scripting, time-of-day events) */
export function setWeather(w: WeatherSim, next: WeatherState): void {
  if (next !== w.weather) {
    w.targetWeather = next;
    w.weatherBlend = 0;
  }
}
