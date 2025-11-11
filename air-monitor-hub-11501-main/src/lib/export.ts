// Data export utilities

interface SensorReading {
  pm10: number;
  pm25: number;
  co2: number;
  humidity: number;
  temperature: number;
  aqi_value: number;
  aqi_level: string;
  recorded_at: string;
  location_name?: string;
}

export function exportToCSV(data: SensorReading[], filename: string = 'sensor-data.csv') {
  const headers = ['Date/Time', 'PM10 (μg/m³)', 'PM2.5 (μg/m³)', 'CO2 (ppm)', 'Humidity (%)', 'Temperature (°C)', 'AQI', 'AQI Level', 'Location'];
  
  const rows = data.map(reading => [
    new Date(reading.recorded_at).toLocaleString(),
    reading.pm10.toFixed(2),
    reading.pm25.toFixed(2),
    reading.co2.toFixed(0),
    reading.humidity.toFixed(1),
    reading.temperature.toFixed(1),
    reading.aqi_value,
    reading.aqi_level,
    reading.location_name || 'N/A'
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function exportToPDF(data: SensorReading[], filename: string = 'sensor-data.pdf') {
  // Note: For full PDF support, you would integrate a library like jsPDF
  // For now, we'll create a printable HTML version
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Air Quality Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #333; border-bottom: 2px solid #4a90e2; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #4a90e2; color: white; }
          tr:nth-child(even) { background-color: #f2f2f2; }
          .footer { margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <h1>Air Quality Monitoring Report</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <p>Total Records: ${data.length}</p>
        
        <table>
          <thead>
            <tr>
              <th>Date/Time</th>
              <th>PM10</th>
              <th>PM2.5</th>
              <th>CO2</th>
              <th>Humidity</th>
              <th>Temperature</th>
              <th>AQI</th>
              <th>Level</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(reading => `
              <tr>
                <td>${new Date(reading.recorded_at).toLocaleString()}</td>
                <td>${reading.pm10.toFixed(2)} μg/m³</td>
                <td>${reading.pm25.toFixed(2)} μg/m³</td>
                <td>${reading.co2.toFixed(0)} ppm</td>
                <td>${reading.humidity.toFixed(1)}%</td>
                <td>${reading.temperature.toFixed(1)}°C</td>
                <td>${reading.aqi_value}</td>
                <td>${reading.aqi_level}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>Air Quality Monitoring System - Team Project AI & DS - B</p>
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  
  setTimeout(() => {
    printWindow.print();
  }, 250);
}