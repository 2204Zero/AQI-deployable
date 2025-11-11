import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { useSensorData } from '@/contexts/SensorDataContext';

interface ChartData {
  time: string;
  pm10: number;
  pm25: number;
  co2: number;
  humidity: number;
  temperature: number;
}

export function SensorCharts() {
  const { sensorData } = useSensorData();
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  // Update chart with real-time sensor data from context
  useEffect(() => {
    const newReading: ChartData = {
      time: new Date().toLocaleTimeString(),
      pm10: sensorData.pm10,
      pm25: sensorData.pm25,
      co2: sensorData.co2,
      humidity: sensorData.humidity,
      temperature: sensorData.temperature
    };

    setData(prev => {
      const updated = [...prev, newReading];
      return updated.slice(-20); // Keep only last 20 readings
    });
  }, [sensorData]);

  useEffect(() => {
    fetchHistoricalData();
    
    // Subscribe to real-time database updates
    const channel = supabase
      .channel('sensor-readings-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sensor_readings'
        },
        (payload) => {
          const newReading = payload.new as any;
          setData(prev => {
            const updated = [...prev, {
              time: new Date(newReading.recorded_at).toLocaleTimeString(),
              pm10: Number(newReading.pm10),
              pm25: Number(newReading.pm25),
              co2: Number(newReading.co2),
              humidity: Number(newReading.humidity),
              temperature: Number(newReading.temperature)
            }];
            return updated.slice(-20);
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchHistoricalData = async () => {
    try {
      const { data: readings, error } = await supabase
        .from('sensor_readings')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      if (readings) {
        const chartData = readings
          .reverse()
          .map(reading => ({
            time: new Date(reading.recorded_at).toLocaleTimeString(),
            pm10: Number(reading.pm10),
            pm25: Number(reading.pm25),
            co2: Number(reading.co2),
            humidity: Number(reading.humidity),
            temperature: Number(reading.temperature)
          }));
        setData(chartData);
      }
    } catch (error) {
      console.error('Error fetching historical data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const chartConfig = {
    pm10: { label: 'PM10', color: 'hsl(var(--warning))' },
    pm25: { label: 'PM2.5', color: 'hsl(var(--destructive))' },
    co2: { label: 'CO2', color: 'hsl(var(--success))' },
    humidity: { label: 'Humidity', color: 'hsl(var(--primary))' },
    temperature: { label: 'Temperature', color: 'hsl(var(--accent))' }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Particulate Matter Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Particulate Matter (μg/m³)</h3>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="time" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="pm10" 
                stroke={chartConfig.pm10.color}
                strokeWidth={2}
                dot={false}
                name="PM10"
              />
              <Line 
                type="monotone" 
                dataKey="pm25" 
                stroke={chartConfig.pm25.color}
                strokeWidth={2}
                dot={false}
                name="PM2.5"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </Card>

      {/* CO2 Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">CO2 Levels (ppm)</h3>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="time" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="co2" 
                stroke={chartConfig.co2.color}
                fill={chartConfig.co2.color}
                fillOpacity={0.3}
                strokeWidth={2}
                name="CO2"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </Card>

      {/* Temperature & Humidity Chart */}
      <Card className="p-6 lg:col-span-2">
        <h3 className="text-lg font-semibold mb-4">Temperature & Humidity</h3>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="time" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                yAxisId="left"
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12}
                label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft' }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12}
                label={{ value: 'Humidity (%)', angle: 90, position: 'insideRight' }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="temperature" 
                stroke={chartConfig.temperature.color}
                strokeWidth={2}
                dot={false}
                name="Temperature"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="humidity" 
                stroke={chartConfig.humidity.color}
                strokeWidth={2}
                dot={false}
                name="Humidity"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </Card>
    </div>
  );
}
