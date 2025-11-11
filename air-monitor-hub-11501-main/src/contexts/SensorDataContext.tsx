import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface SensorData {
  pm10: number;
  pm25: number;
  co2: number;
  humidity: number;
  temperature: number;
  mq135: number;
  mq135_ppm?: number;
}

interface SensorDataContextType {
  sensorData: SensorData;
  updateSensorData: (data: Partial<SensorData>) => void;
}

const SensorDataContext = createContext<SensorDataContextType | undefined>(undefined);

const DEFAULT_API_BASES = [
  (import.meta.env.VITE_API_BASE as string | undefined) || undefined,
  'http://localhost:5008',
  'http://localhost:5000'
];

function pickApiBase() {
  for (const b of DEFAULT_API_BASES) {
    if (!b) continue;
    try {
      // Basic validation
      // eslint-disable-next-line no-new
      new URL(b);
      return b.replace(/\/$/, '');
    } catch (_) {
      continue;
    }
  }
  return 'http://localhost:5000';
}

export const SensorDataProvider = ({ children }: { children: ReactNode }) => {
  const [sensorData, setSensorData] = useState<SensorData>({
    pm10: 45,
    pm25: 32,
    co2: 450,
    humidity: 55,
    temperature: 24,
    mq135: 350,
    mq135_ppm: 1.2,
  });

  const API_BASE = pickApiBase();

  // Poll backend /esp32/latest every 3 seconds. If backend is not reachable, keep local simulation.
  useEffect(() => {
    let mounted = true;
    const fetchLatest = async () => {
      try {
        const res = await fetch(`${API_BASE}/esp32/latest`, { method: 'GET' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!mounted) return;
        
        // Find the latest reading from all devices
        const deviceIds = Object.keys(data);
        if (deviceIds.length === 0) {
          throw new Error('No device data available');
        }
        
        // Get the most recent reading (assuming the first device in the object is the latest)
        const latestDeviceData = data[deviceIds[0]];
        
        // Ensure numeric fields exist and update state
        setSensorData(prev => ({
          pm10: typeof latestDeviceData.pm10 === 'number' ? latestDeviceData.pm10 : prev.pm10,
          pm25: typeof latestDeviceData.pm25 === 'number' ? latestDeviceData.pm25 : prev.pm25,
          co2: typeof latestDeviceData.co2 === 'number' ? latestDeviceData.co2 : prev.co2,
          humidity: typeof latestDeviceData.humidity === 'number' ? latestDeviceData.humidity : prev.humidity,
          temperature: typeof latestDeviceData.temperature === 'number' ? latestDeviceData.temperature : prev.temperature,
          mq135: typeof latestDeviceData.mq135_raw === 'number' ? latestDeviceData.mq135_raw : prev.mq135,
          mq135_ppm: typeof latestDeviceData.mq135_ppm === 'number' ? latestDeviceData.mq135_ppm : prev.mq135_ppm,
        }));
      } catch (e) {
        // Backend not reachable; fall back to small local random walk to keep UI lively
      setSensorData(prev => ({
        pm10: Math.max(0, +(prev.pm10 + (Math.random() - 0.5) * 4).toFixed(1)),
        pm25: Math.max(0, +(prev.pm25 + (Math.random() - 0.5) * 3).toFixed(1)),
        co2: Math.max(400, Math.round(prev.co2 + (Math.random() - 0.5) * 20)),
        humidity: Math.max(0, Math.min(100, +(prev.humidity + (Math.random() - 0.5) * 2).toFixed(1))),
        temperature: Math.max(0, Math.min(50, +(prev.temperature + (Math.random() - 0.5) * 0.5).toFixed(1))),
        mq135: Math.max(0, Math.min(1000, Math.round(prev.mq135 + (Math.random() - 0.5) * 20))),
        mq135_ppm: Math.max(0.1, +(prev.mq135_ppm! + (Math.random() - 0.5) * 0.2).toFixed(2))
      }));
      }
    };

    // Initial fetch immediately, then interval
    fetchLatest();
    const id = setInterval(fetchLatest, 3000);
    return () => { mounted = false; clearInterval(id); };
  }, [API_BASE]);

  // Local update function used by UI/testing components
  const updateSensorData = (data: Partial<SensorData>) => {
    setSensorData(prev => ({ ...prev, ...data }));
  };

  return (
    <SensorDataContext.Provider value={{ sensorData, updateSensorData }}>
      {children}
    </SensorDataContext.Provider>
  );
};

export const useSensorData = () => {
  const context = useContext(SensorDataContext);
  if (!context) {
    throw new Error("useSensorData must be used within SensorDataProvider");
  }
  return context;
};
