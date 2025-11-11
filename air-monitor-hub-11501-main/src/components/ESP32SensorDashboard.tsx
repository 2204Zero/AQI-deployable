import { useSensorData } from "@/contexts/SensorDataContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getParameterStatus } from "@/lib/aqi";
import { Activity, Wind, Thermometer, Droplets, Cloud, AlertTriangle } from "lucide-react";

export const ESP32SensorDashboard = () => {
  const { sensorData } = useSensorData();

  const sensorCards = [
    {
      title: "PM2.5",
      value: sensorData.pm25.toFixed(1),
      unit: "μg/m³",
      icon: Wind,
      status: getParameterStatus(sensorData.pm25, 'pm25'),
      description: "Fine particulate matter",
      color: "text-blue-500"
    },
    {
      title: "PM10",
      value: sensorData.pm10.toFixed(1),
      unit: "μg/m³",
      icon: Activity,
      status: getParameterStatus(sensorData.pm10, 'pm10'),
      description: "Coarse particulate matter",
      color: "text-green-500"
    },
    {
      title: "MQ135",
      value: sensorData.mq135.toFixed(0),
      unit: "raw",
      icon: Cloud,
      status: getParameterStatus(sensorData.mq135, 'mq135'),
      description: "Gas sensor (Air quality)",
      color: "text-purple-500",
      subValue: sensorData.mq135_ppm ? `${sensorData.mq135_ppm.toFixed(2)} ppm` : undefined
    },
    {
      title: "Temperature",
      value: sensorData.temperature.toFixed(1),
      unit: "°C",
      icon: Thermometer,
      status: getParameterStatus(sensorData.temperature, 'temperature'),
      description: "Ambient temperature",
      color: "text-red-500"
    },
    {
      title: "Humidity",
      value: sensorData.humidity.toFixed(1),
      unit: "%",
      icon: Droplets,
      status: getParameterStatus(sensorData.humidity, 'humidity'),
      description: "Relative humidity",
      color: "text-cyan-500"
    },
    {
      title: "CO2",
      value: sensorData.co2.toFixed(0),
      unit: "ppm",
      icon: Activity,
      status: getParameterStatus(sensorData.co2, 'co2'),
      description: "Carbon dioxide level",
      color: "text-orange-500"
    }
  ];

  const getStatusBadgeVariant = (level: string) => {
    switch (level) {
      case 'good': return 'success';
      case 'moderate': return 'warning';
      case 'poor': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sensorCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {card.value}
                <span className="text-sm text-muted-foreground ml-1">
                  {card.unit}
                </span>
              </div>
              {card.subValue && (
                <div className="text-sm text-muted-foreground mt-1">
                  {card.subValue}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                {card.description}
              </p>
              <div className="mt-3">
                <Badge 
                  variant={getStatusBadgeVariant(card.status.level) as any}
                  className="text-xs"
                >
                  {card.status.level === 'good' && '✓ Good'}
                  {card.status.level === 'moderate' && '⚠ Moderate'}
                  {card.status.level === 'poor' && <><AlertTriangle className="h-3 w-3 mr-1" />Poor</>}
                </Badge>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};