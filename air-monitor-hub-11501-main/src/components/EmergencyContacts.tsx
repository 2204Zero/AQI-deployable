import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, MapPin, AlertCircle, Hospital } from 'lucide-react';
import { useSensorData } from '@/contexts/SensorDataContext';
import { calculateAQI } from '@/lib/aqi';

export function EmergencyContacts() {
  const { sensorData } = useSensorData();
  const aqi = calculateAQI(sensorData.pm25);
  const isEmergency = aqi > 200;

  const contacts = [
    {
      name: 'SMS Hospital',
      phone: '0141-2516293',
      distance: '2.3 km',
      specialization: 'Emergency & Respiratory',
    },
    {
      name: 'Fortis Hospital',
      phone: '0141-2544000',
      distance: '3.8 km',
      specialization: 'Multi-Specialty',
    },
    {
      name: 'Sawai Man Singh Hospital',
      phone: '0141-2560291',
      distance: '4.1 km',
      specialization: 'Government Hospital',
    },
    {
      name: 'Ambulance Service',
      phone: '108',
      distance: '24/7 Available',
      specialization: 'Emergency Medical',
    },
  ];

  if (!isEmergency) {
    return (
      <Card className="p-6 bg-success/5">
        <div className="text-center">
          <Hospital className="w-12 h-12 mx-auto mb-3 text-success" />
          <h3 className="text-lg font-semibold mb-2">Emergency Contacts</h3>
          <p className="text-sm text-muted-foreground">
            Emergency contact information is currently hidden as air quality is within safe limits.
          </p>
          <Badge className="mt-2 bg-success/10 text-success">
            AQI: {aqi} - Safe
          </Badge>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-2 border-destructive bg-destructive/5">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="w-5 h-5 text-destructive" />
        <h3 className="text-lg font-semibold text-destructive">Emergency Contacts</h3>
        <Badge variant="destructive">AQI: {aqi}</Badge>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Air quality is hazardous. Here are nearby hospitals and emergency services:
      </p>

      <div className="space-y-3">
        {contacts.map((contact) => (
          <div
            key={contact.name}
            className="flex items-center justify-between p-3 bg-card border border-border rounded-lg"
          >
            <div className="flex-1">
              <h4 className="font-semibold text-sm">{contact.name}</h4>
              <p className="text-xs text-muted-foreground">{contact.specialization}</p>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{contact.distance}</span>
              </div>
            </div>
            <Button size="sm" variant="outline" asChild>
              <a href={`tel:${contact.phone}`}>
                <Phone className="w-4 h-4 mr-2" />
                Call
              </a>
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
        <p className="text-xs font-medium text-center">
          ⚠️ If experiencing breathing difficulties, chest pain, or severe symptoms, call 108 immediately!
        </p>
      </div>
    </Card>
  );
}
