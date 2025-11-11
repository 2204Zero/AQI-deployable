import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { MapPin, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Reading {
  id: string;
  location_lat: number;
  location_lng: number;
  location_name: string;
  aqi_value: number;
  pm25: number;
  recorded_at: string;
}

export function LocationMap() {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    fetchReadings();
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const fetchReadings = async () => {
    try {
      const { data, error } = await supabase
        .from('sensor_readings')
        .select('id, location_lat, location_lng, location_name, aqi_value, pm25, recorded_at')
        .not('location_lat', 'is', null)
        .not('location_lng', 'is', null)
        .order('recorded_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setReadings(data || []);
    } catch (error) {
      console.error('Error fetching readings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAQIColor = (aqi: number): string => {
    if (aqi <= 50) return 'hsl(var(--success))';
    if (aqi <= 100) return 'hsl(145 60% 50%)';
    if (aqi <= 150) return 'hsl(var(--warning))';
    if (aqi <= 200) return 'hsl(25 85% 50%)';
    if (aqi <= 300) return 'hsl(0 75% 50%)';
    return 'hsl(300 70% 40%)';
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <MapPin className="w-5 h-5 text-primary" />
        <h2 className="text-2xl font-bold">Location-Based Readings</h2>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {userLocation && (
          <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="font-semibold">Your Location</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Lat: {userLocation.lat.toFixed(6)}, Lng: {userLocation.lng.toFixed(6)}
            </p>
          </div>
        )}

        {readings.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No location-based readings available</p>
        ) : (
          readings.map((reading) => (
            <div
              key={reading.id}
              className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium">{reading.location_name || 'Unknown Location'}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {reading.location_lat.toFixed(6)}, {reading.location_lng.toFixed(6)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(reading.recorded_at).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <div
                    className="text-2xl font-bold mb-1"
                    style={{ color: getAQIColor(reading.aqi_value) }}
                  >
                    {reading.aqi_value}
                  </div>
                  <p className="text-xs text-muted-foreground">AQI</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong>Note:</strong> For full interactive mapping with Mapbox, you'll need to add your Mapbox access token.
          This view shows location-based readings in list format.
        </p>
      </div>
    </Card>
  );
}