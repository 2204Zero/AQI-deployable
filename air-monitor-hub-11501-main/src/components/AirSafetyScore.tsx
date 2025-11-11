import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { useSensorData } from '@/contexts/SensorDataContext';
import { calculateAQI, getAQILevel } from '@/lib/aqi';

export function AirSafetyScore() {
  const { sensorData } = useSensorData();
  const aqi = calculateAQI(sensorData.pm25);
  const aqiLevel = getAQILevel(aqi);

  // Calculate safety score (0-100)
  const calculateSafetyScore = () => {
    let score = 100;
    
    // AQI impact (0-50 points)
    if (aqi > 300) score -= 50;
    else if (aqi > 200) score -= 40;
    else if (aqi > 150) score -= 30;
    else if (aqi > 100) score -= 20;
    else if (aqi > 50) score -= 10;
    
    // PM2.5 impact (0-20 points)
    if (sensorData.pm25 > 150) score -= 20;
    else if (sensorData.pm25 > 100) score -= 15;
    else if (sensorData.pm25 > 50) score -= 10;
    
    // CO2 impact (0-15 points)
    if (sensorData.co2 > 2000) score -= 15;
    else if (sensorData.co2 > 1000) score -= 10;
    else if (sensorData.co2 > 800) score -= 5;
    
    // Temperature/Humidity impact (0-15 points)
    if (sensorData.temperature > 35 || sensorData.temperature < 10) score -= 10;
    if (sensorData.humidity > 70 || sensorData.humidity < 30) score -= 5;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const score = calculateSafetyScore();

  const getRiskLevel = () => {
    if (score >= 80) return { label: 'Excellent', color: 'text-success', icon: CheckCircle2, bg: 'bg-success/10' };
    if (score >= 60) return { label: 'Good', color: 'text-primary', icon: Shield, bg: 'bg-primary/10' };
    if (score >= 40) return { label: 'Moderate Risk', color: 'text-warning', icon: AlertTriangle, bg: 'bg-warning/10' };
    return { label: 'High Risk', color: 'text-destructive', icon: XCircle, bg: 'bg-destructive/10' };
  };

  const risk = getRiskLevel();
  const Icon = risk.icon;

  return (
    <Card className={`p-6 border-2 ${risk.bg}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Today's Air Safety Score</h3>
        <Icon className={`w-6 h-6 ${risk.color}`} />
      </div>
      
      <div className="text-center mb-4">
        <div className="inline-flex items-baseline gap-2">
          <span className={`text-6xl font-bold ${risk.color}`}>{score}</span>
          <span className="text-2xl text-muted-foreground">/100</span>
        </div>
      </div>

      <Badge className={`w-full justify-center py-2 ${risk.bg} ${risk.color}`}>
        {risk.label}
      </Badge>

      <div className="mt-4 pt-4 border-t border-border">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">AQI Level</p>
            <p className="font-semibold">{aqiLevel}</p>
          </div>
          <div>
            <p className="text-muted-foreground">PM2.5</p>
            <p className="font-semibold">{sensorData.pm25.toFixed(1)} μg/m³</p>
          </div>
          <div>
            <p className="text-muted-foreground">CO2</p>
            <p className="font-semibold">{sensorData.co2.toFixed(0)} ppm</p>
          </div>
          <div>
            <p className="text-muted-foreground">Humidity</p>
            <p className="font-semibold">{sensorData.humidity.toFixed(1)}%</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
