# Frontend-Backend Connection Guide

## ✅ Connection Status

The frontend and backend are now properly connected! Here's what has been fixed:

### Changes Made

1. **Created API Configuration** (`air-monitor-hub-11501-main/src/lib/api.ts`)
   - Centralized API endpoint configuration
   - Automatically uses correct backend URL in development vs production
   - Development: `http://localhost:5008` (when Vite dev server runs)
   - Production: Relative URLs (when backend serves frontend)

2. **Updated SensorDataContext** (`air-monitor-hub-11501-main/src/contexts/SensorDataContext.tsx`)
   - Now fetches real sensor data from backend `/readings` endpoint
   - Polls backend every 3 seconds for live updates
   - Falls back to mock data if backend is unavailable
   - Shows connection status

3. **Updated Authentication** (`air-monitor-hub-11501-main/src/hooks/useAuth.tsx`)
   - Login and registration now use centralized API endpoints
   - Consistent backend URL configuration

4. **Fixed Backend `/readings` Endpoint** (`AQI_learning/app.py`)
   - Normalizes sensor data field names (handles `hum`/`humidity`, `temp`/`temperature`)
   - Returns consistent data format for frontend

5. **Enhanced Frontend Serving** (`AQI_learning/app.py`)
   - Better detection of built frontend in `dist` folder
   - Improved path resolution for frontend files

6. **Created Unified Startup Script** (`start_unified.py`)
   - Automatically builds frontend (if needed)
   - Starts backend server
   - Opens frontend in browser

## 🚀 How to Run

### Option 1: Unified Startup (Recommended)

**Windows:**
```bash
# Double-click or run:
start_unified.bat
```

**Or manually:**
```bash
python start_unified.py
```

This will:
1. Build the frontend (if not already built)
2. Start the backend on port 5008 (or find available port)
3. Open the frontend in your browser

### Option 2: Development Mode (Separate Servers)

**Terminal 1 - Backend:**
```bash
cd AQI_learning
python app.py
```

**Terminal 2 - Frontend:**
```bash
cd air-monitor-hub-11501-main
npm run dev
```

Then open: `http://localhost:8080`

The frontend will automatically connect to the backend at `http://localhost:5008`.

### Option 3: Production Mode (Backend Serves Frontend)

1. Build the frontend:
```bash
cd air-monitor-hub-11501-main
npm run build
```

2. Start the backend:
```bash
cd AQI_learning
python app.py
```

3. Open: `http://localhost:5008` (or the port shown in console)

The backend will automatically serve the built frontend from the `dist` folder.

## 🔌 API Endpoints

The frontend connects to these backend endpoints:

- `GET /readings` - Fetch latest sensor data (polled every 3 seconds)
- `POST /login` - User authentication
- `POST /register` - User registration
- `GET /weather?city=CityName` - Weather data
- `GET /health` - Health check

## 📊 Data Flow

1. **Sensor Data:**
   - Frontend polls `/readings` every 3 seconds
   - Backend returns latest sensor readings from ESP32 or mock data
   - Data is displayed in real-time in the dashboard

2. **Authentication:**
   - Frontend sends login/register requests to backend
   - Backend returns JWT tokens
   - Frontend stores tokens for authenticated requests

## 🐛 Troubleshooting

### Frontend shows "Disconnected"
- Check if backend is running: `http://localhost:5008/health`
- Check browser console for errors
- Verify CORS is enabled in backend (it is)

### No sensor data showing
- Check backend console for `/readings` requests
- Verify ESP32 is connected (or mock data is enabled)
- Check browser network tab for failed requests

### Frontend not opening
- Check if port 5008 is available
- Try different port by setting `PORT` environment variable
- Check firewall settings

### Build errors
- Ensure Node.js and npm are installed
- Run `npm install` in `air-monitor-hub-11501-main` folder
- Check for TypeScript errors

## 📁 File Structure

```
AQI_data/
├── start_unified.py          # Unified startup script
├── start_unified.bat         # Windows batch launcher
├── air-monitor-hub-11501-main/  # Frontend (React/Vite)
│   ├── src/
│   │   ├── lib/
│   │   │   └── api.ts        # API configuration
│   │   ├── contexts/
│   │   │   └── SensorDataContext.tsx  # Fetches from backend
│   │   └── hooks/
│   │       └── useAuth.tsx   # Uses backend API
│   └── dist/                 # Built frontend (after npm run build)
└── AQI_learning/             # Backend (Flask)
    └── app.py                # Main backend server
```

## ✅ Verification

To verify the connection is working:

1. **Start the application** using one of the methods above
2. **Open browser console** (F12)
3. **Check Network tab** - you should see requests to `/readings` every 3 seconds
4. **Check sensor data** - it should update in real-time
5. **Check connection status** - should show "Connected" in the UI

## 🎯 Next Steps

- The frontend and backend are now connected!
- Sensor data flows from backend to frontend automatically
- You can now test the full application with real ESP32 data
- All API calls use the centralized configuration

---

**Last Updated:** After connecting frontend and backend
**Status:** ✅ Connected and Working



