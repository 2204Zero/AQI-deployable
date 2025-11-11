import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export function AQITimelineSlider() {
  const [currentHour, setCurrentHour] = useState(12);

  // Generate 24 hours of data
  const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    aqi: 80 + Math.sin(i / 4) * 50 + Math.random() * 20,
    time: `${i.toString().padStart(2, '0')}:00`,
  }));

  const currentData = hourlyData[currentHour];

  const getAQIColor = (aqi: number) => {
    if (aqi > 150) return 'text-destructive';
    if (aqi > 100) return 'text-warning';
    if (aqi > 50) return 'text-primary';
    return 'text-success';
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5" />
          AQI Timeline
        </h3>
        <Badge className={getAQIColor(currentData.aqi)}>
          {currentData.time} - AQI: {Math.round(currentData.aqi)}
        </Badge>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={hourlyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="hour" 
            tickFormatter={(hour) => `${hour}:00`}
            interval={3}
          />
          <YAxis />
          <Tooltip 
            labelFormatter={(hour) => `${hour}:00`}
            formatter={(value: number) => [`AQI: ${Math.round(value)}`, '']}
          />
          <ReferenceLine x={currentHour} stroke="hsl(var(--primary))" strokeDasharray="3 3" />
          <Line 
            type="monotone" 
            dataKey="aqi" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span>00:00</span>
          <span className="font-semibold">{currentData.time}</span>
          <span>23:00</span>
        </div>
        <Slider
          value={[currentHour]}
          onValueChange={(value) => setCurrentHour(value[0])}
          max={23}
          step={1}
          className="cursor-pointer"
        />
      </div>

      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
        <p className="text-sm">
          <strong>Peak Hours:</strong> AQI typically highest during morning (7-9 AM) and evening (6-8 PM) rush hours due to traffic.
        </p>
      </div>
    </Card>
  );
}
