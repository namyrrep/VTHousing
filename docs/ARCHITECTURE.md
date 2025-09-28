# Project Architecture

## Directory Structure

```
VTHousing/
├── frontend/                    # React Frontend Application
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/             # Page components (Home, Prompt, Checklist)
│   │   ├── styles/            # CSS files
│   │   └── assets/            # Static assets
│   ├── public/                # Public files
│   ├── package.json           # Frontend dependencies
│   └── vite.config.js         # Vite configuration
│
├── backend/                    # Flask Backend API
│   ├── app.py                 # Main Flask application
│   ├── searchFunction.py      # Housing search functionality
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Backend environment variables
│
├── scripts/                    # Utility scripts
│   ├── run_backend.sh         # Start backend server
│   └── run_frontend.sh        # Start frontend server
│
├── docs/                      # Documentation
│   ├── SETUP.md              # Setup instructions
│   └── ARCHITECTURE.md       # This file
│
├── .env                       # Main environment file
├── .env.example              # Environment template
├── .gitignore                # Git ignore rules
└── README.md                 # Project overview
```

## Component Overview

### Frontend (React + Vite)
- **Home.jsx**: Main page with search functionality
- **Prompt.jsx**: About/information page
- **Checklist.jsx**: Results and checklist page
- **App.jsx**: Main application with routing

### Backend (Flask)
- **app.py**: REST API server with CORS enabled
- **searchFunction.py**: OpenAI + SerpAPI integration for rental search

### API Endpoints
- `POST /api/search`: Search for rental listings
- `GET /api/health`: Health check endpoint

## Data Flow
1. User enters search criteria in React frontend
2. Frontend sends POST request to Flask backend
3. Backend processes request using OpenAI and SerpAPI
4. Results returned as JSON to frontend
5. Frontend displays rental listings