# 🇮🇳 SIH 26002 — NER-LINK
## AI-Based Smart Logistics & Accessibility Intelligence Platform for North Eastern Region

> **Smart India Hackathon 2026 — Problem Statement SIH 26002**  
> **Theme:** Transportation & Logistics  
> **Organization:** Ministry of Development of North Eastern Region (MDoNER)  
> **Team:** Tech4Bharat

<p align="center">

**Risk-Aware • Mission-Aware • Disaster-Aware • Weather-Aware Logistics Intelligence**

</p>

---

## 🌐 Live Prototype

### 🚀 Live Website

https://sih26002-ne-logistics-intelligence.onrender.com

### 💻 GitHub Repository

https://github.com/skmursalim9779-create/SIH26002-NE-Logistics-Intelligence

---

# 📌 Overview

**NER-LINK** is a risk-aware logistics decision-support platform designed specifically for the **North Eastern Region (NER) of India**.

Traditional navigation systems mainly focus on:

- Distance
- Travel time
- Road connectivity

NER-LINK adds a logistics intelligence layer on top of road routing by considering:

- Cargo type
- Cargo quantity
- Delivery priority
- Vehicle type
- Alternative routes
- Government disaster alerts
- Weather conditions
- Terrain context
- Accessibility
- Vehicle compatibility
- Recent disaster-related news

The goal is not simply to find the shortest route.

The goal is to answer:

> **Which available route is more suitable for this particular logistics mission under the available environmental, disaster and accessibility evidence?**

---

# 🎯 Problem Statement

The North Eastern Region faces unique logistics challenges because of:

- Mountainous and difficult terrain
- Heavy and rapidly changing weather
- Floods and flash floods
- Landslides
- Earthquakes
- Road blockages
- Infrastructure limitations
- Difficult accessibility
- Limited connectivity in remote areas
- Emergency logistics requirements

These challenges can affect the transportation of:

- 💊 Medicines
- 🍚 Food supplies
- 🏗️ Construction materials
- 🌾 Agricultural products
- 🚑 Emergency supplies
- 📦 Essential goods
- 🆘 Disaster-relief materials

A route that is shortest in distance may not always be the most suitable route for a particular logistics mission.

---

# 💡 Our Solution

NER-LINK converts conventional route planning into a **context-aware logistics decision-support workflow**.

Instead of only asking:

```text
What is the shortest route?
```

NER-LINK asks:

```text
What is the most suitable route for this
cargo, priority, quantity, vehicle
and current risk situation?
```

---

# 🔄 Core Decision Pipeline

```text
User / Logistics Mission
          │
          ▼
Origin + Destination
          │
          ▼
Mission Information
(Cargo + Priority + Quantity + Vehicle)
          │
          ▼
Road Route Generation
          │
          ▼
Candidate Route Alternatives
          │
          ├───────────────┐
          ▼               ▼
Government Data       Environmental Data
SACHET / NDMA        Weather / Terrain
          │               │
          └───────┬───────┘
                  ▼
        Route Exposure Analysis
                  │
                  ▼
       AI Disaster-News Research
        (Recent External News)
                  │
                  ▼
        Logistics Risk Scoring
                  │
                  ▼
          Route Comparison
                  │
                  ▼
      Explainable Recommendation
```

---

# ⭐ Key Features

## 🚚 1. Mission-Aware Logistics Planning

Users can provide:

- Origin
- Destination
- Cargo / Goods
- Delivery Priority
- Quantity in kilograms
- Vehicle Type

Example:

```text
Cargo       : Medicine
Priority    : Normal
Quantity    : 500 kg
Vehicle     : 4×4
Origin      : Siliguri
Destination : Guwahati
```

The route assessment is therefore based on the **logistics mission**, not geography alone.

---

# 🗺️ 2. Interactive Map

The platform provides an interactive map for:

- Route visualization
- Origin/destination selection
- Route comparison
- Disaster visualization
- Weather/radar context
- Current location
- Route-specific information

### Mapping Technologies

- Leaflet
- OpenStreetMap
- Nominatim
- OSRM

---

# 🛣️ 3. Alternative Route Analysis

NER-LINK does not simply treat the first route returned by the routing engine as the final decision.

Candidate routes can be compared using:

```text
Route A
 ├── Distance
 ├── Travel Time
 ├── Disaster Exposure
 ├── Weather Risk
 ├── Terrain Risk
 ├── Vehicle Compatibility
 ├── Accessibility
 ├── AI News Context
 └── Overall Logistics Score

Route B
 ├── Distance
 ├── Travel Time
 ├── Disaster Exposure
 ├── Weather Risk
 ├── Terrain Risk
 ├── Vehicle Compatibility
 ├── Accessibility
 ├── AI News Context
 └── Overall Logistics Score
```

The route recommendation is generated **after the available evidence has been collected and evaluated**.

---

# 🇮🇳 4. India / NER Route Protection

The routing workflow is designed specifically around the Indian / NER logistics use case.

The application includes safeguards intended to avoid geographically undesirable international shortcuts.

This is important because a mathematically shorter road-network result may not always be operationally appropriate for the intended corridor.

```text
India / NER Road Network
        ↓
Candidate Routes
        ↓
Route Validation
        ↓
Logistics Risk Analysis
```

---

# 🚨 5. Official Disaster Intelligence — SACHET / NDMA

NER-LINK integrates the official **SACHET / NDMA India CAP RSS feed** through the backend.

SACHET is the National Disaster Alert Portal of the National Disaster Management Authority and provides disaster-warning infrastructure and India CAP alert information.

### Official Source

https://sachet.ndma.gov.in/

### India CAP RSS

https://sachet.ndma.gov.in/cap_public_website/rss/rss_india.xml

The application uses SACHET as the official disaster-alert source.

### Important Principle

> **AI does not replace or fabricate official government disaster alerts.**

---

# 🏛️ 6. SACHET Backend Architecture

```text
SACHET / NDMA
      │
      ▼
India CAP RSS
      │
      ▼
Node.js + Express
      │
      ▼
XML Parsing
      │
      ▼
Normalization
      │
      ▼
Caching + ETag Handling
      │
      ▼
/api/sachet
      │
      ▼
Frontend
```

The backend handles:

- RSS retrieval
- CAP XML enrichment
- XML parsing
- Data normalization
- Caching
- ETag-based change detection
- Timeout handling
- Graceful failure
- Frontend-friendly JSON responses

---

# 📡 7. Government Alert API

### SACHET Alerts

```http
GET /api/sachet
```

Returns normalized disaster-alert information.

### SACHET Status

```http
GET /api/sachet/status
```

Provides feed/cache status information.

### Backend Health

```http
GET /api/health
```

Used to verify backend availability.

---

# 📍 8. Route-Relevant Disaster Alerts

The system distinguishes between:

### Global Alerts

```text
All alerts currently available from the feed
```

and:

### Route-Relevant Alerts

```text
Alerts geographically relevant to the selected route corridor
```

For logistics planning, route relevance is more useful than simply counting every alert in India.

The route analysis considers contextual factors such as:

- Hazard type
- Alert severity
- Geographic proximity
- Route exposure

Conceptually:

```text
Before route search:

Active Alerts → --

After route generation:

Active Alerts
      ↓
Route-relevant alerts
      ↓
Route exposure analysis
```

---

# 🌦️ 9. Weather Intelligence

The prototype uses **Open-Meteo** for weather and forecast information.

Relevant environmental variables can include:

- Precipitation
- Rain
- Showers
- Snowfall
- Visibility
- Wind
- Wind gusts
- Weather codes

Instead of considering only the origin:

```text
Origin Weather
```

route-level analysis can consider sampled points:

```text
Origin
   ↓
Route Point 1
   ↓
Route Point 2
   ↓
Route Point 3
   ↓
Destination
```

This provides a more useful representation of environmental exposure along the corridor.

---

# 📡 10. Weather Radar

The frontend also integrates weather-radar visualization through **RainViewer**.

This provides additional visual environmental context for the route-analysis interface.

---

# 🌍 11. Terrain & Accessibility Intelligence

Terrain and accessibility are treated as decision-support factors.

The current prototype is **not a certified landslide-susceptibility or road-engineering system**.

The terrain/accessibility layer is therefore used as a contextual route-suitability signal.

Future versions can strengthen this layer using:

- High-resolution DEM data
- Validated elevation models
- Landslide susceptibility datasets
- Road-condition feeds
- Bridge-condition data
- Historical road closures
- Government infrastructure datasets

---

# 🚛 12. Vehicle Compatibility

Different missions require different vehicles.

The platform supports vehicle categories such as:

- 4×4
- Medium Truck
- Heavy Truck
- Emergency Vehicle

Vehicle compatibility contributes to route scoring.

Example:

```text
Difficult / mountainous corridor
          +
Heavy Vehicle
          ↓
Higher vehicle/accessibility penalty
```

Therefore:

> **The platform evaluates the mission, not only the road.**

---

# 📍 13. Current Location / Browser GPS

The web application can use the browser's Geolocation API to obtain the user's current position.

This can be used for:

- Current-position based routing
- Starting-point selection
- Operational context

Current prototype:

```text
Browser Geolocation
        ↓
Current Coordinates
        ↓
Route Planning
```

This should not be interpreted as production fleet tracking.

A production system could later integrate:

```text
Fleet GPS / Telematics
        ↓
Live Vehicle Position
        ↓
Route Deviation Detection
        ↓
Hazard Proximity
        ↓
Dynamic Rerouting
```

---

# 🧠 14. AI Disaster-News Intelligence

NER-LINK contains a **separate AI-assisted disaster-news research layer**.

Its purpose is to provide additional situational context from recent public news reporting around the selected route.

### Important

> **AI news intelligence is NOT the official disaster-alert system.**

The system keeps these sources separate:

```text
SACHET / NDMA
      ↓
Official Government Alerts
      ↓
Primary Operational Signal
```

and:

```text
Recent News Retrieval
      ↓
Atria AI Analysis
      ↓
AI Disaster-News Intelligence
      ↓
Secondary Contextual Signal
```

---

# 🔎 15. How AI Disaster-News Research Works

The current architecture is:

```text
Candidate Route
      ↓
Route Corridor Locations
      ↓
Recent News Retrieval
      ↓
Article Filtering
      ↓
Atria-Dawn-Preview
      ↓
Structured Disaster-News Analysis
      ↓
Relevant Articles
      ↓
AI News Risk Signal
      ↓
Existing Logistics Risk Engine
```

The AI layer analyzes supplied recent news articles.

It does **not** independently replace the routing engine or government-alert system.

---

# 📰 16. Disaster-News Scope

The AI research layer focuses on recent disaster-related reporting such as:

- Floods
- Flash floods
- Landslides
- Earthquakes
- Cyclones
- Extreme rainfall
- Road blockages
- Bridge damage
- Disaster-related transport disruption
- Major local disaster incidents

The research is geographically focused on:

- Origin
- Destination
- Route corridor
- Nearby regions that can realistically affect transportation

Unrelated events are filtered out.

---

# ⏱️ 17. Recent News Window

Only **recent disaster-news articles from the last 10 days** are passed to the AI analysis stage.

The workflow intentionally avoids sending old historical/background articles to Atria.

```text
News Retrieval
      ↓
Published Date Filter
      ↓
Last 10 Days
      ↓
Relevant Articles
      ↓
Atria Analysis
```

This keeps the AI research layer focused on current situational context.

---

# 🤖 18. Atria AI Integration

The project uses:

```text
Model:
Atria-Dawn-Preview
```

through the Atria Chat Completions API.

The backend communicates with:

```text
https://api.atria-asi.ai/v1/chat/completions
```

The API key is stored server-side through:

```text
ATRIA_API_KEY
```

### Important Architecture Decision

Atria is used for:

```text
Recent Disaster-News Analysis
```

Atria is NOT used for:

```text
❌ Official SACHET alerts
❌ Government warning generation
❌ OSRM routing
❌ Weather calculation
❌ Route geometry generation
❌ Official disaster prediction
❌ Final route scoring by itself
```

This separation improves explainability and source reliability.

---

# 🧩 19. AI News Output

The AI research layer can return structured information such as:

```json
{
  "title": "Example disaster-related article",
  "summary": "Short article summary",
  "disasterType": "Flood",
  "location": "Example location",
  "publishedAt": "Published date",
  "source": "News source",
  "url": "Source URL",
  "relevance": 85
}
```

The final UI presents the information separately as:

```text
🧠 AI Disaster News Intelligence

External News Intelligence
Not Official Government Alerts
```

---

# 🧮 20. Explainable Logistics Risk Scoring

The current prototype uses a normalized multi-factor scoring engine.

Current weighting:

```text
10%  Distance Risk
10%  Travel-Time Risk
30%  Disaster Risk
15%  Weather Risk
15%  Terrain Risk
10%  Vehicle Risk
05%  Accessibility Risk
05%  AI Disaster-News Risk
--------------------------------
100% Total
```

### Score Interpretation

```text
0   → Lower overall route penalty
100 → Higher overall route penalty
```

The score is:

> **A normalized decision-support score, not a probability and not a guarantee of safety.**

The current weights are prototype design choices and can be calibrated in future versions using historical logistics and disruption data.

---

# 🚨 21. Disaster Risk Calculation

Disaster risk is not simply the number of alerts.

The system can consider:

```text
Alert Severity
      +
Hazard Type
      +
Distance / Proximity
      +
Route Exposure
      ↓
Disaster Exposure
```

Conceptually:

```text
More severe alert
       +
Closer to route
       +
Relevant hazard
       ↓
Higher route disaster exposure
```

---

# 🌧️ 22. Weather Risk Calculation

Weather risk is derived from environmental conditions associated with the route.

Potential factors include:

- Heavy rain
- Thunderstorms
- Strong wind
- Poor visibility
- Snowfall where relevant
- Precipitation exposure
- Waterlogging-related conditions

This is:

> **Risk inference, not a certified weather-hazard prediction model.**

---

# 🚚 23. Mission-Specific Route Recommendation

The recommendation is produced only after the route alternatives have been generated and the available evidence has been evaluated.

Example:

```text
Recommended Route A

✓ Lower disaster exposure
✓ Lower weather risk
✓ Better vehicle compatibility
✓ Acceptable accessibility
✗ Slightly longer distance

          ↓

Lower Overall Logistics Penalty
```

Therefore:

```text
Shortest Route
      ≠
Always Most Suitable Route
```

---

# 🧠 24. AI Does Not Make the Final Route Decision

This is an important architecture principle.

The AI news layer provides:

```text
Secondary contextual evidence
```

The existing logistics decision engine remains responsible for:

```text
Final route scoring
Route comparison
Recommendation
```

Therefore:

```text
OSRM
  ↓
Candidate Routes
  ↓
Government Evidence
  +
Weather
  +
Terrain
  +
Vehicle
  +
Accessibility
  +
AI News Context
  ↓
Existing Risk Engine
  ↓
Route A / Route B Comparison
  ↓
Final Recommendation
```

---

# 🏗️ 25. System Architecture

```text
                         ┌──────────────────────────┐
                         │      User / Operator     │
                         │ Cargo • Priority • etc.  │
                         └────────────┬─────────────┘
                                      │
                                      ▼
                         ┌──────────────────────────┐
                         │      Web Frontend        │
                         │ HTML • CSS • JavaScript  │
                         │ Leaflet                  │
                         └────────────┬─────────────┘
                                      │
             ┌────────────────────────┼────────────────────────┐
             │                        │                        │
             ▼                        ▼                        ▼
      ┌─────────────┐          ┌─────────────┐          ┌─────────────┐
      │ Nominatim   │          │    OSRM     │          │ Open-Meteo  │
      │ Geocoding   │          │  Routing    │          │  Weather    │
      └─────────────┘          └──────┬──────┘          └─────────────┘
                                      │
                                      ▼
                           ┌──────────────────────┐
                           │ Candidate Routes     │
                           └──────────┬───────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
                    ▼                 ▼                 ▼
             ┌────────────┐   ┌────────────┐   ┌──────────────┐
             │ SACHET /   │   │ Weather /  │   │ Terrain /    │
             │ NDMA       │   │ Radar      │   │ Accessibility│
             └─────┬──────┘   └────────────┘   └──────────────┘
                   │
                   ▼
          ┌─────────────────────┐
          │ Government Evidence │
          └──────────┬──────────┘
                     │
                     ▼
          ┌─────────────────────┐
          │ Recent News         │
          │ Retrieval           │
          └──────────┬──────────┘
                     │
                     ▼
          ┌─────────────────────┐
          │ Atria AI            │
          │ Disaster-News       │
          │ Analysis            │
          └──────────┬──────────┘
                     │
                     ▼
          ┌─────────────────────┐
          │ Logistics Risk      │
          │ Decision Engine     │
          └──────────┬──────────┘
                     │
                     ▼
          ┌─────────────────────┐
          │ Route Comparison    │
          │ + Explanation       │
          └──────────┬──────────┘
                     │
                     ▼
          ┌─────────────────────┐
          │ Route Recommendation│
          └─────────────────────┘
```

---

# 🛠️ 26. Technology Stack

## Frontend

- HTML5
- CSS3
- Vanilla JavaScript
- Leaflet

## Backend

- Node.js
- Express.js
- fast-xml-parser
- dotenv

## Mapping & Geospatial

- OpenStreetMap
- Leaflet
- Nominatim
- OSRM

## Weather & Environmental Data

- Open-Meteo
- RainViewer

## Government Disaster Intelligence

- NDMA / SACHET
- India CAP RSS
- CAP XML

## AI / News Intelligence

- Atria API
- Atria-Dawn-Preview
- Recent disaster-news retrieval
- Structured AI analysis

## Deployment

- Render

---

# 🔌 27. Backend API

The backend exposes several application endpoints.

### Health

```http
GET /api/health
```

### SACHET Alerts

```http
GET /api/sachet
```

### SACHET Status

```http
GET /api/sachet/status
```

### AI Disaster News

```http
POST /api/ai/disaster-news
```

Example request:

```json
{
  "origin": "Siliguri",
  "destination": "Guwahati",
  "locations": [
    "Siliguri",
    "Alipurduar",
    "Bongaigaon",
    "Guwahati"
  ]
}
```

The endpoint retrieves recent disaster-related news for the supplied route corridor and uses Atria to analyze the articles.

---

# 📂 28. Project Structure

```text
SIH26002-NE-Logistics-Intelligence/
│
├── index.html
├── server.js
├── package.json
├── package-lock.json
├── README.md
├── .gitignore
│
├── .env                 # Local only — never commit
│
└── assets/              # If applicable
```

> The exact repository structure may evolve as the prototype develops.

---

# ⚙️ 29. Local Setup

## Requirements

Install:

- Node.js 18+
- npm
- Modern web browser

Check Node.js:

```bash
node --version
```

Check npm:

```bash
npm --version
```

---

# 📦 30. Install Dependencies

Clone the repository:

```bash
git clone https://github.com/skmursalim9779-create/SIH26002-NE-Logistics-Intelligence.git
```

Move into the project:

```bash
cd SIH26002-NE-Logistics-Intelligence
```

Install dependencies:

```bash
npm install
```

---

# 🔐 31. Environment Variables

Create a local `.env` file in the project root:

```env
ATRIA_API_KEY=your_atria_api_key
```

### Important

Never commit `.env` to GitHub.

The repository uses `.gitignore` to prevent local secrets from being tracked.

```gitignore
.env
.env.*
!.env.example
node_modules/
```

The API key must remain server-side.

Do NOT place the API key in:

```text
❌ index.html
❌ frontend JavaScript
❌ README.md
❌ screenshots
❌ GitHub repository
❌ public client-side code
```

---

# ▶️ 32. Run Locally

Start the application:

```bash
npm start
```

The application normally runs at:

```text
http://localhost:3000
```

---

# ☁️ 33. Render Deployment

The application is designed to run as a Node.js web service.

Typical configuration:

```text
Build Command:
npm install

Start Command:
npm start
```

The backend uses:

```js
process.env.PORT
```

so the deployment platform can provide the runtime port.

### Render Environment Variable

In Render, configure:

```text
ATRIA_API_KEY = your_actual_api_key
```

The secret should remain in Render's environment configuration and should not be committed to GitHub.

---

# 🔒 34. Security

NER-LINK follows several basic security principles.

### API Secrets

Secrets remain server-side.

### External Data

Government feeds and external APIs are treated as external data and should be validated before use.

### Error Handling

The backend uses:

- Request timeouts
- Error handling
- Caching
- Status endpoints
- Graceful failure behaviour

### Data Availability

The system distinguishes:

```text
Data unavailable
      ≠
No risk
```

An unavailable external service must not silently become a "safe" result.

---

# 🛡️ 35. GitHub Security

Never commit:

```text
.env
API keys
Passwords
Tokens
Private credentials
```

Use:

```text
.env
```

locally and configure production secrets through the deployment platform.

---

# ⚠️ 36. Prototype Limitations

NER-LINK is a **hackathon / academic prototype**, not a certified emergency-response system.

### 1. Routing Dependency

Route quality depends on the underlying OpenStreetMap road network and OSRM service.

### 2. Alternative Route Availability

Alternative routes cannot always be guaranteed by the routing service.

### 3. Weather Uncertainty

Forecasts can change and should not be treated as guarantees.

### 4. Disaster-Data Coverage

Government alerts may not contain complete road-level information for every disruption.

### 5. Terrain Model

The current terrain/accessibility layer is a prototype decision-support mechanism, not a certified landslide-susceptibility model.

### 6. GPS

Browser geolocation is not equivalent to production fleet telematics.

### 7. Dynamic Road Conditions

A road can become inaccessible after route generation.

### 8. AI News

AI news research is contextual information and must not be treated as an official emergency warning.

### 9. Risk Score

The 0–100 score is a normalized decision-support score, not the probability of an accident or disaster.

---

# 🚀 37. Future Roadmap

## Phase 1 — Stronger Geospatial Intelligence

- High-resolution elevation data
- Validated terrain models
- Landslide susceptibility layers
- Road-condition data
- Bridge-condition data

## Phase 2 — Dynamic Accessibility

- Government road-closure feeds
- PWD/BRO updates
- Live disruption reports
- Incident verification
- Dynamic route blocking

## Phase 3 — Fleet Intelligence

```text
Vehicle GPS
     ↓
Live Position
     ↓
Route Deviation
     ↓
Hazard Proximity
     ↓
Dynamic Rerouting
```

## Phase 4 — Field Intelligence

Future mobile/offline reporting can support:

- Geo-tagged incidents
- Road blockage
- Flood depth
- Landslide reports
- Bridge damage
- Local accessibility status
- Photos
- Offline synchronization

## Phase 5 — Predictive Machine Learning

Historical logistics and disruption data can eventually support models for:

- Road disruption probability
- Delivery delay prediction
- Route failure probability
- Seasonal hazard exposure
- Vehicle-specific travel-time prediction

The current explainable scoring engine can serve as a baseline for future predictive models.

---

# 🛰️ 38. Production-Scale Vision

The long-term architecture can evolve into:

```text
Government Feeds
       +
Weather
       +
Road Network
       +
GIS / Satellite Data
       +
Fleet GPS
       +
Field Reports
       +
Historical Logistics Data
       +
AI-Assisted Research
       │
       ▼
Central Intelligence Layer
       │
       ▼
Prediction + Risk Engine
       │
       ▼
Dynamic Route Optimization
       │
       ├───────────────┐
       ▼               ▼
Operator Dashboard   Fleet Dashboard
       │
       ▼
Government / Emergency Intelligence
```

---

# 🧪 39. Example Logistics Scenario

### Mission

```text
Cargo       : Medicine
Quantity    : 500 kg
Priority    : Normal
Vehicle     : 4×4

Origin      : Siliguri
Destination : Guwahati
```

### Processing

```text
1. Resolve locations
        ↓
2. Generate candidate routes
        ↓
3. Analyze route geometry
        ↓
4. Evaluate government disaster alerts
        ↓
5. Evaluate weather
        ↓
6. Evaluate terrain/accessibility
        ↓
7. Evaluate vehicle compatibility
        ↓
8. Research recent disaster news
        ↓
9. Calculate logistics scores
        ↓
10. Compare Route A / Route B
        ↓
11. Explain the recommendation
```

The objective is:

```text
Not simply:
Shortest Distance

But:

Most suitable logistics option
under the available evidence
```

---

# 🔍 40. What Makes NER-LINK Different?

| Traditional Navigation | NER-LINK |
|---|---|
| Distance focused | Mission focused |
| Travel time focused | Risk + logistics focused |
| Generic routing | NER-focused routing |
| Limited disaster context | Government disaster intelligence |
| Basic weather | Route-level environmental context |
| Generic vehicle assumption | Vehicle compatibility |
| Route only | Route + logistics mission |
| No dedicated news context | Separate AI disaster-news research |
| Limited explanation | Explainable multi-factor score |

---

# 🧠 41. AI vs Government Data

A central design principle of NER-LINK is **source separation**.

### Official Operational Signal

```text
NDMA / SACHET
      ↓
Official Disaster Alerts
```

### Environmental Context

```text
Weather / Terrain / Accessibility
      ↓
Route Risk Context
```

### Secondary Intelligence

```text
Recent Public News
      ↓
Atria AI Analysis
      ↓
Disaster-News Context
```

### Final Decision

```text
All Available Evidence
      ↓
Existing Logistics Risk Engine
      ↓
Route Comparison
      ↓
Explainable Recommendation
```

This prevents an AI-generated news summary from being presented as an official government warning.

---

# 📚 42. Technology Rationale

## Why Node.js + Express?

The backend provides:

- API endpoints
- SACHET proxying
- CAP parsing
- Caching
- Normalization
- External API integration
- Static frontend serving
- Deployment-friendly architecture

## Why OSRM?

OSRM provides road-network routing and supports alternative route requests.

NER-LINK adds its own logistics intelligence on top of the generated routes.

In simple terms:

```text
OSRM
=
Which roads can I take?

NER-LINK Decision Engine
=
Which available route is more suitable
for this logistics mission?
```

## Why Nominatim?

Nominatim is used for geocoding and place search.

Example:

```text
"Siliguri"
     ↓
Latitude / Longitude
     ↓
Routing
```

Production deployments must respect the public Nominatim usage policy and request limits.

## Why Open-Meteo?

Open-Meteo provides forecast variables suitable for environmental route context, including:

- Precipitation
- Rain
- Showers
- Snow
- Wind
- Visibility
- Weather codes

---

# 🔄 43. Data Flow

A typical route-analysis request follows:

```text
User Input
    ↓
Origin + Destination
    ↓
Geocoding
    ↓
Candidate Route Generation
    ↓
Route Sampling
    ↓
Weather Analysis
    ↓
Government Disaster Analysis
    ↓
Terrain / Accessibility Analysis
    ↓
Vehicle Compatibility
    ↓
Recent Disaster-News Research
    ↓
Atria AI Analysis
    ↓
Risk Scoring
    ↓
Route Comparison
    ↓
Explainable Recommendation
```

---

# 🧩 44. Failure Handling

External services can fail.

Possible failures include:

```text
SACHET unavailable
Weather API unavailable
Geocoding failure
No route found
Malformed feed
Network timeout
AI news research unavailable
```

The system should not silently interpret a failed data source as zero risk.

```text
Unavailable Data
      ≠
Zero Risk
```

This is especially important for safety-sensitive logistics.

---

# 🎯 45. Design Principles

### 1. Explainability

Every recommendation should have understandable reasons.

### 2. Source Separation

Official government alerts remain separate from AI-generated news research.

### 3. Safety Over False Certainty

Missing information should not automatically be treated as safe conditions.

### 4. Mission Awareness

Cargo, quantity, priority and vehicle matter.

### 5. Regional Focus

The platform is designed around North Eastern India logistics challenges.

### 6. Modular Architecture

External data providers can be replaced or expanded.

### 7. Open & Practical Technology

The prototype uses widely available technologies and public/open services where practical.

---

# 🏆 46. Smart India Hackathon Context

```text
Problem Statement : SIH 26002
Theme             : Transportation & Logistics
Region            : North Eastern Region of India
Project           : NER-LINK
Team              : Tech4Bharat
```

---

# 🔮 47. Future Vision

The long-term objective is to evolve NER-LINK from a prototype into a comprehensive **regional logistics intelligence platform** capable of combining:

```text
Government Alerts
        +
Weather
        +
Road Conditions
        +
Terrain
        +
Satellite / GIS
        +
Fleet GPS
        +
Field Reports
        +
Historical Logistics Data
        +
AI-Assisted Research
        ↓
Unified Logistics Intelligence
        ↓
Dynamic Risk-Aware Routing
```

The final vision is not merely:

> **"Find a road."**

It is:

> **"Understand the logistics situation before choosing the road."**

---

# 🔗 48. Project Links

### 🚀 Live Prototype

https://sih26002-ne-logistics-intelligence.onrender.com

### 💻 GitHub Repository

https://github.com/skmursalim9779-create/SIH26002-NE-Logistics-Intelligence

### 🏛️ Smart India Hackathon

https://sih.gov.in/sih2026PS

### 🚨 SACHET / NDMA

https://sachet.ndma.gov.in/

### 🌦️ India Meteorological Department

https://mausam.imd.gov.in/

---

# 📖 49. Official & Technical References

### Smart India Hackathon

https://sih.gov.in/sih2026PS

### SACHET — NDMA

https://sachet.ndma.gov.in/

### SACHET India CAP RSS

https://sachet.ndma.gov.in/cap_public_website/rss/rss_india.xml

### India Meteorological Department

https://mausam.imd.gov.in/

### Atria API Documentation

https://api.atria-asi.ai/docs

### Open-Meteo Documentation

https://open-meteo.com/en/docs

### OSRM Documentation

https://project-osrm.org/docs/

### Nominatim Documentation

https://nominatim.org/release-docs/latest/api/Search/

### Nominatim Usage Policy

https://operations.osmfoundation.org/policies/nominatim/

### OpenStreetMap

https://www.openstreetmap.org/

### Leaflet

https://leafletjs.com/

### Geological Survey of India

https://bhusanket.gsi.gov.in/

### Central Water Commission

https://ffs.india-water.gov.in/

### Assam State Disaster Management Authority

https://asdma.assam.gov.in/

### Assam PWD

https://pwdroads.assam.gov.in/

### Border Roads Organisation

https://bro.gov.in/

### Open Government Data Platform

https://data.gov.in/

---

# 👥 50. Team

## 🇮🇳 Tech4Bharat

**Smart India Hackathon 2026 — SIH 26002**

---

# 🙏 51. Acknowledgements

This project builds on publicly available technologies, open geospatial data and government information sources.

Special acknowledgement to:

- Ministry of Development of North Eastern Region
- Smart India Hackathon
- National Disaster Management Authority / SACHET
- India Meteorological Department
- Relevant state disaster-management authorities
- OpenStreetMap contributors
- Leaflet
- OSRM
- Nominatim
- Open-Meteo
- RainViewer
- Other public government data providers

---

# ⚠️ 52. Disclaimer

NER-LINK is an **academic / hackathon prototype** demonstrating a risk-aware logistics decision-support concept for the North Eastern Region of India.

The platform does **not** guarantee:

- Road safety
- Route availability
- Disaster prediction
- Weather certainty
- Delivery success
- Real-time road accessibility

Government alerts, weather forecasts, road-network data and news reports may change, become delayed or become unavailable.

Operational, emergency and safety decisions should continue to rely on current information from competent authorities and on-ground verification.

---

# 💬 NER-LINK

> ## 🚚 Don't just find a route.
> ## 🧠 Understand whether it is suitable.
>
> **NER-LINK — Risk-Aware Logistics Intelligence for North Eastern India 🇮🇳**

```
