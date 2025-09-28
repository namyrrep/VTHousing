# VT HOUSING

This project delivers 3 core features:
- Search function using OpenAI API that returns 3 rentals
- Send an email using Google Mail API after asking for approval
- A to-do list for tracking where you are in the rental process

## Project Structure
```
VTHousing/
├── frontend/          # React application (Vite + React)
├── backend/           # Flask API server + search functionality
├── scripts/           # Shell scripts for running the application
├── docs/              # Documentation
├── .env               # Environment variables (create this)
└── README.md          # This file
```

## Quick Start

1. **Setup Environment Variables**: Copy `.env.example` to `.env` and add your API keys
2. **Install Dependencies**: See [Setup Guide](docs/SETUP.md) for detailed instructions
3. **Run the Application**:
   ```bash
   # Start backend
   ./scripts/run_backend.sh
   
   # Start frontend (in another terminal)
   ./scripts/run_frontend.sh
   ```

## API Requirements
- OpenAI API key for search functionality
- SerpAPI key for web search results

## Tech Stack
- **Frontend**: React 18, Vite, React Router
- **Backend**: Flask, OpenAI API, SerpAPI
- **Styling**: Custom CSS with Virginia Tech branding

For detailed setup instructions, see [docs/SETUP.md](docs/SETUP.md)