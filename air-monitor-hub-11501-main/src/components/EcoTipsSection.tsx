import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Leaf, Bus, Recycle, Lightbulb, Wind, TreePine } from 'lucide-react';

export function EcoTipsSection() {
  const tips = [
    {
      icon: Bus,
      title: 'Use Public Transport',
      description: 'Taking public transport can reduce your carbon footprint by up to 45%',
      impact: 'High Impact',
      color: 'text-green-500',
    },
    {
      icon: Recycle,
      title: 'Avoid Burning Waste',
      description: 'Burning waste releases harmful PM2.5 particles. Use proper disposal methods',
      impact: 'High Impact',
      color: 'text-red-500',
    },
    {
      icon: TreePine,
      title: 'Plant Trees',
      description: 'One tree can absorb up to 48 pounds of CO2 per year',
      impact: 'Medium Impact',
      color: 'text-emerald-500',
    },
    {
      icon: Wind,
      title: 'Reduce Indoor Pollution',
      description: 'Avoid smoking indoors and use natural cleaning products',
      impact: 'Medium Impact',
      color: 'text-blue-500',
    },
    {
      icon: Lightbulb,
      title: 'Energy Conservation',
      description: 'Turn off lights and appliances when not in use to reduce emissions',
      impact: 'Low Impact',
      color: 'text-yellow-500',
    },
    {
      icon: Leaf,
      title: 'Choose Sustainable Products',
      description: 'Opt for eco-friendly products to reduce your environmental footprint',
      impact: 'Low Impact',
      color: 'text-lime-500',
    },
  ];

  return (
    <Card className="p-6 bg-gradient-to-br from-success/5 to-primary/5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Leaf className="w-5 h-5 text-success" />
          Daily Eco Tips
        </h3>
        <Badge className="bg-success/10 text-success">Make a Difference</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tips.map((tip) => {
          const Icon = tip.icon;
          return (
            <div
              key={tip.title}
              className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3 mb-2">
                <Icon className={`w-6 h-6 ${tip.color}`} />
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">{tip.title}</h4>
                  <p className="text-xs text-muted-foreground">{tip.description}</p>
                </div>
              </div>
              <Badge 
                variant="outline" 
                className={`text-xs ${
                  tip.impact.includes('High') ? 'border-success text-success' :
                  tip.impact.includes('Medium') ? 'border-primary text-primary' :
                  'border-muted-foreground text-muted-foreground'
                }`}
              >
                {tip.impact}
              </Badge>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg text-center">
        <p className="text-sm font-medium">
          💚 Small actions create big change! Start with one tip today and help improve air quality for everyone.
        </p>
      </div>
    </Card>
  );
}
