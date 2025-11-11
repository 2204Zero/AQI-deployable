import { Bluetooth } from "lucide-react";

export const ESP32Status = () => {
  const isConnected = true; // Force online for demo purposes
  
  return (
    <div className="flex items-center gap-2">
      <Bluetooth className={`h-5 w-5 ${isConnected ? 'text-success' : 'text-destructive'}`} />
      <span className="text-sm font-medium text-foreground">ESP32 Online</span>
    </div>
  );
};
