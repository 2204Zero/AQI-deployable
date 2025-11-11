import { Info } from 'lucide-react';
import { calculateAQI, getAQIInfo } from '@/lib/aqi';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card } from '@/components/ui/card';

interface AQIDisplayProps {
  pm25: number;
  className?: string;
}

export function AQIDisplay({ pm25, className = '' }: AQIDisplayProps) {
  const aqi = calculateAQI(pm25);
  const aqiInfo = getAQIInfo(aqi);

  return (
    <TooltipProvider>
      <Card 
        className={`p-6 transition-all hover:scale-105 ${className}`}
        style={{ 
          borderColor: aqiInfo.color,
          borderWidth: '2px'
        }}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Air Quality Index</h3>
            <div className="flex items-baseline gap-3">
              <span 
                className="text-5xl font-bold"
                style={{ color: aqiInfo.color }}
              >
                {aqiInfo.value}
              </span>
              <span 
                className="text-lg font-semibold"
                style={{ color: aqiInfo.color }}
              >
                {aqiInfo.label}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">{aqiInfo.description}</p>
          </div>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <Info className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm">{aqiInfo.healthAdvice}</p>
            </TooltipContent>
          </Tooltip>
        </div>
        
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex gap-2 items-center text-xs">
            <span className="font-medium">AQI Scale:</span>
            <div className="flex-1 h-2 rounded-full flex overflow-hidden">
              <div className="flex-1" style={{ backgroundColor: 'hsl(var(--success))' }} title="Good (0-50)" />
              <div className="flex-1" style={{ backgroundColor: 'hsl(145 60% 50%)' }} title="Moderate (51-100)" />
              <div className="flex-1" style={{ backgroundColor: 'hsl(var(--warning))' }} title="Unhealthy for Sensitive (101-150)" />
              <div className="flex-1" style={{ backgroundColor: 'hsl(25 85% 50%)' }} title="Unhealthy (151-200)" />
              <div className="flex-1" style={{ backgroundColor: 'hsl(0 75% 50%)' }} title="Very Unhealthy (201-300)" />
              <div className="flex-1" style={{ backgroundColor: 'hsl(300 70% 40%)' }} title="Hazardous (301+)" />
            </div>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0</span>
            <span>500</span>
          </div>
        </div>
      </Card>
    </TooltipProvider>
  );
}