import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wifi, WifiOff, RefreshCw, Settings } from "lucide-react";
import { useSensorData } from "@/contexts/SensorDataContext";

interface ESP32Device {
  id: string;
  name: string;
  status: 'connected' | 'disconnected';
  lastSeen: Date;
  signalStrength?: number;
  location?: string;
}

export const ESP32ConnectionStatus = () => {
  const { sensorData } = useSensorData();
  const [devices, setDevices] = useState<ESP32Device[]>([
    {
      id: "esp32_001",
      name: "ESP32 Air Quality Monitor",
      status: "connected",
      lastSeen: new Date(),
      signalStrength: 85,
      location: "Living Room"
    }
  ]);
  const [isConnecting, setIsConnecting] = useState(false);

  const refreshConnection = async () => {
    setIsConnecting(true);
    // Simulate connection refresh
    setTimeout(() => {
      setDevices(prev => prev.map(device => ({
        ...device,
        lastSeen: new Date(),
        status: Math.random() > 0.1 ? 'connected' : 'disconnected' as 'connected' | 'disconnected'
      })));
      setIsConnecting(false);
    }, 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-500';
      case 'disconnected': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'connected': return 'success';
      case 'disconnected': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>ESP32 Connection Status</CardTitle>
            <CardDescription>Monitor your ESP32 sensor devices</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshConnection}
            disabled={isConnecting}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isConnecting ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {devices.map((device) => (
            <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-full ${device.status === 'connected' ? 'bg-green-100' : 'bg-red-100'}`}>
                  {device.status === 'connected' ? (
                    <Wifi className={`h-5 w-5 ${getStatusColor(device.status)}`} />
                  ) : (
                    <WifiOff className={`h-5 w-5 ${getStatusColor(device.status)}`} />
                  )}
                </div>
                <div>
                  <h4 className="font-medium">{device.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {device.location} • Last seen: {device.lastSeen.toLocaleTimeString()}
                  </p>
                  {device.signalStrength && device.status === 'connected' && (
                    <p className="text-xs text-muted-foreground">
                      Signal: {device.signalStrength}%
                    </p>
                  )}
                </div>
              </div>
              <Badge variant={getBadgeVariant(device.status) as any}>
                {device.status === 'connected' ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
          ))}
          
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2 flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Current Sensor Data
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>PM2.5: <span className="font-mono">{sensorData.pm25.toFixed(1)} μg/m³</span></div>
              <div>PM10: <span className="font-mono">{sensorData.pm10.toFixed(1)} μg/m³</span></div>
              <div>MQ135: <span className="font-mono">{sensorData.mq135.toFixed(0)} raw</span></div>
              <div>Temp: <span className="font-mono">{sensorData.temperature.toFixed(1)} °C</span></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};