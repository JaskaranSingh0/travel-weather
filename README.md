# Travel Weather

**LIVE LINK**: [https://travel-weather.onrender.com/]

## Overview
Travel Weather is a web application designed to provide travelers with real-time and predictive weather information along their travel routes. The application integrates route mapping and weather forecasting to help users plan their journeys effectively and safely. By displaying weather conditions for key points along the route at the estimated time of arrival, this application addresses the gap between navigation tools and weather prediction services.

## Features
- **Route Mapping**: Displays the best travel routes between two locations using the OpenRouteService API.
- **Weather Forecast**: Provides real-time and predictive weather information for all key waypoints along the route.
- **Traffic Analysis**: Estimates traffic conditions based on travel time and distance.
- **Interactive Map**: Visualizes the route and weather markers using Leaflet.js.
- **User-Friendly Interface**: A clean and responsive design for seamless user experience.

## Technologies Used

### Frontend:
- **React.js**: For building the user interface.
- **Bootstrap**: For styling and responsiveness.
- **Leaflet.js**: For rendering interactive maps and route visualization.

### Backend:
- **Node.js**: For building the server-side application.
- **Express.js**: For handling API requests and routing.

### APIs:
- **OpenWeatherMap API**: For fetching real-time and predictive weather data.
- **OpenRouteService API**: For route mapping and geocoding.

## Installation and Setup

<div align="center">
  <img src="frontend/public/logo192.png" alt="Travel Weather Logo" width="120" />
  <h1>🌤️ Travel Weather</h1>
  <p><b>Plan your journey with real-time weather and route insights!</b></p>
</div>

---

## 🚀 Overview

<b>Travel Weather</b> is a modern web application that helps travelers plan safer and more comfortable journeys by providing:

- Real-time and predictive weather forecasts along your travel route
- Interactive route mapping and traffic analysis
- A beautiful, responsive interface for desktop and mobile

<img src="https://user-images.githubusercontent.com/your-screenshot-url/demo.gif" alt="Travel Weather Demo" style="border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); margin: 24px 0;" width="100%" />

---

## ✨ Features

- 🗺️ <b>Route Mapping</b>: Find the best route between two locations using OpenRouteService.
- 🌦️ <b>Weather Forecast</b>: Get real-time and predictive weather for all key waypoints along your route.
- 🚦 <b>Traffic Analysis</b>: Estimates traffic conditions based on travel time and distance.
- 🗺️ <b>Interactive Map</b>: Visualize your route and weather markers with Leaflet.js.
- 💡 <b>Smart ETA</b>: See weather at your estimated time of arrival for each waypoint.
- 🖥️ <b>Modern UI</b>: Clean, responsive, and mobile-friendly design.
- 🔒 <b>Secure</b>: API keys and sensitive data are managed with environment variables.

---

## 🛠️ Tech Stack

### Frontend
- <b>React.js</b> (with Hooks)
- <b>Bootstrap 5</b> (UI & responsiveness)
- <b>Leaflet.js</b> & <b>React-Leaflet</b> (maps)

### Backend
- <b>Node.js</b> & <b>Express.js</b>
- <b>Axios</b> (API requests)
- <b>express-validator</b> (input validation)
- <b>dotenv</b> (environment variables)

### APIs
- <b>OpenWeatherMap</b> (weather data)
- <b>OpenRouteService</b> (routing & geocoding)

---

## 📸 Screenshots

<div align="center">
  <img src="https://user-images.githubusercontent.com/your-screenshot-url/screenshot1.png" alt="Route and Weather" width="80%" style="margin: 16px 0; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.08);" />
  <img src="https://user-images.githubusercontent.com/your-screenshot-url/screenshot2.png" alt="Weather Details" width="80%" style="margin: 16px 0; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.08);" />
</div>

---

## ⚡ Getting Started

### Prerequisites
- <b>Node.js</b> (v16+ recommended)
- <b>npm</b> (comes with Node.js)
- API keys for:
  - <b>OpenWeatherMap</b>
  - <b>OpenRouteService</b>

### 1. Clone the Repository

```bash
git clone https://github.com/your-repository/travel-weather.git
cd travel-weather
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env # Create your .env file and add your API keys
npm install
```

#### Example `.env` file:

```env
OPENROUTESERVICE_API_KEY=your_openrouteservice_api_key
OPENWEATHERMAP_API_KEY=your_openweathermap_api_key
SSL_VERIFY=false # (optional, for local dev)
NODE_ENV=development
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

### 4. Development vs Production

#### For Development (Recommended):
```bash
# From project root
npm run dev
```
This runs frontend development server on port 3000 and backend on port 5000.

#### For Production Testing (Single Service):
```bash
# From project root
npm run render-build  # Build frontend
npm start            # Start single service on port 5000
```

The single service will serve both the React app and API from [http://localhost:5000](http://localhost:5000).

### 5. Available Scripts

From the project root:
- `npm run dev` - Development mode (frontend on :3000, backend on :5000)
- `npm run render-build` - Build frontend for production
- `npm start` - Start production single service
- `npm run server` - Backend development server only
- `npm run client` - Frontend development server only

---

## 🏗️ Architecture

### Single Service Design
This application uses a **unified single service architecture** for simplified deployment:

```
┌─────────────────────────────────────────────┐
│              Express.js Server               │
│                (Port 5000)                   │
├─────────────────────────────────────────────┤
│  API Routes (/api/*)        Static Files     │
│  ├─ /api/test              ├─ /             │
│  ├─ /api/route-weather     ├─ /static/*      │
│  ├─ /api/geocode           ├─ /* (catchall)  │
│  └─ /api/autocomplete      └─ index.html     │
└─────────────────────────────────────────────┘
```

### Development vs Production Modes

#### Development Mode (`npm run dev`):
- Frontend: React dev server on port 3000 (hot reload)
- Backend: Express server on port 5000 
- Frontend makes requests to `http://localhost:5000/api/*`

#### Production Mode (`npm start`):
- Single Express server on port 5000
- Serves built React files from `/frontend/build`
- API accessible at `/api/*` (same origin)
- Frontend served from `/` with catchall routing

### Key Benefits:
- ✅ **No CORS issues** in production
- ✅ **Simplified deployment** (one service)
- ✅ **Cost effective** (single Render service)
- ✅ **Unified logging** and monitoring

---

## 🧩 Project Structure

```
travel-weather/
├── backend/
│   ├── index.js
│   ├── package.json
│   └── ...
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── ...
│   ├── public/
│   ├── package.json
│   └── ...
└── README.md
```

---

## 📝 Usage

1. Enter your start and end locations in the form.
2. Select from autocomplete suggestions.
3. Click <b>Get Weather Info</b>.
4. View your route, weather at each waypoint, and traffic analysis on the interactive map.

---

## 🛡️ Security & Environment

- API keys are never exposed to the frontend. All sensitive requests are handled server-side.
- Use environment variables for all secrets.
- CORS is enabled for local development.

---

## 🤝 Contributing

Contributions are welcome! To get started:

1. Fork this repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for more details.

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

- [OpenWeatherMap](https://openweathermap.org/)
- [OpenRouteService](https://openrouteservice.org/)
- [React](https://react.dev/)
- [Leaflet.js](https://leafletjs.com/)
- [Bootstrap](https://getbootstrap.com/)

---

<div align="center" style="margin-top: 32px;">
  <b>🌤️ Travel Weather — Plan smart, travel safe!</b>
</div>

---

## 🚀 Deployment (Single Service Architecture)

### Single Service Deployment (Recommended)
The application is now configured as a **single service** where the Express backend serves both the API and the React frontend from one unified service. This approach is simpler and more cost-effective for deployment.

#### Architecture Overview:
- ✅ Backend serves static React build files
- ✅ All API routes prefixed with `/api/*`
- ✅ Frontend uses relative API paths (no CORS issues)
- ✅ Single deployment, single domain, single service

### 1. Render Deployment (Single Web Service)

#### Environment Variables
Set these in the Render dashboard (do NOT commit real keys):
```
OPENROUTESERVICE_API_KEY=your_actual_key_here
OPENWEATHERMAP_API_KEY=your_actual_key_here
SSL_VERIFY=false
NODE_ENV=production
```

#### Service Configuration:
- **Type**: Web Service
- **Environment**: Node
- **Build Command**: `npm run render-build`
- **Start Command**: `npm start`
- **Auto-Deploy**: Yes

#### Manual Setup Steps:
1. Fork/clone this repository to your GitHub
2. Create a new Web Service on Render
3. Connect your GitHub repository
4. Set the environment variables above
5. Deploy!

### 2. Using render.yaml (Infrastructure as Code)
For automated deployment, update the included `render.yaml`:

```yaml
services:
  - type: web
    name: travel-weather
    env: node
    plan: free
    buildCommand: npm run render-build
    startCommand: npm start
    autoDeploy: true
    envVars:
      - key: NODE_VERSION
        value: 18
      - key: SSL_VERIFY
        value: 'false'
      - key: OPENROUTESERVICE_API_KEY
        sync: false  # Set in dashboard
      - key: OPENWEATHERMAP_API_KEY
        sync: false  # Set in dashboard
```

### 3. Testing Deployment
After deployment, test these endpoints:
1. **Frontend**: `https://your-app.onrender.com` (React app)
2. **API Test**: `https://your-app.onrender.com/api/test` (should return API status)
3. **Route Weather**: Use the frontend form to test complete functionality

### 4. Render Deployment Troubleshooting

If you encounter the error "Cannot find module './gOPD'" or similar dependency issues:

1. **Check Render Build Logs**: Look for the specific error
2. **Verify Configuration**: Ensure render.yaml uses root directory
3. **Environment Variables**: Make sure API keys are set in Render dashboard
4. **Manual Service Setup**: If render.yaml fails, create service manually:
   - **Build Command**: `npm run render-build`  
   - **Start Command**: `npm start`
   - **Root Directory**: Leave empty (uses project root)

### 5. Manual Render Service Configuration
If using render.yaml fails, create the service manually with these settings:
```
Service Type: Web Service
Environment: Node
Build Command: npm run render-build
Start Command: npm start
Environment Variables:
  NODE_VERSION=18.20.8
  OPENROUTESERVICE_API_KEY=your_actual_key
  OPENWEATHERMAP_API_KEY=your_actual_key
  SSL_VERIFY=false
```

### 4. Local Development vs Production

#### For Development (Two Services):
```bash
npm run dev  # Runs frontend on :3000, backend on :5000
```

#### For Production Testing (Single Service):
```bash
npm run render-build  # Build frontend
npm start            # Start single service on :5000
```

### 5. Advantages of Single Service Architecture
- ✅ **Simplified Deployment**: One service instead of two
- ✅ **No CORS Issues**: Same origin for frontend and API
- ✅ **Cost Effective**: Only one Render service needed
- ✅ **Easy Maintenance**: Single codebase, single deployment
- ✅ **Environment Consistency**: Same environment for both frontend and backend

### 4. Common Issues & Solutions

#### **Build/Deployment Issues:**
- **Module not found errors (like `gopd`)**: Clean install dependencies
  ```bash
  # Local fix
  rm -rf node_modules backend/node_modules frontend/node_modules
  npm run render-build
  ```
- **Render deployment timeout**: Check build logs, ensure API keys are set
- **Node version issues**: Render supports Node.js 18+, project specifies >=18.20.8

#### **Runtime Issues:**
- **API Errors**: Check environment variables are set correctly in Render dashboard
- **404 on Routes**: Verify catchall route serves index.html
- **Empty Weather Data**: Check API key quotas and backend logs
- **CORS Issues**: Should not occur with single service, but check if `FRONTEND_ORIGIN` is mistakenly set

#### **Local Development Issues:**
- **Port conflicts**: Make sure no other services are running on ports 3000 or 5000
- **SSL Certificate errors**: Set `SSL_VERIFY=false` in backend/.env for development

---
