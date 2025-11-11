// AQI (Air Quality Index) calculation and utilities

export type AQILevel = 'good' | 'moderate' | 'unhealthy_sensitive' | 'unhealthy' | 'very_unhealthy' | 'hazardous';

export interface AQIInfo {
  value: number;
  level: AQILevel;
  color: string;
  label: string;
  description: string;
  healthAdvice: string;
}

// Calculate AQI based on PM2.5 (using US EPA standard)
export function calculateAQI(pm25: number): number {
  const breakpoints = [
    { cLow: 0.0, cHigh: 12.0, iLow: 0, iHigh: 50 },
    { cLow: 12.1, cHigh: 35.4, iLow: 51, iHigh: 100 },
    { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150 },
    { cLow: 55.5, cHigh: 150.4, iLow: 151, iHigh: 200 },
    { cLow: 150.5, cHigh: 250.4, iLow: 201, iHigh: 300 },
    { cLow: 250.5, cHigh: 500.4, iLow: 301, iHigh: 500 }
  ];

  for (const bp of breakpoints) {
    if (pm25 >= bp.cLow && pm25 <= bp.cHigh) {
      const aqi = ((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (pm25 - bp.cLow) + bp.iLow;
      return Math.round(aqi);
    }
  }

  return pm25 > 500.4 ? 500 : 0;
}

export function getAQILevel(aqi: number): AQILevel {
  if (aqi <= 50) return 'good';
  if (aqi <= 100) return 'moderate';
  if (aqi <= 150) return 'unhealthy_sensitive';
  if (aqi <= 200) return 'unhealthy';
  if (aqi <= 300) return 'very_unhealthy';
  return 'hazardous';
}

export function getAQIInfo(aqi: number): AQIInfo {
  const level = getAQILevel(aqi);
  
  const info: Record<AQILevel, Omit<AQIInfo, 'value' | 'level'>> = {
    good: {
      color: 'hsl(var(--success))',
      label: 'Good',
      description: 'Air quality is satisfactory',
      healthAdvice: 'Air quality is considered satisfactory, and air pollution poses little or no risk.'
    },
    moderate: {
      color: 'hsl(145 60% 50%)',
      label: 'Moderate',
      description: 'Acceptable for most',
      healthAdvice: 'Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution.'
    },
    unhealthy_sensitive: {
      color: 'hsl(var(--warning))',
      label: 'Unhealthy for Sensitive Groups',
      description: 'Sensitive groups may be affected',
      healthAdvice: 'Members of sensitive groups may experience health effects. The general public is less likely to be affected.'
    },
    unhealthy: {
      color: 'hsl(25 85% 50%)',
      label: 'Unhealthy',
      description: 'Everyone may begin to feel effects',
      healthAdvice: 'Some members of the general public may experience health effects; members of sensitive groups may experience more serious health effects.'
    },
    very_unhealthy: {
      color: 'hsl(0 75% 50%)',
      label: 'Very Unhealthy',
      description: 'Health alert',
      healthAdvice: 'Health alert: The risk of health effects is increased for everyone.'
    },
    hazardous: {
      color: 'hsl(300 70% 40%)',
      label: 'Hazardous',
      description: 'Health warning of emergency conditions',
      healthAdvice: 'Health warning of emergency conditions: everyone is more likely to be affected.'
    }
  };

  return {
    value: aqi,
    level,
    ...info[level]
  };
}

export function getParameterStatus(value: number, parameter: 'pm10' | 'pm25' | 'co2' | 'humidity' | 'temperature' | 'mq135'): {
  safe: boolean;
  level: 'good' | 'moderate' | 'poor';
  color: string;
} {
  const thresholds = {
    pm10: { good: 50, moderate: 100 },
    pm25: { good: 25, moderate: 60 },
    co2: { good: 800, moderate: 1000 },
    humidity: { good: 60, moderate: 70 },
    temperature: { good: 30, moderate: 35 },
    mq135: { good: 300, moderate: 500 }
  };

  const t = thresholds[parameter];
  
  if (value <= t.good) {
    return { safe: true, level: 'good', color: 'hsl(var(--success))' };
  } else if (value <= t.moderate) {
    return { safe: true, level: 'moderate', color: 'hsl(var(--warning))' };
  } else {
    return { safe: false, level: 'poor', color: 'hsl(var(--destructive))' };
  }
}