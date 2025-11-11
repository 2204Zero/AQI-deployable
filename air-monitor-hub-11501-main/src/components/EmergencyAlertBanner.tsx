import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSensorData } from '@/contexts/SensorDataContext';
import { calculateAQI } from '@/lib/aqi';
import { useState } from 'react';

export function EmergencyAlertBanner() {
  const { sensorData } = useSensorData();
  const aqi = calculateAQI(sensorData.pm25);
  const [dismissed, setDismissed] = useState(false);

  const isEmergency = aqi > 200 || sensorData.pm25 > 150 || sensorData.co2 > 2000;

  if (!isEmergency || dismissed) return null;

  return (
    <Alert
      variant="destructive"
      className="mb-6 animate-pulse-glow border-2 border-destructive"
    >
      <AlertTriangle className="h-5 w-5" />
      <AlertTitle className="text-lg font-bold flex items-center justify-between">
        ⚠️ EMERGENCY ALERT - Hazardous Air Quality
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDismissed(true)}
          className="h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertTitle>
      <AlertDescription className="mt-2">
        <div className="space-y-2">
          <p className="font-semibold">
            Current AQI: {aqi} - This is hazardous to your health!
          </p>
          <div className="text-sm space-y-1">
            <p>🏠 Stay indoors immediately</p>
            <p>🚪 Keep all windows and doors closed</p>
            <p>😷 Wear N95 masks if you must go outside</p>
            <p>💨 Use air purifiers on high setting</p>
            <p>💊 Keep medications ready if you have respiratory conditions</p>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}
