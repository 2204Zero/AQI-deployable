import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertTriangle, Heart, Settings } from 'lucide-react';
import { useSensorData } from '@/contexts/SensorDataContext';
import { calculateAQI } from '@/lib/aqi';

type AgeGroup = 'child' | 'adult' | 'senior';
type HealthCondition = 'none' | 'asthma' | 'heart' | 'both';

export function PersonalizedHealthRisk() {
  const { sensorData } = useSensorData();
  const aqi = calculateAQI(sensorData.pm25);
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('adult');
  const [healthCondition, setHealthCondition] = useState<HealthCondition>('none');

  const calculateRisk = () => {
    let riskMultiplier = 1;

    // Age factor
    if (ageGroup === 'child') riskMultiplier += 0.3;
    if (ageGroup === 'senior') riskMultiplier += 0.4;

    // Health condition factor
    if (healthCondition === 'asthma') riskMultiplier += 0.5;
    if (healthCondition === 'heart') riskMultiplier += 0.4;
    if (healthCondition === 'both') riskMultiplier += 0.8;

    // AQI factor
    let baseRisk = 'Low';
    let color = 'text-success';
    let bgColor = 'bg-success/10';

    if (aqi > 150) {
      baseRisk = 'Critical';
      color = 'text-destructive';
      bgColor = 'bg-destructive/10';
      riskMultiplier += 1;
    } else if (aqi > 100) {
      baseRisk = 'High';
      color = 'text-warning';
      bgColor = 'bg-warning/10';
      riskMultiplier += 0.5;
    } else if (aqi > 50) {
      baseRisk = 'Moderate';
      color = 'text-primary';
      bgColor = 'bg-primary/10';
      riskMultiplier += 0.2;
    }

    const personalizedRisk = riskMultiplier > 2 ? 'Critical' : 
                            riskMultiplier > 1.5 ? 'High' :
                            riskMultiplier > 1 ? 'Moderate' : 'Low';

    return { baseRisk, personalizedRisk, color, bgColor, riskMultiplier };
  };

  const risk = calculateRisk();

  const getRecommendations = () => {
    if (risk.personalizedRisk === 'Critical') {
      return [
        '🏠 Stay indoors with windows closed',
        '😷 Wear N95 mask if going outside is necessary',
        '💊 Keep rescue medications readily available',
        '📞 Monitor symptoms closely and contact doctor if needed',
      ];
    } else if (risk.personalizedRisk === 'High') {
      return [
        '🚶 Limit outdoor activities, especially exercise',
        '😷 Consider wearing a mask outdoors',
        '💨 Use air purifiers indoors',
        '⏰ Plan outdoor activities during times with better AQI',
      ];
    } else if (risk.personalizedRisk === 'Moderate') {
      return [
        '⚠️ Reduce prolonged outdoor exertion',
        '👀 Watch for symptoms if you have respiratory issues',
        '🏃 Light outdoor activities are generally acceptable',
      ];
    } else {
      return [
        '✅ Normal outdoor activities are safe',
        '🏃 Good day for exercise outdoors',
        '🌳 Enjoy the fresh air!',
      ];
    }
  };

  return (
    <Card className={`p-6 border-2 ${risk.bgColor}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Heart className={risk.color} />
          Personalized Health Risk
        </h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Configure
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Personalize Your Health Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Age Group</Label>
                <Select value={ageGroup} onValueChange={(value) => setAgeGroup(value as AgeGroup)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="child">Child (0-12)</SelectItem>
                    <SelectItem value="adult">Adult (13-64)</SelectItem>
                    <SelectItem value="senior">Senior (65+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Health Conditions</Label>
                <Select value={healthCondition} onValueChange={(value) => setHealthCondition(value as HealthCondition)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No conditions</SelectItem>
                    <SelectItem value="asthma">Asthma</SelectItem>
                    <SelectItem value="heart">Heart condition</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="text-center mb-4">
        <Badge className={`${risk.bgColor} ${risk.color} text-lg px-4 py-2`}>
          <AlertTriangle className="w-5 h-5 mr-2" />
          {risk.personalizedRisk} Risk
        </Badge>
        <p className="text-sm text-muted-foreground mt-2">
          {healthCondition !== 'none' && `For ${healthCondition === 'asthma' ? 'asthma' : healthCondition === 'heart' ? 'heart' : 'asthma & heart'} patients`}
        </p>
      </div>

      <div className="space-y-2 mb-4">
        {getRecommendations().map((rec, index) => (
          <div key={index} className="flex items-start gap-2 text-sm p-2 bg-card rounded">
            <span>{rec}</span>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-border text-xs text-muted-foreground">
        <p>Risk calculated based on: Current AQI ({aqi}), Age group, Health conditions</p>
      </div>
    </Card>
  );
}
