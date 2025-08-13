# Travel Weather

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
npm run dev # or npm start
```

#### Example `.env` file:

```env
OPENROUTESERVICE_API_KEY=your_openrouteservice_api_key
OPENWEATHERMAP_API_KEY=your_openweathermap_api_key
SSL_VERIFY=false # (optional, for local dev)
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm start
```

The app will be available at [http://localhost:3000](http://localhost:3000) and will connect to the backend at [http://localhost:5000](http://localhost:5000) by default.

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

## 🚀 Deployment (Render - Option 1: Separate Backend & Static Frontend)

### 1. Prepare Environment Variables
Create the following environment variables in the Render dashboard (do NOT commit keys):
- OPENROUTESERVICE_API_KEY
- OPENWEATHERMAP_API_KEY
- (Optional) SSL_VERIFY=false (only if you experience local SSL issues; omit in production)
- (After frontend deploy) REACT_APP_API_BASE_URL (set in static site) = https://YOUR-BACKEND-SERVICE.onrender.com
- (Optional) FRONTEND_ORIGIN (set in backend) = https://YOUR-FRONTEND-SERVICE.onrender.com to lock CORS

### 2. Backend Service (Web Service)
- Type: Web Service (Node)
- Root Directory: backend
- Build Command: npm install
- Start Command: node index.js
- Node Version: 18+ (set NODE_VERSION=18 if needed)

### 3. Frontend Service (Static Site)
- Type: Static Site
- Root Directory: frontend
- Build Command: npm install && npm run build
- Publish Directory: build
- Initially leave REACT_APP_API_BASE_URL empty; after backend deploys copy its URL and add it, then redeploy frontend.

### 4. CORS Configuration
The backend auto-allows all origins unless FRONTEND_ORIGIN is set. Once frontend URL is live, set FRONTEND_ORIGIN to restrict access.

### 5. Optional: render.yaml
A `render.yaml` file is included for Infrastructure as Code. To use it:
- Push repo to GitHub
- In Render: New + Blueprint -> point to repo
- Fill in unsynced environment variables (API keys, REACT_APP_API_BASE_URL after first backend deploy)

### 6. Testing After Deploy
1. Hit: https://YOUR-BACKEND-SERVICE.onrender.com/test
   - Should return { status: 'APIs working', ... }
2. From browser console on frontend site, verify calls to /route-weather succeed.
3. Set REACT_APP_API_BASE_URL correctly if 404 or CORS errors appear.

### 7. Common Issues
- 401 errors: Check API key values and rate limits.
- CORS error: Ensure FRONTEND_ORIGIN matches deployed frontend URL (including https://).
- Mixed content: Always use https URLs in REACT_APP_API_BASE_URL.
- Empty weather data: Possible API quota or network restriction; check backend logs.

### 8. Redeploy Flow
- Backend code changes: Trigger backend redeploy only.
- Frontend env var changes: Update env var -> Save -> Trigger redeploy static site.

---
