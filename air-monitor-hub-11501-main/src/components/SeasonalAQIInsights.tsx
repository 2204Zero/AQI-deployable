import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sun, Cloud, CloudSnow, Leaf } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function SeasonalAQIInsights() {
  const [viewMode, setViewMode] = useState<'seasonal' | 'monthly'>('seasonal');

  const seasonalData = [
    { season: 'Winter', avgAqi: 185, icon: CloudSnow, color: 'text-blue-500' },
    { season: 'Spring', avgAqi: 92, icon: Leaf, color: 'text-green-500' },
    { season: 'Summer', avgAqi: 128, icon: Sun, color: 'text-yellow-500' },
    { season: 'Fall', avgAqi: 105, icon: Cloud, color: 'text-orange-500' },
  ];

  const monthlyTrend = [
    { month: 'Jan', aqi: 195 },
    { month: 'Feb', aqi: 175 },
    { month: 'Mar', aqi: 110 },
    { month: 'Apr', aqi: 85 },
    { month: 'May', aqi: 95 },
    { month: 'Jun', aqi: 135 },
    { month: 'Jul', aqi: 142 },
    { month: 'Aug', aqi: 128 },
    { month: 'Sep', aqi: 115 },
    { month: 'Oct', aqi: 105 },
    { month: 'Nov', aqi: 145 },
    { month: 'Dec', aqi: 180 },
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Seasonal AQI Insights</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setViewMode(viewMode === 'seasonal' ? 'monthly' : 'seasonal')}
        >
          {viewMode === 'seasonal' ? 'View Monthly Trends' : 'View Seasonal'}
        </Button>
      </div>

      {viewMode === 'seasonal' ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {seasonalData.map((season) => {
            const Icon = season.icon;
            return (
              <div key={season.season} className="bg-muted/30 rounded-lg p-4 text-center">
                <Icon className={`w-8 h-8 mx-auto mb-2 ${season.color}`} />
                <p className="font-semibold mb-1">{season.season}</p>
                <Badge variant={season.avgAqi > 150 ? 'destructive' : season.avgAqi > 100 ? 'default' : 'secondary'}>
                  Avg: {season.avgAqi}
                </Badge>
              </div>
            );
          })}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={monthlyTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="aqi" stroke="hsl(var(--primary))" strokeWidth={2} name="AQI" />
          </LineChart>
        </ResponsiveContainer>
      )}

      <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg">
        <p className="text-sm font-medium">
          📊 Insight: Winter months (Dec-Feb) show highest AQI due to smog and reduced air circulation. 
          Spring offers the best air quality with lower pollution levels.
        </p>
      </div>
    </Card>
  );
}
