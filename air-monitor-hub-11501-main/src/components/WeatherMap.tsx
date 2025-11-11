import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface LocationData {
  location: string;
  pm10: number;
  pm25: number;
  co2: number;
  humidity: number;
  temperature: number;
  lat?: number;
  lng?: number;
}

export const WeatherMap = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationData, setLocationData] = useState<LocationData | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      toast({
        title: "Error",
        description: "Please enter a location",
        variant: "destructive",
      });
      return;
    }

    // Simulate API call (replace with actual weather API integration)
    const mockData: LocationData = {
      location: searchQuery,
      pm10: 60 + Math.random() * 80,
      pm25: 35 + Math.random() * 50,
      co2: 500 + Math.random() * 600,
      humidity: 45 + Math.random() * 30,
      temperature: 18 + Math.random() * 20,
      lat: 28.7041 + (Math.random() - 0.5) * 10,
      lng: 77.1025 + (Math.random() - 0.5) * 10,
    };

    setLocationData(mockData);
    
    toast({
      title: "Location Found",
      description: `Showing data for ${searchQuery}`,
    });
  };

  return (
    <section className="py-12 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold text-center mb-8 text-foreground">
          Weather Information
        </h2>

        <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto mb-8">
          <Input
            type="text"
            placeholder="Enter location (e.g., Delhi, London)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" className="bg-primary hover:bg-primary/90">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </form>

        {locationData && (
          <div className="bg-card rounded-lg shadow-lg overflow-hidden">
            {/* Map placeholder */}
            <div className="relative h-64 md:h-96 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-16 w-16 text-primary mx-auto mb-4 animate-bounce" />
                <p className="text-lg font-semibold text-foreground">{locationData.location}</p>
                <p className="text-sm text-muted-foreground">
                  Lat: {locationData.lat?.toFixed(4)}, Lng: {locationData.lng?.toFixed(4)}
                </p>
              </div>
            </div>

            {/* Readings */}
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-foreground">Air Quality Readings</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">PM10</p>
                  <p className="text-2xl font-bold text-foreground">{locationData.pm10.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">μg/m³</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">PM2.5</p>
                  <p className="text-2xl font-bold text-foreground">{locationData.pm25.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">μg/m³</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">CO2</p>
                  <p className="text-2xl font-bold text-foreground">{locationData.co2.toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground">ppm</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Humidity</p>
                  <p className="text-2xl font-bold text-foreground">{locationData.humidity.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">%</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Temperature</p>
                  <p className="text-2xl font-bold text-foreground">{locationData.temperature.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">°C</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {!locationData && (
          <div className="text-center py-12">
            <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">Search for a location to view air quality data</p>
          </div>
        )}
      </div>
    </section>
  );
};
