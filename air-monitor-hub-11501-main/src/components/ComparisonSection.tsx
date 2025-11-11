import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface LocationData {
  pm10: number;
  pm25: number;
  co2: number;
  humidity: number;
  temperature: number;
}

export const ComparisonSection = () => {
  const [location1, setLocation1] = useState("");
  const [location2, setLocation2] = useState("");
  const [comparison, setComparison] = useState<{
    location1: string;
    location2: string;
    data1: LocationData;
    data2: LocationData;
    safer: string;
  } | null>(null);

  const generateMockData = (): LocationData => ({
    pm10: Math.random() * 150,
    pm25: Math.random() * 100,
    co2: 400 + Math.random() * 800,
    humidity: 40 + Math.random() * 40,
    temperature: 20 + Math.random() * 25,
  });

  const calculateSafety = (data: LocationData): number => {
    let score = 0;
    if (data.pm10 <= 100) score++;
    if (data.pm25 <= 60) score++;
    if (data.co2 <= 1000) score++;
    if (data.humidity <= 70) score++;
    if (data.temperature <= 40) score++;
    return score;
  };

  const handleCompare = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!location1 || !location2) {
      toast({
        title: "Error",
        description: "Please enter both locations",
        variant: "destructive",
      });
      return;
    }

    const data1 = generateMockData();
    const data2 = generateMockData();
    
    const safety1 = calculateSafety(data1);
    const safety2 = calculateSafety(data2);
    
    setComparison({
      location1,
      location2,
      data1,
      data2,
      safer: safety1 > safety2 ? location1 : safety2 > safety1 ? location2 : "Both locations are equally safe",
    });
  };

  return (
    <section className="py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
          Compare Air Quality
        </h2>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Enter Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCompare} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location1">First Location</Label>
                <Input
                  id="location1"
                  value={location1}
                  onChange={(e) => setLocation1(e.target.value)}
                  placeholder="e.g., Delhi"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location2">Second Location</Label>
                <Input
                  id="location2"
                  value={location2}
                  onChange={(e) => setLocation2(e.target.value)}
                  placeholder="e.g., London"
                />
              </div>
              
              <div className="flex items-end">
                <Button type="submit" className="w-full">
                  Compare
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {comparison && (
          <>
            {/* Map Visualization */}
            <Card className="mb-8 overflow-hidden">
              <CardContent className="p-0">
                <div className="relative h-64 bg-gradient-to-br from-primary/5 to-primary/10">
                  <div className="absolute inset-0 flex items-center justify-around p-8">
                    {/* Location 1 Marker */}
                    <div className="flex flex-col items-center gap-2">
                      <div className={`relative ${comparison.safer === comparison.location1 ? 'text-success' : 'text-primary'}`}>
                        <MapPin className="h-12 w-12 fill-current" />
                        {comparison.safer === comparison.location1 && (
                          <CheckCircle2 className="absolute -top-1 -right-1 h-5 w-5 text-success bg-background rounded-full" />
                        )}
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-foreground">{comparison.location1}</p>
                        {comparison.safer === comparison.location1 && (
                          <p className="text-sm text-success font-medium">Safer for you</p>
                        )}
                      </div>
                    </div>

                    {/* Connecting Line */}
                    <div className="flex-1 h-px bg-border mx-4"></div>

                    {/* Location 2 Marker */}
                    <div className="flex flex-col items-center gap-2">
                      <div className={`relative ${comparison.safer === comparison.location2 ? 'text-success' : 'text-primary'}`}>
                        <MapPin className="h-12 w-12 fill-current" />
                        {comparison.safer === comparison.location2 && (
                          <CheckCircle2 className="absolute -top-1 -right-1 h-5 w-5 text-success bg-background rounded-full" />
                        )}
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-foreground">{comparison.location2}</p>
                        {comparison.safer === comparison.location2 && (
                          <p className="text-sm text-success font-medium">Safer for you</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Safety Recommendation */}
            <Card className="mb-8 border-2 border-primary">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center gap-3">
                  {comparison.safer !== "Both locations are equally safe" ? (
                    <>
                      <CheckCircle2 className="h-6 w-6 text-success" />
                      <p className="text-lg font-semibold text-foreground">
                        <span className="text-success">{comparison.safer}</span> is safer for you to visit
                      </p>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-6 w-6 text-warning" />
                      <p className="text-lg font-semibold text-foreground">
                        Both locations have similar air quality
                      </p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Detailed Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className={comparison.safer === comparison.location1 ? "border-2 border-success" : ""}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {comparison.location1}
                    {comparison.safer === comparison.location1 && (
                      <span className="text-success text-sm flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" /> Safer
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">PM10:</span>
                    <span className={comparison.data1.pm10 <= 100 ? "text-success" : "text-destructive"}>
                      {comparison.data1.pm10.toFixed(1)} μg/m³
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">PM2.5:</span>
                    <span className={comparison.data1.pm25 <= 60 ? "text-success" : "text-destructive"}>
                      {comparison.data1.pm25.toFixed(1)} μg/m³
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CO2:</span>
                    <span className={comparison.data1.co2 <= 1000 ? "text-success" : "text-destructive"}>
                      {comparison.data1.co2.toFixed(0)} ppm
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Humidity:</span>
                    <span className={comparison.data1.humidity <= 70 ? "text-success" : "text-destructive"}>
                      {comparison.data1.humidity.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Temperature:</span>
                    <span className={comparison.data1.temperature <= 40 ? "text-success" : "text-destructive"}>
                      {comparison.data1.temperature.toFixed(1)}°C
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className={comparison.safer === comparison.location2 ? "border-2 border-success" : ""}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {comparison.location2}
                    {comparison.safer === comparison.location2 && (
                      <span className="text-success text-sm flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" /> Safer
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">PM10:</span>
                    <span className={comparison.data2.pm10 <= 100 ? "text-success" : "text-destructive"}>
                      {comparison.data2.pm10.toFixed(1)} μg/m³
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">PM2.5:</span>
                    <span className={comparison.data2.pm25 <= 60 ? "text-success" : "text-destructive"}>
                      {comparison.data2.pm25.toFixed(1)} μg/m³
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CO2:</span>
                    <span className={comparison.data2.co2 <= 1000 ? "text-success" : "text-destructive"}>
                      {comparison.data2.co2.toFixed(0)} ppm
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Humidity:</span>
                    <span className={comparison.data2.humidity <= 70 ? "text-success" : "text-destructive"}>
                      {comparison.data2.humidity.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Temperature:</span>
                    <span className={comparison.data2.temperature <= 40 ? "text-success" : "text-destructive"}>
                      {comparison.data2.temperature.toFixed(1)}°C
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </section>
  );
};
