import { useEffect } from "react";
import { Heart } from "lucide-react";
import { useSensorData } from "@/contexts/SensorDataContext";
import { AQIDisplay } from "./AQIDisplay";
import { getParameterStatus } from "@/lib/aqi";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const LiveAirQuality = () => {
  const { sensorData, updateSensorData } = useSensorData();

  // Simulate live data updates (replace with actual ESP32 connection)
  useEffect(() => {
    const interval = setInterval(() => {
      updateSensorData({
        pm10: Math.random() * 150,
        pm25: Math.random() * 100,
        co2: 400 + Math.random() * 800,
        humidity: 40 + Math.random() * 40,
        temperature: 20 + Math.random() * 25,
        mq135: 200 + Math.random() * 600,
        mq135_ppm: 0.5 + Math.random() * 2.5,
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [updateSensorData]);

  const isHealthy = 
    sensorData.pm10 <= 100 &&
    sensorData.pm25 <= 60 &&
    sensorData.co2 <= 1000 &&
    sensorData.humidity <= 70 &&
    sensorData.temperature <= 40 &&
    sensorData.mq135 <= 500;

  const pm10Status = getParameterStatus(sensorData.pm10, 'pm10');
  const pm25Status = getParameterStatus(sensorData.pm25, 'pm25');
  const co2Status = getParameterStatus(sensorData.co2, 'co2');
  const humidityStatus = getParameterStatus(sensorData.humidity, 'humidity');
  const tempStatus = getParameterStatus(sensorData.temperature, 'temperature');
  const mq135Status = getParameterStatus(sensorData.mq135, 'mq135');

  const readings = [
    { label: "PM10", value: sensorData.pm10.toFixed(1), unit: "μg/m³", ...pm10Status },
    { label: "PM2.5", value: sensorData.pm25.toFixed(1), unit: "μg/m³", ...pm25Status },
    { label: "MQ135", value: sensorData.mq135.toFixed(0), unit: "raw", ...mq135Status },
    { label: "CO2", value: sensorData.co2.toFixed(0), unit: "ppm", ...co2Status },
    { label: "Humidity", value: sensorData.humidity.toFixed(1), unit: "%", ...humidityStatus },
    { label: "Temperature", value: sensorData.temperature.toFixed(1), unit: "°C", ...tempStatus },
  ];

  return (
    <TooltipProvider>
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-8 text-accent animate-slide-in-left">
            Live Air Quality of This Region
          </h2>
          
          <div className="mb-12 max-w-2xl mx-auto">
            <AQIDisplay pm25={sensorData.pm25} />
          </div>
          
          <div className="relative">
            {/* Circular readings in radial layout */}
            <div className="relative max-w-4xl mx-auto h-[500px]">
            {/* Central heartbeat icon - positioned absolutely in the center */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div className={`relative ${isHealthy ? 'text-success animate-pulse' : 'text-destructive'}`}>
                <Heart className="fill-current" style={{ width: '64px', height: '64px' }} />
                {isHealthy && (
                  <div className="absolute inset-0 animate-ping opacity-20">
                    <Heart className="fill-current" style={{ width: '64px', height: '64px' }} />
                  </div>
                )}
              </div>
            </div>
            {readings.map((reading, index) => {
              const angle = (index * (360 / readings.length)) - 90;
              const radius = 180;
              const x = Math.cos((angle * Math.PI) / 180) * radius;
              const y = Math.sin((angle * Math.PI) / 180) * radius;
              
              return (
                <div
                  key={index}
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                    borderColor: reading.color,
                    borderStyle: 'dashed',
                  }}
                  className={`w-32 h-32 rounded-full flex flex-col items-center justify-center transition-all duration-500 shadow-lg hover:scale-110 border-2 ${
                    reading.safe
                      ? 'bg-gradient-to-br from-success/10 to-success/5 animate-fade-in'
                      : 'bg-gradient-to-br from-destructive/10 to-destructive/5 animate-fade-in'
                  }`}
                >
                  <div className="text-center">
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      {reading.label}
                    </p>
                    <p className={`text-xl font-bold mb-0.5 ${reading.safe ? 'text-success' : 'text-destructive'}`}>
                      {reading.value}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {reading.unit}
                    </p>
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        </div>
      </section>
    </TooltipProvider>
  );
};
