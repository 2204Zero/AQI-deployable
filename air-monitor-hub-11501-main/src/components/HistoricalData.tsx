import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { Calendar as CalendarIcon, Download, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { exportToCSV, exportToPDF } from '@/lib/export';
import { useToast } from '@/hooks/use-toast';

export function HistoricalData() {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('sensor_readings')
        .select('*')
        .order('recorded_at', { ascending: false });

      if (startDate) {
        query = query.gte('recorded_at', startDate.toISOString());
      }
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        query = query.lte('recorded_at', endOfDay.toISOString());
      }

      const { data: readings, error } = await query.limit(100);

      if (error) throw error;
      setData(readings || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch historical data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (data.length === 0) {
      toast({
        title: 'No Data',
        description: 'No data available to export',
        variant: 'destructive'
      });
      return;
    }
    exportToCSV(data);
    toast({
      title: 'Success',
      description: 'Data exported to CSV successfully'
    });
  };

  const handleExportPDF = () => {
    if (data.length === 0) {
      toast({
        title: 'No Data',
        description: 'No data available to export',
        variant: 'destructive'
      });
      return;
    }
    exportToPDF(data);
    toast({
      title: 'Success',
      description: 'PDF report generated successfully'
    });
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold">Historical Data</h2>
        
        <div className="flex flex-wrap gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, 'PPP') : 'Start date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, 'PPP') : 'End date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
            </PopoverContent>
          </Popover>

          <Button onClick={handleExportCSV} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>

          <Button onClick={handleExportPDF} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No data available for the selected date range
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 font-semibold">Date/Time</th>
                <th className="text-left p-3 font-semibold">PM10</th>
                <th className="text-left p-3 font-semibold">PM2.5</th>
                <th className="text-left p-3 font-semibold">CO2</th>
                <th className="text-left p-3 font-semibold">Humidity</th>
                <th className="text-left p-3 font-semibold">Temp</th>
                <th className="text-left p-3 font-semibold">AQI</th>
              </tr>
            </thead>
            <tbody>
              {data.map((reading) => (
                <tr key={reading.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="p-3">{new Date(reading.recorded_at).toLocaleString()}</td>
                  <td className="p-3">{Number(reading.pm10).toFixed(1)} μg/m³</td>
                  <td className="p-3">{Number(reading.pm25).toFixed(1)} μg/m³</td>
                  <td className="p-3">{Number(reading.co2).toFixed(0)} ppm</td>
                  <td className="p-3">{Number(reading.humidity).toFixed(1)}%</td>
                  <td className="p-3">{Number(reading.temperature).toFixed(1)}°C</td>
                  <td className="p-3">
                    <span className="px-2 py-1 rounded text-xs font-semibold bg-primary/10 text-primary">
                      {reading.aqi_value}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}