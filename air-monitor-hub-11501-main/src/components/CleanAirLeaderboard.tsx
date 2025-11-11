import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award } from 'lucide-react';

export function CleanAirLeaderboard() {
  const leaderboard = [
    { rank: 1, city: 'Bangalore', aqi: 42, icon: Trophy, color: 'text-yellow-500' },
    { rank: 2, city: 'Pune', aqi: 58, icon: Medal, color: 'text-gray-400' },
    { rank: 3, city: 'Hyderabad', aqi: 67, icon: Award, color: 'text-orange-500' },
    { rank: 4, city: 'Chennai', aqi: 78, icon: null, color: 'text-muted-foreground' },
    { rank: 5, city: 'Mumbai', aqi: 95, icon: null, color: 'text-muted-foreground' },
    { rank: 6, city: 'Kolkata', aqi: 128, icon: null, color: 'text-muted-foreground' },
    { rank: 7, city: 'Jaipur', aqi: 158, icon: null, color: 'text-muted-foreground' },
    { rank: 8, city: 'Delhi', aqi: 245, icon: null, color: 'text-muted-foreground' },
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Clean Air Leaderboard</h3>
        <Badge>This Week</Badge>
      </div>

      <div className="space-y-3">
        {leaderboard.map((entry) => {
          const Icon = entry.icon;
          return (
            <div
              key={entry.city}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                entry.rank <= 3 ? 'bg-muted/50 border-primary/20' : 'bg-card'
              }`}
            >
              <div className="flex items-center gap-3">
                {Icon ? (
                  <Icon className={`w-6 h-6 ${entry.color}`} />
                ) : (
                  <span className="w-6 text-center font-bold text-muted-foreground">
                    {entry.rank}
                  </span>
                )}
                <span className="font-medium">{entry.city}</span>
              </div>
              <Badge
                variant={
                  entry.aqi < 50 ? 'default' :
                  entry.aqi < 100 ? 'secondary' :
                  entry.aqi < 150 ? 'default' : 'destructive'
                }
              >
                AQI: {entry.aqi}
              </Badge>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-success/10 border border-success/20 rounded-lg">
        <p className="text-sm font-medium">
          🏆 Bangalore maintains the best air quality this week with an average AQI of 42!
        </p>
      </div>
    </Card>
  );
}
