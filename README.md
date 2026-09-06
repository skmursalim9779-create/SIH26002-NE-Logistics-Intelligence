# SIH 26002 — AI-Based Smart Logistics & Accessibility Intelligence Platform

> **Smart India Hackathon 2026 — Problem Statement SIH 26002**

An AI-assisted Smart Logistics and Accessibility Intelligence Platform designed for the **North Eastern Region (NER) of India**.

The platform combines route intelligence, government disaster alerts, weather and precipitation information, terrain/elevation data, live location awareness, and predictive hazard analysis to support safer and more informed logistics planning in challenging geographic and weather conditions.

---

## 🚀 Live Website

**Production Website:**

https://sih26002-ne-logistics-intelligence.onrender.com

The application is deployed as a Node.js/Express web service on Render.

---

## 🎯 Problem Statement

### SIH 26002 — AI-Based Smart Logistics and Accessibility Intelligence Platform for North Eastern Region (NER)

The North Eastern Region of India presents unique logistics challenges due to difficult terrain, extreme weather conditions, landslides, floods, road disruptions, connectivity limitations, and other disaster-related risks.

This platform aims to provide logistics users with an intelligent decision-support interface that combines route information with environmental and disaster-related intelligence.

The system helps users understand:

- Which route is more suitable
- Whether a route may be affected by hazards
- Current and forecast weather conditions
- Government disaster alerts
- Precipitation and rainfall conditions
- Terrain and elevation characteristics
- Potential weather-related hazards
- Current device location for location-aware operations

---

## ✨ Key Features

### 🗺️ Smart Route Planning

- Interactive map-based route planning
- From → To destination selection
- Famous Indian locations available through location search
- India-only route validation
- Route A — recommended route
- Route B — alternative route
- Clickable route options
- Route distance and travel information
- Route visualization on an interactive map

### 🚨 Disaster-Aware Route Intelligence

- Government disaster alerts displayed on the map
- SACHET / NDMA alert integration
- Alert location visualization
- Affected-area visualization where available
- Route and hazard relationship analysis
- Disaster-aware accessibility assessment

### 🌦️ Weather Intelligence

- Current weather conditions
- Temperature information
- Relative humidity
- Wind speed
- Current precipitation
- Rain and shower information
- Weather-condition classification
- Hourly weather forecasting
- Precipitation probability
- Visibility information
- Full-day weather forecast

### 🌧️ Rain & Precipitation Intelligence

- Live precipitation radar
- Radar animation
- Current precipitation information
- Rain probability forecasting
- Estimated rainfall duration
- Forecast-based precipitation visualization
- Current-location rain information

### ⚠️ Predictive Hazard Intelligence

The platform analyses available weather and route-related information to identify potential weather-driven hazards such as:

- Heavy rainfall
- Flood-related conditions
- Thunderstorms
- Severe wind/storm conditions
- Fog / low visibility
- Snow-related conditions

Predictive hazard information is presented as decision-support information and is not intended to replace official government warnings.

### 📍 Live Device Location

- Browser-based GPS location support
- Live device location marker
- Location accuracy visualization
- Movement/heading awareness when available
- Current location can be used for location-aware route operations
- HTTPS-compatible deployment for browser geolocation

---

## 🏛️ Government & Trusted Data Sources

The platform integrates or references trusted public data sources and services, including:

- **SACHET / NDMA** — Government disaster alerts and CAP information
- **India Meteorological Department (IMD)** — Weather and warning information
- **Geological Survey of India (GSI)** — Geological and terrain-related information
- **Open-Meteo** — Weather and elevation data
- **OpenStreetMap** — Map and geographic data
- **OSRM** — Route calculation
- **RainViewer** — Precipitation radar visualization

The platform is designed to prioritize trusted and publicly available information rather than relying only on arbitrary or manually entered hazard values.

---

## 🔌 SACHET / NDMA Integration

SACHET / NDMA disaster information is accessed through the Node.js/Express backend.

### Architecture

```text
SACHET / NDMA
      │
      │ CAP / Disaster Alert Data
      ▼
Node.js / Express Backend
      │
      │ Server-side integration
      ▼
SIH 26002 Web Application
      │
      ▼
Map + Route + Disaster Intelligence
```

The backend provides a server-side integration layer so that SACHET requests do not have to be made directly from the browser.

The system also supports CAP-based alert processing and alert metadata/geometry enrichment where available.

---

## 🧠 System Architecture

```text
                    USER
                      │
                      ▼
          ┌────────────────────────┐
          │   Web Application      │
          │ HTML / CSS / JavaScript│
          └────────────┬───────────┘
                       │
       ┌───────────────┼────────────────┐
       │               │                │
       ▼               ▼                ▼
 Route Intelligence  Weather       Live GPS
       │               │                │
       └───────────────┼────────────────┘
                       │
                       ▼
             Disaster Intelligence
                       │
                       ▼
          ┌────────────────────────┐
          │ Node.js / Express      │
          │ Backend                │
          └────────────┬───────────┘
                       │
       ┌───────────────┼─────────────────────┐
       │               │                     │
       ▼               ▼                     ▼
   SACHET / NDMA   Open-Meteo          Supporting APIs
       │               │                     │
       └───────────────┼─────────────────────┘
                       │
                       ▼
          Logistics Decision Support
                       │
                       ▼
        Recommended / Alternative Routes
```

---

## 🛠️ Technology Stack

### Frontend

- HTML5
- CSS3
- JavaScript
- Leaflet.js
- OpenStreetMap

### Backend

- Node.js
- Express.js
- fast-xml-parser

### Routing & Mapping

- Leaflet.js
- OpenStreetMap
- OSRM
- Nominatim

### Weather & Environmental Intelligence

- Open-Meteo Forecast API
- Open-Meteo Elevation API
- RainViewer Weather Maps API

### Disaster Intelligence

- SACHET / NDMA CAP Feed
- Government disaster alert information
- CAP metadata and geographic alert information

---

## 📡 APIs & Data Services

| Service | Purpose |
|---|---|
| SACHET / NDMA | Government disaster alerts |
| Open-Meteo | Weather forecasting |
| Open-Meteo Elevation | Elevation information |
| OpenStreetMap | Map data |
| Nominatim | Location search/geocoding |
| OSRM | Route calculation |
| RainViewer | Precipitation radar |

---

## 📦 Requirements

To run the project locally:

- **Node.js 18+**
- Internet connection
- Modern web browser

Node.js 20+ is recommended.

---

## ▶️ Run Locally

Open a terminal in the project folder.

Install dependencies:

```bash
npm install
```

Start the server:

```bash
npm start
```

Then open:

```text
http://localhost:3000
```

> **Important:** Do not double-click `index.html`.  
> The application must be served through the Node.js/Express server.

---

## 🔌 Backend API

### Health Check

```text
http://localhost:3000/api/health
```

### SACHET Disaster Alerts

```text
http://localhost:3000/api/sachet
```

### SACHET Status

```text
http://localhost:3000/api/sachet/status
```

### SACHET Alert Debug Endpoint

```text
http://localhost:3000/api/sachet/debug/:identifier
```

The Express backend provides the server-side integration layer for SACHET / NDMA data and handles the required alert processing before the information is consumed by the frontend.

---

## 🌐 Deployment

The production version is deployed on **Render** as a Node.js Web Service.

### Production URL

https://sih26002-ne-logistics-intelligence.onrender.com

### Deployment Flow

```text
GitHub Repository
       │
       ▼
Render Web Service
       │
       ▼
Node.js / Express Server
       │
       ▼
Public SIH 26002 Website
```

The GitHub repository is connected to the Render service so that repository updates can be deployed to the production application.

---

## 📁 Project Structure

```text
SIH26002-NE-Logistics-Intelligence/
│
├── index.html
├── server.js
├── package.json
├── package-lock.json
├── README.md
└── node_modules/        # Local dependency folder, not committed
```

### Main Files

**`index.html`**

Contains the complete frontend interface, map, route planning, weather intelligence, disaster visualization, live location functionality, and client-side logic.

**`server.js`**

Provides the Express backend, SACHET integration, CAP processing, API endpoints, caching and server-side data handling.

**`package.json`**

Defines the Node.js project configuration, start command, and required dependencies.

**`package-lock.json`**

Locks the installed dependency versions for reproducible installations.

---

## 🔐 Safety & Reliability Approach

The platform is designed as a **decision-support system**.

Important principles include:

- Government disaster alerts are treated as higher-priority information.
- Predictive hazards are clearly distinguished from official warnings.
- Weather forecasts are treated as forecasts, not guarantees.
- Route validation helps prevent routing outside the intended Indian geography.
- Hazard information is evaluated in relation to route/location information rather than relying only on arbitrary static scores.
- Live GPS information is obtained from the user's device when permission is granted.
- External services are used through their intended public interfaces.

Users should always follow official government instructions during an active emergency.

---

## 📍 Current Project Capabilities

The current deployed version includes:

- Smart route planning
- Two-route comparison
- India-only route validation
- SACHET / NDMA disaster alert integration
- Government alert visualization
- Weather intelligence
- Rain probability forecasting
- Live precipitation radar
- Predictive weather-based hazard analysis
- Elevation-aware route intelligence
- Live device GPS tracking
- Interactive mapping
- Public production deployment

---

## 👥 Team

### SIH 26002 — Six Member Team

This project is developed by a **six-member team** for Smart India Hackathon 2026.

The GitHub repository is maintained by the project owner with the other five team members added as repository collaborators.

Team member names, GitHub profiles, and individual responsibilities can be added to this section when the final team-role information is prepared.

---

## 🚀 Future Scope

Potential future extensions include:

- Government logistics vehicle tracking
- Secure vehicle telemetry
- Persistent vehicle tracking database
- Advanced AI-based route risk scoring
- More detailed geological susceptibility integration
- Additional government disaster-data integrations
- Offline/low-connectivity operational support
- Satellite-enabled communication for remote logistics operations where terrestrial connectivity is unavailable
- Government/operator dashboard for disaster-relief logistics

These are future extensions and are not represented as current deployed capabilities unless implemented.

---

## 📌 Project Status

**Status: Deployed and Operational**

The SIH 26002 platform is currently available through its public production website.

### Live Application

https://sih26002-ne-logistics-intelligence.onrender.com

---

## 🏆 Smart India Hackathon 2026

**Problem Statement:** SIH 26002

**Theme:** Transportation & Logistics

**Focus:** AI-Based Smart Logistics and Accessibility Intelligence for the North Eastern Region of India

The project focuses on improving logistics decision-making by bringing route intelligence, weather intelligence, disaster alerts, terrain information, and location awareness into a unified platform.

---

## 📄 License

This project was developed as part of **Smart India Hackathon 2026**.
