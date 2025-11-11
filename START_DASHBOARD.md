# 🚀 How to Start the Dashboard

## ✅ Port Configuration

- **Frontend (React)**: Port **8080** (Vite dev server)
- **Backend (Flask)**: Port **5008** (or auto-finds available port, excluding 8080)

## 🎯 Quick Start

### Step 1: Start Backend
```bash
cd AQI_learning
python app.py
```

**What happens:**
- Backend starts on port 5008 (or finds available port)
- Automatically checks if frontend is running on port 8080
- Browser opens automatically:
  - If frontend is running → Opens `http://localhost:8080` ✅
  - If frontend is NOT running → Opens `http://localhost:5008` (fallback)

### Step 2: Start Frontend (Optional - in another terminal)
```bash
cd air-monitor-hub-11501-main
npm run dev
```

This starts the React frontend on `http://localhost:8080`

## 🔗 Connection Flow

```
┌─────────────────┐         ┌─────────────────┐
│  Frontend        │         │  Backend        │
│  Port: 8080      │◄───────►│  Port: 5008     │
│  (React/Vite)    │  API    │  (Flask)        │
└─────────────────┘  Calls  └─────────────────┘
         │                           │
         │                           │
         └─────────── Browser ────────┘
                    Opens here
```

## 📊 How It Works

1. **Backend starts** on port 5008 (avoids port 8080)
2. **Frontend runs** on port 8080 (configured in `vite.config.ts`)
3. **Frontend connects** to backend via API calls to `http://localhost:5008`
4. **Backend redirects** browser requests to frontend if it's running
5. **Data flows**: ESP32 → Backend → Frontend (real-time updates)

## ✅ Verification

1. **Check Backend:**
   ```bash
   curl http://localhost:5008/health
   ```
   Should return: `{"ok": true, "backend_port": 5008, "frontend_port": 8080}`

2. **Check Frontend:**
   - Open: `http://localhost:8080`
   - Check browser console (F12) → Network tab
   - Should see requests to `http://localhost:5008/readings` every 3 seconds

3. **Check Connection:**
   - Frontend dashboard should show "Connected" status
   - Sensor data should update in real-time

## 🎯 Expected Behavior

When you run `python app.py`:

1. ✅ Backend starts on port 5008 (or available port)
2. ✅ Checks for frontend on port 8080
3. ✅ Browser opens automatically:
   - Frontend URL if running
   - Backend URL if frontend not running
4. ✅ Frontend connects to backend automatically
5. ✅ Dashboard shows real-time sensor data

## 🔧 Troubleshooting

**Backend won't start:**
- Check if port 5008 is available
- Backend will auto-find another port (excluding 8080)

**Frontend can't connect:**
- Make sure backend is running
- Check browser console for errors
- Verify CORS is enabled (it is)

**Port conflicts:**
- Backend automatically avoids port 8080
- If 5008 is taken, backend finds another port
- Check console output for actual port used

---

**Status**: ✅ Ready to use!
**Run**: `cd AQI_learning && python app.py`

