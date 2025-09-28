# VT Housing - Setup Guide

## Prerequisites
- Node.js and npm
- Python 3.x
- pip (Python package installer)

## Environment Setup

1. Create a `.env` file in the root directory with your API keys:
```
OPENAI_API_KEY=your_openai_api_key_here
SERPAPI_KEY=your_serpapi_key_here
```

## Installation

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
```

### Frontend Setup
```bash
cd frontend
npm install
```

## Running the Application

### Option 1: Using the script
```bash
# Start backend (from root directory)
./scripts/run_backend.sh

# Start frontend (from root directory)
./scripts/run_frontend.sh
```

### Option 2: Manual start
```bash
# Terminal 1 - Backend
cd backend
python app.py

# Terminal 2 - Frontend
cd frontend
npm run dev
```

The backend will run on http://localhost:5000
The frontend will run on http://localhost:5173