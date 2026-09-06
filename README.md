# SIH 26002 — AI-Based Smart Logistics & Accessibility Intelligence Platform

AI-Based Smart Logistics and Accessibility Intelligence Platform for the North Eastern Region (NER), developed for Smart India Hackathon 2026 — Problem Statement SIH 26002.

The platform provides intelligent route planning, disaster-aware accessibility analysis, real-time weather and precipitation information, government disaster alerts, and predictive hazard intelligence for logistics operations in the North Eastern Region of India.

## 🚀 Live Website

https://sih26002-ne-logistics-intelligence.onrender.com

## ✨ Key Features

- AI-assisted smart route planning
- India-only route validation
- Route A (recommended) and Route B (alternative)
- Disaster-aware route analysis
- Government disaster alerts from SACHET / NDMA
- SACHET CAP feed integration through Node.js backend
- Alert location and affected-area visualization
- Weather and precipitation forecasting
- Live precipitation radar
- Predictive weather-based hazard detection
- Terrain and elevation-aware route analysis
- Live device GPS location tracking
- North Eastern Region logistics accessibility intelligence
- Interactive OpenStreetMap-based map interface

## 🏛️ Trusted Data Sources

The platform uses data/services from trusted and publicly available sources, including:

- SACHET / NDMA
- India Meteorological Department (IMD)
- Geological Survey of India (GSI)
- Open-Meteo
- OpenStreetMap
- OSRM
- RainViewer

## 🛠️ Technology Stack

### Frontend
- HTML
- CSS
- JavaScript
- Leaflet.js

### Backend
- Node.js
- Express.js
- fast-xml-parser

### APIs / Data Services
- SACHET / NDMA CAP Feed
- Open-Meteo
- OpenStreetMap / Nominatim
- OSRM
- RainViewer
- Open-Meteo Elevation API

## 📦 Requirements

- Node.js 18+
- Internet connection

## ▶️ Run Locally

Open a terminal in the project folder:

```bash
npm install
npm start
