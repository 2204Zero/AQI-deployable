import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dumbbell, Wind, Home, Trees, AlertCircle, CheckCircle } from 'lucide-react';
import { useSensorData } from '@/contexts/SensorDataContext';
import { calculateAQI } from '@/lib/aqi';

export function ActivityRecommendations() {
  const { sensorData } = useSensorData();
  const aqi = calculateAQI(sensorData.pm25);

  const getRecommendations = () => {
    if (aqi <= 50) {
      return [
        { icon: Trees, text: 'Perfect for outdoor activities', safe: true },
        { icon: Dumbbell, text: 'Great for outdoor exercise', safe: true },
        { icon: Wind, text: 'Enjoy fresh air activities', safe: true },
      ];
    } else if (aqi <= 100) {
      return [
        { icon: Dumbbell, text: 'Moderate outdoor exercise is fine', safe: true },
        { icon: Trees, text: 'Limit prolonged outdoor activities', safe: false },
        { icon: Wind, text: 'Consider indoor alternatives for sensitive groups', safe: false },
      ];
    } else if (aqi <= 150) {
      return [
        { icon: Home, text: 'Stay indoors as much as possible', safe: false },
        { icon: AlertCircle, text: 'Avoid strenuous outdoor activities', safe: false },
        { icon: Wind, text: 'Keep windows closed', safe: false },
      ];
    } else {
      return [
        { icon: Home, text: 'Stay indoors and use air purifiers', safe: false },
        { icon: AlertCircle, text: 'Avoid all outdoor activities', safe: false },
        { icon: Wind, text: 'Wear N95 mask if going outside', safe: false },
      ];
    }
  };

  const recommendations = getRecommendations();

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Activity Recommendations</h3>
        <Badge variant={aqi <= 100 ? 'default' : 'destructive'}>
          AQI: {aqi}
        </Badge>
      </div>

      <div className="space-y-3">
        {recommendations.map((rec, index) => {
          const Icon = rec.icon;
          return (
            <div
              key={index}
              className={`flex items-center gap-3 p-3 rounded-lg border ${
                rec.safe
                  ? 'bg-success/10 border-success/20'
                  : 'bg-warning/10 border-warning/20'
              }`}
            >
              <Icon className={`w-5 h-5 ${rec.safe ? 'text-success' : 'text-warning'}`} />
              <span className="text-sm font-medium">{rec.text}</span>
              {rec.safe ? (
                <CheckCircle className="w-4 h-4 text-success ml-auto" />
              ) : (
                <AlertCircle className="w-4 h-4 text-warning ml-auto" />
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
