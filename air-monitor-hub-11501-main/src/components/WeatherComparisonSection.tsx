import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Search, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

// Extended Indian cities with pin codes and popular places for autocomplete
const INDIAN_CITIES = [
  { name: "Jaipur", pincode: "302001", places: [
    "Amer Fort", "Hawa Mahal", "City Palace", "Jantar Mantar", "Nahargarh Fort",
    "Vaishali Nagar", "Malviya Nagar", "Raja Park", "Mansarovar", "Jhotwara",
    "Sodala", "C-Scheme", "Johari Bazaar", "Bapu Bazaar", "Tonk Road"
  ] },
  { name: "Delhi", pincode: "110001", places: [
    "India Gate", "Red Fort", "Qutub Minar", "Lotus Temple", "Connaught Place",
    "Saket", "Dwarka", "Rohini", "Karol Bagh", "Lajpat Nagar", "Vasant Kunj",
    "Hauz Khas", "Chanakyapuri", "Janakpuri", "Pitampura"
  ] },
  { name: "Mumbai", pincode: "400001", places: [
    "Gateway of India", "Marine Drive", "Juhu Beach", "Bandra Kurla Complex", "Colaba",
    "Andheri", "Bandra", "Powai", "Lower Parel", "Dadar", "Worli", "Borivali"
  ] },
  { name: "Bangalore", pincode: "560001", places: [
    "Lalbagh", "Cubbon Park", "Whitefield", "Koramangala", "MG Road",
    "Indiranagar", "Marathahalli", "HSR Layout", "Electronic City", "BTM Layout"
  ] },
  { name: "Chennai", pincode: "600001", places: [
    "Marina Beach", "T Nagar", "Mylapore", "Anna Nagar", "Adyar",
    "Velachery", "Nungambakkam", "Guindy", "Chromepet", "Porur"
  ] },
  { name: "Kolkata", pincode: "700001", places: [
    "Victoria Memorial", "Howrah Bridge", "Park Street", "Salt Lake", "Esplanade",
    "New Town", "Garia", "Behala", "Dumdum", "Ballygunge"
  ] },
  { name: "Hyderabad", pincode: "500001", places: [
    "Charminar", "Hitech City", "Gachibowli", "Banjara Hills", "Secunderabad",
    "Madhapur", "Kukatpally", "Begumpet", "Mehdipatnam", "Kondapur"
  ] },
  { name: "Pune", pincode: "411001", places: [
    "Shivaji Nagar", "Koregaon Park", "Hinjewadi", "Kothrud", "Viman Nagar",
    "Baner", "Aundh", "Pimpri", "Kalyani Nagar", "Magarpatta"
  ] },
  { name: "Ahmedabad", pincode: "380001", places: [
    "Sabarmati Ashram", "Manek Chowk", "Law Garden", "SG Highway", "Satellite",
    "Navrangpura", "Bodakdev", "Vastrapur", "Gota", "Paldi"
  ] },
  { name: "Surat", pincode: "395001", places: [
    "Dumas Beach", "Gopi Talav", "Adajan", "Athwa", "Vesu", "Varachha", "Pal",
    "Rander", "Udhna", "Parle Point"
  ] },
  { name: "Lucknow", pincode: "226001", places: [
    "Hazratganj", "Gomti Nagar", "Aminabad", "Alambagh", "Indira Nagar",
    "Charbagh", "Vikas Nagar", "Rajajipuram", "Chinhat", "Ashiyana"
  ] },
  { name: "Kanpur", pincode: "208001", places: [
    "Mall Road", "Kidwai Nagar", "Civil Lines", "Govind Nagar", "Swaroop Nagar",
    "Kalyanpur", "Barra", "Panki", "Tilak Nagar", "Lajpat Nagar"
  ] },
  { name: "Nagpur", pincode: "440001", places: [
    "Sitabuldi", "Sadar", "Civil Lines", "Dharampeth", "Manish Nagar",
    "Besa", "Hingna", "Mahal", "Jaripatka", "Ajni"
  ] },
  { name: "Indore", pincode: "452001", places: [
    "Rajwada", "Sarafa Bazaar", "Vijay Nagar", "AB Road", "Palasia",
    "Bhawarkuan", "Rau", "Mhow", "Khajrana", "Bengali Square"
  ] },
  { name: "Bhopal", pincode: "462001", places: [
    "Upper Lake", "New Market", "MP Nagar", "Arera Colony", "Kolar Road",
    "Shahpura", "Govindpura", "Berasia", "Ayodhya Bypass", "TT Nagar"
  ] },
  { name: "Jodhpur", pincode: "342001", places: [
    "Mehrangarh Fort", "Clock Tower", "Umaid Bhawan", "Mandore", "Sardarpura",
    "Ratanada", "Shastri Nagar", "Paota", "Sojati Gate", "Raika Bagh"
  ] },
  { name: "Udaipur", pincode: "313001", places: [
    "City Palace", "Lake Pichola", "Fateh Sagar", "Saheliyon Ki Bari", "Sukhadia Circle",
    "Hiran Magri", "Bapu Bazaar", "Chetak Circle", "Pratap Nagar", "Dabok"
  ] },
];

interface LocationData {
  pm10: number;
  pm25: number;
  co2: number;
  humidity: number;
  temperature: number;
  lat?: number;
  lng?: number;
}

interface HealthAdvisory {
  type: 'pm25' | 'co2' | 'temperature';
  message: string;
}

export const WeatherComparisonSection = () => {
  const [mainCity, setMainCity] = useState("");
  const [place1, setPlace1] = useState("");
  const [place2, setPlace2] = useState("");
  const [cityData, setCityData] = useState<LocationData | null>(null);
  const [place1Data, setPlace1Data] = useState<LocationData | null>(null);
  const [place2Data, setPlace2Data] = useState<LocationData | null>(null);
  const [comparison, setComparison] = useState<{
    safer: string;
    bestPlace: string;
    advisories: HealthAdvisory[];
  } | null>(null);

  const [cityInput, setCityInput] = useState("");
  const [place1Input, setPlace1Input] = useState("");
  const [place2Input, setPlace2Input] = useState("");
  const [cityError, setCityError] = useState("");
  const [place1Error, setPlace1Error] = useState("");
  const [place2Error, setPlace2Error] = useState("");
  const [openCity, setOpenCity] = useState(false);
  const [openPlace1, setOpenPlace1] = useState(false);
  const [openPlace2, setOpenPlace2] = useState(false);

  const city1Places = useMemo(() => {
    const selectedCity = INDIAN_CITIES.find(c => c.name === mainCity);
    return selectedCity?.places || [];
  }, [mainCity]);

  const generateMockData = (): LocationData => ({
    pm10: Math.random() * 150,
    pm25: Math.random() * 100,
    co2: 400 + Math.random() * 800,
    humidity: 40 + Math.random() * 40,
    temperature: 20 + Math.random() * 25,
    lat: 28.7041 + (Math.random() - 0.5) * 10,
    lng: 77.1025 + (Math.random() - 0.5) * 10,
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

  const generateHealthAdvisories = (data: LocationData): HealthAdvisory[] => {
    const advisories: HealthAdvisory[] = [];
    
    if (data.pm25 > 60) {
      advisories.push({
        type: 'pm25',
        message: '⚠️ High PM2.5 levels may cause breathing issues. Consider wearing a mask outdoors.'
      });
    }
    
    if (data.co2 > 1000) {
      advisories.push({
        type: 'co2',
        message: '⚠️ Elevated CO2 may lead to fatigue or headaches. Ensure good ventilation indoors.'
      });
    }
    
    if (data.temperature > 40) {
      advisories.push({
        type: 'temperature',
        message: '⚠️ Avoid outdoor activity due to extreme heat. Stay hydrated and seek shade.'
      });
    }

    if (data.pm10 > 100 || data.pm25 > 60) {
      advisories.push({
        type: 'pm25',
        message: '⚠️ Poor air quality detected. Limit outdoor activities and close windows.'
      });
    }
    
    return advisories;
  };

  const handleCitySelect = (cityName: string) => {
    setMainCity(cityName);
    setCityError("");
    const mockData = generateMockData();
    setCityData(mockData);
    setPlace1Data(null);
    setPlace2Data(null);
    setPlace1("");
    setPlace2("");
    setPlace1Input("");
    setPlace2Input("");
    setComparison(null);
    toast({
      title: "City Selected",
      description: `Showing data for ${cityName}`,
    });
  };

  const handleComparison = () => {
    if (!mainCity) {
      toast({
        title: "Error",
        description: "Please select a city first",
        variant: "destructive",
      });
      return;
    }

    if (!place1 || !place2) {
      toast({
        title: "Error",
        description: "Please select both places",
        variant: "destructive",
      });
      return;
    }
    
    const mockPlace1Data = generateMockData();
    const mockPlace2Data = generateMockData();
    setPlace1Data(mockPlace1Data);
    setPlace2Data(mockPlace2Data);
    
    const place1Score = calculateSafety(mockPlace1Data);
    const place2Score = calculateSafety(mockPlace2Data);
    
    const safer = place1Score > place2Score ? place1 : place2Score > place1Score ? place2 : "Both locations have similar air quality";
    const bestPlace = place1Score > place2Score ? place1 : place2;
    const unsafeLocation = place1Score < place2Score ? mockPlace1Data : mockPlace2Data;
    const advisories = generateHealthAdvisories(unsafeLocation);
    
    setComparison({ safer, bestPlace, advisories });
    
    toast({
      title: "Comparison Complete",
      description: `Analyzed air quality for ${place1} and ${place2} in ${mainCity}`,
    });
  };

  return (
    <section className="py-12 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl space-y-8">

        <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Weather Information & Comparison
        </h2>

        {/* Main City Search */}
        <Card>
          <CardHeader>
            <CardTitle>Search Main City</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Popover open={openCity} onOpenChange={setOpenCity}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCity}
                    className="w-full justify-between"
                  >
                    {mainCity || "Select city..."}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search city..." />
                    <CommandList>
                      <CommandEmpty>No city found.</CommandEmpty>
                      <CommandGroup>
                        {INDIAN_CITIES.map((city) => (
                          <CommandItem
                            key={city.name}
                            value={city.name}
                            onSelect={(currentValue) => {
                              handleCitySelect(currentValue);
                              setOpenCity(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                mainCity === city.name ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div>
                              <div className="font-medium">{city.name}</div>
                              <div className="text-xs text-muted-foreground">PIN: {city.pincode}</div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            {cityError && (
              <p className="text-sm text-destructive mt-2">{cityError}</p>
            )}
            {mainCity && !cityError && (
              <p className="text-sm text-success mt-2">✓ {mainCity} selected</p>
            )}
          </CardContent>
        </Card>

        {/* City Data Display */}
        {cityData && (
          <div className="space-y-6 animate-fade-in">
            <Card className="overflow-hidden">
              <div className="relative h-64 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-16 w-16 text-success mx-auto mb-4 animate-bounce" style={{ fill: '#2ecc71' }} />
                  <p className="text-lg font-semibold text-foreground">{mainCity}</p>
                  <p className="text-sm text-muted-foreground">
                    Lat: {cityData.lat?.toFixed(4)}, Lng: {cityData.lng?.toFixed(4)}
                  </p>
                  <p className="text-sm font-medium text-success mt-2">✅ Safe Location</p>
                </div>
              </div>
              
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-foreground">Air Quality Readings</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="bg-muted/50 rounded-lg p-4 text-center transition-all hover:scale-105">
                    <p className="text-sm text-muted-foreground mb-1">PM10</p>
                    <p className={`text-2xl font-bold ${cityData.pm10 <= 100 ? 'text-success' : 'text-destructive'}`}>
                      {cityData.pm10.toFixed(1)}
                    </p>
                    <p className="text-xs text-muted-foreground">μg/m³</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 text-center transition-all hover:scale-105">
                    <p className="text-sm text-muted-foreground mb-1">PM2.5</p>
                    <p className={`text-2xl font-bold ${cityData.pm25 <= 60 ? 'text-success' : 'text-destructive'}`}>
                      {cityData.pm25.toFixed(1)}
                    </p>
                    <p className="text-xs text-muted-foreground">μg/m³</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 text-center transition-all hover:scale-105">
                    <p className="text-sm text-muted-foreground mb-1">CO2</p>
                    <p className={`text-2xl font-bold ${cityData.co2 <= 1000 ? 'text-success' : 'text-destructive'}`}>
                      {cityData.co2.toFixed(0)}
                    </p>
                    <p className="text-xs text-muted-foreground">ppm</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 text-center transition-all hover:scale-105">
                    <p className="text-sm text-muted-foreground mb-1">Humidity</p>
                    <p className={`text-2xl font-bold ${cityData.humidity <= 70 ? 'text-success' : 'text-destructive'}`}>
                      {cityData.humidity.toFixed(1)}
                    </p>
                    <p className="text-xs text-muted-foreground">%</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 text-center transition-all hover:scale-105">
                    <p className="text-sm text-muted-foreground mb-1">Temperature</p>
                    <p className={`text-2xl font-bold ${cityData.temperature <= 40 ? 'text-success' : 'text-destructive'}`}>
                      {cityData.temperature.toFixed(1)}
                    </p>
                    <p className="text-xs text-muted-foreground">°C</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Place Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Compare Two Places in {mainCity}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Place 1</label>
                    <Popover open={openPlace1} onOpenChange={setOpenPlace1}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openPlace1}
                          className="w-full justify-between"
                          disabled={!mainCity}
                        >
                          {place1 || "Select place..."}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search place..." />
                          <CommandList>
                            <CommandEmpty>No place found.</CommandEmpty>
                            <CommandGroup>
                              {city1Places.map((place) => (
                                <CommandItem
                                  key={place}
                                  value={place}
                                  onSelect={(currentValue) => {
                                    setPlace1(currentValue);
                                    setPlace1Error("");
                                    setOpenPlace1(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      place1 === place ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {place}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {place1Error && <p className="text-sm text-destructive">{place1Error}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Place 2</label>
                    <Popover open={openPlace2} onOpenChange={setOpenPlace2}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openPlace2}
                          className="w-full justify-between"
                          disabled={!mainCity}
                        >
                          {place2 || "Select place..."}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search place..." />
                          <CommandList>
                            <CommandEmpty>No place found.</CommandEmpty>
                            <CommandGroup>
                              {city1Places.map((place) => (
                                <CommandItem
                                  key={place}
                                  value={place}
                                  onSelect={(currentValue) => {
                                    setPlace2(currentValue);
                                    setPlace2Error("");
                                    setOpenPlace2(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      place2 === place ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {place}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {place2Error && <p className="text-sm text-destructive">{place2Error}</p>}
                  </div>
                </div>

                <Button onClick={handleComparison} className="w-full">
                  Compare Air Quality
                </Button>

                {/* Comparison Results */}
                {comparison && place1Data && place2Data && (
                  <div className="mt-6 space-y-4 animate-fade-in">
                    <div className="bg-gradient-to-r from-success/10 to-success/5 border border-success/20 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-6 w-6 text-success mt-1 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-success mb-1">Comparison Result</h4>
                          <p className="text-sm text-foreground">
                            {comparison.safer === "Both locations have similar air quality" 
                              ? comparison.safer 
                              : `${comparison.safer} has better air quality`}
                          </p>
                        </div>
                      </div>
                    </div>

                    {comparison.advisories.length > 0 && (
                      <div className="bg-gradient-to-r from-destructive/10 to-destructive/5 border border-destructive/20 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-6 w-6 text-destructive mt-1 flex-shrink-0" />
                          <div className="space-y-2">
                            <h4 className="font-semibold text-destructive">Health Advisories</h4>
                            {comparison.advisories.map((advisory, idx) => (
                              <p key={idx} className="text-sm text-foreground">{advisory.message}</p>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">{place1}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">PM10:</span>
                              <span className={place1Data.pm10 <= 100 ? 'text-success' : 'text-destructive'}>
                                {place1Data.pm10.toFixed(1)} μg/m³
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">PM2.5:</span>
                              <span className={place1Data.pm25 <= 60 ? 'text-success' : 'text-destructive'}>
                                {place1Data.pm25.toFixed(1)} μg/m³
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">CO2:</span>
                              <span className={place1Data.co2 <= 1000 ? 'text-success' : 'text-destructive'}>
                                {place1Data.co2.toFixed(0)} ppm
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Humidity:</span>
                              <span className={place1Data.humidity <= 70 ? 'text-success' : 'text-destructive'}>
                                {place1Data.humidity.toFixed(1)}%
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Temperature:</span>
                              <span className={place1Data.temperature <= 40 ? 'text-success' : 'text-destructive'}>
                                {place1Data.temperature.toFixed(1)}°C
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">{place2}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">PM10:</span>
                              <span className={place2Data.pm10 <= 100 ? 'text-success' : 'text-destructive'}>
                                {place2Data.pm10.toFixed(1)} μg/m³
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">PM2.5:</span>
                              <span className={place2Data.pm25 <= 60 ? 'text-success' : 'text-destructive'}>
                                {place2Data.pm25.toFixed(1)} μg/m³
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">CO2:</span>
                              <span className={place2Data.co2 <= 1000 ? 'text-success' : 'text-destructive'}>
                                {place2Data.co2.toFixed(0)} ppm
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Humidity:</span>
                              <span className={place2Data.humidity <= 70 ? 'text-success' : 'text-destructive'}>
                                {place2Data.humidity.toFixed(1)}%
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Temperature:</span>
                              <span className={place2Data.temperature <= 40 ? 'text-success' : 'text-destructive'}>
                                {place2Data.temperature.toFixed(1)}°C
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
};