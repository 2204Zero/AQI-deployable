import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';

const educationalContent = [
  {
    title: 'What is PM2.5?',
    content: 'PM2.5 refers to atmospheric particulate matter (PM) with a diameter of less than 2.5 micrometers. These tiny particles can penetrate deep into lungs and even enter the bloodstream.',
    tip: 'PM2.5 levels above 35 μg/m³ are considered unhealthy for sensitive groups.',
  },
  {
    title: 'Understanding AQI',
    content: 'The Air Quality Index (AQI) is calculated based on five major air pollutants. It converts pollutant concentrations into a single number from 0-500.',
    tip: 'AQI values below 50 are considered good. Above 100 is unhealthy for sensitive groups.',
  },
  {
    title: 'Why CO2 Matters',
    content: 'High indoor CO2 levels indicate poor ventilation. Levels above 1000 ppm can cause drowsiness, headaches, and reduced concentration.',
    tip: 'Keep CO2 levels below 1000 ppm by ensuring proper ventilation.',
  },
  {
    title: 'Health Effects of Air Pollution',
    content: 'Short-term exposure can irritate eyes, nose, and throat. Long-term exposure increases risk of respiratory diseases and cardiovascular problems.',
    tip: 'Sensitive groups include children, elderly, and people with asthma or heart disease.',
  },
  {
    title: 'How to Improve Indoor Air Quality',
    content: 'Use air purifiers with HEPA filters, ensure proper ventilation, avoid smoking indoors, and reduce use of chemical products.',
    tip: 'Plants like snake plant and spider plant can help improve indoor air quality naturally.',
  },
];

export function EducationalCards() {
  const [currentCard, setCurrentCard] = useState(0);

  const nextCard = () => {
    setCurrentCard((prev) => (prev + 1) % educationalContent.length);
  };

  const prevCard = () => {
    setCurrentCard((prev) => (prev - 1 + educationalContent.length) % educationalContent.length);
  };

  const card = educationalContent[currentCard];

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Air Quality Education
        </h3>
        <div className="text-sm text-muted-foreground">
          {currentCard + 1} / {educationalContent.length}
        </div>
      </div>

      <div className="min-h-[180px]">
        <h4 className="text-xl font-bold mb-3 text-gradient">{card.title}</h4>
        <p className="text-sm text-muted-foreground mb-4">{card.content}</p>
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
          <p className="text-sm font-medium">💡 Pro Tip: {card.tip}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          onClick={prevCard}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>
        <div className="flex gap-1">
          {educationalContent.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 w-8 rounded-full transition-colors ${
                index === currentCard ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={nextCard}
          className="gap-2"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}
