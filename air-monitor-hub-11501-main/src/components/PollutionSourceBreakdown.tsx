import { Card } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export function PollutionSourceBreakdown() {
  const data = [
    { name: 'Vehicular Traffic', value: 35, color: '#ef4444' },
    { name: 'Industrial Emissions', value: 25, color: '#f97316' },
    { name: 'Construction Dust', value: 18, color: '#eab308' },
    { name: 'Crop Burning', value: 12, color: '#84cc16' },
    { name: 'Domestic Heating', value: 10, color: '#3b82f6' },
  ];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Pollution Source Breakdown</h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-4 space-y-2">
        {data.map((source) => (
          <div key={source.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: source.color }} />
              <span>{source.name}</span>
            </div>
            <span className="font-semibold">{source.value}%</span>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
        <p className="text-xs font-medium">
          💡 Key Contributor: Vehicular traffic is the largest pollution source. Consider carpooling or public transport.
        </p>
      </div>
    </Card>
  );
}
