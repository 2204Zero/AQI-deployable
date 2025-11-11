import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { useSensorData } from '@/contexts/SensorDataContext';

export function SensorHealthMonitor() {
  const { sensorData, isConnected } = useSensorData();

  const getSensorStatus = (value: number, min: number, max: number) => {
    if (value >= min && value <= max) {
      return { status: 'active', color: 'text-success', bg: 'bg-success/10' };
    }
    return { status: 'warning', color: 'text-warning', bg: 'bg-warning/10' };
  };

  const sensors = [
    {
      name: 'PM10 Sensor',
      value: sensorData.pm10.toFixed(1),
      unit: 'μg/m³',
      status: getSensorStatus(sensorData.pm10, 0, 500),
    },
    {
      name: 'PM2.5 Sensor',
      value: sensorData.pm25.toFixed(1),
      unit: 'μg/m³',
      status: getSensorStatus(sensorData.pm25, 0, 500),
    },
    {
      name: 'CO2 Sensor',
      value: sensorData.co2.toFixed(0),
      unit: 'ppm',
      status: getSensorStatus(sensorData.co2, 400, 5000),
    },
    {
      name: 'Humidity Sensor',
      value: sensorData.humidity.toFixed(1),
      unit: '%',
      status: getSensorStatus(sensorData.humidity, 0, 100),
    },
    {
      name: 'Temperature Sensor',
      value: sensorData.temperature.toFixed(1),
      unit: '°C',
      status: getSensorStatus(sensorData.temperature, -40, 85),
    },
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Sensor Health Monitor
        </h3>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Wifi className="w-5 h-5 text-success" />
          ) : (
            <WifiOff className="w-5 h-5 text-destructive" />
          )}
          <Badge variant={isConnected ? 'default' : 'destructive'}>
            {isConnected ? 'Online' : 'Offline'}
          </Badge>
        </div>
      </div>

      <div className="space-y-3">
        {sensors.map((sensor) => (
          <div
            key={sensor.name}
            className={`flex items-center justify-between p-3 rounded-lg border ${sensor.status.bg}`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${sensor.status.bg.replace('/10', '')}`} />
              <span className="font-medium text-sm">{sensor.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm">
                {sensor.value} {sensor.unit}
              </span>
              <Badge variant="outline" className={sensor.status.color}>
                {sensor.status.status === 'active' ? 'Active' : 'Warning'}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
