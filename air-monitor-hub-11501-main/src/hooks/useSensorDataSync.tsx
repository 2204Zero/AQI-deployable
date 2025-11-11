import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SensorData } from '@/contexts/SensorDataContext';
import { calculateAQI, getAQILevel } from '@/lib/aqi';
import { useAuth } from './useAuth';

export function useSensorDataSync(sensorData: SensorData) {
  const { user } = useAuth();

  useEffect(() => {
    const saveReading = async () => {
      if (!user) return;

      try {
        const aqi = calculateAQI(sensorData.pm25);
        const aqiLevel = getAQILevel(aqi);

        // Get user location if available
        let location = { lat: null, lng: null, name: null };
        if (navigator.geolocation) {
          await new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                location.lat = position.coords.latitude;
                location.lng = position.coords.longitude;
                resolve(null);
              },
              () => resolve(null)
            );
          });
        }

        const { error } = await supabase
          .from('sensor_readings')
          .insert({
            pm10: sensorData.pm10,
            pm25: sensorData.pm25,
            co2: sensorData.co2,
            humidity: sensorData.humidity,
            temperature: sensorData.temperature,
            aqi_value: aqi,
            aqi_level: aqiLevel,
            location_lat: location.lat,
            location_lng: location.lng,
            location_name: location.name,
            created_by: user.id
          });

        if (error) throw error;

        // Check for alerts
        const { data: userAlerts } = await supabase
          .from('user_alerts')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_enabled', true);

        if (userAlerts) {
          for (const alert of userAlerts) {
            let shouldAlert = false;
            let message = '';

            switch (alert.alert_type) {
              case 'pm10_high':
                if (sensorData.pm10 > alert.threshold_value) {
                  shouldAlert = true;
                  message = `PM10 level (${sensorData.pm10.toFixed(1)} μg/m³) exceeds threshold of ${alert.threshold_value} μg/m³`;
                }
                break;
              case 'pm25_high':
                if (sensorData.pm25 > alert.threshold_value) {
                  shouldAlert = true;
                  message = `PM2.5 level (${sensorData.pm25.toFixed(1)} μg/m³) exceeds threshold of ${alert.threshold_value} μg/m³`;
                }
                break;
              case 'co2_high':
                if (sensorData.co2 > alert.threshold_value) {
                  shouldAlert = true;
                  message = `CO2 level (${sensorData.co2.toFixed(0)} ppm) exceeds threshold of ${alert.threshold_value} ppm`;
                }
                break;
              case 'temperature_high':
                if (sensorData.temperature > alert.threshold_value) {
                  shouldAlert = true;
                  message = `Temperature (${sensorData.temperature.toFixed(1)}°C) exceeds threshold of ${alert.threshold_value}°C`;
                }
                break;
              case 'humidity_high':
                if (sensorData.humidity > alert.threshold_value) {
                  shouldAlert = true;
                  message = `Humidity (${sensorData.humidity.toFixed(1)}%) exceeds threshold of ${alert.threshold_value}%`;
                }
                break;
              case 'aqi_warning':
                if (aqi > alert.threshold_value) {
                  shouldAlert = true;
                  message = `AQI (${aqi}) exceeds threshold of ${alert.threshold_value}`;
                }
                break;
            }

            if (shouldAlert) {
              // Check if alert was already sent in the last hour
              const oneHourAgo = new Date();
              oneHourAgo.setHours(oneHourAgo.getHours() - 1);
              
              const { data: recentAlerts } = await supabase
                .from('alert_logs')
                .select('id')
                .eq('user_id', user.id)
                .eq('alert_type', alert.alert_type)
                .gte('created_at', oneHourAgo.toISOString())
                .limit(1);

              // Only insert if no recent alert exists
              if (!recentAlerts || recentAlerts.length === 0) {
                await supabase
                  .from('alert_logs')
                  .insert({
                    user_id: user.id,
                    alert_type: alert.alert_type,
                    message,
                    is_read: false
                  });
              }
            }
          }
        }
      } catch (error) {
        console.error('Error saving sensor reading:', error);
      }
    };

    // Save reading every 30 seconds when user is authenticated
    const interval = setInterval(saveReading, 30000);
    
    return () => clearInterval(interval);
  }, [sensorData, user]);
}