# 🌟 AQI Dashboard - Multi-User Air Quality Monitoring System

A comprehensive Air Quality Index (AQI) dashboard with multi-user support, weather integration, and beautiful user interfaces.

## ✨ Features

### 🔐 **Multi-User Authentication System**
- **User Registration**: Create accounts with username, password, email, and city
- **Secure Login**: Password hashing with salt for security
- **User Avatars**: Beautiful gradient avatars with user initials
- **City Preferences**: Each user can set their preferred city
- **Session Management**: Persistent login with JWT tokens

### 📊 **Air Quality Monitoring**
- **Real-time Data**: Live AQI metrics (PM10, PM2.5, CO2, Humidity, Temperature)
- **Vertical Layout**: Clean, organized display with proper units
- **Auto-refresh**: Data updates every 30 seconds
- **Database Support**: MySQL integration with fallback to mock data

### 🌤️ **Weather Integration**
- **OpenWeatherMap API**: Real-time weather data for any city
- **City Search**: Check weather for any city worldwide
- **User City Weather**: Quick access to user's preferred city weather

### 🎨 **Beautiful UI/UX**
- **Responsive Design**: Works on all screen sizes
- **User Avatars**: Colorful gradient avatars for each user
- **Modern Interface**: Clean, professional design
- **Status Indicators**: Real-time connection status
- **Error Handling**: User-friendly error messages

## 🚀 Quick Start

### **Option 1: Automatic Launcher (Recommended)**
```bash
# Double-click one of these files:
start_dashboard.bat      # For Windows Command Prompt
start_dashboard.ps1      # For PowerShell
```

### **Option 2: Manual Start**
```bash
# 1. Start Backend
cd AQI_learning
python app.py

# 2. Open Frontend
# Open index.html in your browser
```

## 👥 User Management

### **Creating New Users**
1. Click **"Register"** button
2. Fill in details:
   - **Username**: 3+ characters
   - **Password**: 6+ characters
   - **Email**: Optional
   - **City**: Your preferred city
3. Click **"Create Account"**
4. Sign in with your new credentials

### **User Features**
- **Personal Dashboard**: Each user sees their own data
- **City Management**: Update your preferred city anytime
- **Weather Access**: Check weather for any city
- **Profile Avatar**: Unique colorful avatar for each user

## 🔧 Technical Details

### **Backend (Flask)**
- **Port**: 5000 (auto-detected)
- **Database**: MySQL with user table
- **Authentication**: JWT tokens
- **API Endpoints**:
  - `POST /register` - User registration
  - `POST /login` - User login
  - `POST /update-city` - Update user city
  - `GET /readings` - AQI data
  - `GET /weather?city=CityName` - Weather data

### **Frontend (HTML/JavaScript)**
- **Auto-detection**: Finds backend automatically
- **Retry Logic**: 3 attempts to connect
- **Local Storage**: Saves user preferences
- **Real-time Updates**: Live data refresh

## 📱 Usage Guide

### **For New Users**
1. **Register**: Create your account
2. **Set City**: Choose your preferred city
3. **View Data**: See AQI data for your city
4. **Check Weather**: Get weather for any city

### **For Existing Users**
1. **Sign In**: Use your credentials
2. **Update City**: Change your city if needed
3. **Monitor Data**: View real-time AQI data
4. **Weather Check**: Search weather for any city

## 🎨 User Interface

### **Header**
- **User Avatar**: Colorful gradient circle with initials
- **User Info**: Username and city
- **Sign Out**: Logout button

### **Dashboard Sections**
1. **Live Air Quality Data**: Vertical list with units
2. **Your City**: Update your preferred city
3. **Weather Information**: Check weather for any city
4. **User Profile**: Email management

### **Status Bar**
- **Connection Status**: Backend connection indicator
- **Refresh Data**: Manual data refresh
- **Detect Backend**: Auto-detect backend
- **Connect to Port 5000**: Direct connection

## 🔒 Security Features

- **Password Hashing**: PBKDF2 with salt
- **JWT Tokens**: Secure authentication
- **Input Validation**: Server-side validation
- **CORS Protection**: Cross-origin request security

## 📊 Data Display

### **AQI Metrics**
- **PM10**: Particulate Matter 10 (μg/m³)
- **PM2.5**: Fine Particulate Matter (μg/m³)
- **CO2**: Carbon Dioxide (ppm)
- **Humidity**: Relative Humidity (%)
- **Temperature**: Air Temperature (°C)

### **Weather Data**
- **City**: Location name
- **Temperature**: Current temperature (°C)
- **Humidity**: Relative humidity (%)
- **Wind Speed**: Wind speed (m/s)

## 🛠️ Troubleshooting

### **Backend Issues**
- **Port 5000 in use**: Backend will find alternative port
- **Database errors**: Falls back to mock data
- **Connection failed**: Check if Flask is running

### **Frontend Issues**
- **Backend Disconnected**: Click "Connect to Port 5000"
- **Login failed**: Check username/password
- **No data**: Ensure backend is running

### **Common Solutions**
1. **Restart Backend**: Stop and restart `python app.py`
2. **Clear Cache**: Refresh browser (Ctrl+F5)
3. **Check Console**: Open browser dev tools for errors
4. **Use Launcher**: Run `start_dashboard.bat`

## 📁 File Structure
```
AQI_data/
├── index.html              # Main frontend
├── start_dashboard.bat     # Windows launcher
├── start_dashboard.ps1     # PowerShell launcher
├── README.md               # This file
└── AQI_learning/
    ├── app.py              # Flask backend
    ├── port_config.txt     # Port configuration
    └── routes/             # Additional modules
```

## 🎯 Key Benefits

- **Multi-User**: Unlimited users with individual accounts
- **City-Specific**: Each user can monitor their city
- **Real-Time**: Live data updates every 30 seconds
- **Weather Integration**: Check weather anywhere
- **Beautiful UI**: Modern, responsive design
- **Secure**: Password hashing and JWT authentication
- **Easy Setup**: One-click launcher
- **Auto-Detection**: Finds backend automatically

## 🚀 Getting Started

1. **Run the launcher**: Double-click `start_dashboard.bat`
2. **Register**: Create your user account
3. **Set your city**: Choose your preferred city
4. **Monitor data**: View real-time AQI data
5. **Check weather**: Search weather for any city

The dashboard will automatically open in your browser and connect to the backend! 🎉

---

**Made with ❤️ for Air Quality Monitoring**